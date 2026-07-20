import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Layer I: backfill Swahili CMS body copy when empty.
 * - pages.content_sw (+ meta_*_sw where useful)
 * - hero_slides *_sw
 * - faqs question_sw / answer_sw
 * Upsert-if-empty only — never overwrites editor-provided SW.
 */
export class SeedCmsBodyLocaleSw1782600000000 implements MigrationInterface {
  name = 'SeedCmsBodyLocaleSw1782600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const pageBodies: Array<{
      slug: string;
      content_sw: string;
      meta_title_sw?: string;
      meta_description_sw?: string;
    }> = [
      {
        slug: 'about/management',
        content_sw:
          '<p>Muhtasari wa Bodi ya Usimamizi wa Chuo — uongozi wa kiutendaji wa huduma za kitaaluma na utawala.</p>',
        meta_title_sw: 'Bodi ya Usimamizi | Chuo Kikuu Huria cha Kenya',
        meta_description_sw:
          'Uongozi wa kiutendaji wa huduma za kitaaluma na utawala katika Chuo Kikuu Huria cha Kenya.',
      },
      {
        slug: 'university-chancellor',
        content_sw:
          '<h2>Uongozi wa Kitaasisi</h2><p>Prof. Elizabeth M. Sterling ni kielelezo cha ubora wa kitaaluma na uadilifu wa kitaasisi. Akiwa na uzoefu wa zaidi ya miongo mitatu katika utawala wa elimu ya juu, amekuwa mstari wa mbele katika mabadiliko ya kidijitali ya kujifunza Afrika. Utawala wake unaonyeshwa na dhamira kubwa ya kufanya maarifa yafikike kwa wote na matumizi ya kimaadili ya teknolojia katika utafiti.</p><h3>Athari ya Kimataifa</h3><p>Zaidi ya jukumu lake katika OUK, Prof. Sterling anashauri mashirika kadhaa ya kimataifa kuhusu sera za elimu na amekuwa msomi mgeni katika vyuo vikuu vikubwa duniani. Maono yake kwa OUK ni kuunda kampasi isiyo na mipaka inayomwezesha kila Mkenya kwa zana za mafanikio katika uchumi wa kidijitali wa kimataifa.</p>',
        meta_title_sw: 'Ofisi ya Chansela | Chuo Kikuu Huria cha Kenya',
      },
      {
        slug: 'vice-chancellor',
        content_sw:
          '<p>Chuo Kikuu Huria cha Kenya kiko katika makutano ya teknolojia na uwezo wa binadamu. Kama Makamu wa Chansela, maono yangu ni kuongoza taasisi ambayo haifuati tu kasi ya dunia, bali inaweka kasi kwa mustakabali wa elimu ya juu.</p><p>Tunajenga zaidi ya chuo kikuu; tunajenga mtandao wa kimataifa wa wanafunzi na viongozi. Dhamira yetu kwa ufundishaji unaoendeshwa na teknolojia inahakikisha wanafunzi wetu wako tayari kwa changamoto za kesho, leo.</p>',
        meta_title_sw: 'Maono ya Makamu wa Chansela | Chuo Kikuu Huria cha Kenya',
      },
      {
        slug: 'about/complaints',
        content_sw:
          'Dhamira yetu kwa utawala wa kimaadili inahakikisha kila mdau ana sauti. Tumia lango hili kuwasilisha malalamiko au kufuatilia hali ya kesi zilizopo katika rejista ya kitaasisi.',
        meta_title_sw: 'Kituo cha Malalamiko | Chuo Kikuu Huria cha Kenya',
      },
      {
        slug: 'about/downloads',
        content_sw:
          'Karibu kwenye sehemu maalum ya vipakuliwa. Lango hili la kati hutoa ufikiaji wa vyombo muhimu vya kitaasisi, mifumo ya kitaaluma, na rasilimali za kiutawala zilizoundwa kuunga mkono ubora na uwazi.',
        meta_title_sw: 'Vipakuliwa | Chuo Kikuu Huria cha Kenya',
      },
      {
        slug: 'about/uniqueness',
        content_sw:
          '<h2>Zaidi ya Mipaka ya Jadi</h2><p>Chuo Kikuu Huria cha Kenya (OUK) kilianzishwa kwa maono moja: kuondoa vizuizi vya kijiografia na kiuchumi vinavyozuia watu wenye vipaji kufuata elimu ya juu. Kama taasisi inayoongoza kwa kidijitali, hatufafanuliwi na kuta za kimwili, bali na nguvu ya jamii yetu ya kimataifa ya kujifunza.<br></p><h3>Nini Kinachotufanya Tuwe Tofauti?<br></h3><h4>1. Kujifunza kwa Msingi wa Kidijitali</h4><p>Kila kozi, kila tathmini, na kila mwingiliano umebuniwa kwa ulimwengu wa kidijitali. Jukwaa letu linaitikia, ni rahisi kutumia, na linafikika kutoka popote duniani.<br></p><h4>2. Bei Nafuu kwa Kiasi Kikubwa</h4><p>Kwa kutumia teknolojia kupunguza gharama za uendeshaji, tunatoa elimu ya kiwango cha chuo kikuu kwa sehemu ndogo ya gharama ya taasisi za jadi za matofali na chokaa.<br></p><h4>3. Kasi Inayobadilika</h4><p>Imeundwa kwa wataalamu wanaofanya kazi na wanafunzi wazima, OUK inakuruhusu kusawazisha masomo yako na kazi na majukumu ya familia.<br></p><h4>4. Mitaala Iliyounganishwa na Sekta</h4><p>Programu zetu zinatengenezwa pamoja na viongozi wa sekta ili kuhakikisha kila mhitimu wa OUK anaingia sokoni la ajira akiwa na ujuzi tayari kutumika.</p><p>Jiunge na maelfu ya wanafunzi waliochagua Chuo Kikuu Huria cha Kenya kama mshirika wao katika kujifunza maisha yote na mafanikio ya kitaaluma.</p>',
        meta_title_sw: 'Upekee wa OUK | Chuo Kikuu Huria cha Kenya',
      },
      {
        slug: 'about/policies',
        content_sw:
          'Sera zetu zimeundwa kuhakikisha uzoefu wa kielimu ulio sawa, wa uwazi, na wa ubora wa juu kwa wanafunzi wote. Ukurasa huu unajumuisha Sera yetu ya Udahili, Kanuni ya Uadilifu wa Kitaaluma, na Sera ya Faragha.',
        meta_title_sw: 'Sera za Chuo | Chuo Kikuu Huria cha Kenya',
        meta_description_sw:
          'Sera rasmi zinazoongoza ubora, uadilifu, na utawala katika Chuo Kikuu Huria cha Kenya.',
      },
      {
        slug: 'about',
        content_sw:
          'Imeanzishwa ili kutoa elimu ya mtandaoni inayobadilika, ya bei nafuu, na ya ubora wa juu, Chuo Kikuu Huria cha Kenya kiko mstari wa mbele katika mabadiliko ya kidijitali katika elimu ya juu. Dhamira yetu ni kufanya elimu ifikike kwa wote kupitia ubunifu na ufikiaji.',
        meta_title_sw: 'Kuhusu OUK | Elimu Bora Mtandaoni nchini Kenya',
        meta_description_sw:
          'Jifunze kuhusu dhamira, uongozi, na historia ya Chuo Kikuu Huria cha Kenya.',
      },
    ];

    for (const p of pageBodies) {
      await queryRunner.query(
        `UPDATE "pages"
         SET "content_sw" = COALESCE(NULLIF(TRIM("content_sw"), ''), $1::text),
             "meta_title_sw" = COALESCE(NULLIF(TRIM("meta_title_sw"), ''), $2::character varying),
             "meta_description_sw" = COALESCE(NULLIF(TRIM("meta_description_sw"), ''), $3::text)
         WHERE "slug" = $4::character varying`,
        [
          p.content_sw,
          p.meta_title_sw ?? null,
          p.meta_description_sw ?? null,
          p.slug,
        ],
      );
    }

    // Hero slides: match by English CTA text (stable in seed data)
    const heroSw: Array<{
      cta_text: string;
      title_sw: string;
      tagline_sw: string;
      description_sw: string;
      cta_text_sw: string;
    }> = [
      {
        cta_text: 'Apply Now',
        title_sw:
          'Mustakabali wa <br /> <span class="text-primary italic">Kujifunza</span> Uko Hapa.',
        tagline_sw: 'Kuwawezesha Viongozi wa Kesho',
        description_sw:
          'Jiunge na Chuo Kikuu Huria cha Kenya na upate elimu bora ya mtandaoni iliyoundwa kwa unyumbufu, ubunifu, na ubora wa kazi.',
        cta_text_sw: 'Omba Sasa',
      },
      {
        cta_text: 'Explore Research',
        title_sw:
          'Utafiti unao <br /> <span class="text-secondary italic">Gusa</span> Dunia.',
        tagline_sw: 'Ubora wa Kitaasisi',
        description_sw:
          'Watafiti wetu wanashughulikia changamoto za kimataifa kupitia uvumbuzi unaoendeshwa na teknolojia na mifumo shirikishi ya kidijitali.',
        cta_text_sw: 'Gundua Utafiti',
      },
    ];

    for (const h of heroSw) {
      await queryRunner.query(
        `UPDATE "hero_slides"
         SET "title_sw" = COALESCE(NULLIF(TRIM("title_sw"), ''), $1::character varying),
             "tagline_sw" = COALESCE(NULLIF(TRIM("tagline_sw"), ''), $2::character varying),
             "description_sw" = COALESCE(NULLIF(TRIM("description_sw"), ''), $3::text),
             "cta_text_sw" = COALESCE(NULLIF(TRIM("cta_text_sw"), ''), $4::character varying)
         WHERE "cta_text" = $5::character varying`,
        [
          h.title_sw,
          h.tagline_sw,
          h.description_sw,
          h.cta_text_sw,
          h.cta_text,
        ],
      );
    }

    const faqSw: Array<[string, string, string]> = [
      [
        'How do I join student associations?',
        'Ninawezaje kujiunga na vyama vya wanafunzi?',
        'Wanafunzi wanaweza kujiunga na vilabu mbalimbali vya kitaaluma na vya maslahi kupitia lango la Masuala ya Wanafunzi.',
      ],
      [
        'Can I defer my studies?',
        'Je, ninaweza kuahirisha masomo yangu?',
        'Ndiyo, wanafunzi wanaweza kuahirisha hadi miaka miwili ya kitaaluma kupitia ombi rasmi.',
      ],
      [
        'Does OUK provide career services?',
        'Je, OUK inatoa huduma za kazi?',
        'Ndiyo, ofisi yetu ya maendeleo ya kazi inatoa ushauri, msaada wa kupata kazi, na uhusiano na sekta.',
      ],
      [
        'How do I access my results?',
        'Ninawezaje kupata matokeo yangu?',
        'Matokeo huchapishwa katika lango la mwanafunzi mwishoni mwa kila mzunguko wa muhula.',
      ],
      [
        'What is the grading system?',
        'Mfumo wa alama ni upi?',
        'OUK inafuata mfumo wa kawaida wa alama za vyuo vikuu nchini Kenya (A, B, C, D, E).',
      ],
      [
        'Does OUK have a student council?',
        'Je, OUK ina baraza la wanafunzi?',
        'Ndiyo, Chama cha Wanafunzi cha Chuo Kikuu Huria cha Kenya (OUKSA) kinawakilisha maslahi ya wanafunzi.',
      ],
      [
        'Where can I find my timetable?',
        'Ninaweza kupata ratiba yangu wapi?',
        "Ratiba zinapatikana katika lango la mwanafunzi na kwenye tovuti ya umma chini ya sehemu ya 'Wanafunzi'.",
      ],
      [
        'Does the university accept exemptions?',
        'Je, chuo kinakubali misamaha ya kozi?',
        'Mwanafunzi anayetaka kusamehewa kozi anapaswa kuwasilisha ombi rasmi akiambatanisha nakala za matokeo zilizothibitishwa, ambazo hukaguliwa na maoni husika huwasilishwa.',
      ],
      [
        'How can I contact student support?',
        'Ninawezaje kuwasiliana na msaada wa wanafunzi?',
        'Unaweza kuwasiliana na msaada wa wanafunzi kupitia barua pepe rasmi (support@ouk.ac.ke), kituo cha msaada katika lango lako, au mitandao yetu ya kijamii.',
      ],
      [
        'Are there any physical classes at OUK?',
        'Je, kuna madarasa ya ana kwa ana katika OUK?',
        'OUK ni chuo kikuu cha umma cha mtandaoni kilichopewa hati. Kujifunza kunafanyika mtandaoni kupitia kampasi yetu ya kidijitali.',
      ],
      [
        'What are the admission requirements for undergraduate programmes?',
        'Mahitaji ya udahili kwa programu za shahada ya kwanza ni yapi?',
        'Kwa ujumla, C+ katika KCSE au sawa nayo. Mahitaji mahususi hutofautiana kulingana na programu; tembelea ukurasa wa programu kwa maelezo.',
      ],
      [
        'How do I pay my fees?',
        'Ninawezaje kulipa ada zangu?',
        'Ada hulipwa kupitia lango la mwanafunzi kwa kutumia M-Pesa, uhamisho wa benki, au milango mingine ya malipo ya kitaasisi.',
      ],
      [
        'Does OUK offer post-graduate programmes?',
        'Je, OUK inatoa programu za uzamili?',
        'Ndiyo, OUK inatoa diploma na digrii mbalimbali za uzamili. Angalia sehemu ya programu kwa orodha ya hivi karibuni.',
      ],
      [
        'Is OUK an accredited university?',
        'Je, OUK ni chuo kikuu kilichoidhinishwa?',
        'Ndiyo, Chuo Kikuu Huria cha Kenya ni chuo kikuu cha umma kilichopewa hati kamili nchini Kenya, kilichoanzishwa na serikali.',
      ],
      [
        'Can I study from outside Kenya?',
        'Je, ninaweza kusoma nje ya Kenya?',
        'Ndiyo, OUK imeundwa kwa ufikiaji wa kimataifa. Unaweza kujiandikisha na kusoma kutoka popote duniani.',
      ],
      [
        "What is the duration of a Bachelor's degree at OUK?",
        'Shahada ya kwanza katika OUK inachukua muda gani?',
        'Kwa kawaida miaka 4, lakini mfano wetu wa kujifunza unaonyumbulika unaruhusu muda mfupi au mrefu kulingana na kasi ya mwanafunzi.',
      ],
      [
        'Does OUK have a physical campus?',
        'Je, OUK ina kampasi ya kimwili?',
        'Makao makuu yetu yako Konza Technopolis, lakini chuo ni hasa cha mtandaoni.',
      ],
      [
        'When is the next intake?',
        'Udahili ujao ni lini?',
        'OUK ina udahili mwingi mwaka mzima (Januari, Mei, na Septemba). Angalia lango la udahili kwa mzunguko wa sasa.',
      ],
      [
        'How do I reset my portal password?',
        'Ninawezaje kuweka upya nenosiri la lango?',
        "Tumia kiungo cha 'Umesahau Nenosiri' kwenye ukurasa wa kuingia au wasiliana na msaada wa kiufundi.",
      ],
      [
        'Are library resources available online?',
        'Je, rasilimali za maktaba zinapatikana mtandaoni?',
        'Ndiyo, maktaba yetu ya kidijitali inatoa ufikiaji wa maelfu ya vitabu vya kielektroniki, majarida, na hazina za kitaasisi.',
      ],
      [
        'Does OUK support students with disabilities?',
        'Je, OUK inasaidia wanafunzi wenye ulemavu?',
        'Kabisa. Jukwaa letu limeundwa kwa ufikiaji, na tuna ofisi maalum ya huduma za ulemavu.',
      ],
      [
        'Can I change my programme after admission?',
        'Je, ninaweza kubadilisha programu baada ya kudahiliwa?',
        'Ndiyo, kupitia mchakato rasmi wa ombi ndani ya wiki mbili za kwanza za muhula.',
      ],
      [
        'What is the cost of attending OUK?',
        'Gharama ya kusoma katika OUK ni kiasi gani?',
        'OUK imeundwa kwa ustawi jumuishi. Ada ni nafuu kwa ushindani; miundo ya kina inapatikana kwenye kila ukurasa wa programu.',
      ],
      [
        'Does OUK offer short courses?',
        'Je, OUK inatoa kozi fupi?',
        'Ndiyo, tunatoa kozi mbalimbali fupi za maendeleo ya kitaaluma na vyeti.',
      ],
      [
        'How are examinations conducted?',
        'Mitihani inafanywaje?',
        'Mitihani husimamiwa mtandaoni kupitia mazingira yetu salama ya majaribio.',
      ],
      [
        'Can I pay my fees in instalments?',
        'Je, ninaweza kulipa ada kwa awamu?',
        'Ndiyo, chaguo la Malipo ya Ada kwa Awamu linapatikana. Ili kuzingatiwa, unahitajika kulipa angalau 50% ya ada inayohitajika mwanzoni mwa muhula na kulipa salio angalau wiki mbili kabla ya mitihani.',
      ],
      [
        'How can I access the fees structure?',
        'Ninawezaje kupata muundo wa ada?',
        'Tafadhali bofya kiungo kifuatacho kuona miundo ya ada: https://ouk.ac.ke/programmes-fee-structure',
      ],
      [
        'What are the intakes available at the Open University of Kenya?',
        'Udahili upi unapatikana katika Chuo Kikuu Huria cha Kenya?',
        'Udahili wetu ni Januari, Mei, na Septemba kila mwaka.',
      ],
      [
        'How do I apply for a programme at the Open University of Kenya?',
        'Ninawezaje kuomba programu katika Chuo Kikuu Huria cha Kenya?',
        'Tafadhali bofya kiungo kifuatacho kuomba udahili: https://admissions.ouk.ac.ke/',
      ],
      [
        'What are the programmes offered at the Open University of Kenya?',
        'Programu zipi zinazotolewa katika Chuo Kikuu Huria cha Kenya?',
        'Tafadhali bofya kiungo kifuatacho kuona programu na mahitaji yake: https://ouk.ac.ke/schools',
      ],
      [
        'How can I contact the Admissions Office?',
        'Ninawezaje kuwasiliana na Ofisi ya Udahili?',
        'Mawasiliano ya Ofisi ya Udahili: Simu: 020 2000211 / 020 2000212, Barua pepe: admissions@ouk.ac.ke',
      ],
      [
        'Is OUK a public or a private institution?',
        'Je, OUK ni taasisi ya umma au ya kibinafsi?',
        'OUK ni Chuo Kikuu cha umma kilichopewa hati mnamo Agosti 2023.',
      ],
      [
        'Are there any age restrictions for admission?',
        'Je, kuna vizuizi vya umri kwa udahili?',
        'OUK ni chuo kikuu kwa wote bila vizuizi vya umri, jinsia, au mahali.',
      ],
      [
        'Is there an application fee?',
        'Je, kuna ada ya ombi?',
        'Ndiyo, ada ya ombi ni KES 1000.',
      ],
      [
        'Is there financial aid or scholarships available for eligible students?',
        'Je, kuna msaada wa kifedha au ufadhili kwa wanafunzi wanaostahili?',
        'Ndiyo, wanafunzi wanaofadhiliwa na serikali wanastahili Fedha za Elimu ya Juu kutoka Universities Fund na Higher Education Loans Board kama mwanafunzi mwingine yeyote wa Kenya.',
      ],
      [
        'What are the minimum admission requirements for undergraduate programs at the Open University of Kenya?',
        'Mahitaji ya chini ya udahili kwa programu za shahada ya kwanza katika Chuo Kikuu Huria cha Kenya ni yapi?',
        'Mahitaji ya chini yanajumuisha wastani wa C+ na kuendelea katika KCSE au sawa nayo. Vinginevyo, waombaji wenye diploma, sifa za kitaaluma, au sifa nyingine zinazotambuliwa na Seneti wanastahili.',
      ],
      [
        'How do I apply for admission to the Open University of Kenya?',
        'Ninawezaje kuomba udahili katika Chuo Kikuu Huria cha Kenya?',
        'Wanafunzi wanaweza kuomba kupitia lango la KUCCPS lililojitolea kwa OUK (ouk.kuccps.net) ikiwa wana sifa za KCSE, au lango la udahili la OUK (admissions.ouk.ac.ke) ikiwa wanataka kuzingatiwa kwa msingi wa utambuzi wa ujifunzaji wa awali.',
      ],
      // Already had question_sw in some envs — still fill answer_sw if empty
      [
        'Are OUK certificates recognised both locally and internationally?',
        'Je, vyeti vya OUK vinatambulika nchini na kimataifa?',
        'Ndiyo. OUK ni chuo kikuu cha umma kilichopewa hati; vyeti vyake vinatambulika nchini Kenya na kimataifa kulingana na viwango vya utambuzi vinavyotumika.',
      ],
      [
        'How long does application approval take?',
        'Uidhinishaji wa ombi huchukua muda gani?',
        'Muda hutegemea ukamilifu wa ombi na mzunguko wa udahili; kwa kawaida maombi hukaguliwa ndani ya wiki chache za kazi.',
      ],
      [
        'Does the university accept credit transfers?',
        'Je, chuo kinakubali uhamishaji wa vitengo?',
        'Ndiyo, uhamishaji wa vitengo unaweza kuzingatiwa kupitia ombi rasmi na tathmini ya nakala za matokeo.',
      ],
      [
        'What programmes are offered at OUK?.',
        'Programu zipi zinapatikana katika OUK?',
        'OUK inatoa programu mbalimbali za shahada ya kwanza, uzamili, na kozi fupi. Tembelea https://ouk.ac.ke/schools kwa orodha kamili.',
      ],
      [
        'How does one make an application?',
        'Mtu anaombaje?',
        'Omba kupitia https://admissions.ouk.ac.ke/ au lango la KUCCPS lililojitolea kwa OUK inavyofaa.',
      ],
      [
        'Does OUK have examination centers',
        'Je, OUK ina vituo vya mitihani?',
        'Mitihani husimamiwa mtandaoni; vituo vya usaidizi vinaweza kutolewa kulingana na mahitaji ya programu.',
      ],
      [
        'Does OUK offer Diploma courses',
        'Je, OUK inatoa kozi za diploma?',
        'Angalia orodha ya programu za sasa kwenye tovuti; matoleo yanajumuisha njia mbalimbali za kitaaluma kulingana na seneti.',
      ],
      [
        'Does OUK offer Scholarships?',
        'Je, OUK inatoa ufadhili?',
        'Wanafunzi wanaostahili wanaweza kupata msaada kupitia mifumo ya serikali kama Universities Fund na HELB, pamoja na fursa nyingine zinazotangazwa.',
      ],
    ];

    for (const [question, questionSw, answerSw] of faqSw) {
      await queryRunner.query(
        `UPDATE "faqs"
         SET "question_sw" = COALESCE(NULLIF(TRIM("question_sw"), ''), $1::character varying),
             "answer_sw" = COALESCE(NULLIF(TRIM("answer_sw"), ''), $2::text)
         WHERE "question" = $3::character varying`,
        [questionSw, answerSw, question],
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Data backfill — no destructive rollback
  }
}
