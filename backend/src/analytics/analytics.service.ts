import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { AnalyticsMetric } from './entities/metric.entity';
import { SearchAnalytic } from '../search/entities/search-analytics.entity';
import { ChatConversation } from '../chat/entities/chat.entity';
import { ChatFailure } from '../chat/entities/chat-failure.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsMetric)
    private readonly metricRepository: Repository<AnalyticsMetric>,
    @InjectRepository(SearchAnalytic)
    private readonly searchRepository: Repository<SearchAnalytic>,
    @InjectRepository(ChatConversation)
    private readonly chatRepository: Repository<ChatConversation>,
    @InjectRepository(ChatFailure)
    private readonly chatFailureRepository: Repository<ChatFailure>,
  ) {}

  private formatDuration(durationMs: number): string {
    const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private getDateRange(days: number): {
    now: Date;
    from: Date;
    prevFrom: Date;
  } {
    const now = new Date();
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevFrom = new Date(from.getTime() - days * 24 * 60 * 60 * 1000);
    return { now, from, prevFrom };
  }

  async track(data: Partial<AnalyticsMetric>) {
    const metric = this.metricRepository.create(data);
    return this.metricRepository.save(metric);
  }

  // ─── Overview / KPI Summary ───────────────────────────────────────────────
  async getOverviewStats(days: number = 30) {
    const { now, from, prevFrom } = this.getDateRange(days);

    const [
      currentVisits,
      prevVisits,
      currentSessions,
      prevSessions,
      todayVisits,
      weekVisits,
      monthVisits,
    ] = await Promise.all([
      this.metricRepository.count({
        where: { type: 'VISIT', timestamp: Between(from, now) },
      }),
      this.metricRepository.count({
        where: { type: 'VISIT', timestamp: Between(prevFrom, from) },
      }),
      this.countUnique('session_id', 'VISIT', from, now),
      this.countUnique('session_id', 'VISIT', prevFrom, from),
      this.metricRepository.count({
        where: { type: 'VISIT', timestamp: Between(this.startOfToday(), now) },
      }),
      this.metricRepository.count({
        where: { type: 'VISIT', timestamp: Between(this.daysAgo(7), now) },
      }),
      this.metricRepository.count({
        where: { type: 'VISIT', timestamp: Between(this.daysAgo(30), now) },
      }),
    ]);

    const durationAgg = await this.metricRepository
      .createQueryBuilder('m')
      .select(`AVG((m.metadata->>'duration_ms')::float)`, 'avg_ms')
      .where('m.type = :type', { type: 'HEARTBEAT' })
      .andWhere('m.timestamp >= :from', { from })
      .getRawOne();

    const prevDurationAgg = await this.metricRepository
      .createQueryBuilder('m')
      .select(`AVG((m.metadata->>'duration_ms')::float)`, 'avg_ms')
      .where('m.type = :type', { type: 'HEARTBEAT' })
      .andWhere('m.timestamp BETWEEN :prevFrom AND :from', { prevFrom, from })
      .getRawOne();

    const avgDurationMs = Math.round(Number(durationAgg?.avg_ms) || 0);
    const prevAvgDurationMs = Math.round(Number(prevDurationAgg?.avg_ms) || 0);

    // Unique visitors (by session_id)
    const uniqueVisitors = await this.countUnique(
      'session_id',
      'VISIT',
      from,
      now,
    );
    const prevUniqueVisitors = await this.countUnique(
      'session_id',
      'VISIT',
      prevFrom,
      from,
    );

    // Returning visitors: sessions appearing in both periods
    const returningRaw = await this.metricRepository
      .createQueryBuilder('m')
      .select(`m.metadata->>'session_id'`, 'sid')
      .where('m.type = :type', { type: 'VISIT' })
      .andWhere('m.timestamp >= :from', { from })
      .groupBy(`m.metadata->>'session_id'`)
      .having(`MIN(m.timestamp) < :cutoff`, { cutoff: from })
      .getCount();

    const growth = (curr: number, prev: number) =>
      prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);

    return {
      visitors: {
        today: todayVisits,
        week: weekVisits,
        month: monthVisits,
        period: currentVisits,
        growth: growth(currentVisits, prevVisits),
      },
      sessions: {
        total: currentSessions,
        growth: growth(currentSessions, prevSessions),
      },
      pageViews: {
        total: currentVisits,
        unique: uniqueVisitors,
        growth: growth(uniqueVisitors, prevUniqueVisitors),
      },
      engagement: {
        avgDurationMs,
        avgDuration: this.formatDuration(avgDurationMs),
        avgDurationGrowth: growth(avgDurationMs, prevAvgDurationMs),
        returningVisitors: returningRaw,
      },
    };
  }

  // ─── Traffic Trend ────────────────────────────────────────────────────────
  async getTrafficTrend(granularity: string = 'daily', days: number = 30) {
    const { now, from } = this.getDateRange(days);

    const truncMap: Record<string, string> = {
      hourly: 'hour',
      daily: 'day',
      weekly: 'week',
      monthly: 'month',
    };
    const trunc = truncMap[granularity] || 'day';

    const visitors = await this.metricRepository
      .createQueryBuilder('m')
      .select(`DATE_TRUNC('${trunc}', m.timestamp)`, 'date')
      .addSelect('COUNT(*)', 'visitors')
      .addSelect(`COUNT(DISTINCT m.metadata->>'session_id')`, 'sessions')
      .where('m.type = :type', { type: 'VISIT' })
      .andWhere('m.timestamp BETWEEN :from AND :now', { from, now })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return visitors.map((v) => ({
      date: v.date,
      visitors: parseInt(v.visitors) || 0,
      sessions: parseInt(v.sessions) || 0,
    }));
  }

  // ─── Pages Analytics ──────────────────────────────────────────────────────
  async getTopPages(days: number = 30, limit: number = 50) {
    const { now, from } = this.getDateRange(days);

    const pages = await this.metricRepository
      .createQueryBuilder('m')
      .select('m.path', 'path')
      .addSelect('COUNT(*)', 'views')
      .addSelect(`COUNT(DISTINCT m.metadata->>'session_id')`, 'unique_views')
      .addSelect(`AVG((m.metadata->>'duration_ms')::float)`, 'avg_duration_ms')
      .where('m.type = :type', { type: 'VISIT' })
      .andWhere('m.timestamp BETWEEN :from AND :now', { from, now })
      .groupBy('m.path')
      .orderBy('views', 'DESC')
      .limit(limit)
      .getRawMany();

    return pages.map((p) => ({
      path: p.path,
      views: parseInt(p.views) || 0,
      uniqueViews: parseInt(p.unique_views) || 0,
      avgDuration: this.formatDuration(
        Math.round(Number(p.avg_duration_ms) || 0),
      ),
      avgDurationMs: Math.round(Number(p.avg_duration_ms) || 0),
    }));
  }

  // ─── Device Analytics ─────────────────────────────────────────────────────
  async getDeviceBreakdown(days: number = 30) {
    const { now, from } = this.getDateRange(days);

    const [devices, browsers, os] = await Promise.all([
      this.metricRepository
        .createQueryBuilder('m')
        .select(`m.metadata->>'device'`, 'label')
        .addSelect('COUNT(*)', 'value')
        .where('m.type = :type', { type: 'VISIT' })
        .andWhere('m.timestamp BETWEEN :from AND :now', { from, now })
        .andWhere(`m.metadata->>'device' IS NOT NULL`)
        .groupBy(`m.metadata->>'device'`)
        .orderBy('value', 'DESC')
        .getRawMany(),

      this.metricRepository
        .createQueryBuilder('m')
        .select(`m.metadata->>'browser'`, 'label')
        .addSelect('COUNT(*)', 'value')
        .where('m.type = :type', { type: 'VISIT' })
        .andWhere('m.timestamp BETWEEN :from AND :now', { from, now })
        .andWhere(`m.metadata->>'browser' IS NOT NULL`)
        .groupBy(`m.metadata->>'browser'`)
        .orderBy('value', 'DESC')
        .limit(8)
        .getRawMany(),

      this.metricRepository
        .createQueryBuilder('m')
        .select(`m.metadata->>'os'`, 'label')
        .addSelect('COUNT(*)', 'value')
        .where('m.type = :type', { type: 'VISIT' })
        .andWhere('m.timestamp BETWEEN :from AND :now', { from, now })
        .andWhere(`m.metadata->>'os' IS NOT NULL`)
        .groupBy(`m.metadata->>'os'`)
        .orderBy('value', 'DESC')
        .limit(8)
        .getRawMany(),
    ]);

    const toChartData = (rows: any[]) =>
      rows.map((r) => ({
        label: r.label || 'Unknown',
        value: parseInt(r.value) || 0,
      }));

    return {
      devices: toChartData(devices),
      browsers: toChartData(browsers),
      os: toChartData(os),
    };
  }

  // ─── Geographic Analytics ─────────────────────────────────────────────────
  async getGeographicBreakdown(days: number = 30) {
    const { now, from } = this.getDateRange(days);

    const [countries, regions] = await Promise.all([
      this.metricRepository
        .createQueryBuilder('m')
        .select(`m.metadata->>'country'`, 'label')
        .addSelect('COUNT(*)', 'value')
        .where('m.type = :type', { type: 'VISIT' })
        .andWhere('m.timestamp BETWEEN :from AND :now', { from, now })
        .andWhere(`m.metadata->>'country' IS NOT NULL`)
        .groupBy(`m.metadata->>'country'`)
        .orderBy('value', 'DESC')
        .limit(20)
        .getRawMany(),

      this.metricRepository
        .createQueryBuilder('m')
        .select(`m.metadata->>'region'`, 'label')
        .addSelect('COUNT(*)', 'value')
        .where('m.type = :type', { type: 'VISIT' })
        .andWhere('m.timestamp BETWEEN :from AND :now', { from, now })
        .andWhere(`m.metadata->>'region' IS NOT NULL`)
        .groupBy(`m.metadata->>'region'`)
        .orderBy('value', 'DESC')
        .limit(20)
        .getRawMany(),
    ]);

    const toChartData = (rows: any[]) =>
      rows.map((r) => ({
        label: r.label || 'Unknown',
        value: parseInt(r.value) || 0,
      }));

    return {
      countries: toChartData(countries),
      regions: toChartData(regions),
    };
  }

  // ─── Traffic Sources ──────────────────────────────────────────────────────
  async getTrafficSources(days: number = 30) {
    const { now, from } = this.getDateRange(days);

    const rawReferrers = await this.metricRepository
      .createQueryBuilder('m')
      .select(`m.metadata->>'referrer'`, 'referrer')
      .addSelect('COUNT(*)', 'count')
      .where('m.type = :type', { type: 'VISIT' })
      .andWhere('m.timestamp BETWEEN :from AND :now', { from, now })
      .groupBy(`m.metadata->>'referrer'`)
      .orderBy('count', 'DESC')
      .limit(50)
      .getRawMany();

    const sources: Record<string, number> = {
      Direct: 0,
      'Google Search': 0,
      'Social Media': 0,
      Referral: 0,
      Other: 0,
    };

    const referralList: { domain: string; count: number }[] = [];
    const searchEngines: Record<string, number> = {};
    const socialNetworks = [
      'facebook',
      'twitter',
      'instagram',
      'linkedin',
      'tiktok',
      'youtube',
      'whatsapp',
    ];
    const searchEnginesList = [
      'google',
      'bing',
      'yahoo',
      'duckduckgo',
      'yandex',
    ];

    for (const row of rawReferrers) {
      const count = parseInt(row.count) || 0;
      const ref = row.referrer;

      if (!ref || ref === 'null' || ref === '') {
        sources['Direct'] += count;
        continue;
      }

      let domain = ref;
      try {
        domain = new URL(ref).hostname.replace('www.', '');
      } catch {}

      const isSocial = socialNetworks.some((s) => domain.includes(s));
      const isSearch = searchEnginesList.some((s) => domain.includes(s));

      if (isSocial) {
        sources['Social Media'] += count;
      } else if (isSearch) {
        sources['Google Search'] += count;
        const engineName = searchEnginesList.find((s) => domain.includes(s));
        if (engineName) {
          searchEngines[engineName] = (searchEngines[engineName] || 0) + count;
        }
      } else {
        sources['Referral'] += count;
        referralList.push({ domain, count });
      }
    }

    return {
      sources: Object.entries(sources)
        .map(([label, value]) => ({ label, value }))
        .filter((s) => s.value > 0),
      searchEngines: Object.entries(searchEngines)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value),
      referrals: referralList.slice(0, 20),
    };
  }

  // ─── Search Analytics ─────────────────────────────────────────────────────
  async getSearchAnalytics(days: number = 30) {
    const { now, from } = this.getDateRange(days);

    const [topSearches, failedSearches, totalSearches] = await Promise.all([
      this.searchRepository
        .createQueryBuilder('s')
        .select('s.query', 'query')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(s.results_count)', 'total_results')
        .where('s.searched_at BETWEEN :from AND :now', { from, now })
        .groupBy('s.query')
        .orderBy('count', 'DESC')
        .limit(20)
        .getRawMany(),

      this.searchRepository
        .createQueryBuilder('s')
        .select('s.query', 'query')
        .addSelect('COUNT(*)', 'count')
        .where('s.searched_at BETWEEN :from AND :now', { from, now })
        .andWhere('s.is_failed = true')
        .groupBy('s.query')
        .orderBy('count', 'DESC')
        .limit(20)
        .getRawMany(),

      this.searchRepository.count({
        where: { searched_at: Between(from, now) },
      }),
    ]);

    const failedCount = await this.searchRepository.count({
      where: { searched_at: Between(from, now), is_failed: true },
    });

    return {
      topSearches: topSearches.map((s) => ({
        query: s.query,
        count: parseInt(s.count) || 0,
        avgResults: Math.round(
          Number(s.total_results) / (parseInt(s.count) || 1),
        ),
      })),
      failedSearches: failedSearches.map((s) => ({
        query: s.query,
        count: parseInt(s.count) || 0,
      })),
      summary: {
        total: totalSearches,
        failed: failedCount,
        failureRate:
          totalSearches > 0
            ? Math.round((failedCount / totalSearches) * 100)
            : 0,
      },
    };
  }

  // ─── AI / Chat Analytics ──────────────────────────────────────────────────
  async getChatAnalytics(days: number = 30) {
    const { now, from } = this.getDateRange(days);

    const [totalConversations, escalated, resolved, topFailures] =
      await Promise.all([
        this.chatRepository.count({
          where: { created_at: Between(from, now) },
        }),
        this.chatRepository.count({
          where: {
            created_at: Between(from, now),
            current_status: 'escalated',
          },
        }),
        this.chatRepository.count({
          where: { created_at: Between(from, now), current_status: 'archived' },
        }),
        this.chatFailureRepository
          .createQueryBuilder('f')
          .select('f.query', 'question')
          .addSelect('COUNT(*)', 'count')
          .where('f.created_at BETWEEN :from AND :now', { from, now })
          .groupBy('f.query')
          .orderBy('count', 'DESC')
          .limit(10)
          .getRawMany()
          .catch(() => []),
      ]);

    // Rating average
    const ratingAgg = await this.chatRepository
      .createQueryBuilder('c')
      .select('AVG(c.rating)', 'avg_rating')
      .where('c.created_at BETWEEN :from AND :now', { from, now })
      .andWhere('c.rating IS NOT NULL')
      .getRawOne();

    // Daily trend
    const trend = await this.chatRepository
      .createQueryBuilder('c')
      .select(`DATE_TRUNC('day', c.created_at)`, 'date')
      .addSelect('COUNT(*)', 'conversations')
      .where('c.created_at BETWEEN :from AND :now', { from, now })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      summary: {
        totalConversations,
        escalated,
        resolved,
        resolutionRate:
          totalConversations > 0
            ? Math.round((resolved / totalConversations) * 100)
            : 0,
        escalationRate:
          totalConversations > 0
            ? Math.round((escalated / totalConversations) * 100)
            : 0,
        avgRating: Number(ratingAgg?.avg_rating || 0).toFixed(1),
      },
      topFailures: topFailures.map((f: any) => ({
        question: f.question,
        count: parseInt(f.count) || 0,
      })),
      trend: trend.map((t) => ({
        date: t.date,
        conversations: parseInt(t.conversations) || 0,
      })),
    };
  }

  // ─── Real-Time Active Users ───────────────────────────────────────────────
  async getRealTimeSummary() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const thirtySecAgo = new Date(Date.now() - 30 * 1000);

    const [activeNow, recentSessions, currentPages] = await Promise.all([
      this.metricRepository.count({
        where: { type: 'HEARTBEAT', timestamp: MoreThanOrEqual(fiveMinAgo) },
      }),
      this.metricRepository
        .createQueryBuilder('m')
        .select(`COUNT(DISTINCT m.metadata->>'session_id')`, 'count')
        .where('m.type = :type', { type: 'VISIT' })
        .andWhere('m.timestamp >= :since', { since: fiveMinAgo })
        .getRawOne(),
      this.metricRepository
        .createQueryBuilder('m')
        .select('m.path', 'path')
        .addSelect('COUNT(*)', 'count')
        .where('m.type = :type', { type: 'VISIT' })
        .andWhere('m.timestamp >= :since', { since: fiveMinAgo })
        .groupBy('m.path')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany(),
    ]);

    return {
      activeUsers: parseInt(recentSessions?.count || '0'),
      heartbeats: activeNow,
      timestamp: new Date(),
      topCurrentPages: currentPages.map((p) => ({
        path: p.path,
        count: parseInt(p.count) || 0,
      })),
    };
  }

  // ─── Legacy Dashboard Stats (preserved for backward compat) ───────────────
  async getDashboardStats(days: number = 7) {
    const { now, from } = this.getDateRange(days);

    const [totalVisits, recentVisitsCount, interactions] = await Promise.all([
      this.metricRepository.count({ where: { type: 'VISIT' } }),
      this.metricRepository.count({
        where: { type: 'VISIT', timestamp: Between(from, now) },
      }),
      this.metricRepository.count({ where: { type: 'CLICK' } }),
    ]);

    const durationAgg = await this.metricRepository
      .createQueryBuilder('m')
      .select(`AVG((m.metadata->>'duration_ms')::int)`, 'avg_duration_ms')
      .where('m.type = :type', { type: 'HEARTBEAT' })
      .andWhere('m.timestamp >= :date', { date: from })
      .getRawOne();

    const avgDurationMs = Math.round(Number(durationAgg?.avg_duration_ms) || 0);

    const topPages = await this.metricRepository
      .createQueryBuilder('m')
      .select('m.path', 'path')
      .addSelect('COUNT(*)', 'count')
      .where('m.type = :type', { type: 'VISIT' })
      .andWhere('m.timestamp >= :date', { date: from })
      .groupBy('m.path')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const trend = await this.metricRepository
      .createQueryBuilder('m')
      .select(`DATE_TRUNC('day', m.timestamp)`, 'date')
      .addSelect('COUNT(*)', 'count')
      .where('m.type = :type', { type: 'VISIT' })
      .andWhere('m.timestamp >= :date', { date: from })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      overview: {
        totalVisits,
        recentVisits: recentVisitsCount,
        interactions,
        avgDurationMs,
        avgDuration: this.formatDuration(avgDurationMs),
        trend: trend.map((t) => ({ date: t.date, count: parseInt(t.count) })),
      },
      topPages,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private async countUnique(
    field: string,
    type: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const r = await this.metricRepository
      .createQueryBuilder('m')
      .select(`COUNT(DISTINCT m.metadata->>'${field}')`, 'count')
      .where('m.type = :type', { type })
      .andWhere('m.timestamp BETWEEN :from AND :to', { from, to })
      .getRawOne();
    return parseInt(r?.count || '0');
  }

  /**
   * First-party RUM aggregates from WEB_VITAL track events.
   * CLS values are stored ×1000 by the client (integer ms-scale).
   */
  async getWebVitalsStats(days: number = 30) {
    const { from, now } = this.getDateRange(days);
    const rows = await this.metricRepository
      .createQueryBuilder('m')
      .select('m.label', 'metric')
      .addSelect('COUNT(*)', 'samples')
      .addSelect(`AVG((m.metadata->>'value')::float)`, 'avg_value')
      .addSelect(
        `PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY (m.metadata->>'value')::float)`,
        'p75_value',
      )
      .where('m.type = :type', { type: 'WEB_VITAL' })
      .andWhere('m.timestamp BETWEEN :from AND :to', { from, to: now })
      .andWhere("m.label IN ('CLS','FCP','INP','LCP','TTFB')")
      .andWhere("m.metadata->>'value' IS NOT NULL")
      .groupBy('m.label')
      .orderBy('m.label', 'ASC')
      .getRawMany();

    const order = ['LCP', 'INP', 'CLS', 'FCP', 'TTFB'];
    const byLabel = new Map(
      rows.map((r) => {
        const metric = String(r.metric || '');
        const avg = parseFloat(r.avg_value || '0');
        const p75 = parseFloat(r.p75_value || '0');
        const samples = parseInt(r.samples || '0', 10);
        // CLS was stored ×1000 — present as unitless again for readability.
        const scale = metric === 'CLS' ? 1000 : 1;
        return [
          metric,
          {
            metric,
            samples,
            avg:
              scale === 1
                ? Math.round(avg)
                : Math.round((avg / scale) * 1000) / 1000,
            p75:
              scale === 1
                ? Math.round(p75)
                : Math.round((p75 / scale) * 1000) / 1000,
            unit: metric === 'CLS' ? 'score' : 'ms',
          },
        ] as const;
      }),
    );

    const metrics = order
      .map((label) => byLabel.get(label))
      .filter((m): m is NonNullable<typeof m> => Boolean(m));

    return {
      days,
      totalSamples: metrics.reduce((n, m) => n + m.samples, 0),
      metrics,
    };
  }

  private startOfToday(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private daysAgo(n: number): Date {
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  }
}
