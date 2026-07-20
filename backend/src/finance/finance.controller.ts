import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Delete,
  Req,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentMethod } from './entities/finance.entity';
import { MpesaService } from './mpesa.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  private readonly logger = new Logger(FinanceController.name);

  constructor(
    private readonly financeService: FinanceService,
    private readonly mpesaService: MpesaService,
  ) {}

  @Get('my-invoices')
  async getMyInvoices(@Request() req: any) {
    return this.financeService.getStudentInvoices(req.user.userId);
  }

  @Post('initiate-payment')
  async initiatePayment(
    @Body() body: { invoiceId: string; amount: number; phoneNumber: string },
  ) {
    const result = await this.mpesaService.stkPush(
      body.phoneNumber.replace('+', ''),
      body.amount,
      `INV-${body.invoiceId.substring(0, 8)}`,
    );

    // Save checkout ID for tracking
    if (result.CheckoutRequestID) {
      const invoice = await this.financeService.getInvoice(body.invoiceId);
      if (invoice) {
        invoice.mpesa_checkout_id = result.CheckoutRequestID;
        await this.financeService.updateInvoice(invoice);
      }
    }

    return {
      message: 'Payment request sent to your phone',
      mpesaResponse: result,
    };
  }

  @Public()
  @Post('mpesa/callback')
  async handleMpesaCallback(@Req() req: ExpressRequest, @Body() payload: any) {
    this.assertMpesaCallbackAllowed(req);

    if (!payload?.Body?.stkCallback?.CheckoutRequestID) {
      throw new ForbiddenException('Invalid M-Pesa callback payload');
    }

    return this.financeService.handleMpesaCallback(payload);
  }

  /**
   * When MPESA_CALLBACK_IPS is set (comma-separated), reject callbacks from other IPs.
   * When unset (local/sandbox), allow but log a warning so production can harden without breaking.
   */
  private assertMpesaCallbackAllowed(req: ExpressRequest) {
    const allowlist = (process.env.MPESA_CALLBACK_IPS || '')
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);

    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim();
    const clientIp = forwarded || req.ip || req.socket?.remoteAddress || '';

    if (allowlist.length === 0) {
      this.logger.warn(
        `M-Pesa callback accepted without IP allowlist (set MPESA_CALLBACK_IPS in production). Source: ${clientIp}`,
      );
      return;
    }

    const normalized = clientIp.replace(/^::ffff:/, '');
    const ok = allowlist.some(
      (allowed) => allowed === clientIp || allowed === normalized,
    );
    if (!ok) {
      this.logger.warn(`Rejected M-Pesa callback from ${clientIp}`);
      throw new ForbiddenException('Callback source not allowed');
    }
  }

  // --- Scholarships ---
  @Public()
  @Get('scholarships')
  getScholarships() {
    return this.financeService.getScholarships(true);
  }

  @Get('admin/scholarships')
  getAdminScholarships(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.financeService.getScholarships(false, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  @Get('admin/scholarships/:id')
  getScholarship(@Param('id') id: string) {
    return this.financeService.getScholarshipById(id);
  }

  @Delete('admin/scholarships/:id')
  deleteScholarship(@Param('id') id: string) {
    return this.financeService.deleteScholarship(id);
  }

  @Post('admin/scholarships')
  saveScholarship(@Body() body: any) {
    return this.financeService.saveScholarship(body);
  }

  // --- Payment Methods ---
  @Public()
  @Get('payment-methods')
  getPaymentMethods() {
    return this.financeService.getPaymentMethods(true);
  }

  @Get('admin/payment-methods')
  getAdminPaymentMethods(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.financeService.getPaymentMethods(false, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  @Get('admin/payment-methods/:id')
  getPaymentMethod(@Param('id') id: string) {
    return this.financeService.getPaymentMethodById(id);
  }

  @Delete('admin/payment-methods/:id')
  deletePaymentMethod(@Param('id') id: string) {
    return this.financeService.deletePaymentMethod(id);
  }

  @Post('admin/payment-methods')
  savePaymentMethod(@Body() body: any) {
    return this.financeService.savePaymentMethod(body);
  }
}
