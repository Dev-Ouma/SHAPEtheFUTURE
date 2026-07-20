import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { AppPermission } from './app-permission.entity';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'Super Administrator', 'General Helpdesk'

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  is_system_role: boolean; // Protect core roles like Super Admin from deletion

  @ManyToMany(() => AppPermission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: AppPermission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
