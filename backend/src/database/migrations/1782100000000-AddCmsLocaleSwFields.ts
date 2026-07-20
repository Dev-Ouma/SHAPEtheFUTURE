import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/**
 * Layer B i18n: additive Swahili columns for menus, pages, hero slides
 * plus seed title_sw for known menu slugs and home_hero_*_sw settings keys.
 */
export class AddCmsLocaleSwFields1782100000000 implements MigrationInterface {
  name = 'AddCmsLocaleSwFields1782100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await addColumnIfNotExists(
      queryRunner,
      'menus',
      'title_sw',
      'character varying NULL',
    );

    await addColumnIfNotExists(
      queryRunner,
      'pages',
      'title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(queryRunner, 'pages', 'summary_sw', 'text NULL');
    await addColumnIfNotExists(
      queryRunner,
      'pages',
      'meta_title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'pages',
      'meta_description_sw',
      'text NULL',
    );

    await addColumnIfNotExists(
      queryRunner,
      'hero_slides',
      'title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'hero_slides',
      'subtitle_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'hero_slides',
      'description_sw',
      'text NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'hero_slides',
      'tagline_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'hero_slides',
      'cta_text_sw',
      'character varying NULL',
    );

    // Seed menu SW titles for known slugs (no-op if slug missing)
    const menuSw: Record<string, string> = {
      about: 'Kuhusu',
      'about/governing-council': 'Baraza la Uongozi',
      'about/chancellor': 'Chansela',
      'about/management': 'Bodi ya Usimamizi wa Chuo',
      'about/uniqueness': 'Upekee wa OUK',
      'about/downloads': 'Vipakuliwa',
      'about/complaints': 'Malalamiko ya Umma',
      'about/vice-chancellor': 'Maono ya Makamu wa Chansela',
      'about/campus-feedback': 'Malalamiko na Pongezi',
      admissions: 'Udahili',
      'admissions/overview': 'Muhtasari',
      'admissions/how-to-apply': 'Jinsi ya Kuomba',
      'admissions/careers': 'Kazi',
      academics: 'Masomo',
      'academics/overview': 'Muhtasari',
      'academics/peer-learners': 'Wanafunzi Wenza',
      'academics/schools': 'Shule',
      'academics/timetables': 'Ratiba',
      programs: 'Programu',
      'academics/professional-development': 'Kozi za Maendeleo ya Kitaaluma',
      research: 'Utafiti',
      'research/overview': 'Muhtasari',
      'research/publications': 'Machapisho',
      'research/programmes': 'Programu za Utafiti',
      library: 'Maktaba',
      'library/information-literacy': 'Ujuzi wa Habari',
      'library/e-resources': 'Rasilimali za Kielektroniki',
      'library/e-repository': 'Hazina ya Kielektroniki',
      'library/plagiarism-checker': 'Kikagua Ulaghai',
      students: 'Wanafunzi',
      faculty: 'Wahadhiri na Wafanyakazi',
      alumni: 'Wahitimu',
      contact: 'Mawasiliano',
      tenders: 'Zabuni',
      jobs: 'Ajira',
      news: 'Habari',
    };

    for (const [slug, titleSw] of Object.entries(menuSw)) {
      await queryRunner.query(
        `UPDATE "menus" SET "title_sw" = $1::character varying WHERE "slug" = $2::character varying AND ("title_sw" IS NULL OR "title_sw" = ''::character varying)`,
        [titleSw, slug],
      );
    }

    // Settings SW keys (insert if missing)
    const settingSw: Array<[string, string, string]> = [
      [
        'home_hero_title_sw',
        'Chuo Kikuu Huria cha Kenya',
        'Swahili home hero title',
      ],
      [
        'home_hero_tagline_sw',
        'Chuo kikuu cha ubunifu kwa ustawi jumuishi',
        'Swahili home hero tagline',
      ],
      [
        'home_hero_description_sw',
        'Elimu ya juu inayobadilika, ya bei nafuu, na ya ubora kupitia kujifunza mtandaoni.',
        'Swahili home hero description',
      ],
      ['cta_apply_label', 'Apply Now', 'Navbar / hero apply CTA label (EN)'],
      [
        'cta_apply_label_sw',
        'Omba Sasa',
        'Navbar / hero apply CTA label (SW)',
      ],
      ['cta_portal_label', 'Portal', 'Navbar portal CTA label (EN)'],
      [
        'cta_portal_label_sw',
        'Langoni',
        'Navbar portal CTA label (SW)',
      ],
      [
        'footer_mission_sw',
        'Chuo kikuu cha ubunifu kwa ustawi jumuishi',
        'Swahili footer mission',
      ],
      [
        'footer_description_sw',
        'Kuwawezesha viongozi wa kizazi kijacho kupitia elimu ya juu inayoendeshwa na teknolojia.',
        'Swahili footer description',
      ],
    ];

    for (const [key, value, description] of settingSw) {
      await queryRunner.query(
        `INSERT INTO "settings" ("key", "value", "description")
         SELECT $1::character varying, $2::character varying, $3::character varying
         WHERE NOT EXISTS (
           SELECT 1 FROM "settings" WHERE "key" = $4::character varying
         )`,
        [key, value, description, key],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Keep data; only drop columns if needed for rollback
    const drops: Array<[string, string]> = [
      ['menus', 'title_sw'],
      ['pages', 'title_sw'],
      ['pages', 'summary_sw'],
      ['pages', 'meta_title_sw'],
      ['pages', 'meta_description_sw'],
      ['hero_slides', 'title_sw'],
      ['hero_slides', 'subtitle_sw'],
      ['hero_slides', 'description_sw'],
      ['hero_slides', 'tagline_sw'],
      ['hero_slides', 'cta_text_sw'],
    ];
    for (const [table, col] of drops) {
      if (await queryRunner.hasColumn(table, col)) {
        await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "${col}"`);
      }
    }
  }
}
