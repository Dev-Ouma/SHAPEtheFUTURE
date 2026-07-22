import { MigrationInterface, QueryRunner } from 'typeorm';
import { addColumnIfNotExists } from '../migration-helpers';

/**
 * Deep job-body Swahili columns + seed (upsert-if-empty).
 * Also re-asserts the three header menu title_sw rows by slug and English title.
 */
export class AddJobBodyLocaleSwFields1782930000000 implements MigrationInterface {
  name = 'AddJobBodyLocaleSwFields1782930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const col of [
      'responsibilities_sw',
      'requirements_sw',
      'qualifications_sw',
      'benefits_sw',
      'additional_notes_sw',
    ]) {
      await addColumnIfNotExists(queryRunner, 'jobs', col, 'text NULL');
    }

    // Menu leftovers — by slug and English title
    const menuRows: Array<[string, string, string]> = [
      [
        'about/vice-chancellor',
        'Vice-Chancellor Vision',
        'Maono ya Makamu wa Chansela',
      ],
      [
        'about/campus-feedback',
        'Complaints & Compliments',
        'Malalamiko na Pongezi',
      ],
      ['library/e-repository', 'E-Repository', 'Hazina ya Kielektroniki'],
    ];
    for (const [slug, title, titleSw] of menuRows) {
      await queryRunner.query(
        `UPDATE "menus" SET "title_sw" = $1::character varying
         WHERE ("slug" = $2::character varying OR "title" = $3::character varying)
           AND ("title_sw" IS NULL OR "title_sw" = ''::character varying)`,
        [titleSw, slug, title],
      );
    }

    type JobBodySw = [
      string, // slug
      string, // title_sw
      string, // summary_sw
      string, // description_sw
      string, // responsibilities_sw
      string, // requirements_sw
      string, // qualifications_sw
      string, // benefits_sw
      string, // additional_notes_sw
    ];

    const jobs: JobBodySw[] = [
      [
        'professor-of-artificial-intelligence',
        'Profesa wa Akili Bandia',
        'Ongoza utafiti wa kisasa na ufundishe mbinu za juu za AI kwa viongozi wa kidijitali wa kesho.',
        '<p>Chuo Kikuu Huria cha Kenya kinatafuta msomi mashuhuri kuongoza kitengo chetu kipya cha AI.</p>',
        '<ul><li>Buni mitaala kamili ya uzamili katika Kujifunza kwa Mashine</li><li>Simamia wagombea wa udaktari</li></ul>',
        '<ul><li>Ph.D. katika Sayansi ya Kompyuta au uwanja husika</li><li>Uzoefu wa kufundisha wa miaka 10+</li></ul>',
        '<ul><li>Machapisho katika majarida ya ngazi ya juu</li></ul>',
        '<p>Bima kamili ya afya, posho ya nyumba, na ruzuku kubwa za utafiti.</p>',
        '',
      ],
      [
        'cloud-infrastructure-architect',
        'Mbunifu wa Miundombinu ya Wingu',
        'Buni na weka miundombinu ya wingu inayoweza kupanuka inayoendesha mazingira pepe ya kujifunza ya OUK.',
        '<p>Utawajibika kwa upatikanaji wa msingi wa mali zote za kidijitali za OUK.</p>',
        '<ul><li>Buni suluhisho za AWS/Azure</li><li>Hakikisha upatikanaji wa 99.99% wa LMS</li></ul>',
        '<ul><li>AWS Certified Solutions Architect</li><li>Uzoefu wa Kubernetes wa miaka 5+</li></ul>',
        '<ul><li>B.Sc. katika Sayansi ya Kompyuta</li></ul>',
        '<p>Uwezo wa kufanya kazi kwa mbali na bonasi za utendaji.</p>',
        '',
      ],
      [
        'chief-financial-officer',
        'Afisa Mkuu wa Fedha',
        'Jukumu la uongozi wa juu la kusimamia mkakati wa kifedha wa OUK.',
        '<p>Ongoza mipango ya uendelevu wa fedha wa chuo.</p>',
        '<ul><li>Simamia bajeti za mabilioni ya shilingi</li><li>Kuza uhusiano na wafadhili wa kimataifa</li></ul>',
        '<ul><li>CPA-K, Shahada ya Uzamili katika Fedha</li></ul>',
        '<ul><li>Kusajiliwa na ICPAK</li></ul>',
        '<p>Posho ya watendaji, utoaji wa gari.</p>',
        '',
      ],
      [
        'data-privacy-officer',
        'Afisa wa Faragha ya Data',
        'Hakikisha uzingatiaji wa Sheria ya Ulinzi wa Data ya Kenya katika majukwaa yetu makubwa ya kidijitali.',
        '<p>Jukumu muhimu la kulinda data za wanafunzi zaidi ya 100,000 wanaotumia mfumo.</p>',
        '<ul><li>Kagua sera za ndani za data</li><li>Shirikiana na Kamishna wa Data</li></ul>',
        '<ul><li>Shahada katika Sheria au Usalama wa Habari</li></ul>',
        '<ul><li>Cheti cha CIPP</li></ul>',
        '<p>Mafunzo endelevu na vyeti vya kisheria vinafadhiliwa.</p>',
        '',
      ],
      [
        'digital-marketing-strategist',
        'Mtaalamu wa Mikakati ya Uuzaji wa Kidijitali',
        'Ongeza idadi ya usajili mtandaoni kupitia kampeni za kimkakati za kidijitali.',
        '<p>Tunatafuta muuzaji mahiri anayeelewa nafasi ya elimu ya kidijitali.</p>',
        '<ul><li>Uzalishaji wa wateja watarajiwa</li><li>Uboreshaji wa SEO</li></ul>',
        '<ul><li>Cheti cha HubSpot</li></ul>',
        '<ul><li>B.A. katika Mawasiliano/Uuzaji</li></ul>',
        '<p>Muundo wa kamisheni unaotegemea utendaji.</p>',
        '',
      ],
      [
        'senior-lecturer-cybernetics',
        'Mhadhiri Mkuu, Cybernetics',
        'Jiunge na Shule yetu ya Sayansi kuchunguza mstari wa mbele wa mwingiliano wa binadamu na kompyuta.',
        '<p>Mhadhiri wa moduli za juu za uzamili.</p>',
        '<ul><li>Andaa mitihani</li><li>Simamia miradi ya tasnifu</li></ul>',
        '<ul><li>Shahada ya juu katika Cybernetics au uwanja husika.</li></ul>',
        '<ul><li>Uzoefu mpana wa tasnia unapendelewa.</li></ul>',
        '<p>Ratiba rahisi.</p>',
        '',
      ],
      [
        'deputy-director-teaching-and-learning',
        'Naibu Mkurugenzi, Ufundishaji na Kujifunza',
        'Saidia utekelezaji wa Mkakati wa Ufundishaji na Kujifunza wa Chuo kwa Kujifunza Huria na Pepe.',
        '<p>Ongoza utekelezaji wa kimkakati na uundaji wa sera za ufundishaji wa kidijitali, tathmini mtandaoni, na kujifunza kwa teknolojia katika Chuo Kikuu Huria cha Kenya.</p>',
        '<ul><li>Saidia utekelezaji wa Mkakati wa Ufundishaji na Kujifunza wa Chuo kwa Kujifunza Huria na Pepe.</li><li>Saidia kuunda na kukagua sera, viwango, na miongozo ya ufundishaji, kujifunza, na tathmini ya kidijitali.</li><li>Toa programu za maendeleo ya kitaaluma kujenga ujuzi wa wahadhiri katika ufundishaji wa kidijitali na uwezeshaji mtandaoni.</li><li>Kuhimiza mbinu bunifu za ufundishaji na matumizi ya teknolojia mpya, ikiwemo AI na zana za otomatiki.</li><li>Ratibu ubuni na ukaguzi wa kozi mtandaoni ili kuhakikisha ubora, ufikiaji, na muundo unaozingatia mwanafunzi.</li><li>Kuhimiza utafiti na usomi katika ufundishaji wa kidijitali, tathmini mtandaoni, na ushiriki wa wanafunzi.</li><li>Ongoza mbinu za LearningOps kwa kutumia data na uchambuzi kuboresha michakato ya ufundishaji na mafanikio ya wanafunzi.</li><li>Jenga ushirikiano wa kitaifa na kimataifa kuunga mkono maendeleo ya kitaaluma na ubunifu wa ufundishaji.</li><li>Simamia wahadhiri kuhusu ufundishaji mtandaoni, tathmini, na ubuni wa kozi.</li><li>Wezesha jamii za mazoezi, warsha, na majukwaa ya kushiriki maarifa.</li><li>Tumia Uchambuzi wa Kujifunza kuunga mkono tahadhari za mapema, ushiriki wa wanafunzi, na hatua zinazotegemea data.</li><li>Ratibu rasilimali na ripoti maendeleo kwa DVC, Masuala ya Kitaaluma.</li></ul>',
        '<ul><li>Shahada ya Uzamili katika Sayansi ya Kompyuta, Mifumo ya Habari, ICT, au taaluma husika; au Shahada ya Uzamili katika Elimu yenye utaalamu wa ICT, Kujifunza Kidijitali, EdTech au uwanja husika.</li><li>Shahada ya kwanza katika Elimu, ICT-katika-Elimu au uwanja husika.</li><li>PhD katika Elimu (Ubunifu wa Mafundisho, Uundaji wa Mitaala, Teknolojia ya Elimu, au uwanja husika) itakuwa faida ya ziada.</li><li>Mafunzo katika mbinu za ufundishaji, ubuni wa mafundisho, e-learning, uhakikisho wa ubora, au uongozi wa elimu ya juu.</li><li>Cheti au mafunzo katika matumizi ya LMS, ufundishaji wa kidijitali, uundaji wa kozi mtandaoni, au zana za AI-katika-Elimu.</li><li>Angalau miaka 9 ya uzoefu husika wa kitaaluma, ikiwemo miaka mitatu (3) katika majukumu ya uongozi yanayohusisha usimamizi wa programu, usimamizi wa mitaala, uhakikisho wa ubora, na kujifunza kwa teknolojia.</li></ul>',
        '<ul><li>Ustadi katika majukwaa ya LMS, zana za kujifunza kidijitali, teknolojia za kujifunza zinazotumia AI, na Uchambuzi wa Kujifunza.</li><li>Uelewa thabiti wa mifano ya ufundishaji, sera za ufundishaji na kujifunza, na viwango vya kitaaluma.</li></ul>',
        '<p>Manufaa ya kawaida ya uongozi wa chuo na posho za maendeleo ya kitaaluma.</p>',
        '',
      ],
      [
        'lead-software-engineer-edtech',
        'Mhandisi Mkuu wa Programu (Teknolojia ya Elimu)',
        'Jiunge na timu yetu kuu ya uhandisi kujenga majukwaa ya kielimu yanayoweza kupanuka yatakayowahudumia mamilioni ya wanafunzi.',
        '<p>Jiunge na timu yetu kuu ya uhandisi kujenga majukwaa ya kielimu yanayoweza kupanuka yatakayowahudumia mamilioni ya wanafunzi barani Afrika.</p>',
        '<ul><li>Ongoza ubuni wa kiufundi, uundaji, na uwekaji wa programu za wavuti zinazoweza kupanuka.</li><li>Simamia na ongoza wahandisi wa programu wa ngazi ya chini na ya kati kupitia ukaguzi wa msimbo na programu ya pamoja.</li><li>Shirikiana na wasimamizi wa bidhaa kufafanua mahitaji ya kiufundi na usanifu wa mfumo.</li><li>Hakikisha usalama, utendaji, na uaminifu wa programu zote zinazowahudumia wanafunzi.</li><li>Anzisha na dudumisha mifumo thabiti ya CI/CD na majaribio otomatiki.</li></ul>',
        '<ul><li>Angalau miaka 7 ya uzoefu wa kitaalamu katika uhandisi wa programu, ikiwemo angalau miaka 2 katika jukumu la uongozi wa kiufundi.</li><li>Ustadi katika mazingira ya kisasa ya JavaScript/TypeScript (React, Next.js, Node.js).</li><li>Uzoefu thabiti na hifadhidata za uhusiano (PostgreSQL) na miundombinu ya wingu (AWS au GCP).</li><li>Rekodi iliyothibitishwa ya kujenga na kupanua programu changamano za wavuti.</li><li>Ujuzi bora wa mawasiliano na kutatua matatizo.</li></ul>',
        '<ul><li>Shahada ya Uzamili katika Sayansi ya Kompyuta, Uhandisi wa Programu, au uwanja husika (au uzoefu sawia wa vitendo).</li><li>AWS Certified Solutions Architect au cheti sawia ni faida ya ziada.</li></ul>',
        '<ul><li>Mshahara shindani na bonasi zinazotegemea utendaji.</li><li>Bima kamili ya afya, meno, na macho.</li><li>Saa rahisi za kazi na chaguo la kufanya kazi kwa mbali.</li><li>Likizo ya kila mwaka na muda wa kulipwa wa kuondoka kazini.</li><li>Bajeti ya kujifunza endelevu na maendeleo ya kitaaluma.</li><li>Ufikiaji wa vifaa vya chuo na rasilimali za kielimu.</li></ul>',
        '<p>Chuo Kikuu Huria cha Kenya ni mwajiri wa fursa sawa. Tunasherehekea utofauti na tumejitolea kuunda mazingira jumuishi kwa wafanyakazi wote.</p>',
      ],
      [
        'director-of-distance-learning',
        'Mkurugenzi wa Kujifunza kwa Umbali',
        'Ongoza maono ya kimkakati na utekelezaji wa programu zetu za kimataifa za kujifunza kwa umbali, ukihakikisha ubora wa kitaaluma.',
        '<p>Ongoza maono ya kimkakati na utekelezaji wa programu zetu za kimataifa za kujifunza kwa umbali, ukihakikisha ubora wa kitaaluma na ufikiaji.</p>',
        '<ul><li>Buni na tekeleza mpango wa kimkakati wa chuo wa kujifunza kwa umbali na mtandaoni.</li><li>Simamia ubuni, uundaji, na tathmini ya kozi na mitaala yote ya kidijitali.</li><li>Simamia timu yenye majukumu mbalimbali ya wabuni wa mafundisho, wataalamu wa teknolojia ya elimu, na wataalamu wa midia.</li><li>Weka viwango vya uhakikisho wa ubora na mbinu bora za ufundishaji mtandaoni.</li><li>Shirikiana na wahadhiri kuunganisha teknolojia bunifu (mf. AI, VR) katika uzoefu wa kujifunza.</li><li>Fuatilia ushiriki, uhifadhi, na vipimo vya mafanikio ya wanafunzi, ukitekeleza hatua inapohitajika.</li></ul>',
        '<ul><li>Angalau miaka 10 ya uzoefu katika elimu ya juu, ikiwemo angalau miaka 5 katika jukumu la uongozi linalolenga kujifunza mtandaoni au kwa umbali.</li><li>Uelewa wa kina wa nadharia za kujifunza kwa watu wazima, mifano ya ubuni wa mafundisho, na teknolojia za elimu.</li><li>Uwezo uliothibitishwa wa kuongoza mipango mikubwa ya kitaaluma na kusimamia bajeti.</li><li>Ujuzi wa kipekee wa uongozi, mawasiliano, na usimamizi wa wadau.</li><li>Uzoefu wa kushughulikia mahitaji ya uidhinishaji na udhibiti katika elimu ya juu.</li></ul>',
        '<ul><li>Ph.D. au Ed.D. katika Elimu, Teknolojia ya Elimu, Ubunifu wa Mafundisho, au uwanja husika.</li><li>Rekodi ya utafiti wa kisomi au uongozi wa mawazo katika elimu ya kidijitali.</li></ul>',
        '<ul><li>Kifurushi cha fidia ya watendaji.</li><li>Bima kamili ya afya ya familia.</li><li>Msaada wa kuhama (inapotumika).</li><li>Fursa za likizo ya sabbatical.</li><li>Programu za mafunzo ya watendaji na maendeleo ya uongozi.</li></ul>',
        '<p>Wagombea lazima wawasilishe jalada kamili linaloonyesha athari zao katika mipango ya awali ya kujifunza kwa umbali pamoja na maombi yao ya kawaida.</p>',
      ],
    ];

    for (const row of jobs) {
      const [
        slug,
        titleSw,
        summarySw,
        descriptionSw,
        responsibilitiesSw,
        requirementsSw,
        qualificationsSw,
        benefitsSw,
        additionalNotesSw,
      ] = row;
      await queryRunner.query(
        `UPDATE "jobs"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "summary_sw" = COALESCE(NULLIF(TRIM("summary_sw"), ''), $2::text),
             "description_sw" = COALESCE(NULLIF(TRIM("description_sw"), ''), $3::text),
             "responsibilities_sw" = COALESCE(NULLIF(TRIM("responsibilities_sw"), ''), $4::text),
             "requirements_sw" = COALESCE(NULLIF(TRIM("requirements_sw"), ''), $5::text),
             "qualifications_sw" = COALESCE(NULLIF(TRIM("qualifications_sw"), ''), $6::text),
             "benefits_sw" = COALESCE(NULLIF(TRIM("benefits_sw"), ''), $7::text),
             "additional_notes_sw" = COALESCE(NULLIF(TRIM("additional_notes_sw"), ''), $8::text)
         WHERE "slug" = $9::character varying`,
        [
          titleSw,
          summarySw,
          descriptionSw,
          responsibilitiesSw || null,
          requirementsSw || null,
          qualificationsSw || null,
          benefitsSw || null,
          additionalNotesSw || null,
          slug,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const col of [
      'additional_notes_sw',
      'benefits_sw',
      'qualifications_sw',
      'requirements_sw',
      'responsibilities_sw',
    ]) {
      if (await queryRunner.hasColumn('jobs', col)) {
        await queryRunner.query(`ALTER TABLE "jobs" DROP COLUMN "${col}"`);
      }
    }
  }
}
