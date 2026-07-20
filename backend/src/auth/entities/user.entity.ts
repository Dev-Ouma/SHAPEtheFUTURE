import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { StaffMember } from '../../staff/entities/staff-member.entity';
import { Role } from './role.entity';
import { AppPermission } from './app-permission.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
  STAFF = 'staff',
  STUDENT = 'student',
  FACULTY = 'faculty',
  HELPDESK = 'helpdesk',
  CONTENT_MANAGER = 'content_manager',
}

export enum UserType {
  STAFF = 'staff',
  EXECUTIVE = 'executive',
  STUDENT = 'student',
  ALUMNI = 'alumni',
  EXTERNAL = 'external',
}

export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ select: false }) // Don't return password by default
  password: string;

  @Column()
  full_name: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  profile_photo: string;

  @Column({ type: 'enum', enum: UserType, default: UserType.STUDENT })
  user_type: UserType;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  school: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
    nullable: true, // Allow NULL so we can transition to formal Roles
  })
  role_legacy: UserRole;

  @ManyToOne(() => Role, (role) => role.users, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToMany(() => AppPermission)
  @JoinTable({
    name: 'user_allowed_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  allowedPermissions: AppPermission[];

  @ManyToMany(() => AppPermission)
  @JoinTable({
    name: 'user_denied_permissions',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  deniedPermissions: AppPermission[];

  @Column({ default: true })
  is_active: boolean;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.PENDING })
  account_status: AccountStatus;

  @Column({ default: false })
  is_verified: boolean;

  // -- Security Fields --

  @Column({ select: false, nullable: true })
  otp: string;

  @Column({ select: false, nullable: true })
  reset_token: string;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires: Date;

  @Column({ select: false, nullable: true })
  two_factor_secret: string;

  @Column({ default: false })
  is_2fa_enabled: boolean;

  @Column({ default: 0 })
  login_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_password_change_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  provisioned_password_expires_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => StaffMember, { nullable: true })
  @JoinColumn({ name: 'staff_member_id' })
  staff_member: StaffMember;

  @DeleteDateColumn()
  deleted_at: Date;
}
