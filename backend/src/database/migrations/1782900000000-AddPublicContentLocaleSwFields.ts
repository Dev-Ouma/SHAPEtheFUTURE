import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/**
 * Layer L: additive Swahili columns + seed for careers, tenders, adverts,
 * testimonials, and research publications (upsert-if-empty).
 */
export class AddPublicContentLocaleSwFields1782900000000
  implements MigrationInterface
{
  name = 'AddPublicContentLocaleSwFields1782900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // jobs
    await addColumnIfNotExists(
      queryRunner,
      'jobs',
      'title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(queryRunner, 'jobs', 'summary_sw', 'text NULL');
    await addColumnIfNotExists(
      queryRunner,
      'jobs',
      'description_sw',
      'text NULL',
    );

    // tenders (camelCase columns match existing table)
    await addColumnIfNotExists(
      queryRunner,
      'tenders',
      'title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'tenders',
      'description_sw',
      'text NULL',
    );

    // adverts
    await addColumnIfNotExists(
      queryRunner,
      'adverts',
      'title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'adverts',
      'content_sw',
      'text NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'adverts',
      'button_text_sw',
      'character varying NULL',
    );

    // testimonials
    await addColumnIfNotExists(
      queryRunner,
      'testimonials',
      'content_sw',
      'text NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'testimonials',
      'author_role_sw',
      'character varying NULL',
    );

    // publications
    await addColumnIfNotExists(
      queryRunner,
      'publications',
      'title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'publications',
      'abstract_sw',
      'text NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'publications',
      'meta_title_sw',
      'character varying NULL',
    );
    await addColumnIfNotExists(
      queryRunner,
      'publications',
      'meta_description_sw',
      'text NULL',
    );

    // --- Seed jobs by slug ---
    const jobs: Array<[string, string, string, string]> = [
      [
        'lead-software-engineer-edtech',
        'Mhandisi Mkuu wa Programu (Teknolojia ya Elimu)',
        'Jiunge na timu yetu kuu ya uhandisi kujenga majukwaa ya kielimu yanayoweza kupanuka yatakayowahudumia mamilioni ya wanafunzi.',
        '<p>Jiunge na timu yetu kuu ya uhandisi kujenga majukwaa ya kielimu yanayoweza kupanuka yatakayowahudumia mamilioni ya wanafunzi barani Afrika.</p>',
      ],
      [
        'director-of-distance-learning',
        'Mkurugenzi wa Kujifunza kwa Umbali',
        'Ongoza maono ya kimkakati na utekelezaji wa programu zetu za kimataifa za kujifunza kwa umbali, ukihakikisha ubora wa kitaaluma.',
        '<p>Ongoza maono ya kimkakati na utekelezaji wa programu zetu za kimataifa za kujifunza kwa umbali, ukihakikisha ubora wa kitaaluma na ufikiaji.</p>',
      ],
      [
        'curriculum-developer-digital-arts',
        'Mtengenezaji wa Mitaala (Sanaa za Kidijitali)',
        'Buni na tekeleza mitaala bunifu ya mtandaoni kwa programu zetu mpya za digrii za Sanaa za Kidijitali na Ubunifu.',
        '<p>Buni na tekeleza mitaala bunifu ya mtandaoni kwa programu zetu mpya za digrii za Sanaa za Kidijitali na Ubunifu.</p>',
      ],
      [
        'ciso',
        'Afisa Mkuu wa Usalama wa Habari (CISO)',
        'Ongoza mkakati wa usalama wa mtandao wa chuo, ukihakikisha ulinzi wa data za wanafunzi na utafiti wa kitaasisi.',
        '<p>Ongoza mkakati wa usalama wa mtandao wa chuo, ukihakikisha ulinzi wa data za wanafunzi na utafiti wa kitaasisi.</p>',
      ],
      [
        'senior-lecturer-ai',
        'Mhadhiri Mkuu wa Akili Bandia',
        'Jiunge na Shule ya Sayansi na Teknolojia kuongoza utafiti na ufundishaji katika Akili Bandia iliyotumika.',
        '<p>Jiunge na Shule ya Sayansi na Teknolojia kuongoza utafiti na ufundishaji katika Akili Bandia iliyotumika.</p>',
      ],
      [
        'chief-financial-officer',
        'Afisa Mkuu wa Fedha',
        'Jukumu la uongozi wa juu la kusimamia mkakati wa kifedha wa OUK.',
        '<p>Jukumu la uongozi wa juu la kusimamia mkakati wa kifedha wa Chuo Kikuu Huria cha Kenya.</p>',
      ],
    ];
    for (const [slug, titleSw, summarySw, descriptionSw] of jobs) {
      await queryRunner.query(
        `UPDATE "jobs"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "summary_sw" = COALESCE(NULLIF(TRIM("summary_sw"), ''), $2::text),
             "description_sw" = COALESCE(NULLIF(TRIM("description_sw"), ''), $3::text)
         WHERE "slug" = $4::character varying`,
        [titleSw, summarySw, descriptionSw, slug],
      );
    }

    // --- Seed tenders by slug ---
    const tenders: Array<[string, string, string]> = [
      [
        'supply-delivery-scholarly-tablets-2026',
        'Ugavi na Uwasilishaji wa Kompyuta Kibao za Kisomi kwa Wanafunzi Wenza',
        'Ugavi wa kompyuta kibao 5,000 zenye azimio la juu zilizo na Mfumo wa Usimamizi wa Kujifunza wa OUK na suite salama ya ugunduzi.',
      ],
      [
        'provision-cloud-governance-security-ops',
        'Utowaji wa Mfumo wa Utawala wa Wingu na Operesheni za Usalama',
        'Kuanzisha mfumo thabiti wa usalama wa wingu kwa uhuru wa data wa kitaasisi na faragha ya kisomi.',
      ],
      [
        'design-implementation-virtual-campus-hub-phase-1',
        'Ubunifu na Utekelezaji wa Kituo cha Kampasi Pepe cha OUK Awamu ya 1',
        'Kuunda uzoefu wa kampasi pepe ya 3D yenye ubora wa juu kwa ugunduzi wa kisomi wa kuzama.',
      ],
      [
        'consultancy-ai-ethics-governance',
        'Ushauri wa Maadili ya AI na Utawala wa Kisomi wa Kitaasisi',
        'Kuunda mfumo thabiti wa utekelezaji wa kimaadili wa AI katika shughuli za chuo kikuu.',
      ],
    ];
    for (const [slug, titleSw, descriptionSw] of tenders) {
      await queryRunner.query(
        `UPDATE "tenders"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "description_sw" = COALESCE(NULLIF(TRIM("description_sw"), ''), $2::text)
         WHERE "slug" = $3::character varying`,
        [titleSw, descriptionSw, slug],
      );
    }

    // --- Seed adverts by English title ---
    const adverts: Array<[string, string, string, string]> = [
      [
        'Registration Now Open',
        'Usajili Sasa Umeanza',
        'Jisajili sasa kwa kozi zinazoanza Oktoba 2026 na Februari na Aprili 2027.',
        'Omba Sasa',
      ],
      [
        'Academic Affairs Hub',
        'Kituo cha Masuala ya Kitaaluma',
        'Gundua lango letu jipya lililojitolea kwa rekodi zako zote za kitaaluma, ratiba, na mwingiliano na wahadhiri.',
        'Gundua Kituo',
      ],
      [
        'Virtual Campus Tour',
        'Ziara ya Kampasi Pepe',
        'Pata uzoefu wa miundombinu ya kidijitali ya kisasa ya OUK kutoka popote duniani.',
        'Anza Ziara',
      ],
      [
        'Postgraduate Research Symposium',
        'Kongamano la Utafiti wa Uzamili',
        'Jiunge nasi katika mkutano wa kila mwaka wa wasomi wa kidijitali wanaowasilisha utafiti wa msingi katika teknolojia endelevu.',
        'Angalia Ratiba',
      ],
    ];
    for (const [title, titleSw, contentSw, buttonSw] of adverts) {
      await queryRunner.query(
        `UPDATE "adverts"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "content_sw" = COALESCE(NULLIF(TRIM("content_sw"), ''), $2::text),
             "button_text_sw" = COALESCE(NULLIF(TRIM("button_text_sw"), ''), $3::character varying)
         WHERE "title" = $4::character varying`,
        [titleSw, contentSw, buttonSw, title],
      );
    }

    // --- Seed testimonials by English content prefix ---
    const testimonials: Array<[string, string, string]> = [
      [
        'The Open University of Kenya has redefined flexible learning for me.',
        'Chuo Kikuu Huria cha Kenya kimefafanua upya kujifunza kunakobadilika kwangu. Ninaweza kusoma nikiwa nafanya kazi, na ubora wa maudhui ni wa kiwango cha kimataifa.',
        'Mwanafunzi wa MSc Sayansi ya Data',
      ],
      [
        'As a working professional, the ability to access high-quality higher education remotely',
        'Kama mtaalamu anayefanya kazi, uwezo wa kufikia elimu ya juu bora kwa mbali umebadilisha ukuaji wa kazi yangu.',
        'BSc Biashara na Ujasiriamali',
      ],
      [
        'The institutional support and the digital infrastructure provided by OUK',
        'Msaada wa kitaasisi na miundombinu ya kidijitali inayotolewa na OUK ni laini na rahisi sana kutumia.',
        'Mwanafunzi wa Diploma katika ICT',
      ],
      [
        'Learning at OUK has been an enlightening journey.',
        'Kujifunza katika OUK kumekuwa safari yenye kuelimisha. Mitaala ni ya kisasa na wahadhiri ni wasaidizi.',
        'Mwanafunzi wa BSc Sayansi ya Kompyuta',
      ],
      [
        'The flexibility of online learning combined with the rigorous academic standards',
        'Unyumbufu wa kujifunza mtandaoni pamoja na viwango thabiti vya kitaaluma hufanya OUK iwe chaguo bora kwangu.',
        'Mwanafunzi wa MBA',
      ],
    ];
    for (const [contentPrefix, contentSw, roleSw] of testimonials) {
      await queryRunner.query(
        `UPDATE "testimonials"
         SET "content_sw" = COALESCE(NULLIF(TRIM("content_sw"), ''), $1::text),
             "author_role_sw" = COALESCE(NULLIF(TRIM("author_role_sw"), ''), $2::character varying)
         WHERE "content" LIKE $3::text`,
        [contentSw, roleSw, `${contentPrefix}%`],
      );
    }

    // --- Seed publications by slug ---
    const pubs: Array<[string, string, string]> = [
      [
        'future-open-science-kenya',
        'Mustakabali wa Sayansi Huria nchini Kenya',
        'Kutathmini upokeaji wa hazina za ufikiaji huria katika taasisi za kitaifa za utafiti.',
      ],
      [
        'llm-low-resource',
        'Kuboresha LLM kwa Lugha Zenye Rasilimali Chache',
        'Mikakati ya kurekebisha miundo ya transformer kwa lahaja za Kiswahili na Kikuyu.',
      ],
      [
        'decentralized-ai-africa',
        'AI Iliyosambazwa katika Afrika ya Vijijini',
        'Utafiti juu ya kompyuta ya ukingo yenye bandwidth ndogo kwa uboreshaji wa kilimo.',
      ],
      [
        'societal-impact-open-access-africa',
        'Athari za Kijamii za Elimu ya Ufikiaji Huria katika Afrika Kusini mwa Sahara',
        'Uchambuzi kamili wa jinsi hazina za kidijitali za ufikiaji huria zimebadilisha ufikiaji wa maarifa katika jamii za vijijini.',
      ],
      [
        'quantum-safe-academic-records',
        'Itifaki Salama za Kriptografia kwa Rekodi za Kitaaluma za Wingu',
        'Kadri kompyuta ya quantum inavyoendelea, mifumo ya jadi ya kriptografia inakabiliwa na vitisho. Karatasi hii inapendekeza mbinu ya lattice.',
      ],
      [
        'bantu-language-processing-nlp',
        'Isimu ya Kikokotozi katika Usindikaji wa Lugha za Kibantu',
        'Mbinu za kuboresha miundo ya Usindikaji wa Lugha Asilia kwa lugha za Kibantu, kwa kuzingatia uhamishaji wa lugha mbalimbali.',
      ],
      [
        'decentralized-academic-frameworks',
        'Mifumo Iliyosambazwa ya Kitaaluma katika Vyuo Vikuu vya Kidijitali',
        'Utafiti huu unachunguza ujumuishaji wa mashirika huru yaliyosambazwa (DAO) ndani ya vyuo vikuu vya kisasa vya kidijitali.',
      ],
      [
        'cyber-resilience-emerging',
        'Ustahimilivu wa Mtandao katika Uchumi Unaobuka',
        'Karatasi ya sera kuhusu kulinda miundombinu muhimu ya kidijitali dhidi ya vitisho vinavyofadhiliwa na mataifa.',
      ],
      [
        'quantum-readiness-kenya',
        'Utayari wa Quantum: Kesi ya Kenya',
        'Kutathmini uwezekano wa ujumuishaji wa kompyuta ya quantum katika vituo vya data vya kikanda.',
      ],
      [
        'optimizing-student-engagement-ai',
        'Kuboresha Ushiriki wa Wanafunzi kupitia Ushauri Unaotumia AI',
        'Utafiti wa muda mrefu juu ya athari za majukwaa ya ushauri wa rika yanayosaidiwa na AI kwa uhifadhi wa wanafunzi na utendaji wa kitaaluma.',
      ],
      [
        'drone-swarms-reforestation',
        'Makundi ya Drone kwa Ufuatiliaji wa Upandaji Misitu',
        'Kutumia akili ya makundi kuchora ramani ya urejeshaji wa dari katika eneo la Msitu wa Mau.',
      ],
    ];
    for (const [slug, titleSw, abstractSw] of pubs) {
      await queryRunner.query(
        `UPDATE "publications"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "abstract_sw" = COALESCE(NULLIF(TRIM("abstract_sw"), ''), $2::text),
             "meta_title_sw" = COALESCE(NULLIF(TRIM("meta_title_sw"), ''), $1::character varying),
             "meta_description_sw" = COALESCE(NULLIF(TRIM("meta_description_sw"), ''), $2::text)
         WHERE "slug" = $3::character varying`,
        [titleSw, abstractSw, slug],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const drops: Array<[string, string]> = [
      ['jobs', 'description_sw'],
      ['jobs', 'summary_sw'],
      ['jobs', 'title_sw'],
      ['tenders', 'description_sw'],
      ['tenders', 'title_sw'],
      ['adverts', 'button_text_sw'],
      ['adverts', 'content_sw'],
      ['adverts', 'title_sw'],
      ['testimonials', 'author_role_sw'],
      ['testimonials', 'content_sw'],
      ['publications', 'meta_description_sw'],
      ['publications', 'meta_title_sw'],
      ['publications', 'abstract_sw'],
      ['publications', 'title_sw'],
    ];
    for (const [table, col] of drops) {
      if (await queryRunner.hasColumn(table, col)) {
        await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "${col}"`);
      }
    }
  }
}
