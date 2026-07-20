import { DataSource } from 'typeorm';
import { AcademicCalendarEvent } from '../../programs/entities/calendar-event.entity';
import { School } from '../../programs/entities/school.entity';

export const runCalendarSeed = async (dataSource: DataSource) => {
  const calendarRepo = dataSource.getRepository(AcademicCalendarEvent);
  const schoolRepo = dataSource.getRepository(School);

  console.log('--- STARTING ACADEMIC CALENDAR SEEDING ---');

  const schools = await schoolRepo.find();
  if (schools.length === 0) {
    console.warn('No schools found, skipping calendar seed.');
    return;
  }

  const baseEvents = [
    {
      title: 'Semester I Commencement',
      title_sw: 'Kuanza kwa Muhula wa I',
      date_start: '2025-05-12',
      category: 'Academic',
      description:
        'Official start of the May-August 2025 academic session. Orientation for new students begins.',
      description_sw:
        'Mwanzo rasmi wa kipindi cha kitaaluma cha Mei-Agosti 2025. Mwelekezo kwa wanafunzi wapya unaanza.',
    },
    {
      title: 'Course Registration Deadline',
      title_sw: 'Tarehe ya Mwisho ya Usajili wa Kozi',
      date_start: '2025-05-26',
      category: 'Academic',
      description:
        'Last day for unit selection and registration for the current semester.',
      description_sw:
        'Siku ya mwisho ya kuchagua vitengo na kujisajili kwa muhula wa sasa.',
    },
    {
      title: 'Madaraka Day (Public Holiday)',
      title_sw: 'Siku ya Madaraka (Sikukuu ya Umma)',
      date_start: '2025-06-01',
      category: 'Holiday',
      description: 'National holiday - all university operations suspended.',
      description_sw: 'Sikukuu ya kitaifa — shughuli zote za chuo zinasimamishwa.',
    },
    {
      title: 'Mid-Semester Assessment Week',
      title_sw: 'Wiki ya Tathmini ya Katikati ya Muhula',
      date_start: '2025-06-23',
      category: 'Examination',
      description:
        'Formative assessments and interim examinations for all undergraduate units.',
      description_sw:
        'Tathmini za malezi na mitihani ya muda kwa vitengo vyote vya shahada ya kwanza.',
    },
    {
      title: 'Institutional Research Symposia',
      title_sw: 'Makongamano ya Utafiti wa Kitaasisi',
      date_start: '2025-07-14',
      category: 'Event',
      description:
        'Showcasing breakthroughs in AI and Data Science from our senior researchers.',
      description_sw:
        'Kuonyesha uvumbuzi katika AI na Sayansi ya Data kutoka kwa watafiti wetu wakuu.',
    },
    {
      title: 'Final Semester Examinations',
      title_sw: 'Mitihani ya Mwisho ya Muhula',
      date_start: '2025-08-11',
      category: 'Examination',
      description:
        'Comprehensive summative assessments for the Semester I session.',
      description_sw:
        'Tathmini kamili za muhtasari kwa kipindi cha Muhula wa I.',
    },
    {
      title: 'End of Semester Break',
      title_sw: 'Mapumziko ya Mwisho wa Muhula',
      date_start: '2025-08-25',
      category: 'Academic',
      description:
        'University recess period prior to the September-December session.',
      description_sw:
        'Kipindi cha mapumziko cha chuo kabla ya kipindi cha Septemba-Desemba.',
    },
  ];

  for (const school of schools) {
    const existingEvents = await calendarRepo.count({
      where: { school: { id: school.id } },
    });
    if (existingEvents === 0) {
      console.log(`Seeding calendar for ${school.name}...`);
      for (const eventData of baseEvents) {
        await calendarRepo.save(
          calendarRepo.create({
            ...eventData,
            school,
          }),
        );
      }
    } else {
      // Backfill empty SW on existing calendar rows for this school
      for (const eventData of baseEvents) {
        const rows = await calendarRepo.find({
          where: { title: eventData.title, school: { id: school.id } },
        });
        for (const row of rows) {
          const patch: Record<string, string> = {};
          if (eventData.title_sw && !row.title_sw)
            patch.title_sw = eventData.title_sw;
          if (eventData.description_sw && !row.description_sw)
            patch.description_sw = eventData.description_sw;
          if (Object.keys(patch).length) {
            Object.assign(row, patch);
            await calendarRepo.save(row);
          }
        }
      }
    }
  }

  console.log('--- ACADEMIC CALENDAR SEEDING COMPLETE ---');
};
