import { DataSource } from 'typeorm';
import { Faq } from '../../faqs/entities/faq.entity';

export const runFaqsSeed = async (dataSource: DataSource) => {
  const faqRepo = dataSource.getRepository(Faq);

  const faqsData = [
    {
      category: 'Admissions',
      question:
        'What are the minimum admission requirements for undergraduate programmes at the Open University of Kenya?',
      question_sw:
        'Mahitaji ya chini ya udahili kwa programu za shahada ya kwanza katika Chuo Kikuu Huria cha Kenya ni yapi?',
      answer:
        'The minimum requirements include a mean grade of C+ and above at KCSE (Kenya Certificate of Secondary Education) or its equivalent. Alternatively, applicants with diplomas, professional qualifications, or other qualifications recognised by the Senate are eligible.',
      answer_sw:
        'Mahitaji ya chini yanajumuisha wastani wa C+ na kuendelea katika KCSE au sawa nayo. Vinginevyo, waombaji wenye diploma, sifa za kitaaluma, au sifa nyingine zinazotambuliwa na Seneti wanastahili.',
      display_order: 1,
      is_active: true,
    },
    {
      category: 'Admissions',
      question: 'How do I apply for admission to the Open University of Kenya?',
      question_sw:
        'Ninawezaje kuomba udahili katika Chuo Kikuu Huria cha Kenya?',
      answer:
        'Students can apply through the Kenya Universities and Colleges Central Placement Services (KUCCPS) admission portal dedicated for OUK (ouk.kuccps.net) if they have KCSE qualifications, or using OUK admission portal (admissions.ouk.ac.ke) if they wish to be considered for admission based on recognition of prior learning.',
      answer_sw:
        'Wanafunzi wanaweza kuomba kupitia lango la KUCCPS lililojitolea kwa OUK (ouk.kuccps.net) ikiwa wana sifa za KCSE, au lango la udahili la OUK (admissions.ouk.ac.ke) ikiwa wanataka kuzingatiwa kwa msingi wa utambuzi wa ujifunzaji wa awali.',
      display_order: 2,
      is_active: true,
    },
    {
      category: 'Financials',
      question:
        'Is there financial aid or scholarships available for eligible students?',
      question_sw:
        'Je, kuna msaada wa kifedha au ufadhili kwa wanafunzi wanaostahili?',
      answer:
        'Yes, government-sponsored students are eligible for Higher Education Funds both from Universities Fund and Higher Education Loans Board as any other Kenyan student.',
      answer_sw:
        'Ndiyo, wanafunzi wanaofadhiliwa na serikali wanastahili Fedha za Elimu ya Juu kutoka Universities Fund na Higher Education Loans Board kama mwanafunzi mwingine yeyote wa Kenya.',
      display_order: 1,
      is_active: true,
    },
    {
      category: 'Academic',
      question: 'Is there an application fee?',
      question_sw: 'Je, kuna ada ya ombi?',
      answer: 'Yes, the application fee is KES 1000.',
      answer_sw: 'Ndiyo, ada ya ombi ni KES 1000.',
      display_order: 1,
      is_active: true,
    },
    {
      category: 'General',
      question: 'Are there any age restrictions for admission?',
      question_sw: 'Je, kuna vizuizi vya umri kwa udahili?',
      answer:
        'OUK is a university for all without age, gender, location restrictions',
      answer_sw:
        'OUK ni chuo kikuu kwa wote bila vizuizi vya umri, jinsia, au mahali.',
      display_order: 1,
      is_active: true,
    },
  ];

  for (const f of faqsData) {
    const existing = await faqRepo.findOne({ where: { question: f.question } });
    if (!existing) {
      await faqRepo.save(faqRepo.create(f));
    } else {
      const patch: Record<string, string> = {};
      if (f.question_sw && !existing.question_sw)
        patch.question_sw = f.question_sw;
      if (f.answer_sw && !existing.answer_sw) patch.answer_sw = f.answer_sw;
      if (Object.keys(patch).length) {
        Object.assign(existing, patch);
        await faqRepo.save(existing);
      }
    }
  }
};
