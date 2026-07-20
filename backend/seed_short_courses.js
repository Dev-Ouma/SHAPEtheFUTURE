// Node 24 native fetch used

const API_URL = 'http://localhost:3001';

async function seedShortCourses() {
  console.log("Fetching taxonomies...");
  
  // 1. Fetch Taxonomies
  const schools = await (await fetch(`${API_URL}/schools`)).json();
  const departments = await (await fetch(`${API_URL}/short-courses/taxonomies/departments`)).json();
  const categories = await (await fetch(`${API_URL}/short-courses/taxonomies/categories`)).json();
  const methods = await (await fetch(`${API_URL}/short-courses/taxonomies/methods`)).json();

  let schoolId = schools.length > 0 ? schools[0].id : null;
  let departmentId = departments.length > 0 ? departments[0].id : null;
  let categoryId = categories.length > 0 ? categories[0].id : null;
  let methodId = methods.length > 0 ? methods[0].id : null;

  // Ensure taxonomies exist
  if (!schoolId) {
    const s = await (await fetch(`${API_URL}/schools`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'School of Science & Technology' })
    })).json();
    schoolId = s.id;
  }
  if (!categoryId) {
    const c = await (await fetch(`${API_URL}/short-courses/taxonomies/categories`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Technology & Data' })
    })).json();
    categoryId = c.id;
  }

  const mockCourses = [
    {
      title: 'Applied Machine Learning & AI',
      code: 'SC-MLAI-101',
      slug: 'applied-machine-learning-ai',
      overview: 'Master the fundamentals of applied machine learning, neural networks, and AI ethics.',
      about: '<p>This intensive 6-week programme is designed to equip professionals with practical machine learning skills. From linear regression to deep neural networks, learners will build and deploy models using industry-standard Python libraries.</p>',
      duration: '6 Weeks',
      cost: 'KES 85,000',
      image_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070&auto=format&fit=crop',
      skills_gained: 'Python, Neural Networks, AI Strategy, Predictive Analytics',
      target_audience: 'Software Engineers, Data Analysts, IT Managers',
      mode_of_delivery: 'Online',
      level: 'Intermediate',
      status: 'Published',
      school: { id: schoolId },
      course_category: { id: categoryId },
      modules: [
        { title: 'Introduction to AI', description: 'Overview of AI concepts and modern applications.', order: 1 },
        { title: 'Supervised Learning', description: 'Regression, Classification, and predictive modeling.', order: 2 },
        { title: 'Deep Learning Basics', description: 'Introduction to Neural Networks using TensorFlow.', order: 3 }
      ]
    },
    {
      title: 'Executive Digital Transformation',
      code: 'SC-EDT-202',
      slug: 'executive-digital-transformation',
      overview: 'A leadership guide to transforming organizational strategies through digital technologies.',
      about: '<p>Tailored for C-suite executives and senior managers, this course provides the strategic framework needed to navigate digital disruption and lead organizational change in the 21st century.</p>',
      duration: '4 Weeks',
      cost: 'KES 120,000',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
      skills_gained: 'Digital Strategy, Change Management, Innovation Frameworks',
      target_audience: 'C-Suite, Directors, Senior Management',
      mode_of_delivery: 'Blended',
      level: 'Advanced',
      status: 'Published',
      school: { id: schoolId },
      course_category: { id: categoryId },
      modules: [
        { title: 'The Digital Economy', description: 'Understanding digital disruption and new business models.', order: 1 },
        { title: 'Leading Change', description: 'Navigating organizational resistance to technology.', order: 2 }
      ]
    },
    {
      title: 'Cybersecurity Fundamentals',
      code: 'SC-CYB-300',
      slug: 'cybersecurity-fundamentals',
      overview: 'Essential cybersecurity principles for securing institutional networks and data.',
      about: '<p>A foundational course covering network security, threat modeling, and modern cryptographic practices. Ideal for IT professionals transitioning into specialized security roles.</p>',
      duration: '8 Weeks',
      cost: 'KES 95,000',
      image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
      skills_gained: 'Network Security, Threat Modeling, Cryptography, Risk Assessment',
      target_audience: 'System Administrators, Network Engineers',
      mode_of_delivery: 'Online',
      level: 'Beginner',
      status: 'Published',
      school: { id: schoolId },
      course_category: { id: categoryId },
      modules: [
        { title: 'Threat Landscapes', description: 'Identifying modern attack vectors and vulnerabilities.', order: 1 },
        { title: 'Defensive Architecture', description: 'Building secure networks and zero-trust environments.', order: 2 }
      ]
    }
  ];

  for (const course of mockCourses) {
    console.log(`Seeding: ${course.title}...`);
    const res = await fetch(`${API_URL}/short-courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    
    if (res.ok) {
      console.log(`Successfully seeded ${course.code}`);
    } else {
      console.error(`Failed to seed ${course.code}:`, await res.text());
    }
  }
  console.log("Done.");
}

seedShortCourses().catch(console.error);
