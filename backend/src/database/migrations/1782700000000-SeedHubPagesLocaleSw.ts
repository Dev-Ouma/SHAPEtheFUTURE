import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Layer J: insert missing public hub CMS pages with EN + SW copy.
 * Routes call getPage("admissions"|"academics"|"research"|"library"|…) —
 * when rows are absent, heroes fall back to chrome-only English titles.
 */
export class SeedHubPagesLocaleSw1782700000000 implements MigrationInterface {
  name = 'SeedHubPagesLocaleSw1782700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hubs: Array<{
      slug: string;
      parent_slug: string | null;
      title: string;
      title_sw: string;
      summary: string;
      summary_sw: string;
      content: string;
      content_sw: string;
      meta_title: string;
      meta_title_sw: string;
      meta_description: string;
      meta_description_sw: string;
    }> = [
      {
        slug: 'admissions',
        parent_slug: null,
        title: 'Admissions',
        title_sw: 'Udahili',
        summary:
          'Join a global community of digital learners. Our admissions process is transparent, flexible, and designed for working professionals.',
        summary_sw:
          'Jiunge na jamii ya kimataifa ya wanafunzi wa kidijitali. Mchakato wetu wa udahili ni wa uwazi, unaonyumbulika, na umeundwa kwa wataalamu wanaofanya kazi.',
        content:
          '<p>The Open University of Kenya welcomes applicants to undergraduate, postgraduate, and professional development pathways. Explore requirements, intakes, and how to apply through our digital admissions portals.</p>',
        content_sw:
          '<p>Chuo Kikuu Huria cha Kenya kinakaribisha waombaji kwa njia za shahada ya kwanza, uzamili, na maendeleo ya kitaaluma. Gundua mahitaji, udahili, na jinsi ya kuomba kupitia milango yetu ya kidijitali ya udahili.</p>',
        meta_title: 'Admissions | The Open University of Kenya',
        meta_title_sw: 'Udahili | Chuo Kikuu Huria cha Kenya',
        meta_description:
          'Apply to OUK. Transparent digital admissions for undergraduate, postgraduate, and professional programmes.',
        meta_description_sw:
          'Omba katika OUK. Udahili wa kidijitali wa uwazi kwa programu za shahada ya kwanza, uzamili, na kitaaluma.',
      },
      {
        slug: 'academics',
        parent_slug: null,
        title: 'Academics',
        title_sw: 'Masomo',
        summary:
          "OUK's academic hub bridges global knowledge and local innovation through digital-first schools and programmes.",
        summary_sw:
          'Kituo cha masomo cha OUK kinaunganisha maarifa ya kimataifa na uvumbuzi wa ndani kupitia shule na programu zinazoongoza kwa kidijitali.',
        content:
          '<p>Explore OUK schools, programmes, timetables, and professional development offerings designed for flexible online learning.</p>',
        content_sw:
          '<p>Gundua shule za OUK, programu, ratiba, na matoleo ya maendeleo ya kitaaluma yaliyoundwa kwa kujifunza mtandaoni kunakobadilika.</p>',
        meta_title: 'Academics & schools | Open University of Kenya',
        meta_title_sw: 'Masomo na shule | Chuo Kikuu Huria cha Kenya',
        meta_description:
          "Explore OUK's digital-first academic landscape, from undergraduate excellence to professional pathways.",
        meta_description_sw:
          'Gundua mazingira ya kitaaluma yanayoongoza kwa kidijitali ya OUK, kutoka ubora wa shahada ya kwanza hadi njia za kitaaluma.',
      },
      {
        slug: 'research',
        parent_slug: null,
        title: 'Research',
        title_sw: 'Utafiti',
        summary:
          'Pioneering digital discovery and bridging theoretical scholarship with practical innovation.',
        summary_sw:
          'Kuanzisha ugunduzi wa kidijitali na kuunganisha elimu ya nadharia na uvumbuzi wa vitendo.',
        content:
          '<p>OUK research advances technology-driven discovery through publications, programmes, and collaborative partnerships.</p>',
        content_sw:
          '<p>Utafiti wa OUK unaendeleza ugunduzi unaoendeshwa na teknolojia kupitia machapisho, programu, na ushirikiano.</p>',
        meta_title: 'Research with global impact | Open University of Kenya',
        meta_title_sw:
          'Utafiti wenye athari ya kimataifa | Chuo Kikuu Huria cha Kenya',
        meta_description:
          'Pioneering digital discovery and bridging theoretical scholarship with practical innovation at OUK.',
        meta_description_sw:
          'Ugunduzi wa kidijitali na uvumbuzi wa vitendo katika Chuo Kikuu Huria cha Kenya.',
      },
      {
        slug: 'library',
        parent_slug: null,
        title: 'Digital Library',
        title_sw: 'Maktaba ya Kidijitali',
        summary:
          "Access OUK's global digital repository of e-journals, databases, and continuous learning resources.",
        summary_sw:
          'Fikia hazina ya kidijitali ya kimataifa ya OUK ya majarida ya kielektroniki, hifadhidata, na rasilimali za kujifunza endelevu.',
        content:
          '<p>The OUK virtual library connects learners to e-resources, information literacy support, and open-access scholarship.</p>',
        content_sw:
          '<p>Maktaba pepe ya OUK inawaunganisha wanafunzi na rasilimali za kielektroniki, msaada wa ujuzi wa habari, na uchapishaji wa ufikiaji huria.</p>',
        meta_title: 'Digital library | Open University of Kenya',
        meta_title_sw: 'Maktaba ya kidijitali | Chuo Kikuu Huria cha Kenya',
        meta_description:
          "Access OUK's global digital repository of e-journals, databases, and learning resources.",
        meta_description_sw:
          'Fikia hazina ya kidijitali ya OUK ya majarida, hifadhidata, na rasilimali za kujifunza.',
      },
      {
        slug: 'governance',
        parent_slug: 'about',
        title: 'Governance',
        title_sw: 'Utawala',
        summary:
          'Institutional governance structures that uphold integrity, accountability, and academic excellence.',
        summary_sw:
          'Miundo ya utawala wa kitaasisi inayodumisha uadilifu, uwajibikaji, na ubora wa kitaaluma.',
        content:
          '<p>Learn how OUK is governed through its council, management board, and academic leadership structures.</p>',
        content_sw:
          '<p>Jifunze jinsi OUK inavyotawaliwa kupitia baraza lake, bodi ya usimamizi, na miundo ya uongozi wa kitaaluma.</p>',
        meta_title: 'Governance | Open University of Kenya',
        meta_title_sw: 'Utawala | Chuo Kikuu Huria cha Kenya',
        meta_description:
          'OUK governance: council, management, and academic leadership for institutional integrity.',
        meta_description_sw:
          'Utawala wa OUK: baraza, usimamizi, na uongozi wa kitaaluma kwa uadilifu wa kitaasisi.',
      },
      {
        slug: 'quality-assurance',
        parent_slug: 'about',
        title: 'Quality Assurance',
        title_sw: 'Uhakikisho wa Ubora',
        summary:
          'Quality frameworks that safeguard academic standards across OUK programmes and services.',
        summary_sw:
          'Mifumo ya ubora inayolinda viwango vya kitaaluma katika programu na huduma za OUK.',
        content:
          '<p>OUK quality assurance promotes continuous improvement, compliance, and learner-centred excellence.</p>',
        content_sw:
          '<p>Uhakikisho wa ubora wa OUK unakuza uboreshaji endelevu, uzingatiaji wa viwango, na ubora unaozingatia mwanafunzi.</p>',
        meta_title: 'Quality assurance | Open University of Kenya',
        meta_title_sw: 'Uhakikisho wa ubora | Chuo Kikuu Huria cha Kenya',
        meta_description:
          'How OUK safeguards academic standards through quality assurance frameworks.',
        meta_description_sw:
          'Jinsi OUK inavyolinda viwango vya kitaaluma kupitia mifumo ya uhakikisho wa ubora.',
      },
      {
        slug: 'policies',
        parent_slug: 'about',
        title: 'University Policies',
        title_sw: 'Sera za Chuo',
        summary:
          'Official policies guiding fairness, integrity, and high-quality educational experiences.',
        summary_sw:
          'Sera rasmi zinazoongoza usawa, uadilifu, na uzoefu wa kielimu wa ubora wa juu.',
        content:
          '<p>Our policies are designed to ensure fair, transparent, and high-quality educational experiences for all students. This page includes our Admission Policy, Academic Integrity Code, and Privacy Policy.</p>',
        content_sw:
          '<p>Sera zetu zimeundwa kuhakikisha uzoefu wa kielimu ulio sawa, wa uwazi, na wa ubora wa juu kwa wanafunzi wote. Ukurasa huu unajumuisha Sera yetu ya Udahili, Kanuni ya Uadilifu wa Kitaaluma, na Sera ya Faragha.</p>',
        meta_title: 'University Policies | Open University of Kenya',
        meta_title_sw: 'Sera za Chuo | Chuo Kikuu Huria cha Kenya',
        meta_description:
          'Official OUK policies on admissions, academic integrity, and privacy.',
        meta_description_sw:
          'Sera rasmi za OUK kuhusu udahili, uadilifu wa kitaaluma, na faragha.',
      },
      {
        slug: 'academic-affairs',
        parent_slug: null,
        title: 'Academic Affairs',
        title_sw: 'Masuala ya Kitaaluma',
        summary:
          "Safeguarding the integrity of OUK's academic mission through rigorous standards and faculty support.",
        summary_sw:
          'Kulinda uadilifu wa dhamira ya kitaaluma ya OUK kupitia viwango thabiti na msaada kwa wahadhiri.',
        content:
          '<p>Academic Affairs governs curriculum integrity, assessment standards, and faculty development across OUK.</p>',
        content_sw:
          '<p>Masuala ya Kitaaluma yanasimamia uadilifu wa mitaala, viwango vya tathmini, na maendeleo ya wahadhiri katika OUK.</p>',
        meta_title: 'Academic affairs | Open University of Kenya',
        meta_title_sw: 'Masuala ya kitaaluma | Chuo Kikuu Huria cha Kenya',
        meta_description:
          'Governing academic excellence, curriculum integrity, and faculty development at OUK.',
        meta_description_sw:
          'Kusimamia ubora wa kitaaluma, uadilifu wa mitaala, na maendeleo ya wahadhiri katika OUK.',
      },
      {
        slug: 'faculty-resources',
        parent_slug: 'academic-affairs',
        title: 'Faculty Resources',
        title_sw: 'Rasilimali za Wahadhiri',
        summary:
          'Tools, platforms, and guidance for OUK faculty delivering digital-first teaching.',
        summary_sw:
          'Zana, majukwaa, na mwongozo kwa wahadhiri wa OUK wanaotoa ufundishaji unaoongoza kwa kidijitali.',
        content:
          '<p>Access pedagogical platforms, teaching resources, and support channels for OUK faculty and staff.</p>',
        content_sw:
          '<p>Fikia majukwaa ya ufundishaji, rasilimali za kufundisha, na njia za msaada kwa wahadhiri na wafanyakazi wa OUK.</p>',
        meta_title: 'Faculty resources | Open University of Kenya',
        meta_title_sw: 'Rasilimali za wahadhiri | Chuo Kikuu Huria cha Kenya',
        meta_description:
          'Faculty platforms and teaching resources at the Open University of Kenya.',
        meta_description_sw:
          'Majukwaa na rasilimali za ufundishaji kwa wahadhiri katika Chuo Kikuu Huria cha Kenya.',
      },
    ];

    for (const h of hubs) {
      await queryRunner.query(
        `INSERT INTO "pages" (
           "title", "title_sw", "slug", "content", "content_sw",
           "summary", "summary_sw", "parent_slug",
           "meta_title", "meta_title_sw", "meta_description", "meta_description_sw",
           "layout_template", "status", "is_published"
         )
         SELECT
           $1::character varying, $2::character varying, $3::character varying,
           $4::text, $5::text, $6::text, $7::text, $8::character varying,
           $9::character varying, $10::character varying, $11::text, $12::text,
           'default'::character varying, 'PUBLISHED'::pages_status_enum, true
         WHERE NOT EXISTS (
           SELECT 1 FROM "pages" WHERE "slug" = $3::character varying
         )`,
        [
          h.title,
          h.title_sw,
          h.slug,
          h.content,
          h.content_sw,
          h.summary,
          h.summary_sw,
          h.parent_slug,
          h.meta_title,
          h.meta_title_sw,
          h.meta_description,
          h.meta_description_sw,
        ],
      );

      // If row exists but SW empty, backfill SW only
      await queryRunner.query(
        `UPDATE "pages"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "summary_sw" = COALESCE(NULLIF(TRIM("summary_sw"), ''), $2::text),
             "content_sw" = COALESCE(NULLIF(TRIM("content_sw"), ''), $3::text),
             "meta_title_sw" = COALESCE(NULLIF(TRIM("meta_title_sw"), ''), $4::character varying),
             "meta_description_sw" = COALESCE(NULLIF(TRIM("meta_description_sw"), ''), $5::text)
         WHERE "slug" = $6::character varying`,
        [
          h.title_sw,
          h.summary_sw,
          h.content_sw,
          h.meta_title_sw,
          h.meta_description_sw,
          h.slug,
        ],
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Keep seeded hub pages
  }
}
