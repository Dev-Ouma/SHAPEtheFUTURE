import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only log state-changing requests or specific sensitive GET requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const user = request.user;
      const ip_address =
        request.headers['x-forwarded-for'] || request.connection.remoteAddress;
      const url = request.url;

      return next.handle().pipe(
        tap(async () => {
          if (user && user.userId) {
            try {
              await this.auditRepository.save({
                user: { id: user.userId },
                action: `${method} ${url}`,
                ip_address,
                details: {
                  body: this.sanitizeBody(request.body),
                  userAgent: request.headers['user-agent'],
                },
              });
            } catch (err) {
              console.error('Failed to save audit log:', err);
            }
          }
        }),
      );
    }

    return next.handle();
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    const sanitized = { ...body };
    const sensitiveKeys = ['password', 'token', 'otp', 'two_factor_secret'];

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}
