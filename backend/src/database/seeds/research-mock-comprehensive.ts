import { Client } from 'pg';

async function seedComprehensiveResearch() {
  const client = new Client({
    connectionString: 'postgresql://mwarabu@localhost:5432/ouk_db',
  });

  await client.connect();

  const schoolId = '9794fc9d-21ac-41a4-bede-6ffe6ea25e3e';

  // 1. Projects
  const projects = [
    [
      'AI-Driven Crop Disease Detection',
      'crop-disease-ai',
      'A mobile-first solution using computer vision to identify maize lethal necrosis in real-time.',
      'ongoing',
      'USAID Digital Development Lab',
      450000.0,
    ],
    [
      'Blockchain for Academic Credentialing',
      'blockchain-credentials',
      'Developing a decentralized ledger for verifiable academic certificates across African universities.',
      'planning',
      'Afri-Tech Foundation',
      200000.0,
    ],
    [
      'Ethical AI in African Governance',
      'ethical-ai-gov',
      'Researching framework for bias-free algorithmic decision making in public service delivery.',
      'ongoing',
      'Mozilla Foundation',
      150000.0,
    ],
    [
      'Low-Cost IoT for Smart Water Grids',
      'iot-water-grids',
      'Implementing mesh-networked sensors to monitor water table levels in arid regions.',
      'completed',
      'Regional Innovation Fund',
      320000.0,
    ],
  ];

  for (const [title, slug, desc, status, funder, budget] of projects) {
    await client.query(
      'INSERT INTO research_projects (title, slug, description, status, funder, budget, school_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now()) ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description, status = EXCLUDED.status',
      [title, slug, desc, status, funder, budget, schoolId],
    );
  }

  // 2. Publications
  const publications = [
    [
      'Optimizing LLMs for Low-Resource Languages',
      'llm-low-resource',
      'Strategies for fine-tuning transformer models on Swahili and Kikuyu dialects.',
      2024,
      'journal',
      'Published',
    ],
    [
      'Cyber-Resilience in Emerging Economies',
      'cyber-resilience-emerging',
      'A policy paper on protecting critical digital infrastructure from state-sponsored threats.',
      2023,
      'technical_report',
      'Published',
    ],
    [
      'The Future of Open Science in Kenya',
      'future-open-science-kenya',
      'Evaluating the adoption of open-access repositories in national research institutes.',
      2024,
      'book_chapter',
      'Published',
    ],
    [
      'Drone Swarms for Reforestation Monitoring',
      'drone-swarms-reforestation',
      'Using swarm intelligence to map canopy recovery in the Mau Forest complex.',
      2022,
      'conference_paper',
      'Published',
    ],
  ];

  for (const [title, slug, abstract, year, type, status] of publications) {
    await client.query(
      'INSERT INTO publications (title, slug, abstract, publication_year, type, status, school_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now()) ON CONFLICT (slug) DO UPDATE SET abstract = EXCLUDED.abstract',
      [title, slug, abstract, year, type, status, schoolId],
    );
  }

  // 3. Partners
  const partners = [
    [
      'Safaricom PLC',
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/Safaricom_logo.svg',
      'https://www.safaricom.co.ke/',
      'Industry',
      'Strategic partner for mobile technology research and 5G testbeds.',
    ],
    [
      'Kenya Space Agency',
      'https://via.placeholder.com/150',
      'https://ksa.go.ke/',
      'Government',
      'Collaborating on satellite imaging and geospatial data analysis.',
    ],
    [
      'Google Research Africa',
      'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
      'https://research.google/locations/accra/',
      'Industry',
      'Supporting AI research fellowships and compute infrastructure.',
    ],
    [
      'African Union',
      'https://via.placeholder.com/150',
      'https://au.int/',
      'Joint Venture',
      'Policy partner for continental digital transformation initiatives.',
    ],
  ];

  for (const [name, logo, site, type, desc] of partners) {
    await client.query(
      'INSERT INTO research_partners (name, logo_url, website_url, type, description, school_id, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now())',
      [name, logo, site, type, desc, schoolId],
    );
  }

  console.log('Comprehensive Research Mock Data Seeded for School of Science');
  await client.end();
}

seedComprehensiveResearch().catch(console.error);
