import { DataSource } from 'typeorm';
import { News } from '../../news/entities/news.entity';

export const runNewsSeed = async (dataSource: DataSource) => {
  const newsRepo = dataSource.getRepository(News);

  const newsItems = [
    {
      title: 'OUK Admissions Now Open',
      title_sw: 'Udahili wa OUK Sasa Umeanza',
      slug: 'admissions-now-open',
      content: `
        <p>The Open University of Kenya is pleased to announce the opening of the application window for the inaugural academic year.</p>
        <p>Prospective students can now apply for various undergraduate and graduate programmes. Our admission process is entirely online, reflecting our commitment to accessibility and digital-first education.</p>
        <h3>Why Apply to OUK?</h3>
        <ul>
          <li>Flexible online learning suitable for working professionals.</li>
          <li>High-quality education at affordable tuition rates.</li>
          <li>Access to global research and academic networks.</li>
        </ul>
      `,
      content_sw:
        '<p>Chuo Kikuu Huria cha Kenya kinafuraha kutangaza ufunguzi wa dirisha la maombi kwa mwaka wa kwanza wa kitaaluma.</p><p>Waombaji wanaweza sasa kuomba programu mbalimbali za shahada ya kwanza na uzamili. Mchakato wetu wa udahili ni wa mtandaoni kabisa.</p><h3>Kwa Nini Kuomba OUK?</h3><ul><li>Kujifunza mtandaoni kunakobadilika kwa wataalamu wanaofanya kazi.</li><li>Elimu bora kwa ada nafuu.</li><li>Ufikiaji wa mitandao ya kimataifa ya utafiti na kitaaluma.</li></ul>',
      summary_sw:
        'Chuo Kikuu Huria cha Kenya kinafuraha kutangaza ufunguzi wa dirisha la maombi kwa mwaka wa kwanza wa kitaaluma.',
      category: 'Institutional Announcement',
      type: 'News',
      image_url:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
      is_published: true,
    },
    {
      title: 'Data Science School Launch',
      title_sw: 'Uzinduzi wa Shule ya Sayansi ya Data',
      slug: 'data-science-school-launch',
      content: `
        <p>As part of our mission to lead technological innovation in Africa, OUK is proud to unveil its specialized School of Data Science.</p>
        <p>The new school will focus on bridging the global talent gap in AI, Machine Learning, and Big Data Analysis. We have partnered with leading tech giants to ensure our curriculum remains industry-relevant.</p>
      `,
      content_sw:
        '<p>Kama sehemu ya dhamira yetu ya kuongoza uvumbuzi wa kiteknolojia Afrika, OUK inajivunia kuzindua Shule yake maalum ya Sayansi ya Data.</p><p>Shule mpya itazingatia kuziba pengo la kimataifa la vipaji katika AI, ujifunzaji wa mashine, na uchambuzi wa data kubwa.</p>',
      summary_sw:
        'OUK inajivunia kuzindua Shule yake maalum ya Sayansi ya Data ili kuziba pengo la vipaji katika AI na data kubwa.',
      category: 'Scholarly Update',
      type: 'Research',
      image_url:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop',
      is_published: true,
    },
    {
      title: 'Test News Article',
      title_sw: 'Habari ya Majaribio',
      slug: 'test-news',
      content: `
        <p>This is a high-fidelity test article for verifying the institutional news engine.</p>
        <p>The Open University of Kenya continues to pioneer digital-first pedagogical strategies across the continent.</p>
      `,
      content_sw:
        '<p>Hii ni makala ya majaribio ya kuthibitisha injini ya habari za kitaasisi.</p><p>Chuo Kikuu Huria cha Kenya kinaendelea kuanzisha mikakati ya ufundishaji inayoongoza kwa kidijitali barani.</p>',
      summary_sw:
        'Makala ya majaribio ya kuthibitisha injini ya habari za kitaasisi.',
      category: 'Intelligence',
      type: 'News',
      image_url:
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop',
      is_published: true,
    },
  ];

  for (const item of newsItems) {
    const existing = await newsRepo.findOne({ where: { slug: item.slug } });
    if (!existing) {
      await newsRepo.save(newsRepo.create(item));
    } else {
      const patch: Record<string, string> = {};
      for (const key of ['title_sw', 'summary_sw', 'content_sw'] as const) {
        if (item[key] && !existing[key]) patch[key] = item[key];
      }
      if (Object.keys(patch).length) {
        Object.assign(existing, patch);
        await newsRepo.save(existing);
      }
    }
  }
};
