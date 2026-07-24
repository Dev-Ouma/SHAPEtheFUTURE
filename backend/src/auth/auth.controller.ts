import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  ResetPasswordDto,
  ForceChangePasswordDto,
} from './dto/reset-password.dto';
import { UserPaginationQueryDto } from './dto/pagination-query.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequirePermission } from './decorators/permissions.decorator';
import {
  ADMIN_AUTH_COOKIE,
  adminAuthClearCookieOptions,
  adminAuthCookieOptions,
} from './auth-cookie';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const authResult = await this.authService.login(loginDto);

    // Primary session: HttpOnly cookie (not readable by XSS).
    // SameSite=lax keeps CSRF surface low for typical navigations while
    // allowing the Next.js /api rewrite on the same site to receive it.
    res.cookie(
      ADMIN_AUTH_COOKIE,
      authResult.access_token,
      adminAuthCookieOptions(),
    );

    // access_token remains in the JSON body for non-browser clients (e.g. mobile).
    // The MainWebsite admin SPA uses the HttpOnly cookie only.
    return authResult;
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ADMIN_AUTH_COOKIE, adminAuthClearCookieOptions());
    return { success: true };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const password = body.password ?? body.newPassword;
    if (!password) {
      throw new UnauthorizedException('Password is required');
    }
    return this.authService.resetPassword(body.token, password);
  }

  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Get('me')
  async getMe(@Request() req: any) {
    // Returns the fully hydrated user profile including role.permissions
    return this.authService.findOneWithPermissions(
      req.user.userId || req.user.sub,
    );
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users.view')
  @Get('users')
  async getAllUsers(@Query() query: UserPaginationQueryDto) {
    return this.authService.findAll(query);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users.manage')
  @Post('users')
  async createUser(@Body() createData: any) {
    return this.authService.register(createData);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users.manage')
  @Post('users/:id/reprovision')
  async reprovisionUser(@Param('id') id: string) {
    return this.authService.reprovisionAccess(id);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users.manage')
  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return this.authService.update(id, updateData);
  }

  @UseGuards(PermissionsGuard)
  @RequirePermission('users.manage')
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.remove(id);
  }

  @Post('force-change-password')
  async forceChangePassword(
    @Request() req: any,
    @Body() body: ForceChangePasswordDto,
  ) {
    return this.authService.forceChangePassword(req.user.userId, body.password);
  }
}
