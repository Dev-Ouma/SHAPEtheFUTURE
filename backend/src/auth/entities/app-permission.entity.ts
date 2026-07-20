import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity('permissions')
export class AppPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g., 'View Dashboard'

  @Column({ unique: true })
  slug: string; // e.g., 'dashboard.view'

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @ManyToMany(() => User, (user) => user.allowedPermissions)
  allowedUsers: User[];

  @ManyToMany(() => User, (user) => user.deniedPermissions)
  deniedUsers: User[];
}
