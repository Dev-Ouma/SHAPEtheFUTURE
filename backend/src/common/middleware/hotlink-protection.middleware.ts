import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HotlinkProtectionMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const referer = req.headers['referer'] || req.headers['referrer'];

    // Only apply protection for image requests, ignore standard API routes
    if (req.path.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
      if (referer) {
        try {
          const refererUrl = new URL(referer as string);
          // Allow requests from our own frontend domain
          const allowedDomain =
            this.configService.get<string>('FRONTEND_URL') || 'localhost';
          const hostName = refererUrl.hostname;

          if (
            !hostName.includes(
              allowedDomain
                .replace('http://', '')
                .replace('https://', '')
                .split(':')[0],
            ) &&
            hostName !== 'localhost'
          ) {
            throw new ForbiddenException(
              'Hotlinking of images is not allowed.',
            );
          }
        } catch (error) {
          // If referer is invalid, we can just block it or let it pass.
          // We'll block it since it's an image.
          throw new ForbiddenException(
            'Invalid referer for hotlinked resource.',
          );
        }
      }
    }

    next();
  }
}
