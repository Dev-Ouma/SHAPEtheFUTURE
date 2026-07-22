import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { normalizeLocale, pickLocalized } from '../common/locale';
import { CmsCacheService } from '../common/cms-cache.service';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
    private readonly cmsCache: CmsCacheService,
  ) {}

  async onModuleInit() {
    const keysToSeed = [
      {
        key: 'openai_api_key',
        value: 'sk-your-openai-api-key-here',
        description: 'OpenAI API Key for Intelligence Engine',
      },
      {
        key: 'google_client_id',
        value: 'your-google-client-id-here.apps.googleusercontent.com',
        description: 'Google Auth Client ID for public portal',
      },
      {
        key: 'google_client_secret',
        value: '',
        description: 'Google Auth Client Secret (Optional for frontend flow)',
      },
      {
        key: 'site_name',
        value: 'Open University of Kenya',
        description: 'Website name',
      },
      {
        key: 'site_description',
        value: 'The innovative university for inclusive prosperity',
        description: 'Website meta description',
      },
      {
        key: 'address',
        value: 'Nairobi, Kenya',
        description: 'Physical address',
      },
      {
        key: 'contact_email',
        value: 'info@ouk.ac.ke',
        description: 'Contact email address',
      },
      {
        key: 'contact_phone',
        value: '+254 700 000 000',
        description: 'Contact phone number',
      },
      {
        key: 'footer_mission',
        value: 'The innovative university for inclusive prosperity',
        description: 'Footer mission statement',
      },
      {
        key: 'footer_description',
        value:
          'Empowering the next generation of global leaders through innovative, technology-driven higher education.',
        description: 'Footer tagline',
      },
      {
        key: 'facebook_url',
        value: 'https://facebook.com/openuniversitykenya',
        description: 'Facebook page URL',
      },
      {
        key: 'twitter_url',
        value: 'https://x.com/OUKenya',
        description: 'X (Twitter) URL',
      },
      {
        key: 'linkedin_url',
        value: 'https://linkedin.com/school/open-university-of-kenya',
        description: 'LinkedIn URL',
      },
      {
        key: 'youtube_url',
        value: 'https://youtube.com/@openuniversityofkenya',
        description: 'YouTube URL',
      },
      { key: 'tiktok_url', value: '', description: 'TikTok URL' },
      {
        key: 'cta_apply_url',
        value: '/admissions',
        description: 'Hero CTA Apply Now URL',
      },
    ];

    for (const item of keysToSeed) {
      const exists = await this.settingRepository.findOne({
        where: { key: item.key },
      });
      if (!exists) {
        await this.settingRepository.save(this.settingRepository.create(item));
        console.log(`Seeded setting: ${item.key}`);
      }
    }
  }

  private readonly publicKeys = [
    // Site identity
    'site_name',
    'site_description',
    'site_logo',
    'favicon',
    // Contact
    'address',
    'contact_email',
    'contact_phone',
    // Footer
    'footer_mission',
    'footer_description',
    'footer_mission_sw',
    'footer_description_sw',
    'footer_background_image',
    'footer_background',
    // Social
    'facebook_url',
    'twitter_url',
    'linkedin_url',
    'youtube_url',
    'tiktok_url',
    'instagram_url',
    // Hero & CTA
    'home_hero_title',
    'home_hero_tagline',
    'home_hero_description',
    'home_hero_image',
    'home_hero_title_sw',
    'home_hero_tagline_sw',
    'home_hero_description_sw',
    'cta_apply_url',
    'cta_apply_label',
    'cta_apply_label_sw',
    'cta_portal_label',
    'cta_portal_label_sw',
    'cta_portal_url',
    // Auth
    'google_client_id',
    // Maintenance
    'maintenance_mode',
    'maintenance_message',
    // Public timetable Google Calendar helpers
    'timetable_gcal_class_duration_hours',
    'timetable_gcal_semester_start_date',
    'timetable_gcal_semester_end_date',
    // Public alumni contact block
    'alumni_support_email',
    'alumni_support_office',
    // SHAPE Erasmus+ portal homepage (PROSPER-style CMS content)
    'shape_hero_eyebrow',
    'shape_hero_title',
    'shape_hero_text',
    'shape_intro',
    'shape_acronym',
    'shape_erasmus_call',
    'shape_objectives_json',
    'shape_overview',
    'shape_overview_image',
    'site_tagline',
    // News hub CMS (copy + 3D visuals)
    'news_hub_eyebrow',
    'news_hub_title',
    'news_hub_title_accent',
    'news_hub_subtitle',
    'news_hub_search_hint',
    'news_hub_ticker_label',
    'news_hub_image_tablet',
    'news_hub_image_orb',
    'news_hub_image_cards',
    // Search synonym / related-terms map (JSON object)
    'search_related_terms_json',
    // Work packages hub
    'work_packages_eyebrow',
    'work_packages_title',
    'work_packages_subtitle',
  ];

  async findPublic(localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const settings = await this.settingRepository.find();
    const raw = settings
      .filter((s) => this.publicKeys.includes(s.key))
      .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, string>);

    if (locale !== 'sw') {
      return {
        ...raw,
        // Canonical CTA labels for consumers
        cta_apply_label: raw.cta_apply_label || 'Apply Now',
        cta_portal_label: raw.cta_portal_label || 'Portal',
      };
    }

    return {
      ...raw,
      home_hero_title: pickLocalized(
        locale,
        raw.home_hero_title,
        raw.home_hero_title_sw,
      ),
      home_hero_tagline: pickLocalized(
        locale,
        raw.home_hero_tagline,
        raw.home_hero_tagline_sw,
      ),
      home_hero_description: pickLocalized(
        locale,
        raw.home_hero_description,
        raw.home_hero_description_sw,
      ),
      footer_mission: pickLocalized(
        locale,
        raw.footer_mission,
        raw.footer_mission_sw,
      ),
      footer_description: pickLocalized(
        locale,
        raw.footer_description,
        raw.footer_description_sw,
      ),
      cta_apply_label: pickLocalized(
        locale,
        raw.cta_apply_label || 'Apply Now',
        raw.cta_apply_label_sw,
      ),
      cta_portal_label: pickLocalized(
        locale,
        raw.cta_portal_label || 'Portal',
        raw.cta_portal_label_sw,
      ),
    };
  }

  async findAll() {
    const settings = await this.settingRepository.find();
    return settings.reduce(
      (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
      {},
    );
  }

  async findOnePublic(key: string) {
    if (!this.publicKeys.includes(key))
      throw new NotFoundException('Setting not found');
    return this.findOne(key);
  }

  async findOne(key: string) {
    const setting = await this.settingRepository.findOne({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async update(key: string, value: string) {
    let setting = await this.settingRepository.findOne({ where: { key } });
    if (!setting) {
      setting = this.settingRepository.create({ key, value });
    } else {
      setting.value = value;
    }
    const saved = await this.settingRepository.save(setting);
    void this.cmsCache.invalidateSettings();
    return saved;
  }
}
