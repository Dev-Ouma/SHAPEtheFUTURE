import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BackLinksService } from './backlinks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('partnerships')
export class BackLinksController {
  constructor(private readonly backlinksService: BackLinksService) {}

  // --- PUBLIC ENDPOINTS ---

  @Public()
  @Get()
  findAll(
    @Query('featured') featured?: string,
    @Query('category') category?: string,
  ) {
    return this.backlinksService.findAllPartners({
      featured: featured === 'true',
      category,
    });
  }

  @Public()
  @Get('categories')
  findAllCategories() {
    return this.backlinksService.findAllCategories();
  }

  @Public()
  @Get('stats')
  getStats() {
    return this.backlinksService.getStats();
  }

  @Public()
  @Get('detail/:slug')
  findOne(@Param('slug') slug: string) {
    return this.backlinksService.findPartnerBySlug(slug);
  }

  // Legacy fallback for footer logos
  @Public()
  @Get('backlinks')
  async findAllLegacy() {
    const links = await this.backlinksService.findAll();
    return links.map((l) => ({
      id: l.id,
      title: (l as any).name || (l as any).title,
      url: (l as any).website_url || (l as any).url,
      logo_url: l.logo_url,
    }));
  }

  // --- ADMIN ENDPOINTS ---

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAllAdmin() {
    return this.backlinksService.findAllAdmin();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findOneById(@Param('id') id: string) {
    return this.backlinksService.findPartnerById(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  create(@Body() data: any) {
    return this.backlinksService.createPartner(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.backlinksService.updatePartner(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.backlinksService.removePartner(+id);
  }
}
