import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as cheerio from 'cheerio';

@Injectable()
export class TimetablesService {
  private readonly logger = new Logger(TimetablesService.name);
  private readonly plannerUrl = 'https://planner.ouk.ac.ke';

  constructor(private readonly httpService: HttpService) {}

  async getPlannerSchools() {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.plannerUrl}/timetable`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }),
      );
      const $ = cheerio.load(response.data);
      const schools: { id: string; name: string }[] = [];
      // Extract from the school <select> dropdown in the planner page
      $(
        'select[name="school_id"] option, select#school option, select[name="school"] option',
      ).each((_, el) => {
        const value = $(el).attr('value');
        const text = $(el).text().trim();
        if (value && value !== '' && text) {
          schools.push({ id: value, name: text });
        }
      });
      return schools;
    } catch (error) {
      this.logger.error('Error fetching planner schools: ' + error.message);
      return [];
    }
  }

  async getExams(filters: any) {
    const query = new URLSearchParams(filters).toString();
    const url = `${this.plannerUrl}/examinations?${query}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }),
      );
      const html = response.data;
      return this.parseExamsHtml(html);
    } catch (error) {
      this.logger.error(`Error fetching exams from ${url}: ${error.message}`);
      return [];
    }
  }

  private parseExamsHtml(html: string) {
    const $ = cheerio.load(html);
    const exams: any[] = [];
    let currentDay = '';

    $('#examsTable tbody tr').each((i, el) => {
      const $row = $(el);

      if ($row.hasClass('boundary-row')) {
        currentDay = $row.text().trim();
        return;
      }

      const timeTd = $row.find('td').eq(0);
      if (timeTd.length === 0) return;

      const time = timeTd.text().trim().replace(/\s+/g, ' ');
      const courseCode = $row.find('td').eq(1).find('.fw-bold').text().trim();
      const courseName = $row.find('td').eq(1).find('small').text().trim();
      const level = $row.find('td').eq(2).text().trim();
      const programs: string[] = [];
      $row
        .find('td')
        .eq(3)
        .find('span')
        .each((j, span) => {
          programs.push($(span).text().trim());
        });

      if (courseCode) {
        exams.push({
          day: currentDay,
          time,
          courseCode,
          courseName,
          level,
          programs,
        });
      }
    });

    return exams;
  }

  async getClassTimetable(filters: any) {
    // Planner expects 'level' not 'level_id'
    const { level_id, ...rest } = filters;
    const mappedFilters: any = { ...rest };
    if (level_id) mappedFilters.level = level_id;

    const query = new URLSearchParams(mappedFilters).toString();
    const url = `${this.plannerUrl}/timetable?${query}`;

    try {
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }),
      );
      const html = response.data;
      return this.parseTimetableHtml(html);
    } catch (error) {
      this.logger.error(
        `Error fetching timetable from ${url}: ${error.message}`,
      );
      return { days: [], timeSlots: [], data: {} };
    }
  }

  private parseTimetableHtml(html: string) {
    const $ = cheerio.load(html);

    // Extract days from the FIRST thead only
    const days: string[] = [];
    const firstThead = $('.table-bordered thead').first();
    firstThead.find('th').each((i, th) => {
      const text = $(th).text().trim();
      if (i > 0 && text && text !== 'Time (EAT)') days.push(text);
    });
    if (days.length === 0) {
      days.push('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');
    }

    // Extract time slots from the FIRST table-bordered only, deduplicated
    const timeSlots: string[] = [];
    const seenSlots = new Set<string>();
    const firstTable = $('.table-bordered').first();
    firstTable.find('tbody tr').each((i, tr) => {
      const timeCell = $(tr).find('td.time-cell');
      if (timeCell.length) {
        const t = timeCell.text().trim();
        if (t && !seenSlots.has(t)) {
          seenSlots.add(t);
          timeSlots.push(t);
        }
      }
    });

    // Build a grid: for each (timeSlot, day) find the lesson
    // The planner uses rowspan so we need a virtual grid approach
    const timetableData: any = {};
    timeSlots.forEach((slot) => {
      timetableData[slot] = {};
    });

    // Virtual grid to track cell occupancy due to rowspan
    // Use FIRST table only — the planner renders two identical tables
    const occupied: Record<string, Record<number, boolean>> = {};
    const allRows = firstTable.find('tbody tr').toArray();

    // Map each row to a timeSlot
    const rowToSlot: string[] = [];
    let slotIdx = 0;
    allRows.forEach((tr, ri) => {
      const tc = $(tr).find('td.time-cell');
      if (tc.length && tc.text().trim()) {
        slotIdx = timeSlots.indexOf(tc.text().trim());
      }
      rowToSlot[ri] = timeSlots[slotIdx] || '';
    });

    // Track virtual column positions
    const virtualCols: Record<number, number> = {}; // rowIdx -> next available col

    allRows.forEach((tr, ri) => {
      const cells = $(tr).children('td').toArray();
      if (!virtualCols[ri]) virtualCols[ri] = 0;

      let colCursor = 0; // actual column index in DOM

      cells.forEach((td) => {
        const $td = $(td);

        // Skip to next non-occupied virtual column
        while (occupied[ri]?.[colCursor]) colCursor++;

        // Skip time-cell (col 0)
        if ($td.hasClass('time-cell')) {
          colCursor++;
          return;
        }

        const rowspan = parseInt($td.attr('rowspan') || '1', 10);
        const dayIndex = colCursor - 1; // col 0 is time
        const day = days[dayIndex];

        if (day && $td.hasClass('timetable-slot')) {
          const slot = rowToSlot[ri];
          if (slot) {
            // Parse lesson from this cell
            const lesson = this.parseLessonCell($, $td);
            if (lesson) {
              if (!timetableData[slot][day]) timetableData[slot][day] = [];
              timetableData[slot][day].push(lesson);
            }
          }

          // Mark subsequent rows as occupied for this column
          for (let r = 1; r < rowspan; r++) {
            if (!occupied[ri + r]) occupied[ri + r] = {};
            occupied[ri + r][colCursor] = true;
          }
        }

        colCursor++;
      });
    });

    return { days, timeSlots, data: timetableData };
  }

  private parseLessonCell($: any, $td: any): any {
    // Extract background color from style
    const style = $td.attr('style') || '';
    const colorMatch = style.match(/background-color:\s*([^;]+)/);
    const color = colorMatch ? colorMatch[1].trim() : '#00a3a1';

    // Instructor name
    const instructor =
      $td.find('p.instructor-name').text().trim() ||
      $td.find('.instructor-name').text().trim();

    // Instructor image
    const instructorImage = $td.find('img').attr('src') || '';

    // Course info: "SST 111: Basic Statistics with R"
    const courseInfoText = $td.find('.course-info').text().trim();
    let courseCode = '';
    let courseTitle = '';
    const courseMatch = courseInfoText.match(/([A-Z]{2,4}\s*\d{3,4}):\s*(.+)/);
    if (courseMatch) {
      courseCode = courseMatch[1].trim();
      courseTitle = courseMatch[2].trim();
    } else {
      // Fallback: look for strong tag
      const strong = $td.find('.course-info strong').text().trim();
      if (strong) {
        courseCode = strong.replace(':', '').trim();
        courseTitle = $td
          .find('.course-info')
          .text()
          .replace(strong, '')
          .trim();
      }
    }

    // Mode and session from the span elements within the details section
    let mode = '';
    let session = '';
    $td.find('span').each((_: any, span: any) => {
      const t = $(span).text().trim();
      if (!t) return;
      const tl = t.toLowerCase();
      if (
        (tl.includes('synchronous') ||
          tl.includes('async') ||
          tl.includes('online') ||
          tl.includes('physical') ||
          tl.includes('hybrid')) &&
        !mode
      ) {
        mode = t;
      } else if (
        (tl.includes('morning') ||
          tl.includes('afternoon') ||
          tl.includes('evening') ||
          tl.includes('night')) &&
        !session
      ) {
        session = t;
      }
    });

    if (!instructor && !courseCode) return null;

    return {
      instructor,
      instructorImage,
      courseCode,
      courseTitle,
      mode,
      session,
      color,
    };
  }

  async getProgrammes(schoolId: string) {
    try {
      const url = `${this.plannerUrl}/api/programmes-by-school?school_id=${schoolId}`;
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }),
      );
      return response.data;
    } catch (error) {
      return { programmes: [] };
    }
  }

  async getLevels(schoolId: string, programmeId: string) {
    try {
      const url = `${this.plannerUrl}/api/levels-with-timetables?school_id=${schoolId}&programme_id=${programmeId}`;
      const response = await lastValueFrom(
        this.httpService.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          },
        }),
      );
      return response.data;
    } catch (error) {
      return { data: [] };
    }
  }
}
