import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, Payment, PaymentMethod } from './entities/finance.entity';
import { Scholarship } from './entities/scholarship.entity';
import { PaymentMethodInfo } from './entities/payment-method.entity';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Scholarship)
    private readonly scholarshipRepo: Repository<Scholarship>,
    @InjectRepository(PaymentMethodInfo)
    private readonly paymentMethodRepo: Repository<PaymentMethodInfo>,
  ) {}

  async createInvoice(
    student: Student,
    description: string,
    amount: number,
    dueDate: Date,
  ) {
    const invoice = this.invoiceRepository.create({
      student,
      description,
      amount_total: amount,
      due_date: dueDate,
    });
    return this.invoiceRepository.save(invoice);
  }

  async getStudentInvoices(studentId: string) {
    return this.invoiceRepository.find({
      where: { student: { id: studentId } },
      order: { created_at: 'DESC' },
    });
  }

  async getInvoice(id: string) {
    return this.invoiceRepository.findOne({
      where: { id },
      relations: ['student'],
    });
  }

  async updateInvoice(invoice: Invoice) {
    return this.invoiceRepository.save(invoice);
  }

  async handleMpesaCallback(payload: any) {
    const callbackData = payload.Body.stkCallback;
    const checkoutRequestID = callbackData.CheckoutRequestID;
    const resultCode = callbackData.ResultCode;

    const invoice = await this.invoiceRepository.findOne({
      where: { mpesa_checkout_id: checkoutRequestID },
      relations: ['student'],
    });

    if (!invoice) {
      console.error(
        `Invoice not found for CheckoutRequestID: ${checkoutRequestID}`,
      );
      return;
    }

    if (resultCode === 0) {
      // Success
      const metadata = callbackData.CallbackMetadata.Item;
      const amount = metadata.find((i: any) => i.Name === 'Amount')?.Value;
      const receipt = metadata.find(
        (i: any) => i.Name === 'MpesaReceiptNumber',
      )?.Value;

      await this.processPayment(invoice.id, amount, 'mpesa' as any, receipt);
    } else {
      // Failed (could update invoice with a 'failed' attempt log)
      console.warn(
        `Payment failed for ${invoice.id}: ${callbackData.ResultDesc}`,
      );
    }
  }

  async processPayment(
    invoiceId: string,
    amount: number,
    method: PaymentMethod,
    reference: string,
  ) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['student'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const payment = this.paymentRepository.create({
      invoice,
      student: invoice.student,
      amount,
      method,
      transaction_reference: reference,
    });

    await this.paymentRepository.save(payment);

    // Update invoice status
    invoice.amount_paid = Number(invoice.amount_paid) + Number(amount);
    if (invoice.amount_paid >= invoice.amount_total) {
      invoice.status = 'paid' as any;
    } else if (invoice.amount_paid > 0) {
      invoice.status = 'partial' as any;
    }

    return this.invoiceRepository.save(invoice);
  }

  // --- Scholarships ---
  async getScholarships(
    activeOnly = false,
    options: { page?: number; limit?: number; search?: string } = {},
  ) {
    const { page = 1, limit = 10, search } = options;
    const query = this.scholarshipRepo.createQueryBuilder('s');

    if (activeOnly) {
      query.andWhere('s.is_active = :active', { active: true });
    }

    if (search) {
      query.andWhere(
        '(LOWER(s.title) LIKE :search OR LOWER(s.description) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('s.created_at', 'DESC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getScholarshipById(id: string) {
    const scholarship = await this.scholarshipRepo.findOne({ where: { id } });
    if (!scholarship) throw new NotFoundException('Scholarship not found');
    return scholarship;
  }

  async saveScholarship(data: Partial<Scholarship>) {
    if (data.id) {
      const existing = await this.scholarshipRepo.findOne({
        where: { id: data.id },
      });
      if (existing) {
        Object.assign(existing, data);
        return this.scholarshipRepo.save(existing);
      }
    }
    const created = this.scholarshipRepo.create(data);
    return this.scholarshipRepo.save(created);
  }

  async deleteScholarship(id: string) {
    return this.scholarshipRepo.delete(id);
  }

  // --- Payment Methods ---
  async getPaymentMethods(
    activeOnly = false,
    options: { page?: number; limit?: number; search?: string } = {},
  ) {
    const { page = 1, limit = 10, search } = options;
    const query = this.paymentMethodRepo.createQueryBuilder('p');

    if (activeOnly) {
      query.andWhere('p.is_active = :active', { active: true });
    }

    if (search) {
      query.andWhere(
        '(LOWER(p.provider_name) LIKE :search OR LOWER(p.account_name) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    query.orderBy('p.provider_name', 'ASC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPaymentMethodById(id: string) {
    const method = await this.paymentMethodRepo.findOne({ where: { id } });
    if (!method) throw new NotFoundException('Payment method not found');
    return method;
  }

  async savePaymentMethod(data: Partial<PaymentMethodInfo>) {
    if (data.id) {
      const existing = await this.paymentMethodRepo.findOne({
        where: { id: data.id },
      });
      if (existing) {
        Object.assign(existing, data);
        return this.paymentMethodRepo.save(existing);
      }
    }
    const created = this.paymentMethodRepo.create(data);
    return this.paymentMethodRepo.save(created);
  }

  async deletePaymentMethod(id: string) {
    return this.paymentMethodRepo.delete(id);
  }
}
