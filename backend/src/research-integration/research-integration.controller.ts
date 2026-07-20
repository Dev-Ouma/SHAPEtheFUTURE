import {
  Controller,
  Post,
  Param,
  UseGuards,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrcidService } from './orcid.service';
import { StaffMember } from '../staff/entities/staff-member.entity';
import {
  Publication,
  PublicationType,
} from '../research/entities/publication.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@Controller('research-integration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResearchIntegrationController {
  private readonly logger = new Logger(ResearchIntegrationController.name);

  constructor(
    private readonly orcidService: OrcidService,
    @InjectRepository(StaffMember)
    private readonly staffMemberRepository: Repository<StaffMember>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
  ) {}

  @Post('sync-orcid/:staffId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async syncOrcid(@Param('staffId') staffId: string) {
    const staff = await this.staffMemberRepository.findOne({
      where: { id: staffId },
    });
    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    if (!staff.orcid_id) {
      throw new NotFoundException(
        'Staff member does not have an ORCID ID configured.',
      );
    }

    this.logger.log(
      `Syncing ORCID data for staff ${staff.full_name} (${staff.orcid_id})`,
    );

    // 1. Fetch works from ORCID
    const works = await this.orcidService.getScholarWorks(staff.orcid_id);
    let newWorksCount = 0;

    // 2. Save works to Publications
    for (const work of works) {
      if (!work.title) continue;

      // Check if already exists by DOI or Title
      const doi = work.externalIds?.find((id: any) => id.type === 'doi')?.value;
      const url =
        work.url || work.externalIds?.find((id: any) => id.type === 'doi')?.url;

      const existing = await this.publicationRepository
        .createQueryBuilder('pub')
        .where('pub.title = :title', { title: work.title })
        .orWhere('pub.doi = :doi AND pub.doi IS NOT NULL', { doi })
        .getOne();

      if (!existing) {
        // Create new publication
        const slug =
          work.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .slice(0, 100) +
          '-' +
          Math.random().toString(36).substring(2, 7);
        const pub = this.publicationRepository.create({
          title: work.title,
          slug,
          abstract: `Synchronized from ORCID: ${work.title}`,
          publication_year: work.publicationYear
            ? parseInt(work.publicationYear, 10)
            : new Date().getFullYear(),
          journal_name: work.journalTitle,
          doi,
          url,
          status: 'Published',
          type: work.type?.includes('journal')
            ? PublicationType.JOURNAL
            : PublicationType.BOOK,
          staff_authors: [staff],
          is_open_access: true,
        });

        await this.publicationRepository.save(pub);
        newWorksCount++;
      } else {
        // If it exists, ensure this staff member is an author
        const pubWithAuthors = await this.publicationRepository.findOne({
          where: { id: existing.id },
          relations: ['staff_authors'],
        });
        if (pubWithAuthors) {
          const isAuthor = pubWithAuthors.staff_authors.some(
            (a) => a.id === staff.id,
          );
          if (!isAuthor) {
            pubWithAuthors.staff_authors.push(staff);
            await this.publicationRepository.save(pubWithAuthors);
          }
        }
      }
    }

    return {
      message: 'ORCID Sync completed',
      totalWorksFound: works.length,
      newWorksImported: newWorksCount,
      staff: staff.full_name,
    };
  }
}
