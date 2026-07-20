import { Client } from 'pg';

async function seedResearch() {
  const client = new Client({
    connectionString: 'postgresql://mwarabu@localhost:5432/ouk_db',
  });

  await client.connect();

  const schoolId = '9794fc9d-21ac-41a4-bede-6ffe6ea25e3e';

  // 1. Seed Partners
  const partners = [
    [
      'IBM Research Africa',
      'https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg',
      'https://www.research.ibm.com/labs/africa/',
      'Industry',
      'Collaborating on AI for sustainable development and quantum computing literacy.',
    ],
    [
      'UNESCO',
      'https://upload.wikimedia.org/wikipedia/commons/b/b1/UNESCO_logo_white.svg',
      'https://en.unesco.org/',
      'Joint Venture',
      'Global partnership for open science and digital inclusion in higher education.',
    ],
    [
      'Microsoft Africa Research Institute (MARI)',
      'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
      'https://www.microsoft.com/en-us/research/lab/microsoft-africa-research-institute/',
      'Industry',
      'Focusing on human-centric AI and local innovation ecosystems.',
    ],
    [
      'CIB Africa',
      'https://via.placeholder.com/150',
      '#',
      'Joint Venture',
      'Regional infrastructure and technical training consortium.',
    ],
  ];

  for (const [name, logo, site, type, desc] of partners) {
    await client.query(
      'INSERT INTO research_partners (name, logo_url, website_url, type, description, school_id) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
      [name, logo, site, type, desc, schoolId],
    );
  }

  // 2. Seed Programmes (Research Areas)
  const programmes = [
    [
      'Artificial Intelligence & Robotics',
      'ai-robotics',
      'Pioneering intelligent systems and autonomous robotics tailored for African logistical challenges.',
    ],
    [
      'Cybersecurity & Digital Sovereignty',
      'cybersecurity',
      'Protecting national digital infrastructure and developing robust cryptographic standards.',
    ],
    [
      'Sustainable Energy Systems',
      'sustainable-energy',
      'Researching off-grid solar solutions and smart grid technologies for rural electrification.',
    ],
  ];

  for (const [title, slug, overview] of programmes) {
    await client.query(
      'INSERT INTO research_programmes (title, slug, overview, status, school_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
      [title, slug, overview, 'active', schoolId],
    );
  }

  console.log('Research data seeded successfully for School of Science');
  await client.end();
}

seedResearch().catch(console.error);
