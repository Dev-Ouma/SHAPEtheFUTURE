import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Layer K: backfill Swahili for news summaries/bodies, academic calendar,
 * and footer menu titles (upsert-if-empty only).
 */
export class SeedNewsCalendarFooterLocaleSw1782800000000 implements MigrationInterface {
  name = 'SeedNewsCalendarFooterLocaleSw1782800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- News: shared titles (covers school-scoped duplicates) ---
    const newsByTitle: Array<{
      title: string;
      title_sw: string;
      summary_sw: string;
      content_sw: string;
    }> = [
      {
        title: "Dean's Distinguished Lecture Series",
        title_sw: 'Mfululizo wa Mihadhara Maarufu ya Mkuu wa Shule',
        summary_sw:
          'Mhadhara Maalum wa Mgeni. Mhadhara wetu ujao unamshirikisha mtaalamu wa kimataifa wa ustahimilivu wa usalama wa mtandao. Mazungumzo yatazingatia kulinda miundombinu muhimu ya kidijitali dhidi ya vitisho vinavyofadhiliwa na mataifa.',
        content_sw:
          '<h3>Mhadhara Maalum wa Mgeni</h3><p>Mhadhara wetu ujao unamshirikisha mtaalamu wa kimataifa wa ustahimilivu wa usalama wa mtandao. Mazungumzo yatazingatia kulinda miundombinu muhimu ya kidijitali dhidi ya vitisho vinavyofadhiliwa na mataifa.</p>',
      },
      {
        title: 'FinTech Innovation Workshop',
        title_sw: 'Warsha ya Ubunifu wa FinTech',
        summary_sw:
          'Kujifunza kwa Vitendo. Uchambuzi wa kina wa teknolojia za hivi karibuni zinazobadilisha sekta ya fedha. Jifunze kuhusu ujumuishaji wa blockchain, usalama wa malipo ya simu, na mazingira ya majaribio ya udhibiti. Inafaa kwa wanafunzi na wataalamu.',
        content_sw:
          '<h3>Kujifunza kwa Vitendo</h3><p>Uchambuzi wa kina wa teknolojia za hivi karibuni zinazobadilisha sekta ya fedha. Jifunze kuhusu ujumuishaji wa blockchain, usalama wa malipo ya simu, na mazingira ya majaribio ya udhibiti.</p><p>Inafaa kwa wanafunzi na wataalamu.</p>',
      },
      {
        title: 'Global AI Ethics Summit 2024',
        title_sw: 'Mkutano wa Kimataifa wa Maadili ya AI 2024',
        summary_sw:
          'Muhtasari wa Tukio. Jiunge nasi kwa majadiliano kamili kuhusu athari za kimaadili za akili bandia katika nchi zinazoendelea. Mkutano huu unawaleta pamoja viongozi wa sekta, wasomi, na watunga sera.',
        content_sw:
          '<h3>Muhtasari wa Tukio</h3><p>Jiunge nasi kwa majadiliano kamili kuhusu athari za kimaadili za akili bandia katika nchi zinazoendelea. Mkutano huu unawaleta pamoja viongozi wa sekta, wasomi, na watunga sera.</p>',
      },
      {
        title: 'Research Symposium: Future of Cloud Computing',
        title_sw: 'Kongamano la Utafiti: Mustakabali wa Kompyuta ya Wingu',
        summary_sw:
          'Wasilisho la Kitaaluma. Wahadhiri na wanafunzi wanawasilisha matokeo yao ya hivi karibuni kuhusu miundo isiyo na seva, kompyuta ya ukingo, na vituo vya data visivyo na uchafuzi.',
        content_sw:
          '<h3>Wasilisho la Kitaaluma</h3><p>Wahadhiri na wanafunzi wanawasilisha matokeo yao ya hivi karibuni kuhusu miundo isiyo na seva, kompyuta ya ukingo, na vituo vya data visivyo na uchafuzi.</p>',
      },
      {
        title: 'Hackathon: Digital Solutions for Agriculture',
        title_sw: 'Hackathon: Suluhisho za Kidijitali kwa Kilimo',
        summary_sw:
          'Ubunifu wa Ushindani. Changamoto ya saa 48 ya kujenga zana za kidijitali zinazosaidia wakulima wadogo nchini Kenya. Shinda zawadi, fursa za ushauri, na nafasi ya kukuza mradi wako.',
        content_sw:
          '<h3>Ubunifu wa Ushindani</h3><p>Changamoto ya saa 48 ya kujenga zana za kidijitali zinazosaidia wakulima wadogo nchini Kenya. Shinda zawadi, fursa za ushauri, na nafasi ya kukuza mradi wako.</p>',
      },
      {
        title: 'OUK Research Hub Integration',
        title_sw: 'Ujumuishaji wa Kituo cha Utafiti cha OUK',
        summary_sw:
          'Muunganisho wa Kimataifa. Chuo Kikuu Huria cha Kenya (OUK) kimekamilisha awamu ya kwanza ya ujumuishaji wa Kituo chake kikuu cha Utafiti na hifadhidata kuu za kitaaluma duniani.',
        content_sw:
          '<h3>Muunganisho wa Kimataifa</h3><p>Chuo Kikuu Huria cha Kenya (OUK) kimekamilisha awamu ya kwanza ya ujumuishaji wa Kituo chake kikuu cha Utafiti na hifadhidata kuu za kitaaluma duniani, ikiwa ni pamoja na IEEE Xplore, ScienceDirect, na JSTOR.</p><p>Hatua hii inawapa wahadhiri na wanafunzi wa OUK ufikiaji salama wa mamilioni ya karatasi za kisomi, majarida, na ripoti za kiufundi. Ujumuishaji huu ni sehemu ya mpango wetu mpana wa "Maarifa Bila Mipaka".</p><h4>Faida Muhimu:</h4><ul><li>Utafutaji Umoja: Ufikiaji wa hifadhidata nyingi kwa bonyeza moja.</li><li>Ufikiaji Huria: Ugunduzi rahisi wa kazi za kisomi za bure.</li><li>Zana Shirikishi: Usimamizi wa nukuu na kushiriki kwa vikundi vya utafiti.</li></ul><p>Kituo cha Utafiti sasa kinapatikana kwa watumiaji wote walioidhinishwa kupitia milango ya wanafunzi na wafanyakazi.</p>',
      },
    ];

    for (const n of newsByTitle) {
      await queryRunner.query(
        `UPDATE "news"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "summary_sw" = COALESCE(NULLIF(TRIM("summary_sw"), ''), $2::text),
             "content_sw" = COALESCE(NULLIF(TRIM("content_sw"), ''), $3::text)
         WHERE "title" = $4::character varying`,
        [n.title_sw, n.summary_sw, n.content_sw, n.title],
      );
    }

    const newsBySlug: Array<{
      slug: string;
      title_sw: string;
      summary_sw: string;
      content_sw: string;
    }> = [
      {
        slug: 'data-science-school-launch',
        title_sw: 'Uzinduzi wa Shule ya Sayansi ya Data',
        summary_sw:
          'Kama sehemu ya dhamira yetu ya kuongoza uvumbuzi wa kiteknolojia Afrika, OUK inajivunia kuzindua Shule yake maalum ya Sayansi ya Data. Shule mpya itazingatia kuziba pengo la kimataifa la vipaji katika AI, ujifunzaji wa mashine, na uchambuzi wa data kubwa.',
        content_sw:
          '<p>Kama sehemu ya dhamira yetu ya kuongoza uvumbuzi wa kiteknolojia Afrika, OUK inajivunia kuzindua Shule yake maalum ya Sayansi ya Data.</p><p>Shule mpya itazingatia kuziba pengo la kimataifa la vipaji katika AI, ujifunzaji wa mashine, na uchambuzi wa data kubwa. Tumeshirikiana na makampuni makubwa ya teknolojia kuhakikisha mitaala yetu inabakia muhimu kwa sekta.</p>',
      },
      {
        slug: 'admissions-now-open',
        title_sw: 'Udahili wa OUK Sasa Umeanza',
        summary_sw:
          'Chuo Kikuu Huria cha Kenya kinafuraha kutangaza ufunguzi wa dirisha la maombi kwa mwaka wa kwanza wa kitaaluma. Waombaji wanaweza sasa kuomba programu mbalimbali za shahada ya kwanza na uzamili.',
        content_sw:
          '<p>Chuo Kikuu Huria cha Kenya kinafuraha kutangaza ufunguzi wa dirisha la maombi kwa mwaka wa kwanza wa kitaaluma.</p><p>Waombaji wanaweza sasa kuomba programu mbalimbali za shahada ya kwanza na uzamili. Mchakato wetu wa udahili ni wa mtandaoni kabisa, ukionyesha dhamira yetu ya ufikiaji na elimu inayoongoza kwa kidijitali.</p><h3>Kwa Nini Kuomba OUK?</h3><ul><li>Kujifunza mtandaoni kunakobadilika kwa wataalamu wanaofanya kazi.</li><li>Elimu bora kwa ada nafuu.</li><li>Ufikiaji wa mitandao ya kimataifa ya utafiti na kitaaluma.</li></ul>',
      },
      {
        slug: 'test-news',
        title_sw: 'Habari ya Majaribio',
        summary_sw:
          'Chuo Kikuu Huria cha Kenya kinafuraha kutangaza ufunguzi wa dirisha la maombi kwa mwaka wa kwanza wa kitaaluma. Waombaji wanaweza sasa kuomba programu mbalimbali za shahada ya kwanza na uzamili.',
        content_sw:
          '<p>Chuo Kikuu Huria cha Kenya kinafuraha kutangaza ufunguzi wa dirisha la maombi kwa mwaka wa kwanza wa kitaaluma.</p><p>Waombaji wanaweza sasa kuomba programu mbalimbali za shahada ya kwanza na uzamili. Mchakato wetu wa udahili ni wa mtandaoni kabisa, ukionyesha dhamira yetu ya ufikiaji na elimu inayoongoza kwa kidijitali.</p><h3>Kwa Nini Kuomba OUK?</h3><ul><li><p>Kujifunza mtandaoni kunakobadilika kwa wataalamu wanaofanya kazi.</p></li><li><p>Elimu bora kwa ada nafuu.</p></li><li><p>Ufikiaji wa mitandao ya kimataifa ya utafiti na kitaaluma.</p></li></ul>',
      },
    ];

    for (const n of newsBySlug) {
      await queryRunner.query(
        `UPDATE "news"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "summary_sw" = COALESCE(NULLIF(TRIM("summary_sw"), ''), $2::text),
             "content_sw" = COALESCE(NULLIF(TRIM("content_sw"), ''), $3::text)
         WHERE "slug" = $4::character varying`,
        [n.title_sw, n.summary_sw, n.content_sw, n.slug],
      );
    }

    // --- Academic calendar ---
    const calendarSw: Array<[string, string, string]> = [
      [
        'Semester I Commencement',
        'Kuanza kwa Muhula wa I',
        'Mwanzo rasmi wa kipindi cha kitaaluma cha Mei-Agosti 2025. Mwelekezo kwa wanafunzi wapya unaanza.',
      ],
      [
        'Science & Tech Faculty Orientation',
        'Mwelekezo wa Kitivo cha Sayansi na Teknolojia',
        'Mwelekezo wa kina kwa wanafunzi wa Sayansi, Teknolojia, na Hisabati.',
      ],
      [
        'Course Registration Deadline',
        'Tarehe ya Mwisho ya Usajili wa Kozi',
        'Siku ya mwisho ya kuchagua vitengo na kujisajili kwa muhula wa sasa.',
      ],
      [
        'Madaraka Day (Public Holiday)',
        'Siku ya Madaraka (Sikukuu ya Umma)',
        'Sikukuu ya kitaifa — shughuli zote za chuo zinasimamishwa.',
      ],
      [
        'AI & Robotics Showcase',
        'Maonyesho ya AI na Robotiki',
        'Maonyesho ya miradi ya wanafunzi katika Akili Bandia na Robotiki.',
      ],
      [
        'Mid-Semester Assessment Week',
        'Wiki ya Tathmini ya Katikati ya Muhula',
        'Tathmini za malezi na mitihani ya muda kwa vitengo vyote vya shahada ya kwanza.',
      ],
      [
        'Cybersecurity Awareness Week',
        'Wiki ya Uhamasishaji wa Usalama wa Mtandao',
        'Warsha na semina kuhusu usalama wa kidijitali na ulinzi wa data.',
      ],
      [
        'Institutional Research Symposia',
        'Makongamano ya Utafiti wa Kitaasisi',
        'Kuonyesha uvumbuzi katika AI na Sayansi ya Data kutoka kwa watafiti wetu wakuu.',
      ],
      [
        'OUK Hackathon: Solving Regional Challenges',
        'Hackathon ya OUK: Kutatua Changamoto za Kikanda',
        'Shindano la chuo kikuu kujenga suluhisho zinazoendeshwa na teknolojia kwa matatizo ya ndani.',
      ],
      [
        'Final Semester Examinations',
        'Mitihani ya Mwisho ya Muhula',
        'Tathmini kamili za muhtasari kwa kipindi cha Muhula wa I.',
      ],
      [
        'End of Semester Break',
        'Mapumziko ya Mwisho wa Muhula',
        'Kipindi cha mapumziko cha chuo kabla ya kipindi cha Septemba-Desemba.',
      ],
    ];

    for (const [title, titleSw, descSw] of calendarSw) {
      await queryRunner.query(
        `UPDATE "academic_calendar_events"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "description_sw" = COALESCE(NULLIF(TRIM("description_sw"), ''), $2::text)
         WHERE "title" = $3::character varying`,
        [titleSw, descSw, title],
      );
    }

    // --- Footer menus ---
    const menuSw: Record<string, string> = {
      'footer-reg': 'Usajili',
      apply: 'Omba Sasa',
      portal: 'Lango la Mwanafunzi',
      'adm-policy': 'Sera ya Udahili',
      'footer-schools': 'Shule Zetu',
      'f-sci': 'Sayansi na Teknolojia',
      'f-bus': 'Biashara na Uchumi',
      'footer-legal': 'Taasisi',
    };

    for (const [slug, titleSw] of Object.entries(menuSw)) {
      await queryRunner.query(
        `UPDATE "menus"
         SET "title_sw" = $1::character varying
         WHERE "slug" = $2::character varying
           AND ("title_sw" IS NULL OR "title_sw" = ''::character varying)`,
        [titleSw, slug],
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Data backfill — no destructive rollback
  }
}
