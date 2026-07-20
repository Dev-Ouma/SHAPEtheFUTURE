import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { AppPermission } from '../../auth/entities/app-permission.entity';

// Expiry bookkeeping for time-boxed module grants. The actual access is granted by
// adding the permission to the user's existing allowedPermissions (so the auth guard
// and sidebar already honour it); this row only tracks when to remove it again.
@Entity('user_temporary_grants')
export class UserTemporaryGrant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AppPermission, { eager: true })
  @JoinColumn({ name: 'permission_id' })
  permission: AppPermission;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'granted_by_id' })
  granted_by: User;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  revoked_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
