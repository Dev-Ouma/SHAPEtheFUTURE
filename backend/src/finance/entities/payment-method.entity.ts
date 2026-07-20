import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PaymentMethodType {
  BANK = 'BANK',
  MOBILE_MONEY = 'MOBILE_MONEY',
  OTHER = 'OTHER',
}

@Entity('payment_methods')
export class PaymentMethodInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  provider_name: string; // e.g., 'KCB Bank', 'M-Pesa Paybill'

  @Column({
    type: 'enum',
    enum: PaymentMethodType,
    default: PaymentMethodType.BANK,
  })
  type: PaymentMethodType;

  @Column({ nullable: true })
  account_number: string;

  @Column({ nullable: true })
  account_name: string;

  @Column({ nullable: true })
  branch: string; // e.g., 'Moi Avenue Branch'

  @Column('text', { nullable: true })
  instructions: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
