import { createConnection } from 'typeorm';
import { User } from './src/auth/entities/user.entity';
import { Role } from './src/auth/entities/role.entity';
import { StaffMember } from './src/staff/entities/staff-member.entity';
import { Brackets } from 'typeorm';

async function testQuery() {
  try {
    const connection = await createConnection();
    console.log('DB Connected');
    
    const userRepo = connection.getRepository(User);
    
    const results = await userRepo.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.staff_member', 'staff')
      .where('user.is_active = :active', { active: true })
      .andWhere(new Brackets(qb => {
        qb.where('role.name ILIKE :h1', { h1: '%helpdesk%' })
          .orWhere('role.name ILIKE :h2', { h2: '%help desk%' })
          .orWhere('user.role_legacy = :h3', { h3: 'helpdesk' })
          .orWhere('user.role_legacy = :h4', { h4: 'help desk' });
      }))
      .getMany();
      
    console.log('Found users:', results.length);
    results.forEach(u => console.log(`- ${u.full_name} (${u.email})`));
    
    await connection.close();
  } catch (err) {
    console.error('QUERY FAILED:', err);
  }
}

testQuery();
