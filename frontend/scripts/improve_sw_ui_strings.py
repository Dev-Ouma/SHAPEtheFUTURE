#!/usr/bin/env python3
"""Curated HE Swahili improvements for OUK MainWebsite sw.json (selected namespaces)."""

from __future__ import annotations

import json
import re
from copy import deepcopy
from pathlib import Path

MESSAGES = Path(__file__).resolve().parents[1] / "messages"
SW_PATH = MESSAGES / "sw.json"
EN_PATH = MESSAGES / "en.json"

NAMESPACES = [
    "Library",
    "EResources",
    "Research",
    "Staff",
    "Students",
    "Alumni",
    "Tenders",
    "ShortCourses",
    "Timetables",
    "VirtualTour",
    "Partnerships",
    "Governance",
    "GoverningCouncil",
    "Leadership",
    "Policies",
    "QualityAssurance",
    "ServiceCharter",
    "Helpdesk",
    "ComplaintsCms",
    "CmsLayouts",
    "CmsChrome",
    "AcademicAffairs",
    "Academics",
    "AiAdvisor",
    "PeerLearners",
    "PersonnelGrid",
    "Referencing",
    "Units",
    "Legal",
    "Sitemap",
    "Faqs",
    "Contact",
    "Management",
    "SearchPage",
    "Social",
]

# Nested path updates: Namespace -> dotted.key -> new Swahili value
UPDATES: dict[str, dict[str, str]] = {
    "Library": {
        "browseArticles": "Chunguza makala za msaada",
        "browseCatalog": "Chunguza katalogi",
        "callDesk": "Piga simu dawati la msaada",
        "callDeskDesc": "Inapatikana wakati wa saa za ofisi za OUK.",
        "cantFindBody": "Tumia huduma yetu ya Mikopo baina ya Maktaba kuomba nyenzo kutoka vyuo vingine nchini Kenya na Afrika Mashariki.",
        "cantFindTitle": "Huwezi kupata rasilimali?",
        "chatLibrarian": "Ongea na maktabani",
        "chatLibrarianDesc": "Msaada wa papo hapo kwa utafiti na ugunduzi.",
        "citationStylesBody": "OUK inatekeleza kanuni mahususi za kurejelea kulingana na shule na taaluma yako. Hakikisha unazifahamu:",
        "competencyBody": "Mfumo wa mafunzo wa Maktaba unalingana na viwango vya Global Society for Library Science (GSLS), ili wahitimu wa OUK wawe wenye ujuzi wa taarifa na wachangiaji katika uchumi wa maarifa duniani.",
        "coreCompetenciesBody": "Kujua nguzo hizi za msingi kutaboresha sana ubora na kina cha utafiti wako wa kitaaluma.",
        "dbBody": "Chunguza hifadhidata 150+ za kitaasisi zinazohifadhi zaidi ya vitabu, majarida, na ripoti milioni 250 za kielimu kutoka duniani kote.",
        "dbEyebrow": "Ufikiaji kamili kupitia vitambulisho vya OUK",
        "dbTitle": "Portal ya",
        "dbTitleAccent": "Hifadhidata",
        "economyBody": "Tunaamini ufikiaji wa nyenzo bora za kielimu ni haki ya binadamu. Kwa kuondoa vizuizi vya malipo na kutumia faharasa mahiri, hifadhi yetu inahakikisha kila mwanafunzi ana zana zinazohitajika kufanikiwa.",
        "economyTitle": "Kuimarisha",
        "economyTitleAccent": "uchumi wa maarifa",
        "ejournalsDesc": "Fikia majarida ya kitaaluma ya kimataifa na makala zilizokaguliwa na wenza katika taaluma zote.",
        "emailLibrary": "Tuma barua pepe kwa maktaba",
        "emailSupportDesc": "Kwa kawaida hujibu ndani ya saa 4 za kitaaluma.",
        "evaluationFrameworkBody": "Tumia kiwango hiki cha kitaasisi cha kielimu kutathmini ubora na uaminifu wa taarifa unazopata.",
        "exploreEngage": "Chunguza na",
        "exploreEngageAccent": "shiriki",
        "exploreKb": "Chunguza hifadhi ya maarifa",
        "exploreKbBody": "Tembelea makala zetu za kina za msaada kwa maelekezo ya hatua kwa hatua kuhusu mbinu za utafiti, maadili ya taarifa, na matumizi ya zana za kidijitali.",
        "faq1a": "Unaweza kufikia hifadhidata zote za usajili za OUK kwa kuingia kwa Kitambulisho chako cha Mwanafunzi cha OUK na nenosiri. VPN haitahitajiki. Tafuta chaguo la 'Institutional Login' au 'OpenAthens' kwenye tovuti ya hifadhidata.",
        "faq1q": "Ninawezaje kufikia rasilimali za maktaba nikiwa nyumbani?",
        "faq2a": "Ingia kwenye Akaunti yako ya Maktaba kupitia Portal ya OUK. Nenda kwenye 'Mikopo Yangu' na bonyeza kitufe cha 'Kuhuisha' karibu na vitu unavyotaka kuweka muda mrefu. Kumbuka: Vitu vilivyo na maombi ya watumiaji wengine haviwezi kuhuishwa.",
        "faq2q": "Ninawezaje kuhuisha vitabu nilivyokopa?",
        "faq3a": "Hakikisha msajili wako ameamilisha akaunti yako kwa muhula wa sasa. Ikiwa umekubaliwa hivi karibuni, uamilishaji unaweza kuchukua hadi saa 48. Ikiwa tatizo linaendelea, wasiliana na Dawati la Msaada kupitia fomu hapa chini.",
        "faq3q": "Nifanye nini ikiwa Kitambulisho changu cha Mwanafunzi hakitambuliki?",
        "faq4a": "Ndiyo, OUK inashiriki katika mpango wa Mikopo baina ya Maktaba (ILL). Unaweza kuwasilisha ombi kupitia kichupo cha 'Rasilimali' katika Portal yako, na tutapata nyenzo kutoka taasisi washirika.",
        "faq4q": "Je, naweza kuomba vitabu kutoka vyuo vingine?",
        "faqBody": "Majibu ya haraka kwa maswali ya kawaida ya maktaba.",
        "helpSearchPlaceholder": "Tafuta miongozo ya kutatua matatizo, Maswali, au mada za mawasiliano…",
        "hubsBody": "Milango muhimu kwa wanafunzi, watafiti, na wanafunzi wa kitaalamu.",
        "hubsTitle": "Vituo vya ugunduzi",
        "infoLitIntroFallback": "Ujuzi wa taarifa ni uwezo wa kutambua, kupata, kutathmini, na kutumia taarifa kwa ufanisi kwa madhumuni ya kitaaluma, utafiti, na kitaalamu.",
        "infoLitMetaDesc": "Kuza ujuzi wa kupata, kutathmini, na kutumia taarifa kwa ufanisi kwa mafanikio ya kitaaluma na kitaalamu katika Chuo Kikuu Huria cha Kenya.",
        "infoLitMetaFallback": "Kuza ujuzi muhimu wa kuchunguza mazingira makubwa ya kidijitali, kutathmini vyanzo, na kutumia taarifa kwa ufanisi kwa ustadi wa kitaaluma na kitaalamu.",
        "launchDatabase": "Fungua hifadhidata",
        "libraryDatabasesBody": "Fikia maelfu ya vitabu pepe vilivyokaguliwa na wenza, majarida, hifadhi za kitaasisi, na miongozo ya utafiti ya hali ya juu.",
        "libraryWorkshopsBody": "Jiunge na maktabani wetu wataalamu kwa vipindi vya mafunzo shirikishi kuhusu sintaksia ya utafutaji wa hali ya juu, Zotero, Mendeley, na uandishi wa kitaaluma.",
        "lostIdBody": "Ufikiaji wa kimwili wa maktaba na kuingia kwenye hifadhi za kidijitali unahitaji kadi halali ya Kitambulisho cha Mwanafunzi cha OUK.",
        "metaDescFallback": "Fikia hifadhi ya kidijitali ya kimataifa ya OUK ya majarida pepe, hifadhidata, na rasilimali za kujifunza endelevu.",
        "multimediaDesc": "Tazama mihadhara ya kitaaluma, video za mafundisho, na rasilimali za kujifunza za kidijitali.",
        "needResearchHelpBody": "Maktabani wetu wa uhusiano wako tayari kutoa mwongozo wa kibinafsi unaolingana na taaluma kwa tasnifu au kazi yako.",
        "noDbMatches": "Hakuna hifadhidata zinazolingana",
        "noDbMatchesBody": "Jaribu kurekebisha vichujio au maneno muhimu ya utafutaji.",
        "offCampusBody": "VPN haitahitajiki. Tumia tu Kitambulisho chako cha Mwanafunzi cha OUK na nenosiri kuingia moja kwa moja kwenye hifadhidata zetu za usajili kutoka popote duniani.",
        "onDemandBody": "Huwezi kufika kwenye kipindi hai? Fikia maktaba yetu ya video za mafunzo na moduli za kujifunza kwa kasi yako mwenyewe wakati wowote.",
        "onDemandTitle": "Kujifunza",
        "onDemandTitleAccent": "kwa mahitaji",
        "openAccess1": "Ufikiaji bila malipo kwa tasnifu zote za OUK",
        "openAccessBody": "OUK imejitolea kwa uenezaji wa maarifa. Sera yetu ya Ufikiaji Wazi inahakikisha kuwa utafiti unaozalishwa ndani ya taasisi unapatikana bila malipo kwa jamii ya kielimu duniani.",
        "openHelpdesk": "Fungua tiketi ya dawati la msaada",
        "personalizedBody": "Kwa wahadhiri na vikundi vikubwa vya utafiti, tunatoa vipindi vya mafunzo vilivyoundwa kwa eneo lako maalum la somo.",
        "physicalBody": "Ingawa OUK inatanguliza kidijitali, tunatoa nafasi za utafiti wa kimwili na makusanyo katika kampasi yetu kuu Nairobi.",
        "plagiarismFallback": "Wizi wa kitaaluma ni matumizi ya kazi ya mtu mwingine—maneno, mawazo, au data—bila kutambua ipasavyo. Uadilifu wa kitaaluma ni thamani muhimu isiyoweza kujadiliwa katika OUK. Kudumisha uadilifu mkali:",
        "readyExplore": "Uko tayari kuchunguza?",
        "repositoryDesc": "Chunguza matokeo ya kielimu, ripoti za kiufundi, na makusanyo ya tasnifu kutoka watafiti wa OUK.",
        "summaryFallback": "Fikia maktaba pepe ya OUK. Unganishwa na zaidi ya makala milioni 10 za kitaaluma, rasilimali za media, na vitabu pepe wakati wowote, popote.",
        "survivalBody": "Kifurushi kilichochaguliwa chenye kitabu chetu cha Ujuzi wa Taarifa, kadi za rejea za haraka, na sera za uadilifu wa kitaaluma.",
        "survivalTitle": "Vifaa vya",
        "survivalTitleAccent": "msaada wa mtafiti",
        "trainBody": "Inua uwezo wako wa utafiti. Programu zetu za mafunzo zimeundwa kuziba pengo kati ya ufikiaji wa taarifa na uundaji wa maarifa.",
        "viewReferencingGuide": "Angalia mwongozo rasmi wa kurejelea",
        "workshopBody": "Vipindi hai vinavyoongozwa na maktabani wa kitaaluma na wataalamu wa somo.",
        "workshopTitle": "Kalenda ya",
        "workshopTitleAccent": "Warsha",
    },
    "EResources": {
        "aboutResource": "Kuhusu rasilimali hii",
        "backToEResources": "Rudi kwenye rasilimali pepe",
        "body": "Fikia rasilimali za kidijitali za kitaaluma ikiwa ni pamoja na vitabu pepe, majarida, na zana za utafiti kusaidia masomo yako.",
        "catEbookDesc": "Vitabu vya kiada na vitabu vya kitaaluma vya kidijitali",
        "catPapers": "Karatasi za mitihani ya awali",
        "catPapersDesc": "Rasilimali za mitihani",
        "exploreAsset": "Chunguza rasilimali",
        "eyebrow": "Rasilimali za kielimu",
        "featured": "Iliyoangaziwa",
        "featuredCollection": "iliyoangaziwa",
        "featuredDigital": "Mkusanyo",
        "featuredDigitalAccent": "wa kidijitali",
        "libraryTipBody": "Ufikiaji nje ya kampasi unahitaji uwe umeingia kwenye Portal ya mwanafunzi. Ukipata matatizo, wasiliana na dawati la msaada la huduma za kidijitali.",
        "noAssets": "Hakuna rasilimali zilizotambuliwa",
        "noAssetsBody": "Panua vigezo vyako vya utafiti au weka upya vichujio ili kuchunguza hifadhi yetu kamili ya kidijitali.",
        "resetDiscovery": "Weka upya ugunduzi",
        "spotlight": "Angazio",
        "title": "Rasilimali",
        "titleAccent": "Pepe",
        "viewsCount": "Mitazamo {count}",
    },
    "Research": {
        "accessPortal": "Fikia Portal",
        "accessPublications": "Fikia machapisho",
        "accessPublicationsAccent": "ya kimataifa",
        "accessPublicationsBody": "Tafuta maelfu ya kazi zilizokaguliwa na wenza, karatasi za mikutano, na majarida ya ufikiaji wazi yaliyoandikwa na wahadhiri wetu.",
        "bioFallback": "Mtafiti huyu bado hajasasisha wasifu wake wa kitaalamu. Ni mtafiti aliyejitolea anayechangia ubora wa kielimu wa Chuo Kikuu Huria cha Kenya kupitia uchunguzi wa kina na ushirikiano wa kitaasisi.",
        "collaborateBody": "Tunatafuta ushirikiano kwa miradi ya utafiti yenye athari kubwa.",
        "ctaTitle": "Kuimarisha",
        "ctaTitleAccent": "akili ya kidijitali",
        "discoveryEngine": "Injini ya ugunduzi",
        "exploreData": "Gundua data",
        "exploreProgramme": "Chunguza programu",
        "exploreRepository": "Chunguza hifadhi",
        "fundingBody": "Chombo cha ufadhili",
        "getInTouch": "Wasiliana nasi",
        "grantBody": "Kuonyesha ushirikiano wa kimataifa wa ufadhili na tuzo za kimkakati zinazowawezesha wahadhiri wetu kuongoza uchunguzi wa kipekee katika mazingira ya kidijitali.",
        "grantMetaDesc": "Chunguza ufadhili, ruzuku, na tuzo za kitaaluma zinazounga mkono utafiti wa kitaasisi katika Chuo Kikuu Huria cha Kenya.",
        "leadFacultyResearcher": "Mtafiti mkuu wa kitivo",
        "leadInvestigator": "Mtafiti mkuu",
        "metaDescFallback": "Ugunduzi wa kidijitali unaoongoza na kuunganisha elimu ya nadharia na ubunifu wa vitendo.",
        "noProgrammesHint": "Rekebisha vichujio vyako au rudi baadaye wakati nguzo mpya za kimkakati zinaanzishwa katika chuo.",
        "nullResult": "Hakuna matokeo",
        "nullResultBody": "Usajili wa kidijitali haujapata rekodi yoyote ya metadata kwa vigezo vilivyotolewa.",
        "openAccess": "Ufikiaji wazi",
        "openRepository": "Fungua hifadhi",
        "partnerInventorsBody": "Tunatafuta washirika wa kimataifa kupanua mipaka yetu ya utafiti na kuongeza athari ya kiteknolojia barani kote.",
        "partnershipsBody": "Kuimarisha ubora wa kitaasisi kupitia mitandao ya kimkakati ya ufadhili.",
        "pillarAiDesc": "Kuunda mifumo ya AI iliyobinafsishwa kwa makundi ya kidijitali na kujifunza kunakobadilika.",
        "pillarPedagogyDesc": "Kuboresha uzoefu wa mtandaoni kupitia mifumo mseto ya ODL na maabara pepe.",
        "pillarsBody": "Kutatua changamoto za Afrika kupitia uchunguzi wenye athari kubwa na usanisi wa kiteknolojia katika mpaka wa kidijitali.",
        "progListBody": "Nguzo za kimkakati katika Chuo Kikuu Huria cha Kenya zinazounganisha elimu, sekta, na vipaumbele vya kitaifa — kuendesha ubunifu barani kote.",
        "progListBody2": "Ajenda yetu ya utafiti wa kitaasisi imepangwa kuzunguka programu zenye athari kubwa zinazolenga kutatua changamoto changamano za kijamii na kiuchumi kupitia uchunguzi wa kisayansi na ushirikiano wa taaluma mbalimbali.",
        "projBody": "Kuwezesha magunduzi ya taaluma mbalimbali kupitia uchunguzi uliopangwa na utekelezaji wa mipango ya utafiti yenye athari kubwa.",
        "projMetaDesc": "Chunguza utafiti wa kitaasisi hai na miradi bunifu katika Chuo Kikuu Huria cha Kenya.",
        "pubBody": "Kuendeleza ubora wa kitaasisi kupitia ugunduzi wa kielimu wa kina na usambazaji wa michango ya kielimu yenye athari kubwa katika mitandao ya kimataifa.",
        "pubMetaDesc": "Chunguza kazi za kielimu, matokeo ya utafiti, na michango ya kitaaluma kutoka Chuo Kikuu Huria cha Kenya.",
        "purgeFilters": "Futa vichujio vyote",
        "purgeParams": "Futa vigezo",
        "registryVacant": "Usajili hauna rekodi",
        "registryVacantBody": "Hakuna miradi hai iliyolingana na vigezo vyako vya ugunduzi.",
        "repoEmptyBody": "Hakuna ruzuku zilizolingana na vigezo vyako vya ugunduzi.",
        "summaryFallback": "Ugunduzi wa kidijitali unaoongoza, kuunganisha elimu ya nadharia na ubunifu wa vitendo kwa Ulimwengu wa Kusini.",
        "title": "Injini ya",
        "titleAccent": "Ugunduzi",
        "typeThesis": "Tasnifu / dissertations",
    },
    "Staff": {
        "academicStaff": "Mfanyakazi wa kitaaluma",
        "academicStaffProfile": "Wasifu wa mfanyakazi wa kitaaluma",
        "body": "Kutana na wanafikra wa kimataifa na waanzilishi wa kidijitali wanaojenga mustakabali wa elimu isiyo na mipaka katika Chuo Kikuu Huria cha Kenya.",
        "ctaBody": "Tunaendelea kupanua wanataaluma wetu kwa wanafikra wa kimataifa wanaojitolea kwa ubora wa ODL unaotanguliza kidijitali.",
        "ctaTitle": "Jiunge na",
        "ctaTitleAccent": "kundi la taasisi",
        "directoryBody": "Ungana na kundi letu la watafiti, waelimishaji, na wataalamu wa teknolojia.",
        "discoveryWithin": "Ugunduzi ndani ya {circle}",
        "emptyBody": "Hatukupata rekodi za kielimu zinazolingana na vigezo vyako vya ugunduzi.",
        "emptyTitle": "Hakuna matokeo",
        "facultyVacancies": "Nafasi za ufundishaji",
        "featured": "Iliyoangaziwa",
        "leadershipBody": "Wasanifu wa kimkakati wanaoongoza ufundishaji wa OUK unaotanguliza kidijitali na athari ya kimataifa.",
        "officialFacultyProfile": "Chuo Kikuu Huria cha Kenya — Wasifu rasmi wa mfanyakazi wa kitaaluma",
        "orchestrating": "Inaandaa matriksi",
        "researchPortal": "Portal ya utafiti",
        "resetProtocols": "Weka upya",
        "returnToLeadership": "Rudi kwenye uongozi",
        "selectedPubs": "Machapisho teule yaliyopitiwa na rika",
        "title": "Wanataaluma",
        "titleAccent": "wetu",
        "viewFullIdentity": "Tazama wasifu kamili",
    },
    "Students": {
        "campusBody": "Jiunge na vilabu, ongoza mipango, na unda uhusiano wa maisha yote zaidi ya darasa.",
        "commitmentQuote": "Tunakusudia kuthibitisha maoni yote ya wanafunzi ndani ya saa 24 na kutatua masuala muhimu ndani ya siku 3–5 za kazi.",
        "connectPageTitle": "Unganisha",
        "directChannelsBody": "Una swali la haraka? Tumia njia zetu rasmi kupata msaada wa papo hapo kutoka timu ya Msaada wa Wanafunzi wa OUK.",
        "exploreResource": "Chunguza {title}",
        "feedbackHint": "Maoni yako yanatusaidia kuboresha. Kwa masuala ya kiufundi ya dharura, tumia kiungo cha Msaada wa ICT kwenye Portal.",
        "footerBody": "Fikia zana na msaada wote unahitaji ili kufanikiwa katika safari yako ya kitaaluma katika OUK.",
        "formsBody": "Pakua vitabu vya mwongozo vya wanafunzi, sera za kitaaluma, na fomu muhimu za kiutawala.",
        "governanceBody": "Chama cha Wanafunzi cha OUK (OUKSA) ni chombo rasmi cha uwakilishi wa wanafunzi, kinachohakikisha sauti yako inasikika katika maamuzi ya kitaasisi.",
        "helpdeskBody": "Dawati letu la msaada linafanya kazi masaa 24/7. Ongea na msaidizi wetu wa AI au fungua tiketi ya msaada.",
        "heroBody": "Karibu kwenye kituo chako kikuu cha rasilimali. Fikia msaada wa kitaaluma, taarifa za maisha ya kampasi, na zana zote unazohitaji kwa mafanikio.",
        "heroTitle": "Kuimarisha",
        "heroTitleAccent": "ukuaji wako.",
        "labsBody": "Fikia maabara zetu maalum za wingu kwa uzoefu wa vitendo katika sayansi ya data, usalama wa mtandao, na uigaji wa biashara ya kidijitali.",
        "launchLab": "Fungua mazingira ya maabara",
        "navHome": "Ukurasa kuu",
        "raiseTicket": "Fungua tiketi",
        "resExamsDesc": "Kanuni za mitihani, karatasi za awali, na uchakataji wa matokeo.",
        "resProgrammesDesc": "Chunguza programu zetu za shahada ya kwanza na za juu za kidijitali.",
        "supportBody": "Kuanzia mwongozo wa kitaaluma hadi afya ya akili na msaada wa kiufundi, mifumo yetu ya msaada iko hapa kuhakikisha safari yako ni laini na yenye mafanikio.",
        "supportFaq1a": "Nenda kwenye ukurasa wa kuingia Portal na bonyeza 'Umesahau nenosiri'. Utapokea kiungo cha kuweka upya kwenye barua pepe yako ya mwanafunzi.",
        "supportFaq1q": "Ninawezaje kuweka upya nenosiri la Portal ya mwanafunzi?",
        "supportFaq2a": "Matokeo huchapishwa kupitia Portal ya Mwanafunzi chini ya kichupo cha 'Masomo' baada ya uchakataji wa kitaasisi.",
        "supportFaq3a": "Wanafunzi wapya wanaweza kupakia picha yao kupitia Portal. Kadi za kitambulisho hutolewa ndani ya wiki mbili baada ya udahili.",
        "supportTitleAccent": "Unajaliwa.",
        "trackTicketBody": "Umewasilisha malalamiko? Weka nambari yako ya rejea kuangalia hali yake ya sasa na maendeleo ya suluhisho.",
    },
    "Alumni": {
        "aboutBody": "Chama cha Wahitimu wa OUK si orodha tu—ni mfumo hai ambapo wahitimu wanaendelea kukua, kushauri, na kuongoza katika enzi ya kidijitali.",
        "aboutTitleAccent": "Ugunduzi wa maisha yote.",
        "alumniReferralsDesc": "Unganishwa na wahitimu wanaofanya kazi katika kampuni za juu kwa rufaa za ndani.",
        "applyViaPortal": "Omba kupitia Portal",
        "bioPlaceholder": "Tuambie kidogo kuhusu safari yako ya kitaalamu…",
        "careersHeroFallback": "Fikia bodi za kazi za kipekee, rufaa za wahitimu, na fursa za mafunzo ndani ya mtandao wetu wa kimataifa wa washirika wa kitaasisi.",
        "employerPortal": "Portal ya waajiri",
        "eventsHeroFallback": "Jiunge na mtandao wetu wa kimataifa wa wahitimu katika matukio ya kipekee, semina pepe, na mikusanyiko duniani kote.",
        "exploreOpportunities": "Chunguza fursa",
        "faq1a": "Bonyeza tu kitufe cha 'Jiunge na mtandao' na jaza maelezo yako ya kuhitimu kwa uthibitishaji.",
        "faq2a": "Ingia kwenye Portal ya Wahitimu na nenda kwenye 'Mipangilio' kusasisha taarifa za kazi na mawasiliano.",
        "faq3a": "Tembelea ukurasa wa Ushauri na sajili utaalamu wako. Timu yetu itakuunganisha na wanafunzi au wahitimu wenzako.",
        "faq4a": "Matukio yajayo yameorodheshwa kwenye ukurasa wetu kuu. Bonyeza 'Thibitisha' kwenye kadi yoyote ya tukio kujisajili.",
        "footerBody": "Jiunge na maelfu ya wahitimu wa OUK katika kuunda mustakabali wa ubunifu wa kidijitali na uongozi wa kimataifa.",
        "giveBackBody": "Unda kizazi kijacho kupitia ushauri na msaada wa kitaasisi.",
        "globalCommunityBody": "Unganishwa na wataalamu katika nchi 35+ katika sekta mbalimbali.",
        "heroBody": "Endelea kuunganishwa na Chuo Kikuu Huria cha Kenya. Pata fursa za kitaalamu, ushauri wa maisha yote, na mtandao wa kimataifa wa viongozi wa kidijitali.",
        "howItWorksBody": "Programu yetu iliyopangwa ya ushauri inahakikisha miunganisho yenye athari kubwa kati ya wahitimu wenye uzoefu na wanafunzi.",
        "industryExpertsBody": "Unganishwa na wahitimu wa OUK wanaoongoza timu katika Google, Safaricom, Microsoft, na taasisi za utafiti duniani.",
        "joinPageBody": "Endelea kuunganishwa, fungua fursa za kipekee za kazi, na shauri kizazi kijacho cha viongozi wa kidijitali.",
        "joinSuccessBody": "Usajili wako umewasilishwa kwa mafanikio. Dawati letu la utawala linathibitisha rekodi zako za mwanafunzi. Utapokea barua pepe mara wasifu wako utakapothibitishwa na kuwa hai.",
        "mentorBody": "Ongoza wanafunzi na wataalamu wachanga kwa kushiriki maarifa yako ya kitaaluma na kazi.",
        "mentorHeroBody": "Unganishwa na wataalamu wa sekta, shiriki safari yako, au pata mwongozo unaohitaji ili kuharakisha kazi yako katika uchumi wa kidijitali.",
        "mentorTitle": "Wezesha kupitia ushauri.",
        "metaDesc": "Unganishwa na jamii ya wahitimu wa Chuo Kikuu Huria cha Kenya — matukio, ushauri, kazi, na taarifa za chama.",
        "missionFallback": "Chama cha Wahitimu wa Chuo Kikuu Huria cha Kenya kinakusudia kukuza uhusiano wa maisha yote kati ya chuo na wahitimu wake, kuunda jamii ya kimataifa ya wavumbuzi wanaoendesha mabadiliko ya kidijitali ya Afrika.",
        "navHome": "Ukurasa kuu",
        "pillEngagementDesc": "Kudumisha mwingiliano wenye athari kubwa wa wahitimu kupitia matukio na matawi.",
        "pillMentorshipDesc": "Kuziba pengo kati ya mafanikio ya kitaaluma na ubora wa kitaalamu.",
        "qaExploreCareers": "Chunguza kazi",
        "readJourney": "Soma safari kamili",
        "referralNetworkBody": "Ongeza nafasi zako za kuajiriwa kwa kuunganishwa na wahitimu ambao tayari wako katika kampuni hizi.",
        "returnAlumniPortal": "Rudi kwenye Portal ya wahitimu",
        "stepBookDesc": "Omba kipindi pepe cha dakika 30-60 moja kwa moja kupitia Portal.",
        "stepMatchDesc": "Algorithm yetu inapendekeza washauriji kulingana na maslahi yako ya kazi na historia.",
        "storiesEyebrow": "Safari za kuvutia",
        "supportBody": "Wasiliana na ofisi yetu ya mahusiano ya wahitimu kwa maswali kuhusu matawi, matukio, au michango.",
        "verificationBody": "Kudumisha uadilifu wa mtandao wetu, maombi yote yanathibitishwa kwa mikono dhidi ya rekodi za wanafunzi wa OUK. Hakikisha nambari yako ya mwanafunzi na mwaka wa kuhitimu ni sahihi.",
    },
    "Tenders": {
        "detailSummary": "Fursa rasmi ya ununuzi iliyoorodheshwa na Chuo Kikuu Huria cha Kenya.",
        "emptyBody": "Rekebisha vigezo vya utafutaji au rudi baadaye",
        "examine": "Chunguza fursa",
        "loading": "Inasawazisha Portal ya ununuzi",
        "notFoundBody": "Tangazo la ununuzi unalotafuta halipo au limeondolewa kwenye Portal.",
        "portal": "Portal ya ununuzi",
        "submissionBody": "Nyaraka zote za zabuni lazima ziwasilishwe kielektroniki kupitia Portal au kuwekwa kwenye sanduku la zabuni lililoteuliwa kabla ya muda wa kufunga.",
        "summary": "Gundua fursa za ununuzi katika Chuo Kikuu Huria cha Kenya na shiriki katika michakato yetu ya zabuni yenye uwazi na ushindani.",
        "supportBody": "Unahitaji msaada wa kuwasilisha zabuni au kusajili muuzaji? Timu yetu ya ununuzi iko tayari kukuongoza kwa uzingatiaji wa kitaasisi.",
        "supportTitle": "Kituo cha msaada wa ununuzi",
    },
    "ShortCourses": {
        "advisorsReady": "Washauri wetu wa kitaaluma wako tayari kukusaidia kupanga safari yako ya kitaalamu.",
        "applyBody": "Hakikisha nafasi yako katika kundi lijalo la kitaalamu. Maombi yanashughulikiwa kwa msingi wa mzunguko.",
        "body": "Ongeza kasi ya taaluma yako kupitia mafunzo yanayozingatia ujuzi kwa viongozi wa uchumi wa kidijitali.",
        "bridgeDegree": "Unganishwa na portfolio kamili ya digrii",
        "browseFaculty": "Chunguza portfolio ya shule",
        "deliveryBody": "Cheti hiki hutumia mfumo wa {mode} wa hali ya juu, ukichanganya rasilimali za {method} na mifumo ya usaidizi wa taasisi.",
        "exploreCatalog": "Chunguza katalogi ya kitaaluma",
        "home": "Ukurasa kuu",
        "metaDesc": "Boresha taaluma yako kupitia vyeti na kozi fupi za OUK katika sayansi ya data, uongozi, na mabadiliko ya kidijitali.",
        "metaTitle": "Vyeti vya kitaalamu na kozi fupi | OUK Academy",
        "resetDiscovery": "Weka upya vichujio vya ugunduzi",
        "talkAdvisor": "Ongea na mshauri",
        "title": "Kozi za",
        "titleAccent": "Maendeleo ya kitaalamu",
    },
    "Timetables": {
        "academicSupport": "Usaidizi wa kitaaluma",
        "academicSupportDesc": "Wasiliana na ofisi ya kitaaluma ya shule yako kwa maswali ya ratiba.",
        "body": "Fikia ratiba za madarasa na tarehe za mitihani mahali pamoja. Chagua shule na programu yako ili kupata ratiba yako binafsi.",
        "examSubtitle": "Mitihani ijayo na nyakati za kukaa",
        "liveDataDesc": "Inasasishwa kwa wakati halisi kutoka Mpangaji wa OUK",
        "noteBody": "Saa zote ni <strong>Saa za Afrika Mashariki (EAT, UTC+3)</strong>. Viungo vya vipindi vinapatikana kwenye Portal ya wanafunzi.",
        "onlineSessionsDesc": "Madarasa yote yanatolewa kwa wakati mmoja kupitia Portal ya OUK",
        "openPortal": "Fungua Portal",
        "studentPortal": "Portal ya mwanafunzi",
        "studentPortalDesc": "Fikia viungo vya vipindi vya mtandaoni na nyenzo za kozi.",
        "viewProspectus": "Tazama prospakta",
        "welcomeBody": "Chagua shule na programu yako kutoka vichujio ili kuona ratiba ya kila wiki au tarehe za mitihani.",
    },
    "VirtualTour": {
        "browseCatalog": "Chunguza katalogi",
        "cinemaBody": "Gundua vipengele tofauti vya taasisi yetu kupitia uzoefu wa sinema uliochaguliwa.",
        "cyberPhysicalBody": "Usanifu wetu wa kampasi ya dijitali-twin unawawezesha wasomi kuingiliana na rasilimali za kitaasisi kutoka popote duniani kwa ubora wa juu.",
        "fallbackDescription": "Ingia katika mustakabali wa elimu. Gundua kampasi yetu inayotanguliza kidijitali, mitandao ya utafiti wa kimataifa, na mifumo bunifu ya kujifunza.",
        "modalFallbackDesc": "Pata uzoefu wa kampasi inayotanguliza kidijitali ya Chuo Kikuu Huria cha Kenya na mazingira bunifu ya kujifunza.",
        "secureCredentialsBody": "Vyeti vilivyothibitishwa kwa blockchain vinahakikisha uhamaji wako wa kimataifa na uadilifu wa kitaaluma kuvuka mipaka.",
        "stepCareerDesc": "Uunganishaji wa moja kwa moja na viongozi wa sekta na masoko ya ajira duniani.",
        "stepOnboardingDesc": "Udahili na mwelekeo wa mtandaoni usio na shida katika jumuiya yetu ya wasomi.",
        "videoFallbackDesc": "Gundua muhtasari huu wa sinema wa kitaasisi.",
    },
    "Partnerships": {
        "alumniStories": "Hadithi za wahitimu",
        "ctaBody": "Tunatafuta washirika wenye maono kujiunga na mapinduzi yetu ya elimu ya kidijitali.",
        "emptyBody": "Jaribu kurekebisha vichujio au maneno ya utafutaji",
        "eyebrow": "Ushirikiano wa kimataifa na miungano",
        "fallbackDescription": "Kuendeleza elimu na uvumbuzi kupitia ushirikiano wa kimkakati wa kitaasisi.",
        "fallbackDetailBody": "Ushirikiano wa kimkakati unaolenga kuendeleza utafiti, uvumbuzi, na ufikiaji wa elimu ndani ya ekosistema ya kidijitali ya OUK.",
        "learnMore": "Jifunze zaidi",
        "partnershipValueBody": "Ushirikiano huu unasaidia moja kwa moja dhamira ya OUK ya kutoa elimu yenye ushindani wa kimataifa, ubora wa juu, na inayojibu soko.",
        "subtitle": "Kujenga madaraja na vyuo vikuu bora duniani, viongozi wa sekta, na mashirika ya serikali ili kubadilisha mustakabali wa elimu ya juu Afrika.",
        "title": "Mtandao wetu",
        "titleAccent": "wa kimkakati",
        "valueIndustry": "Uwiano wa sekta",
        "viewCaseStudy": "Tazama utafiti wa kesi",
    },
    "Governance": {
        "badge": "Uongozi wa kitaasisi",
        "chairmanValue": "Makamu Mkuu wa Chuo",
        "compositionTitle": "Muundo wa seneti",
        "councilDesc": "Chombo kuu cha utawala kinachohusika na mwelekeo wa kimkakati na sera za kiutawala za chuo.",
        "councilTitle": "Baraza la chuo",
        "dutyAwards": "Utoaji wa digrii, Diploma, na vyeti",
        "dutyProgrammes": "Idhini ya programu za kitaaluma na silabasi",
        "membersValue": "Makamu Wakuu wa Chuo wasaidizi, Usajili, Dekani wa Shule, Wakurugenzi wa Taasisi, Maktabani wa Chuo, na wawakilishi wa wahadhiri.",
        "metaTitle": "Seneti na utawala wa chuo | Chuo Kikuu Huria cha Kenya",
        "mgmtDesc": "Inahusika na utekelezaji wa kila siku wa sera za Baraza na usimamizi wa rasilimali za chuo.",
        "mgmtTitle": "Bodi ya usimamizi wa chuo",
        "roleBody": "Seneti ya Chuo ni mamlaka kuu ya kitaaluma ya Chuo. Inapanga, kudhibiti, na kuongoza kazi ya kitaaluma ya Chuo, katika ufundishaji na utafiti, na kuhakikisha viwango vya kitaaluma vinadumishwa.",
        "roleTitle": "Jukumu la seneti",
        "secretaryValue": "Usajili (Masuala ya Kitaaluma)",
        "summaryFallback": "Mamlaka kuu ya kitaaluma ya Chuo, inayohusika na sera za kitaaluma, programu, na uhakikisho wa ubora.",
        "titleFallback": "Seneti ya chuo",
    },
    "GoverningCouncil": {
        "architects": "Wasanifu",
        "crumbCouncil": "Baraza la usimamizi",
        "dutyFiscalDesc": "Kusimamia afya ya kifedha na uhamasishaji wa rasilimali wa Chuo.",
        "dutyHrDesc": "Kuteua wasimamizi wakuu na kuhakikisha sera bora za rasilimali watu.",
        "dutyLegalDesc": "Kuhakikisha Chuo kinafuata Sheria ya Vyuo Vikuu na mifumo mingine ya udhibiti.",
        "dutyStrategicDesc": "Kuidhinisha na kufuatilia utekelezaji wa Mpango Mkakati wa Chuo.",
        "funcAcademicDesc": "Gundua anuwai ya programu za digrii na kozi fupi zinazolingana na soko.",
        "funcGlobalDesc": "Kuunganisha wanafunzi katika kaunti 47 na zaidi kupitia kampasi yetu pepe.",
        "funcResearchDesc": "Kuendesha athari za kimataifa kupitia uchunguzi wa kisasa na maendeleo ya teknolojia ya kidijitali.",
        "gridTitle": "Wanachama wa baraza la usimamizi",
        "learnMore": "Jifunze zaidi",
        "mandateBody": "Baraza linahakikisha Chuo kinabakia kweli kwa dhamira yake ya kuleta demokrasia katika ufikiaji wa elimu ya juu bora kupitia uvumbuzi wa kidijitali na uwazi wa kitaasisi.",
        "pageSummary": "Chuo kinatawaliwa kupitia tabaka mbili za usimamizi: Baraza la Usimamizi kwa mkakati na Bodi ya Usimamizi kwa shughuli.",
        "stewardshipBadge": "Usimamizi na utawala",
    },
    "Leadership": {
        "featCurriculumDesc": "Kuendeleza mitaala inayolingana na sekta kwa uchumi wa kidijitali.",
        "featFacultyDesc": "Kuwawezesha wasomi wa kiwango cha dunia kutoa mafundisho bora.",
        "featResearchDesc": "Kukuza ujasiriamali wa kitaasisi na athari kwa jamii.",
        "featStandardsDesc": "Kuhakikisha uthibitishaji wa kitaaluma wa kimataifa na ubora.",
        "gridSubtitle": "Mamlaka ya juu zaidi ya kitaaluma inayoongoza ajenda ya ufundishaji na kitaasisi ya Chuo.",
        "mandateBody": "Uongozi wetu wa kitaaluma unahakikisha Chuo Kikuu Huria cha Kenya kinabakia mstari wa mbele katika ufundishaji wa kidijitali, uvumbuzi wa utafiti, na uadilifu wa kitaaluma.",
        "pageSummary": "Kutana na wasomi mashuhuri na viongozi wa kimkakati wanaoendesha Chuo Kikuu Huria cha Kenya kuelekea ubora wa elimu duniani.",
    },
    "Policies": {
        "admissionsDesc": "Vigezo na taratibu za kuwaandikisha wanafunzi katika programu mbalimbali.",
        "conductDesc": "Matarajio ya tabia na taratibu za nidhamu.",
        "integrityDesc": "Miongozo kuhusu wizi wa kitaaluma, udanganyifu, na utovu wa nidhamu wa kitaaluma.",
        "metaDesc": "Sera na kanuni rasmi zinazoongoza Chuo Kikuu Huria cha Kenya.",
        "privacyDesc": "Jinsi tunavyokusanya, kuhifadhi, na kulinda data ya wanafunzi na wafanyakazi.",
        "summaryFallback": "Nyaraka kamili za sheria, kanuni, na viwango vinavyohakikisha uadilifu na usawa wa kitaasisi.",
    },
    "QualityAssurance": {
        "dqaP1": "Kurugenzi ya Uhakikisho wa Ubora (DQA) inaratibu na kusimamia utekelezaji wa sera za uhakikisho wa ubora katika vitengo vyote vya kitaaluma na kiutawala vya Chuo.",
        "dqaP2": "Tunahakikisha mfumo wetu wa ufundishaji unaotanguliza kidijitali unakidhi mahitaji magumu yaliyowekwa na Tume ya Elimu ya Vyuo Vikuu (CUE) na miili ya uthibitishaji ya kimataifa.",
        "statusBody": "Chuo Kikuu Huria cha Kenya ni chuo kikuu cha umma chenye hati kamili, kilichoanzishwa chini ya Sheria ya Vyuo Vikuu. Programu zetu zote za kitaaluma zimeidhinishwa na Tume ya Elimu ya Vyuo Vikuu (CUE).",
        "summaryFallback": "Kudumisha viwango vya juu zaidi vya ubora wa kitaaluma, uwasilishaji wa ufundishaji, na uzingatiaji wa kitaasisi kupitia tathmini kali.",
    },
    "ServiceCharter": {
        "aboutP1": "Hati ya Huduma ya Chuo Kikuu Huria cha Kenya ni hati ya ahadi ya umma inayoeleza ubora, viwango, na muda wa huduma tunazotoa. Inatumika kama makubaliano kati ya OUK na wadau wake wote.",
        "aboutP2": "Hati hii inaeleza unachoweza kutarajia kutoka kwetu, tunachohitaji kutoka kwako, na jinsi unavyoweza kutuwajibisha. Inaonyesha kujitolea kwetu kwa uboreshaji endelevu na huduma inayomlenga mteja.",
        "aboutP3": "Huduma zetu zinaongozwa na viwango vya Huduma ya Umma ya Kenya, Sheria ya Vyuo Vikuu, na Mpango Mkakati wa OUK 2023–2027, ukizingatia ujumuishaji, mabadiliko ya kidijitali, na ubora wa kitaaluma.",
        "aiBody": "Uliza swali lolote kuhusu huduma za OUK — pata majibu ya papo hapo na sahihi.",
        "contactHelpdesk": "Wasiliana na dawati la msaada",
        "ctaBody": "Ikiwa tutashindwa kufikia viwango katika hati hii, tunataka kujua. Maoni yako yanaendesha uboreshaji wetu endelevu.",
        "dashboardSubtitle": "Vipimo vinavyoonyesha ahadi yetu kwa ubora wa huduma.",
        "deptIct": "Dawati la msaada la ICT",
        "docsSubtitle": "Fikia, angalia, na pakua hati zote zinazohusiana na huduma.",
        "faqsSubtitle": "Majibu yanayoweza kutafutwa na kuainishwa kwa maswali ya kawaida ya huduma.",
        "heroBody": "Ahadi yetu ya kutoa huduma bora, kwa wakati, na zenye uwazi kwa wanafunzi, wafanyakazi, washirika, na umma.",
        "lodgeComplaint": "Wasilisha malalamiko",
        "poweredByKb": "Inaendeshwa na Hifadhi ya Maarifa ya OUK",
        "qaQuote": "Tumejitolea kutoa huduma zinazofikia au kuzidi viwango vilivyowekwa, na tunakaribisha maoni kama chombo cha uboreshaji endelevu.",
        "speakToHuman": "Zungumza na mtu",
        "videoUploadHint": "Pakia URL ya video ili kuwezesha uchezaji",
    },
    "Helpdesk": {
        "chooseSupportBody": "Dawati la Msaada la Chuo linashughulikia mazingira ya kampasi, huduma, na miundombinu. Msaada wa Kiufundi wa ICT unashughulikia akaunti, Portal, mifumo ya kitaaluma, na huduma za kidijitali.",
        "complaintHint": "Ripoti tatizo",
        "complimentHint": "Shiriki maoni chanya",
        "dataConsentBody": "Ninakubali OUK kuchakata maoni haya kulingana na sera ya faragha ya chuo.",
        "descriptionPlaceholder": "Toa maelezo ya kina kuhusu tukio…",
        "errConsent": "Lazima ukubali uchakataji wa data.",
        "errOukEmail": "Anwani za barua pepe za OUK pekee ndizo zinazoruhusiwa.",
        "errSubmit": "Uwasilishaji umeshindwa. Tafadhali jaribu tena.",
        "fbHeroBody": "Dawati la Msaada la Chuo — mazingira ya kampasi, huduma, na miundombinu. Wanafunzi, wafanyakazi, na wageni wanaweza kuwasilisha malalamiko au pongezi.",
        "fbHeroTitle": "Portal ya maoni ya kampasi",
        "fbMetaDesc": "Wasilisha malalamiko, pongezi, na maoni kuhusu miundombinu, vifaa, na huduma za kampasi.",
        "generalHelpdesk": "Dawati la msaada la jumla",
        "generalHelpdeskBody": "Kampasi na huduma — vifaa, malazi, usalama, usafiri, nafasi za maktaba, huduma za afya, na maswali ya dawati la ada. Yeyote anaweza kuwasilisha malalamiko au pongezi.",
        "generalHelpdeskNote": "Wi‑Fi ya jengo kama kukatika kwa kifaa iko hapa. Masuala ya akaunti au kuingia kifaa yako chini ya ICT.",
        "googleNotConfigured": "Kuingia kwa Google hakujasanidiwa. Andika jina na barua pepe yako hapa chini.",
        "guidanceBody": "Fomu hii ni Dawati la Msaada la Chuo — vifaa vya kampasi, huduma, malazi, usalama, na huduma za jumla. Wi‑Fi ya jengo kama kukatika kwa kifaa iko hapa. Kwa akaunti, Portal/LMS, barua pepe, kuingia Wi‑Fi, SOMAS, usajili, au matokeo, tumia Msaada wa Kiufundi wa ICT katika programu ya simu ya OUK.",
        "guidanceTitle": "Dawati la Msaada la Chuo dhidi ya Msaada wa Kiufundi wa ICT",
        "ictRedirectBanner": "Unatafuta Msaada wa Kiufundi wa ICT (akaunti, SOMAS, usajili)? Tumia programu ya simu ya OUK, au angalia",
        "ictRedirectTail": ". Fomu hii ni Dawati la Msaada la Chuo pekee.",
        "ictSidebarBody": "Masuala ya mifumo na kidijitali hushughulikiwa na ICT kupitia programu ya simu ya OUK — si fomu hii ya Dawati la Msaada:",
        "openCampusFeedback": "Fungua maoni ya kampasi",
    },
    "ComplaintsCms": {
        "anonymityBody": "Utambulisho wako unalindwa kwa itifaki za zero-knowledge.",
        "anonymityLocked": "Utambulisho umejificha",
        "anonymityOrchestrated": "Utambulisho umelindwa",
        "assignmentDomain": "Eneo la ugawaji",
        "avgDelay": "Wastani wa muda wa uratibu",
        "categoryDescFallback": "Wasilisha malalamiko ya kitaaluma au kiutawala yanayohusiana na {name}.",
        "checkStatus": "Angalia hali",
        "consentBody": "Ninakubali uchakataji wa ombi hili la malalamiko chini ya sera za chuo.",
        "continueNarrative": "Endelea kwa maelezo",
        "currentPhase": "Awamu ya sasa",
        "dataSubjectIdentity": "Utambulisho wa mhusika",
        "emailPlaceholder": "Anwani ya barua pepe inayohusiana",
        "evidenceBody": "Wasilisha hati za kidijitali au picha za skrini (picha pekee).",
        "evidenceSync": "Usawazishaji wa ushahidi",
        "finalize": "Kamilisha uratibu",
        "formalResolution": "Utatuzi rasmi wa kitaasisi",
        "formalSubject": "Kichwa rasmi cha mada",
        "fullLegalName": "Jina kamili la kisheria",
        "govBiometric": "Mantiki ya rejea ya biometriska",
        "govConfidential": "Ushughulikiaji wa siri",
        "govSla": "Usawazishaji wa SLA sanifu",
        "govZeroRetaliation": "Sera ya kutokulipiza kisasi",
        "lodgeGrievance": "Wasilisha malalamiko",
        "monitorStatus": "Fuatilia hali",
        "narrativePlaceholder": "Toa maelezo ya kina, kwa mpangilio wa matukio...",
        "ombudsmanBody": "Ofisi ya Ombudsman wa Chuo inahakikisha kila malalamiko yanashughulikiwa kwa upande wowote na uratibu wa kisheria.",
        "pendingTriage": "Kesi bado inasubiri uchunguzi wa Ofisi ya Malalamiko ya Kitaasisi",
        "processNarrative": "Simulizi ya mchakato na ukweli",
        "processSynchronized": "Mchakato umesawazishwa",
        "referenceId": "Nambari ya rejea ya kitaasisi",
        "referenceIdLabel": "Nambari ya rejea",
        "registryLookup": "Kituo cha utafutaji wa rejista",
        "resolutionLog": "Kumbukumbu kuu ya utatuzi",
        "resolutionRate": "Kiwango cha utatuzi cha siku 90",
        "satisfaction": "Kuridhika kwa wadau",
        "selectDomain": "Chagua eneo la mgogoro",
        "selectDomainBody": "Panga malalamiko yako ili yaelekezwe kwa wataalamu wanaofaa.",
        "stepNarrative": "Simulizi",
        "stepOrchestration": "Uratibu",
        "subjectPlaceholder": "Muhtasari mfupi wa malalamiko...",
        "submitAnonymously": "Wasilisha bila jina",
        "submitNew": "Wasilisha malalamiko mapya",
        "successBody": "Ombi lako la malalamiko limesajiliwa katika Rejista ya Kitaasisi ya OUK. Tafadhali nakili na hifadhi Nambari yako ya Rejea hapa chini; utahitaji kufuatilia hali.",
        "summaryFallback": "Lango salama, lenye vipengele vingi kwa malalamiko, mapendekezo, na ripoti rasmi.",
        "telemetryTitle": "Takwimu za kitaasisi",
        "temporalSpatial": "Data ya muda na mahali",
        "titleFallback": "Kituo cha malalamiko ya wadau",
        "toastArtifactsOk": "Vipande {count} vya picha vimesawazishwa",
        "toastCategoriesFail": "Imeshindwa kupakia kategoria za malalamiko. Tafadhali onyesha upya.",
        "toastConsentRequired": "Idhini ya kisheria inahitajika",
        "toastEmailRequired": "Barua pepe kuu inahitajika kwa uwasilishaji usio wa siri",
        "toastImagesOnly": "Ni picha pekee zinazosawazishwa katika awamu hii ya rejista",
        "toastNarrativeIncomplete": "Simulizi ya mchakato haijakamilika",
        "toastSelectCategory": "Tafadhali chagua kategoria ya malalamiko",
        "toastSubmitFail": "Uwasilishaji umeshindwa. Angalia maelezo yako na ujaribu tena.",
        "toastSubmitOk": "Malalamiko yamesawazishwa na Rejista ya Kitaasisi",
        "toastTrackFail": "Utafutaji wa ufuatiliaji umeshindwa. Thibitisha nambari yako na ujaribu tena.",
        "toastUploadFail": "Upakiaji wa faili umeshindwa. Tafadhali jaribu tena.",
        "verificationKey": "Ufunguo wa uthibitishaji",
    },
    "CmsLayouts": {
        "activeTenure": "Muda hai",
        "allCategories": "Kategoria zote",
        "areasOfSpecialization": "Maeneo ya utaalamu",
        "assetsFound": "Rasilimali {count} zimepatikana",
        "boardMembership": "Uanachama wa bodi",
        "centerOfExcellence": "Kituo cha ubora wa kimataifa",
        "connectScholarly": "Unganisha na ufikiaji wa kitaaluma",
        "councilMembership": "Uanachama wa baraza",
        "ctaProtocol": "Anzisha itifaki yako ya kitaaluma leo.",
        "ctaReady": "Uko tayari kujiunga",
        "differentLead": "Nini kinatufanya",
        "durationOfService": "Muda wa huduma",
        "entryRequirements": "Mahitaji ya kuingia",
        "exploreProgrammes": "Gundua programu",
        "featureAffordDesc": "Kwa kutumia teknolojia kupunguza gharama za jadi, tunatoa elimu ya juu ya kiwango cha juu kwa sehemu ndogo ya gharama.",
        "featureAffordTitle": "Upatikanaji wa bei nafuu",
        "featureDigitalDesc": "Kila kozi, tathmini, na mwingiliano umeundwa kwa ulimwengu wa kidijitali. Jukwaa letu ni linalojibu, rahisi, na linafikika duniani kote.",
        "featureDigitalTitle": "Ujifunzaji wa kidijitali kwa chaguo-msingi",
        "featureIndustryDesc": "Mitaala yetu hutengenezwa pamoja na viongozi wa sekta ili kuhakikisha kila mhitimu anaingia sokoni akiwa na ujuzi tayari kutumika.",
        "featureIndustryTitle": "Inayolingana na sekta",
        "featurePacingDesc": "Imeundwa kwa wataalamu wanaofanya kazi na wanafunzi watu wazima, OUK inakuwezesha kusawazisha masomo yako na kazi na familia.",
        "featurePacingTitle": "Kasi inayobadilika",
        "institutionalPortfolio": "Portfolio ya kitaasisi",
        "institutionalRegistry": "Rejista ya kitaasisi",
        "institutionalWebsite": "Tovuti ya kitaasisi",
        "leadershipBadge": "Uongozi wa kitaasisi",
        "leadershipCtaBody": "Kupitia uongozi wa kujitolea na ahadi ya mabadiliko ya kidijitali, OUK inaweka kiwango cha ujifunzaji huria Afrika.",
        "learnMore": "Jifunze zaidi",
        "officialRepository": "Hifadhi rasmi",
        "officialSignature": "Saini rasmi ya kitaasisi",
        "pathwayBadge": "Njia ya maombi",
        "pathwayBody": "Tumeunda mzunguko wa udahili unaoheshimu muda wako. Hakuna foleni za kimwili, hakuna fomu za karatasi—ni mpito laini tu kuelekea mustakabali wa kujifunza.",
        "philosophyFallback": "Elimu si fursa iliyofungwa na jiografia. Ni haki ya ulimwengu inayowezeshwa na teknolojia.",
        "requirementsBody": "Hakikisha hati zako ziko sawa kabla ya kuanzisha itifaki ya kidijitali.",
        "searchRegistry": "Tafuta rejista...",
        "selectedPublications": "Machapisho teule",
        "startApplication": "Anza maombi",
        "supportPortal": "Portal ya msaada",
        "synchronizingRepo": "Inasawazisha hifadhi...",
        "toastFileUnavailable": "Faili ya hati hii haipatikani. Tafadhali wasiliana na msimamizi wa hifadhi.",
        "toastLoadRegistry": "Imeshindwa kupakia rejista ya vipakuliwa. Tafadhali onyesha upya.",
        "toastNoFile": "Hakuna faili iliyounganishwa na hati hii bado.",
        "toastUnableDownload": "Imeshindwa kuanzisha upakuaji sasa. Tafadhali jaribu tena.",
        "uniquenessBadgeFallback": "Zaidi ya mipaka ya jadi",
        "uniquenessHeroFallback": "Hatufafanuliwi na kuta za kimwili, bali na nguvu na uvumbuzi wa jamii yetu ya kitaaluma duniani.",
        "uniquenessSummaryFallback": "Ahadi thabiti ya kuvunja vizuizi vya elimu ya juu kupitia ubora wa kidijitali.",
    },
    "CmsChrome": {
        "assistanceBody": "Wasiliana na ofisi ya Katibu wa Chuo kwa nyaraka na maswali maalum.",
        "contactSupport": "Wasiliana na msaada",
        "explore": "Gundua",
        "exploreTitle": "Gundua {title}",
        "home": "Ukurasa kuu",
        "navigateSection": "Tembea sehemu hii",
        "needAssistance": "Unahitaji msaada?",
        "printDocument": "Chapisha hati",
        "sectionNavigation": "Urambazaji wa sehemu",
        "sharePage": "Shiriki ukurasa huu",
        "subSections": "Sehemu ndogo",
    },
    "AcademicAffairs": {
        "browseCatalogue": "Chunguza katalogi",
        "contactOffice": "Wasiliana na ofisi",
        "coreFunctionsBody": "Idara ya Masuala ya Kitaaluma inaendesha ubora katika nyanja tatu kuu za chuo.",
        "ctaBody": "Gundua programu zetu za digrii na kozi fupi za kisasa zinazotanguliza kidijitali kwa mwanafunzi wa kisasa.",
        "ctaTitle": "Gundua programu za kitaaluma",
        "facultyMetaDesc": "Zana, majukwaa, na rasilimali kwa wafanyakazi wa kitaaluma wa Chuo Kikuu Huria cha Kenya.",
        "facultyPedagogicalBody": "Kituo cha Ubunifu wa Mafundisho na Teknolojia hutoa mafunzo endelevu juu ya ufundishaji wa kidijitali, uundaji wa maudhui ya multimedia, na mikakati bora ya tathmini mtandaoni.",
        "facultyPlatformElearning": "Portal ya e-Learning",
        "facultyPlatformElearningDesc": "Fikia LMS kuu kusimamia kozi, kupakia maudhui, na kuweka alama za kazi.",
        "facultyPlatformIntranetDesc": "Mawasiliano ya ndani, Portal za HR, na zana za kiutawala.",
        "facultyPlatformLibraryDesc": "Ufikiaji wa majarida ya kidijitali, hifadhidata za kitaaluma, na vitabu pepe.",
        "facultyPlatformResearchDesc": "Maombi ya ruzuku, hifadhi za machapisho, na nafasi za kazi za pamoja.",
        "facultySummaryFallback": "Zana muhimu, majukwaa, na huduma za usaidizi kuwawezesha wafanyakazi wetu wa kitaaluma kutoa ubora katika elimu ya kidijitali na utafiti.",
        "funcCurriculumDesc": "Kusimamia uundaji, ukaguzi, na uthibitishaji wa programu zote za digrii na kozi fupi ili kuhakikisha ushindani wa kimataifa.",
        "funcPolicyDesc": "Kuunda na kutekeleza kanuni zinazoongoza udahili, mitihani, alama, na mahitaji ya kuhitimu.",
        "funcQaDesc": "Ufuatiliaji na tathmini endelevu ya uwasilishaji wa ufundishaji, viwango vya tathmini, na matokeo ya utafiti wa kitaasisi.",
        "leadershipBody": "Idara ya Masuala ya Kitaaluma inaongozwa na Makamu Mkuu wa Chuo (Masuala ya Kitaaluma), akifanya kazi kwa karibu na Dekani wa Shule, Usajili (Kitaaluma), na Kurugenzi ya Uhakikisho wa Ubora.",
        "metaDesc": "Kusimamia ubora wa kitaaluma, uadilifu wa mitaala, na maendeleo ya wahadhiri katika Chuo Kikuu Huria cha Kenya.",
        "summaryFallback": "Kulinda uadilifu wa dhamira ya kitaaluma ya OUK kupitia viwango thabiti, uwezeshaji wa wahadhiri, na uvumbuzi wa ufundishaji.",
    },
    "Academics": {
        "metaDesc": "Chunguza mazingira ya kitaaluma ya OUK yanayotanguliza kidijitali, kutoka digrii za awali hadi masomo ya uzamili na kitaalamu.",
        "summaryFallback": "Kituo cha Masomo cha OUK kinaunganisha maarifa ya kimataifa na uvumbuzi wa ndani kupitia mfumo wa ufundishaji unaotanguliza kidijitali.",
        "explorePathway": "Chunguza njia",
        "schoolDescFallback": "Shule inazingatia kutoa ubora wa kitaaluma wa kiwango cha kimataifa kupitia teknolojia bunifu.",
        "exploreSchool": "Chunguza shule",
        "discoveryTitle": "Ugunduzi",
        "exploreResearchHub": "Chunguza kituo cha utafiti",
        "schoolsHeroBody": "Chunguza usanifu mbalimbali wa kitaaluma wa Chuo Kikuu Huria cha Kenya, ambapo uvumbuzi hukutana na mamlaka ya kitaasisi. Shule zetu ni nguzo za mabadiliko ya kesho.",
        "noSchoolsHint": "Jaribu maneno mapana zaidi au chunguza shule zote hapa chini.",
        "beginJourneyAccent": "safari yako",
        "beginJourneyTail": "ya kitaaluma leo",
        "exploreAllCourses": "Chunguza kozi zote",
        "schoolMetaFallback": "Chunguza nguzo maalum za kitaaluma katika Chuo Kikuu Huria cha Kenya.",
        "browseQualifications": "Chunguza sifa maalum zinazotolewa na {name}.",
        "explorePortfolio": "Chunguza portfolio",
        "researchBody": "Gundua maeneo maalum ya mada ambapo {name} inatoa athari ya kimataifa.",
    },
    "AiAdvisor": {
        "errorConnect": "Nina shida kuunganisha kwa sasa. Tafadhali jaribu tena hivi karibuni au wasiliana nasi kwa **support@ouk.ac.ke**.",
        "escalatePrompt": "Je, ungependa nikuunganishe na mshauri binadamu kwa msaada zaidi?",
        "footerNote": "Mshauri wa AI wa OUK • Inaendeshwa na AI salama",
        "openAria": "Fungua mshauri wa AI",
        "placeholder": "Niulize chochote…",
        "sendAria": "Tuma ujumbe",
        "statusOnline": "Mtandaoni • Inaendeshwa na AI",
        "suggestApply": "Jinsi ya kuomba",
        "suggestFees": "Tazama muundo wa ada",
        "suggestNoFine": "Hapana, niko sawa",
        "suggestProgrammes": "Gundua programu",
        "suggestSupport": "Wasiliana na msaada",
        "suggestTryAgain": "Jaribu tena",
        "suggestYesConnect": "Ndiyo, niunganishe",
        "welcome": "👋 **Habari! Mimi ni Mshauri wa AI wa OUK.**\n\nNinaweza kukusaidia kuhusu programu, udahili, ada, ratiba, utafiti, na zaidi.\n\nNaweza kukusaidiaje leo?",
    },
    "PeerLearners": {
        "applyRegistry": "Omba kujisajili",
        "body": "Ungana na mtandao wetu wa kitaaluma wa ushirikiano. Programu ya Wanafunzi Rika ya OUK huwezesha ushauri unaoendeshwa na jamii, ikiziba pengo kati ya uwezo na ustadi.",
        "callMentor": "Piga simu kwa mshauri",
        "ctaEyebrow": "Panda kwenye uongozi",
        "faq1a": "Ndiyo, programu ni huduma kuu ya wanafunzi ya OUK iliyoundwa kukuza utamaduni wa kitaaluma wa ushirikiano bila gharama ya ziada.",
        "faq2a": "Washauri wanapaswa kudumisha GPA ya angalau 3.5 na kupokea mapendekezo kutoka viongozi wa kitivo kabla ya kuonekana kwenye rejesta.",
        "faq3a": "Washauri wetu maalum hushughulikia taaluma zote, ikiwa ni pamoja na uuguzi, uhandisi, na vitengo vya maabara ya TEHAMA.",
        "faq4a": "Hakuna mipaka iliyowekwa, ingawa tunahimiza wanafunzi kuheshimu ratiba za washauri na kuanzisha mawasiliano wakati wa saa zinazopendekezwa.",
        "honestyDesc": "Washauri wetu hutoa mwongozo na ufafanuzi, si kufanya kazi za kozi kwa wengine. Tunazingatia viwango vikali vya uadilifu vya OUK.",
        "journeyEyebrow": "Safari ya ushirikiano",
        "step1Title": "Chunguza wataalamu",
    },
    "PersonnelGrid": {
        "boardMember": "Mwanachama wa bodi",
        "directoryOffline": "Orodha haipatikani kwa sasa",
        "executiveLeadership": "Uongozi wa juu",
        "loadingDirectory": "Inapakia orodha",
        "viewProfile": "Tazama wasifu",
    },
    "Referencing": {
        "ackSourcesDesc": "Toa sifa kwa wanafikra asilia ambao mawazo yao unajenga juu yake.",
        "avoidPlagiarism": "Epuka wizi wa kitaaluma",
        "avoidPlagiarismDesc": "Linda hadhi yako ya kitaaluma na udumishe viwango vya OUK.",
        "backLiteracy": "Rudi kwenye msingi wa ujuzi",
        "body": "Jifunze sanaa ya sifa za kitaaluma. Marejeleo sahihi yanathibitisha utafiti wako, yanaheshimu mali miliki, na yanaunganisha kazi yako na mazungumzo ya kielimu duniani.",
        "confusedBody": "Maktabani wetu wa uhusiano wanafanya warsha za kila wiki kuhusu marejeleo ya APA na Harvard. Jiunge nasi kwa kipindi cha vitendo.",
        "confusedTitle": "Bado umechanganyikiwa kuhusu nukuu?",
        "enableVerification": "Wezesha uthibitishaji",
        "enableVerificationDesc": "Ruhusu wasomaji wako kupata na kuthibitisha vyanzo ulivyotumia.",
        "ethicsBody": "Kwa nini tunanukuu: Zaidi ya kuepuka matokeo hasi, marejeleo yanajenga uaminifu wako.",
        "guideBody": "Pakua mwongozo wetu kamili wa kurasa 50 kuhusu Viwango vya Marejeleo vya OUK.",
        "harvardDesc": "Mtindo rasmi wa kitaasisi kwa programu za shahada ya kwanza za OUK.",
        "mgmtBody": "Uandishi wa kitaaluma ni rahisi kwa zana sahihi. Maktaba ya OUK inapendekeza wasimamizi hawa wa rejea wa kiwango cha sekta kukusaidia kupanga maktaba yako.",
        "mlaDesc": "Inatumika sana katika Binadamu na Sanaa.",
        "selectStyleBody": "Taaluma tofauti zinahitaji miundo tofauti. Chagua mtindo unaopendelea kuona violezo vilivyoidhinishwa na OUK.",
        "showBreadthDesc": "Onyesha kina na anuwai ya usomaji wako wa utafiti.",
        "viewWorkshops": "Angalia ratiba ya warsha",
        "zoteroDesc": "Zana huria ya bure kukusaidia kukusanya na kunukuu.",
    },
    "Units": {
        "accreditationValue": "Cheti kinachotambuliwa kimataifa",
        "assessmentFallback": "Mitihani endelevu (CATs), warsha za maabara, na mitihani ya mwisho.",
        "descriptionFallback": "Silabasi ya kina na uchunguzi wa kanuni za msingi ndani ya kitengo hiki cha kitaaluma. Kitengo hiki kinazingatia kukuza fikra muhimu na matumizi ya vitendo katika uwanja.",
        "heroBlurb": "Kitengo hiki ni msingi muhimu wa mtaala wa OUK, kilichoundwa kutoa ustadi katika {title}.",
        "includedInDegreePaths": "Imejumuishwa katika njia za digrii",
        "levelFallback": "Shahada ya kwanza",
        "motto": "Ubora katika elimu ya kidijitali",
        "prerequisitesFallback": "Mahitaji ya kawaida ya kuingia Mwaka wa 1 au kukamilisha kwa mafanikio vitalu vya msingi vya kitaaluma.",
        "programmesEmpty": "Kitengo hiki bado kinaunganishwa na njia rasmi za digrii.",
        "supportBlurb": "Vitengo vyote vya kozi za OUK vinaungwa mkono na Kituo cha Ujifunzaji Kidijitali cha 24/7 na wahadhiri wa kiwango cha dunia.",
    },
    "Legal": {
        "centerBody": "Katika Chuo Kikuu Huria cha Kenya, tumejitolea kulinda faragha yako na kuhakikisha data yako inashughulikiwa kwa usalama na uwazi.",
        "centerCookiesBody": "Dhibiti mipangilio yako ya vidakuzi na uchague teknolojia gani za ufuatiliaji unazoruhusu kwenye majukwaa yetu ya kidijitali.",
        "centerMetaDesc": "Dhibiti mipangilio yako ya faragha na jifunze jinsi OUK inavyolinda data yako binafsi.",
        "centerPolicyBody": "Jifunze jinsi tunavyokusanya, kuchakata, na kulinda taarifa zako binafsi kwa kufuata sheria za kitaifa za ulinzi wa data.",
        "centerRightsBody": "Una haki ya kuomba ufikiaji, urekebishaji, au ufutaji wa data yako binafsi. Wasilisha ombi kwa Afisa wetu wa Ulinzi wa Data.",
        "cookiesAnalyticsDesc": "Hutusaidia kuelewa mwingiliano wa watumiaji ili kuboresha huduma zetu.",
        "cookiesHowP": "Tunatumia vidakuzi kukuweka umeingia, kukumbuka mapendeleo yako ya ufikiaji (kama saizi ya fonti na hali ya utofautishaji), kuboresha utendaji wa tovuti, na kuelewa jinsi wageni wanavyosafiri katika kampasi ya kidijitali ya OUK.",
        "cookiesManageP": "Unaweza kudhibiti na kufuta vidakuzi kupitia mipangilio ya kivinjari chako wakati wowote. Tafadhali kumbuka kuwa kuzima vidakuzi muhimu kunaweza kuathiri utendaji wa jukwaa.",
        "cookiesWhatP": "Vidakuzi ni faili ndogo za maandishi zinazohifadhiwa kwenye kifaa chako unapotembelea tovuti yetu. Zinatusaidia kutoa uzoefu bora na wa kibinafsi zaidi na kutukumbusha mapendeleo yako katika vipindi.",
        "privacyCollectP": "Tunaweza kukusanya data kama jina lako, maelezo ya mawasiliano, rekodi za kitaaluma, na data ya matumizi unapoomba programu, kutumia Portal ya wanafunzi, au kushirikiana na huduma zetu za kidijitali.",
        "privacyIntroP": "Karibu Chuo Kikuu Huria cha Kenya. Tumejitolea kulinda data yako binafsi na kuheshimu faragha yako. Sera hii inaeleza jinsi tunavyokusanya, kutumia, na kulinda taarifa zako unaposhirikiana na kampasi yetu ya kidijitali na huduma zetu.",
        "privacyUseP": "Data yako inatumika pekee kuwezesha safari yako ya kitaaluma, kudhibiti wasifu wako wa mwanafunzi, kuchakata malipo, na kuboresha huduma zetu za kidijitali za kitaasisi.",
        "termsIpP": "Nyenzo zote za kozi, machapisho, na maudhui kwenye jukwaa la OUK ni mali miliki ya Chuo Kikuu Huria cha Kenya au watoa leseni wake, na zinalindwa na sheria za hakimiliki na mali miliki zinazotumika.",
    },
    "Sitemap": {
        "alumniNetwork": "Mtandao wa wahitimu",
        "helpCenter": "Kituo cha msaada",
        "metaDesc": "Pitia kampasi ya kidijitali ya Chuo Kikuu Huria cha Kenya.",
        "studentPortal": "Portal ya mwanafunzi",
        "subtitle": "Pitia kampasi ya kidijitali ya Chuo Kikuu Huria cha Kenya. Pata viungo vya haraka vya programu, udahili, na rasilimali za kitaasisi.",
        "title": "Ramani ya tovuti",
    },
    "Faqs": {
        "emptyBody": "Hifadhi ya maarifa ya chuo bado inasubiri kujazwa.",
        "emptyTitle": "Hifadhi ya maarifa ni tupu",
        "eyebrow": "Hifadhi ya maarifa",
        "loading": "Inasawazisha hifadhi ya maarifa…",
        "metaDesc": "Pata majibu ya maswali ya kawaida kuhusu udahili, fedha, na sera za kitaaluma katika OUK.",
        "ontologyGroups": "Vikundi vya mada",
        "registrySuffix": "Rejesta",
        "searchPlaceholder": "Tafuta maarifa…",
        "subtitle": "Pata majibu thabiti ya maswali ya kawaida kuhusu udahili, fedha, na utawala wa kitaaluma katika Chuo Kikuu Huria cha Kenya.",
        "titleAccent": "yanayoulizwa mara kwa mara",
        "voidBody": "Hakuna maswali yaliyolingana na utafutaji wako.",
        "voidTitle": "Hakuna matokeo",
    },
    "Contact": {
        "campusLabel": "Kampasi ya kimwili",
        "campusSub": "Makao makuu ya kidijitali",
        "digitalPresence": "Uwepo wa kidijitali",
        "emailPlaceholder": "wewe@mfano.com",
        "eyebrow": "Kituo cha msaada wa kimataifa",
        "formTitle": "Ombi",
        "formTitleAccent": "la kielektroniki",
        "mapBody": "Kituo cha kimkakati cha kidijitali cha Chuo Kikuu Huria cha Kenya.",
        "mapEyebrow": "Mahali pa chuo",
        "message": "Ujumbe",
        "messagePlaceholder": "Maelezo ya kina ya swali lako…",
        "metaDesc": "Wasiliana na Chuo Kikuu Huria cha Kenya. Tuko tayari kukuunga mkono katika safari yako ya kitaaluma.",
        "phoneLabel": "Simu ya taasisi",
        "responseLabel": "Wastani wa majibu",
        "responseValue": "Saa 24 zimehakikishwa",
        "secureBody": "Data yote inalindwa kupitia itifaki za SSL za chuo.",
        "subject": "Mada",
        "submit": "Tuma ujumbe",
        "subtitle": "Timu zetu za msaada wa kitaasisi ziko tayari kushughulikia maswali yako na kukupa mwongozo katika maeneo yote ya kitaaluma.",
        "title": "Wasiliana",
        "titleAccent": "nasi",
    },
    "Management": {
        "chipAgile": "Utawala wa haraka",
        "ctaGateway": "Lango lako la elimu duniani linaanza hapa.",
        "ecoCampusDesc": "Mazingira ya ufundishaji yanayofikiwa duniani kwa kujifunza kwa njia isiyosawazishwa.",
        "ecoPortal": "Portal ya kidijitali",
        "ecoPortalDesc": "Kiolesura cha mwingiliano cha mahali pamoja kwa usimamizi wa rekodi za fedha na kitaaluma.",
        "ecoSupportDesc": "Msaada wa kibinafsi kwa mipango ya kitaaluma na maswali ya kiufundi.",
        "ecosystemBody": "Kila sehemu ya Chuo imeundwa kwa ufikiaji, uwazi, na ubora wa kidijitali.",
        "featAdminDesc": "Kuratibu mzunguko wa maisha wa mwanafunzi kutoka udahili hadi kuhitimu kwa uadilifu wa kidijitali.",
        "featFiscalDesc": "Kuhakikisha uendelevu wa muda mrefu kupitia uhamasishaji bora wa rasilimali.",
        "featStudentDesc": "Kuendesha viwango vya juu vya kukamilisha kupitia huduma za msaada zinazoendeshwa na teknolojia.",
        "featTechDesc": "Kudumisha Kampasi yetu Pepe ya kiwango cha dunia na mifumo ya data ya kitaasisi.",
        "gridSubtitle": "Chombo cha utendaji kinachohusika na shughuli za kila siku na usimamizi wa kiutawala wa Chuo.",
        "initiateProtocol": "Anzisha itifaki",
        "joinUniversity": "Jiunge na chuo",
        "mandateBody": "Bodi ya Usimamizi hutumika kama injini ya utendaji ya OUK, ikihakikisha ufundishaji wetu unaotanguliza kidijitali unatafsiriwa kuwa uzoefu laini wa mwanafunzi.",
        "pageSummary": "Kugeuza mkakati wa kitaasisi kuwa uhalisia wa kiutendaji kupitia uongozi unaotanguliza kidijitali na ubora wa kitaaluma.",
    },
    "SearchPage": {
        "ariaLabel": "Tafuta Chuo Kikuu Huria cha Kenya",
        "clear": "Futa utafutaji",
        "emptyPrompt": "Andika neno la utafutaji hapo juu ili kuanza",
        "loading": "Inatafuta katika maudhui yote ya chuo…",
        "noResultsHint": "Jaribu maneno mapana zaidi au chunguza sehemu moja kwa moja.",
        "placeholder": "Tafuta programu, habari, wafanyakazi, utafiti…",
        "staticAboutBody": "Imeanzishwa ili kutoa elimu ya mtandaoni inayobadilika, ya bei nafuu, na ya ubora wa juu, Chuo Kikuu Huria cha Kenya kiko mstari wa mbele katika mabadiliko ya kidijitali katika elimu ya juu.",
        "staticAdmissionsBody": "Jiunge na jamii ya kimataifa ya wanafunzi wa kidijitali. Udahili wetu ni wazi, wa haraka, na umeundwa kukuunga mkono.",
        "staticLibraryBody": "Fikia mamilioni ya rasilimali za kidijitali, majarida, kumbukumbu, na vitabu vilivyochaguliwa kwa wanafunzi wa OUK.",
        "staticResearchBody": "Gundua magunduzi, machapisho, vituo vya utafiti, na ubunifu unaofanyika katika shule zetu.",
        "suggestions": "Mapendekezo ya utafutaji",
        "viewCourseUnit": "Angalia kitengo cha kozi",
        "viewProgramme": "Angalia programu",
        "viewShortCourse": "Angalia kozi fupi",
    },
    "Social": {
        "ctaBody": "Tuitaje katika nyakati zako za chuo kwa #OUKKenya na ujiunge na maelfu ya wanafunzi wanaoumba kesho.",
        "ctaTitle": "Kuwa sehemu ya kitu kikubwa",
        "followEverywhere": "Tufuate kila mahali",
        "getInvolved": "Shiriki",
        "hashtagHint": "Tumia #OUKKenya ili kuangaziwa",
        "latestFromChannels": "Hivi karibuni kutoka kwa njia zetu",
        "liveUpdates": "Masasisho ya moja kwa moja kutoka kwa njia zetu rasmi.",
        "loadingFeeds": "Inapakia milisho ya mitandao…",
        "socialFeed": "Mlisho wa mitandao",
        "socialPulse": "Mapigo ya mitandao",
        "subtitle": "Endelea kuunganishwa na Chuo Kikuu Huria cha Kenya — mahali maarifa yanakutana na jamii.",
        "title": "Jiunge na mazungumzo",
        "viewAllNews": "Tazama habari zote",
    },
}


def set_dotted(root: dict, dotted: str, value: str) -> bool:
    """Set a nested dict value by dotted path. Returns True if key existed and value changed."""
    parts = dotted.split(".")
    cur: dict = root
    for p in parts[:-1]:
        if p not in cur or not isinstance(cur[p], dict):
            return False
        cur = cur[p]
    leaf = parts[-1]
    if leaf not in cur:
        return False
    if cur[leaf] == value:
        return False
    cur[leaf] = value
    return True


def apply_systematic(ns_obj: dict, en_ns: dict) -> int:
    """Safe pattern fixes within a namespace object. Returns number of string changes."""
    changed = 0

    def walk(sw_node, en_node):
        nonlocal changed
        if not isinstance(sw_node, dict):
            return
        for k, v in sw_node.items():
            en_v = en_node.get(k) if isinstance(en_node, dict) else None
            if isinstance(v, dict):
                walk(v, en_v if isinstance(en_v, dict) else {})
            elif isinstance(v, str):
                new = v
                # Browse/Explore Vinjari → Chunguza (do not touch kivinjari = browser)
                new = re.sub(r"(?<![Kk]i)vinjari", "chunguza", new)
                new = re.sub(r"(?<![Kk]i)Vinjari", "Chunguza", new)
                if "kuvinjari" in new:
                    new = new.replace("kuvinjari", "kuchunguza")
                # Home (website) → Ukurasa kuu
                if isinstance(en_v, str) and en_v.strip() == "Home" and new in ("Nyumbani", "nyumbani"):
                    new = "Ukurasa kuu"
                # Portali → Portal (brand/loanword consistency)
                if "Portali" in new:
                    new = new.replace("Portali", "Portal")
                if "portali" in new:
                    new = new.replace("portali", "Portal")
                # Common agreement: Portal la → Portal ya
                if "Portal la " in new:
                    new = new.replace("Portal la ", "Portal ya ")
                if "portal la " in new:
                    new = new.replace("portal la ", "Portal ya ")
                if "portal lako" in new:
                    new = new.replace("portal lako", "Portal yako")
                if " bofya " in new:
                    new = new.replace(" bofya ", " bonyeza ")
                if new.startswith("Bofya "):
                    new = "Bonyeza " + new[6:]
                if new != v:
                    sw_node[k] = new
                    changed += 1

    walk(ns_obj, en_ns)
    return changed


def main() -> None:
    sw = json.loads(SW_PATH.read_text(encoding="utf-8"))
    en = json.loads(EN_PATH.read_text(encoding="utf-8"))
    before = deepcopy(sw)

    curated_changed = 0
    namespaces_touched: set[str] = set()
    examples: list[tuple[str, str, str]] = []

    # 1) Curated per-key updates
    for ns, mapping in UPDATES.items():
        if ns not in sw or not isinstance(sw[ns], dict):
            continue
        for dotted, value in mapping.items():
            # Capture old value for examples
            parts = dotted.split(".")
            cur = sw[ns]
            ok = True
            for p in parts:
                if not isinstance(cur, dict) or p not in cur:
                    ok = False
                    break
                if p == parts[-1]:
                    old = cur[p]
                else:
                    cur = cur[p]
            if not ok:
                continue
            if set_dotted(sw[ns], dotted, value):
                curated_changed += 1
                namespaces_touched.add(ns)
                if len(examples) < 40 and isinstance(old, str):
                    examples.append((f"{ns}.{dotted}", old, value))

    # 2) Systematic fixes (may overlap; count only actual diffs vs before)
    for ns in NAMESPACES:
        if ns not in sw or ns not in en:
            continue
        apply_systematic(sw[ns], en[ns])

    # Count total string changes vs original
    def flatten(d, prefix=""):
        out = {}
        for k, v in d.items():
            key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                out.update(flatten(v, key))
            else:
                out[key] = v
        return out

    total_changed = 0
    touched = set()
    all_examples: list[tuple[str, str, str]] = []
    for ns in NAMESPACES:
        if ns not in before or ns not in sw:
            continue
        b = flatten(before[ns])
        a = flatten(sw[ns])
        for k in b:
            if k in a and a[k] != b[k]:
                total_changed += 1
                touched.add(ns)
                if len(all_examples) < 15:
                    all_examples.append((f"{ns}.{k}", b[k], a[k]))

    SW_PATH.write_text(
        json.dumps(sw, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"CHANGED_STRINGS={total_changed}")
    print(f"NAMESPACES_TOUCHED={len(touched)}")
    print("NAMESPACES=" + ", ".join(sorted(touched)))
    print("EXAMPLES:")
    for path, old, new in all_examples:
        print(f"  {path}")
        print(f"    BEFORE: {old}")
        print(f"    AFTER:  {new}")


if __name__ == "__main__":
    main()
