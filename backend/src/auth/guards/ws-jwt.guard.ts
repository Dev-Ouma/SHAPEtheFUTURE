import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const auth = client.handshake?.auth as Record<string, unknown> | undefined;
    const authHeader = client.handshake?.headers?.authorization;
    const token =
      (auth?.token as string | undefined) ?? authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('Authentication token required');
    }

    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new WsException('Server misconfiguration');
    }

    try {
      const payload = jwt.verify(token, secret);
      client.data.user = payload;
      return true;
    } catch {
      throw new WsException('Invalid or expired authentication token');
    }
  }
}
