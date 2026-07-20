import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { AppPermission } from './entities/app-permission.entity';
import { AuditLog } from './entities/audit-log.entity';
import { LoginDto } from './dto/login.dto';
import { UserPaginationQueryDto } from './dto/pagination-query.dto';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { randomBytes } from 'crypto';

export type UserProvisioningDetails = {
  username: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  expiresAt: string;
  emailSent: boolean;
  deliveryNote: string;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(AppPermission)
    private readonly permissionRepository: Repository<AppPermission>,
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly dataSource: DataSource,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email OR LOWER(user.username) = :email', { email: normalizedEmail })
      .select([
        'user.id',
        'user.email',
        'user.password',
        'user.role_legacy',
        'user.full_name',
        'user.locked_until',
        'user.login_attempts',
        'user.last_password_change_at',
        'user.account_status',
        'user.provisioned_password_expires_at',
      ])
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermissions')
      .leftJoinAndSelect('user.allowedPermissions', 'allowedPermissions')
      .leftJoinAndSelect('user.deniedPermissions', 'deniedPermissions')
      .getOne();
    
    if (!user) return null;

    if (user.account_status === 'suspended') {
      throw new UnauthorizedException('Account suspended. Contact ICT Support.');
    }

    if (user.locked_until && user.locked_until > new Date()) {
      const mins = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(
        `Account temporarily locked due to multiple failed login attempts. Try again in ${mins} minute(s) or use Forgot Password.`,
      );
    }
    if (user.locked_until && user.locked_until <= new Date()) {
      user.locked_until = null as any;
      user.login_attempts = 0;
      await this.userRepository.save(user);
    }

    if (await bcrypt.compare(pass, user.password)) {
      // Temp-password expiry only applies while the user is still on the
      // system-provisioned password. Once they have set their own password
      // (last_password_change_at), the old expiry must not block login.
      if (
        !user.last_password_change_at &&
        user.provisioned_password_expires_at &&
        user.provisioned_password_expires_at < new Date()
      ) {
        throw new UnauthorizedException('PROVISIONED_PASSWORD_EXPIRED');
      }

      // Successful login
      user.login_attempts = 0;
      user.locked_until = null as any;
      user.last_login_at = new Date();
      await this.userRepository.save(user);

      const { password, ...result } = user;
      return result;
    } else {
      // Failed login
      user.login_attempts += 1;
      if (user.login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      }
      await this.userRepository.save(user);
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Normalize role for token payload: formal role slug takes precedence, falling back to legacy role
    const roleIdentifier = user.role?.slug || user.role_legacy;
    
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: roleIdentifier,
      require_password_change: !user.last_password_change_at 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user,
      require_password_change: !user.last_password_change_at
    };
  }

  async getEffectivePermissionSlugs(userId: string): Promise<string[]> {
    const full = await this.findOneWithPermissions(userId);
    if (!full) return [];
    const granted = new Set<string>();
    (full.role?.permissions || []).forEach((p) => granted.add(p.slug));
    (full.allowedPermissions || []).forEach((p) => granted.add(p.slug));
    (full.deniedPermissions || []).forEach((p) => granted.delete(p.slug));
    return Array.from(granted);
  }

  private getAdminLoginUrl(): string {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/login`;
  }

  private sanitizeUser(user: User): User {
    const { password, otp, reset_token, two_factor_secret, ...safe } = user as any;
    return safe as User;
  }

  private async deliverWelcomeCredentials(
    user: User,
    username: string,
    email: string,
    temporaryPassword: string,
    expiresAt: Date,
    subject = 'Welcome to Open University of Kenya',
  ): Promise<UserProvisioningDetails> {
    const loginUrl = this.getAdminLoginUrl();
    const emailHtml = this.mailService.getWelcomeEmailTemplate(email, username, temporaryPassword, loginUrl);
    const emailSent = await this.mailService.sendEmail('system', email, subject, emailHtml);

    const provisioning: UserProvisioningDetails = {
      username,
      email,
      temporaryPassword,
      loginUrl,
      expiresAt: expiresAt.toISOString(),
      emailSent,
      deliveryNote: emailSent
        ? 'Welcome email sent to the user.'
        : 'Email could not be sent (SMTP not configured). Share these credentials manually.',
    };

    if (!emailSent && process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Provisioning credentials for ${email}:`, provisioning);
    }

    return provisioning;
  }

  async register(data: { email: string, fullName: string, username?: string, role?: string, roleId?: string, userType?: string, department?: string, school?: string, phone_number?: string }): Promise<{ user: User; provisioning: UserProvisioningDetails }> {
    const normalizedEmail = data.email.trim().toLowerCase();
    // Generate secure random alphanumeric password (12 chars)
    const otp = randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Check if email already exists
    const existingEmail = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();
    if (existingEmail) {
      // Re-provision access: Update password with new OTP and send Welcome Email
      existingEmail.password = hashedPassword;
      existingEmail.last_password_change_at = null as any; // Force password change
      existingEmail.provisioned_password_expires_at = expiresAt;
      existingEmail.login_attempts = 0;
      existingEmail.locked_until = null as any;
      const saved = await this.userRepository.save(existingEmail);

      const displayUsername = saved.username || saved.email;
      const provisioning = await this.deliverWelcomeCredentials(
        saved,
        displayUsername,
        normalizedEmail,
        otp,
        expiresAt,
        'Access Provisioned - Open University of Kenya',
      );

      return { user: this.sanitizeUser(saved), provisioning };
    }

    // Check against staff_members table to prevent different staff and users sharing the same email
    const staffCheck = await this.dataSource.query('SELECT full_name FROM staff_members WHERE LOWER(email) = LOWER($1) AND deleted_at IS NULL', [normalizedEmail]);
    if (staffCheck.length > 0) {
      if (staffCheck[0].full_name.trim().toLowerCase() !== data.fullName.trim().toLowerCase()) {
        throw new ConflictException(`Email ${normalizedEmail} is already associated with a different staff member. Please use the exact same full name as the staff profile, or use a different email.`);
      }
    }

    // Generate username from email (e.g., john.doe from john.doe@ouk.ac.ke)
    let username = data.username?.trim().toLowerCase();
    if (!username) {
      username = normalizedEmail.split('@')[0];
      const existing = await this.userRepository
        .createQueryBuilder('user')
        .where('LOWER(user.username) = :username', { username })
        .getOne();
      if (existing) {
        username = `${username}${Math.floor(Math.random() * 100)}`;
      }
    }

    const payload: any = {
      email: normalizedEmail,
      username: username,
      password: hashedPassword, // Uses OTP as initial password
      full_name: data.fullName,
      role_legacy: (data.role as any) || 'viewer',
      user_type: (data.userType as any) || 'staff',
      department: data.department,
      school: data.school,
      phone_number: data.phone_number,
      account_status: 'active',
      provisioned_password_expires_at: expiresAt,
    };

    if (data.roleId) {
      const roleEntity = await this.roleRepository.findOne({ where: { id: data.roleId } });
      if (roleEntity) payload.role = roleEntity;
    }

    const user = this.userRepository.create(payload);

    const savedUser = (await this.userRepository.save(user)) as unknown as User;

    const provisioning = await this.deliverWelcomeCredentials(
      savedUser,
      username,
      normalizedEmail,
      otp,
      expiresAt,
    );

    await this.auditRepository.save({
      user: { id: savedUser.id } as User,
      action: 'USER_PROVISIONED',
      details: { email: normalizedEmail, emailSent: provisioning.emailSent },
    });

    return { user: this.sanitizeUser(savedUser), provisioning };
  }

  /** Issue a fresh temporary password and welcome email for an existing user. */
  async reprovisionAccess(userId: string): Promise<{ user: User; provisioning: UserProvisioningDetails }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const otp = randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.password = hashedPassword;
    user.last_password_change_at = null as any;
    user.provisioned_password_expires_at = expiresAt;
    user.login_attempts = 0;
    user.locked_until = null as any;
    user.reset_token = null as any;
    user.reset_token_expires = null as any;

    const saved = await this.userRepository.save(user);
    const displayUsername = saved.username || saved.email;
    const provisioning = await this.deliverWelcomeCredentials(
      saved,
      displayUsername,
      saved.email,
      otp,
      expiresAt,
      'Access Provisioned - Open University of Kenya',
    );

    await this.auditRepository.save({
      user: { id: saved.id } as User,
      action: 'USER_REPROVISIONED',
      details: { email: saved.email, emailSent: provisioning.emailSent },
    });

    return { user: this.sanitizeUser(saved), provisioning };
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', { email: normalizedEmail })
      .getOne();
    if (!user) return { message: 'If that email exists, a reset link has been sent.' }; // Generic message for security

    const resetToken = randomBytes(32).toString('hex');
    user.reset_token = resetToken;
    user.reset_token_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.userRepository.save(user);

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reset-password?token=${resetToken}`;
    const emailHtml = this.mailService.getPasswordResetTemplate(resetUrl);
    const sent = await this.mailService.sendEmail('system', normalizedEmail, 'Password Reset Request', emailHtml);
    if (!sent && process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset link for ${normalizedEmail}: ${resetUrl}`);
    }

    // Log Audit
    await this.auditRepository.save({
      user: { id: user.id } as User,
      action: 'PASSWORD_RESET_REQUESTED',
      details: { email: normalizedEmail, emailSent: sent },
    });

    return {
      message: 'If that email exists, a reset link has been sent.',
      emailSent: sent,
      ...(!sent && process.env.NODE_ENV !== 'production' ? { resetUrl } : {}),
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({ 
      where: { reset_token: token },
      select: [
        'id',
        'password',
        'reset_token',
        'reset_token_expires',
        'last_password_change_at',
        'provisioned_password_expires_at',
        'locked_until',
        'login_attempts',
      ],
    });

    if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_token = null as any;
    user.reset_token_expires = null as any;
    user.last_password_change_at = new Date();
    user.provisioned_password_expires_at = null as any;
    user.locked_until = null as any; // Unlock account if it was locked
    user.login_attempts = 0;

    await this.userRepository.save(user);

    // Log Audit (use id reference — partial select entity is enough for FK)
    await this.auditRepository.save({
      user: { id: user.id } as User,
      action: 'PASSWORD_RESET_COMPLETED',
      details: {},
    });

    return { message: 'Password has been successfully reset. You may now log in.' };
  }

  async forceChangePassword(userId: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password', 'last_password_change_at', 'provisioned_password_expires_at'],
    });
    if (!user) throw new UnauthorizedException('User not found');

    user.password = await bcrypt.hash(newPassword, 10);
    user.last_password_change_at = new Date();
    // Clear temp-password expiry so future logins are not blocked by the
    // original provisioning window after the user has set their own password.
    user.provisioned_password_expires_at = null as any;
    await this.userRepository.save(user);
    
    await this.auditRepository.save({ user, action: 'PASSWORD_CHANGED_FORCED', details: {} });
    return { message: 'Password updated successfully' };
  }

  async findAll(query: UserPaginationQueryDto) {
    const { search, role, userType, is_active, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.full_name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (role) {
      // role here is a role ID since we migrated to formal Role relations
      queryBuilder.andWhere('role.id = :role', { role });
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('user.is_active = :is_active', { is_active });
    }

    if (userType) {
      queryBuilder.andWhere('user.user_type = :userType', { userType });
    }

    queryBuilder
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermissions')
      .leftJoinAndSelect('user.allowedPermissions', 'allowedPermissions')
      .leftJoinAndSelect('user.deniedPermissions', 'deniedPermissions')
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, updateData: Partial<User>) {
    // Load user WITH all relations so TypeORM doesn't wipe them on save
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: ['role', 'allowedPermissions', 'deniedPermissions']
    });
    if (!user) throw new NotFoundException('User not found');
    
    if (updateData.email) {
      updateData.email = updateData.email.trim().toLowerCase();
    }
    if (updateData.username) {
      updateData.username = updateData.username.trim().toLowerCase();
    }
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Check if email or name is changing, and enforce consistency with staff_members
    const targetEmail = updateData.email || user.email;
    const targetName = updateData.full_name || user.full_name;
    
    if ((updateData.email && updateData.email !== user.email) || (updateData.full_name && updateData.full_name !== user.full_name)) {
      const staffCheck = await this.dataSource.query('SELECT full_name FROM staff_members WHERE email = $1 AND deleted_at IS NULL', [targetEmail]);
      if (staffCheck.length > 0) {
        if (staffCheck[0].full_name.trim().toLowerCase() !== targetName.trim().toLowerCase()) {
          throw new ConflictException(`Email ${targetEmail} is already associated with a different staff member. Please use the exact same full name as the staff profile, or use a different email.`);
        }
      }
    }
    
    // Handle role update explicitly if roleId is provided
    if ((updateData as any).roleId) {
      const role = await this.roleRepository.findOne({ where: { id: (updateData as any).roleId } });
      if (role) {
        user.role = role;
      }
      delete (updateData as any).roleId;
    }

    // Handle Manual Overrides
    if ((updateData as any).allowedPermissionIds) {
      user.allowedPermissions = await this.permissionRepository.findByIds((updateData as any).allowedPermissionIds);
      delete (updateData as any).allowedPermissionIds;
    }

    if ((updateData as any).deniedPermissionIds) {
      user.deniedPermissions = await this.permissionRepository.findByIds((updateData as any).deniedPermissionIds);
      delete (updateData as any).deniedPermissionIds;
    }
    
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role', 'allowedPermissions', 'deniedPermissions'],
    });
  }

  async findOneWithPermissions(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role', 'role.permissions', 'allowedPermissions', 'deniedPermissions'],
    });
  }

  async initializeRbac() {
    // 1. Define Comprehensive Permissions
    const modules = [
      { slug: 'dashboard', name: 'Main Dashboard' },
      { slug: 'users', name: 'User Management' },
      { slug: 'roles', name: 'Roles & Permissions' },
      { slug: 'reports', name: 'Strategic Reporting' },
      { slug: 'home', name: 'Home Manager' },
      { slug: 'menus', name: 'Navigation Menus' },
      { slug: 'pages', name: 'Institutional Pages' },
      { slug: 'staff', name: 'Staff & Governance' },
      { slug: 'news', name: 'News & Publications' },
      { slug: 'downloads', name: 'Downloads Hub' },
      { slug: 'schools', name: 'Schools & Faculties' },
      { slug: 'programmes', name: 'Academic Programmes' },
      { slug: 'course_units', name: 'Course Unit Registry' },
      { slug: 'short_courses', name: 'Short Course Catalogue' },
      { slug: 'peer_learners', name: 'Peer Learners Registry' },
      { slug: 'timetables', name: 'Timetables Configuration' },
      { slug: 'chats', name: 'Chat Intelligence' },
      { slug: 'complaints', name: 'Complaints & Complements' },
      { slug: 'logs', name: 'System Audit Logs' },
      { slug: 'recycle_bin', name: 'Institutional Recycle Bin' },
      { slug: 'student_portal', name: 'Student Portal Hub' },
      { slug: 'alumni_portal', name: 'Alumni Association' },
      { slug: 'partnerships', name: 'Strategic Partnerships' },
      { slug: 'shape', name: 'SHAPE Grant Portal' },
      { slug: 'settings', name: 'Portal Settings' },
      { slug: 'content', name: 'Legacy Content' },
      { slug: 'web_orchestration', name: 'Web Orchestration' },
      { slug: 'virtual_tour', name: 'Virtual Tour Gallery' },
      { slug: 'governance', name: 'Governance & Stats' },
      { slug: 'communications', name: 'Communications' },
      { slug: 'academic_ecosystem', name: 'Academic Ecosystem' },
      { slug: 'knowledge_hub', name: 'Knowledge Hub' },
      { slug: 'institutional_content', name: 'Institutional Content' },
      { slug: 'portals_communities', name: 'Portals & Communities' },
      { slug: 'adverts', name: 'Adverts Manager' },
      { slug: 'testimonials', name: 'Testimonials' },
      { slug: 'hero_slides', name: 'Hero Slides' },
      { slug: 'intro_videos', name: 'Intro Videos' },
      { slug: 'back_links', name: 'Back Links' },
      { slug: 'finance', name: 'Finance' },
      { slug: 'analytics', name: 'Analytics' },
      // ICT Service Desk modules (one matrix group per page)
      { slug: 'ict', name: 'ICT Service Desk' },
      { slug: 'ict_status', name: 'System Status' },
      { slug: 'ict_knowledge', name: 'IT Knowledge Base' },
      { slug: 'ict_password', name: 'Password Reset Desk' },
      { slug: 'maintenance', name: 'Maintenance Engine' },
      // Campus Feedback Desk (complaints & compliments routed through ICT triage)
      { slug: 'campus_feedback', name: 'Campus Feedback Desk' },
      { slug: 'helpdesk', name: 'HelpDesk Operations' },
      { slug: 'my_tickets', name: 'My Tickets' },
      { slug: 'infrastructure_analytics', name: 'Infrastructure Analytics' },
    ];

    const permissionData: { name: string, slug: string, description: string }[] = [];
    modules.forEach(m => {
      permissionData.push({ 
        name: `View ${m.name}`, 
        slug: `${m.slug}.view`, 
        description: `Read-only access to ${m.name.toLowerCase()}` 
      });
      permissionData.push({ 
        name: `Manage ${m.name}`, 
        slug: `${m.slug}.manage`, 
        description: `Full administrative control over ${m.name.toLowerCase()}` 
      });
    });

    const permissions: AppPermission[] = [];
    for (const p of permissionData) {
      let perm = await this.permissionRepository.findOne({ where: { slug: p.slug } });
      if (!perm) perm = await this.permissionRepository.save(this.permissionRepository.create(p));
      permissions.push(perm);
    }

    const pMap = permissions.reduce((acc, p) => ({ ...acc, [p.slug]: p }), {} as Record<string, AppPermission>);

    // 2. Define Standard Roles
    const rolesConfig = [
      { name: 'Super Administrator', slug: 'super_admin', is_system: true, pSlugs: permissionData.map(p => p.slug) },
      { name: 'Administrator', slug: 'admin', is_system: true, pSlugs: permissionData.map(p => p.slug) },
      { 
        name: 'Content Manager', 
        slug: 'content_manager', 
        is_system: true, 
        pSlugs: [
          'dashboard.view', 'home.manage', 'menus.manage', 'pages.manage', 'pages.view',
          'news.manage', 'news.view', 'downloads.view', 'downloads.manage', 'content.manage',
          'shape.view', 'shape.manage',
          'knowledge_hub.view', 'knowledge_hub.manage',
          'programmes.view', 'programmes.manage',
          'hero_slides.view', 'hero_slides.manage',
          'testimonials.view', 'testimonials.manage',
          'adverts.view', 'adverts.manage',
        ] 
      },
      {
        name: 'General Helpdesk',
        slug: 'general_helpdesk',
        is_system: true,
        pSlugs: [
          'dashboard.view',
          'complaints.manage', 'complaints.view',
          'helpdesk.view', 'helpdesk.manage',
          'campus_feedback.view', 'campus_feedback.manage',
          'chats.view', 'chats.manage',
          'my_tickets.view',
        ],
      },
      {
        name: 'Academic Editor', 
        slug: 'editor', 
        is_system: true, 
        pSlugs: ['dashboard.view', 'schools.view', 'programmes.view', 'programmes.manage', 'course_units.manage'] 
      },
      { name: 'Institutional Viewer', slug: 'viewer', is_system: true, pSlugs: ['dashboard.view'] },
      {
        name: 'Service Desk Manager',
        slug: 'service_desk_manager',
        is_system: true,
        pSlugs: [
          'dashboard.view',
          // Both service-desk lanes
          'helpdesk.view', 'helpdesk.manage',
          'campus_feedback.view', 'campus_feedback.manage',
          'complaints.view', 'complaints.manage',
          'ict.view', 'ict.manage',
          'chats.view', 'chats.manage',
          'my_tickets.view',
          // Elevated ICT tooling (formerly ICT Support)
          'ict_status.view', 'ict_status.manage',
          'ict_knowledge.view', 'ict_knowledge.manage',
          'ict_password.view', 'ict_password.manage',
          'users.view', 'users.manage',
          'logs.view', 'logs.manage',
          'recycle_bin.view', 'recycle_bin.manage',
          'maintenance.view', 'maintenance.manage',
          // Combined analytics
          'reports.view',
          'infrastructure_analytics.view',
        ],
      },
      {
        name: 'ICT Technical Support',
        slug: 'ict_officer',
        is_system: true,
        pSlugs: [
          'dashboard.view',
          'ict.view', 'ict.manage',
          'my_tickets.view',
        ],
      },
      {
        name: 'Vice Chancellor',
        slug: 'vice_chancellor',
        is_system: true,
        pSlugs: [
          'dashboard.view',
          'campus_feedback.view',
          'reports.view',
          'infrastructure_analytics.view',
          'helpdesk.view',
        ],
      },
    ];

    // Rename legacy role display names → enterprise Service Desk naming.
    const roleRenames: Array<{ from: string[]; to: string; description: string }> = [
      {
        from: ['Help Desk', 'HelpDesk', 'Grievance Officer'],
        to: 'General Helpdesk',
        description:
          'General Helpdesk — campus feedback (complaints & compliments), infrastructure tickets, and AI chat support',
      },
      {
        from: ['Grievance Manager', 'ICT Support'],
        to: 'Service Desk Manager',
        description:
          'Service Desk Manager — both Helpdesk and ICT lanes, plus elevated ICT tooling (status, KB, password desk)',
      },
      {
        from: ['ICT Officer'],
        to: 'ICT Technical Support',
        description:
          'ICT Technical Support — systems, portals, academic platforms, and digital technical requests',
      },
    ];
    for (const rename of roleRenames) {
      for (const oldName of rename.from) {
        const existing = await this.roleRepository.findOne({
          where: { name: oldName },
          relations: ['users'],
        });
        if (!existing) continue;
        const targetTaken = await this.roleRepository.findOne({ where: { name: rename.to } });
        if (targetTaken && targetTaken.id !== existing.id) {
          // Target already exists — move users off the legacy role, then remove it.
          for (const u of existing.users || []) {
            u.role = targetTaken;
            await this.userRepository.save(u);
          }
          await this.dataSource.query('DELETE FROM role_permissions WHERE role_id = $1', [existing.id]);
          await this.roleRepository.delete(existing.id);
          continue;
        }
        existing.name = rename.to;
        existing.description = rename.description;
        await this.roleRepository.save(existing);
      }
    }

    // Hard-remove obsolete titles if any remain (system flag blocked UI delete).
    for (const obsoleteName of ['Grievance Officer', 'Grievance Manager', 'ICT Support']) {
      const obsolete = await this.roleRepository.findOne({
        where: { name: obsoleteName },
        relations: ['users'],
      });
      if (!obsolete) continue;
      const fallbackName =
        obsoleteName === 'Grievance Officer' ? 'General Helpdesk' : 'Service Desk Manager';
      const fallback = await this.roleRepository.findOne({ where: { name: fallbackName } });
      for (const u of obsolete.users || []) {
        if (!fallback) continue;
        u.role = fallback;
        await this.userRepository.save(u);
      }
      await this.dataSource.query('DELETE FROM role_permissions WHERE role_id = $1', [obsolete.id]);
      await this.roleRepository.delete(obsolete.id);
      console.log(`[RBAC] Removed obsolete role: ${obsoleteName}`);
    }

    for (const rCfg of rolesConfig) {
      let role = await this.roleRepository.findOne({ where: { name: rCfg.name }, relations: ['permissions'] });
      if (!role) {
        role = this.roleRepository.create({
          name: rCfg.name,
          description:
            rCfg.name === 'General Helpdesk'
              ? 'General Helpdesk — campus feedback (complaints & compliments), infrastructure tickets, and AI chat support'
              : rCfg.name === 'ICT Technical Support'
                ? 'ICT Technical Support — systems, portals, academic platforms, and digital technical requests'
                : rCfg.name === 'Service Desk Manager'
                  ? 'Service Desk Manager — both Helpdesk and ICT lanes, plus elevated ICT tooling (status, KB, password desk)'
                  : `Standard institutional role for ${rCfg.name.toLowerCase()}s`,
          is_system_role: rCfg.is_system,
        });
      }
      role.permissions = rCfg.pSlugs
        .map(s => pMap[s])
        .filter(p => !!p);
      if (rCfg.name === 'General Helpdesk') {
        role.description =
          'General Helpdesk — campus feedback (complaints & compliments), infrastructure tickets, and AI chat support';
      }
      if (rCfg.name === 'ICT Technical Support') {
        role.description =
          'ICT Technical Support — systems, portals, academic platforms, and digital technical requests';
      }
      if (rCfg.name === 'Service Desk Manager') {
        role.description =
          'Service Desk Manager — both Helpdesk and ICT lanes, plus elevated ICT tooling (status, KB, password desk)';
      }
      await this.roleRepository.save(role);
    }

    // Align any leftover Help Desk naming variants to General Helpdesk capabilities.
    const helpDeskPermissionSlugs = [
      'dashboard.view',
      'complaints.manage', 'complaints.view',
      'helpdesk.view', 'helpdesk.manage',
      'campus_feedback.view', 'campus_feedback.manage',
      'chats.view', 'chats.manage',
      'my_tickets.view',
    ];
    const allRolesForAlias = await this.roleRepository.find({ relations: ['permissions'] });
    for (const role of allRolesForAlias) {
      const normalized = (role.name || '').replace(/\s+/g, '').toLowerCase();
      if (
        normalized !== 'helpdesk' &&
        normalized !== 'help_desk' &&
        normalized !== 'generalhelpdesk'
      ) {
        continue;
      }
      role.permissions = helpDeskPermissionSlugs.map((s) => pMap[s]).filter(Boolean);
      if (role.name !== 'General Helpdesk') {
        const taken = allRolesForAlias.find((r) => r.name === 'General Helpdesk' && r.id !== role.id);
        if (!taken) role.name = 'General Helpdesk';
      }
      role.description =
        'General Helpdesk — campus feedback (complaints & compliments), infrastructure tickets, and AI chat support';
      await this.roleRepository.save(role);
    }

    // Ensure custom "Staff" (and similar desk-capable roles) can open My Tickets
    // when they already have lane access — keeps RBAC assignable without forcing it.
    const myTicketsPerm = pMap['my_tickets.view'];
    if (myTicketsPerm) {
      const staffish = await this.roleRepository.find({ relations: ['permissions'] });
      for (const role of staffish) {
        const name = (role.name || '').toLowerCase();
        if (name !== 'staff' && name !== 'content manager') continue;
        const slugs = new Set((role.permissions || []).map((p) => p.slug));
        const hasDesk =
          slugs.has('ict.view') ||
          slugs.has('helpdesk.view') ||
          slugs.has('campus_feedback.view') ||
          slugs.has('technical_support.view');
        if (!hasDesk || slugs.has('my_tickets.view')) continue;
        role.permissions = [...(role.permissions || []), myTicketsPerm];
        await this.roleRepository.save(role);
      }
    }

    // 3. Migrate Existing Users
    const users = await this.userRepository.find({ relations: ['role'] });
    const allRoles = await this.roleRepository.find();
    const roleSlugMap = rolesConfig.reduce((acc, r) => ({ ...acc, [r.slug]: r.name }), {} as Record<string, string>);

    for (const user of users) {
      if (!user.role && user.role_legacy) {
        const targetRoleName = roleSlugMap[user.role_legacy];
        if (targetRoleName) {
           const foundRole = allRoles.find(r => r.name === targetRoleName);
           if (foundRole) {
             user.role = foundRole;
             await this.userRepository.save(user);
           }
        }
      }
    }

    return { message: 'RBAC Orchestration Complete', permissionsSeeded: permissions.length, rolesSeeded: allRoles.length };
  }

  async findAllRoles() {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' }
    });
  }

  async findAllPermissions() {
    return this.permissionRepository.find({
      order: { name: 'ASC' }
    });
  }

  async createRole(data: { name: string, description?: string, permissionIds: string[] }) {
    const role = this.roleRepository.create({
      name: data.name,
      description: data.description,
      is_system_role: false,
    });
    
    if (data.permissionIds && data.permissionIds.length > 0) {
      role.permissions = await this.permissionRepository.findByIds(data.permissionIds);
    }
    
    return this.roleRepository.save(role);
  }

  async updateRole(id: string, data: { name?: string, description?: string, permissionIds?: string[] }) {
    const role = await this.roleRepository.findOne({ where: { id }, relations: ['permissions'] });
    if (!role) throw new NotFoundException('Role not found');

    // System roles may be renamed for display (e.g. ICT Officer → ICT Technical Support)
    // but cannot be deleted. Slug stability is preserved via seed migrations.
    if (data.name !== undefined) {
      const next = data.name.trim();
      if (!next) throw new BadRequestException('Role name is required');
      if (next !== role.name) {
        const clash = await this.roleRepository.findOne({ where: { name: next } });
        if (clash && clash.id !== role.id) {
          throw new ConflictException(`A role named "${next}" already exists`);
        }
        role.name = next;
      }
    }
    if (data.description !== undefined) role.description = data.description;

    if (data.permissionIds) {
      role.permissions = await this.permissionRepository.findByIds(data.permissionIds);
    }

    return this.roleRepository.save(role);
  }

  async deleteRole(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.is_system_role) throw new ForbiddenException('System roles cannot be terminated');
    
    return this.roleRepository.remove(role);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.userRepository.softRemove(user);
  }
}
