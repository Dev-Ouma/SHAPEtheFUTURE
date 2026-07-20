import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LogsService } from '../../logs/logs.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const startTime = Date.now();

    // Only log mutations and login by default to prevent DB bloat
    const isMutation = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);
    const isAuth = url.includes('/auth/login');

    if (!isMutation && !isAuth) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((response) => {
        void this.logMutation(
          context,
          request,
          method,
          url,
          body,
          user,
          startTime,
          response,
          undefined,
        );
      }),
      catchError((err) => {
        const status =
          err instanceof HttpException
            ? err.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        void this.logMutation(
          context,
          request,
          method,
          url,
          body,
          user,
          startTime,
          null,
          status,
        );
        return throwError(() => err);
      }),
    );
  }

  private logMutation(
    context: ExecutionContext,
    request: any,
    method: string,
    url: string,
    body: any,
    user: any,
    startTime: number,
    _response: any,
    forcedStatus?: number,
  ) {
    const responseTime = Date.now() - startTime;
    const statusCode =
      forcedStatus ?? context.switchToHttp().getResponse().statusCode ?? 200;

    const sanitizedBody = { ...body };
    if (sanitizedBody.password) sanitizedBody.password = '********';
    if (sanitizedBody.token) sanitizedBody.token = '********';

    const failed = statusCode >= 400;

    void this.logsService.create({
      log_level: failed ? 'WARNING' : 'INFO',
      message: `Administrative action: ${method} ${url}`,
      service_name: 'main-backend',
      environment: process.env.NODE_ENV || 'development',
      user: user
        ? {
            user_id: user.userId,
            username: user.email,
            role: user.role,
          }
        : undefined,
      network: {
        ip_address: request.ip,
        user_agent: request.get('user-agent'),
      },
      request: {
        http_method: method,
        endpoint: url,
        request_body: sanitizedBody,
        response_status: statusCode,
        response_time_ms: responseTime,
      },
      security: {
        action: this.deriveAction(method, url),
        status: failed ? 'FAILURE' : 'SUCCESS',
      },
      system: {
        host: require('os').hostname(),
        process_id: process.pid,
      },
    });
  }

  private deriveAction(method: string, url: string): string {
    if (url.includes('/auth/login')) return 'LOGIN';
    if (method === 'POST') return 'CREATE';
    if (method === 'PATCH' || method === 'PUT') return 'UPDATE';
    if (method === 'DELETE') return 'DELETE';
    return 'UNKNOWN';
  }
}
