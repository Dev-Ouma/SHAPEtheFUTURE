import { DataSource } from 'typeorm';
import { PeerLearner } from '../../peer-learners/entities/peer-learner.entity';
import { School } from '../../programs/entities/school.entity';

export const runPeerLearnersSeed = async (dataSource: DataSource) => {
  const peerLearnerRepo = dataSource.getRepository(PeerLearner);
  const schoolRepo = dataSource.getRepository(School);

  console.log('--- STARTING PEER LEARNERS SEED ---');

  // 1. Get existing schools
  const schools = await schoolRepo.find();
  if (schools.length === 0) {
    console.warn('No schools found. Skipping peer learners seed.');
    return;
  }

  const findSchool = (slug: string) =>
    schools.find((s) => s.slug === slug) || schools[0];

  const peerLearnersData = [
    {
      name: 'Alex Otieno',
      email: 'alex.otieno@student.ouk.ac.ke',
      phone: '+254 711 123 456',
      image_url:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-science-technology'),
    },
    {
      name: 'Sarah Kamau',
      email: 'sarah.kamau@student.ouk.ac.ke',
      phone: '+254 722 234 567',
      image_url:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-science-technology'),
    },
    {
      name: 'Brian Mwangi',
      email: 'brian.mwangi@student.ouk.ac.ke',
      phone: '+254 733 345 678',
      image_url:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-business-economics'),
    },
    {
      name: 'Grace Wambui',
      email: 'grace.wambui@student.ouk.ac.ke',
      phone: '+254 744 456 789',
      image_url:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-education'),
    },
    {
      name: 'Kevin Kipkorir',
      email: 'kevin.kip@student.ouk.ac.ke',
      phone: '+254 755 567 890',
      image_url:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-science-technology'),
    },
    {
      name: 'Anita Hassan',
      email: 'anita.h@student.ouk.ac.ke',
      phone: '+254 766 678 901',
      image_url:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-business-economics'),
    },
    {
      name: 'Dennis Muthomi',
      email: 'dennis.m@student.ouk.ac.ke',
      phone: '+254 777 789 012',
      image_url:
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-education'),
    },
    {
      name: 'Purity Atieno',
      email: 'purity.a@student.ouk.ac.ke',
      phone: '+254 788 890 123',
      image_url:
        'https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-business-economics'),
    },
    {
      name: 'Victor Kiptoo',
      email: 'victor.k@student.ouk.ac.ke',
      phone: '+254 799 901 234',
      image_url:
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=2574&auto=format&fit=crop',
      school: findSchool('school-of-science-technology'),
    },
    {
      name: 'Lillian Odhiambo',
      email: 'lilly.o@student.ouk.ac.ke',
      phone: '+254 700 012 345',
      image_url:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2561&auto=format&fit=crop',
      school: findSchool('school-of-education'),
    },
  ];

  for (const data of peerLearnersData) {
    const existing = await peerLearnerRepo.findOne({
      where: { email: data.email },
    });
    if (!existing) {
      await peerLearnerRepo.save(peerLearnerRepo.create(data));
      console.log(`Seeded Peer Learner: ${data.name}`);
    }
  }

  console.log('--- PEER LEARNERS SEED COMPLETE ---');
};
