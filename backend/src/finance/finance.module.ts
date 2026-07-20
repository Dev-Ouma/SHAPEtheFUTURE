import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { Invoice, Payment } from './entities/finance.entity';
import { Scholarship } from './entities/scholarship.entity';
import { PaymentMethodInfo } from './entities/payment-method.entity';
import { MpesaService } from './mpesa.service';
import { ErpService } from './erp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      Payment,
      Scholarship,
      PaymentMethodInfo,
    ]),
    HttpModule,
  ],
  providers: [FinanceService, MpesaService, ErpService],
  controllers: [FinanceController],
  exports: [FinanceService, MpesaService, ErpService],
})
export class FinanceModule {}
