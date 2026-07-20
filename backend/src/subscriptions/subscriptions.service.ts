import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
    private mailService: MailService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto): Promise<{ message: string }> {
    let subscription = await this.subscriptionRepo.findOne({
      where: { email: dto.email },
    });

    if (subscription) {
      if (subscription.is_active) {
        throw new ConflictException('Email is already subscribed.');
      } else {
        // Reactivate
        subscription.is_active = true;
        await this.subscriptionRepo.save(subscription);
      }
    } else {
      // Create new
      subscription = this.subscriptionRepo.create({ email: dto.email });
      await this.subscriptionRepo.save(subscription);
    }

    // Dispatch welcome email using the 'subscriptions' channel
    const htmlContent = this.mailService.getBrandedTemplate(
      'Welcome to the OUK Institutional Network',
      `<p>Dear Subscriber,</p><p>Thank you for subscribing to our official newsletter and updates. You are now part of our scholarly network and will receive official announcements directly to your inbox.</p>`,
      process.env.FRONTEND_URL || 'http://localhost:3000',
    );

    this.mailService
      .sendEmail(
        'subscriptions',
        dto.email,
        'Welcome to Open University of Kenya',
        htmlContent,
      )
      .catch((err) =>
        this.logger.error(
          `Failed to send welcome email to ${dto.email}: ${err.message}`,
        ),
      );

    return { message: 'Successfully subscribed to the institutional network.' };
  }

  async getAllActiveSubscribers(): Promise<Subscription[]> {
    return this.subscriptionRepo.find({ where: { is_active: true } });
  }
}
