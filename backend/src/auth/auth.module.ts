import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RolesController } from './roles.controller';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { AppPermission } from './entities/app-permission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailModule } from '../mail/mail.module';

import { PermissionsGuard } from './guards/permissions.guard';
import { PartnerScopeGuard } from './guards/partner-scope.guard';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, AppPermission, AuditLog]),
    PassportModule,
    forwardRef(() => MailModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            'JWT_SECRET environment variable is required but not configured',
          );
        }
        return {
          secret,
          signOptions: { expiresIn: '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    PermissionsGuard,
    PartnerScopeGuard,
    WsJwtGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  controllers: [AuthController, RolesController],
  exports: [AuthService, PermissionsGuard, PartnerScopeGuard, WsJwtGuard],
})
export class AuthModule {
  constructor() {
    console.log(
      'AuthModule initialized. JWT_SECRET:',
      process.env.JWT_SECRET ? 'PRESENT' : 'MISSING',
    );
  }
}
