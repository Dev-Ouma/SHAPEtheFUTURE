import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AlumniProfile } from './entities/alumni-profile.entity';
import { AlumniMentorship } from './entities/alumni-mentorship.entity';
import { AlumniEvent } from './entities/alumni-event.entity';
import { AlumniStory } from './entities/alumni-story.entity';
import { AlumniCareer } from './entities/alumni-career.entity';
import { AlumniChapter } from './entities/alumni-chapter.entity';
import { MailService } from '../mail/mail.service';
import { normalizeLocale, pickLocalized, AppLocale } from '../common/locale';

@Injectable()
export class AlumniService {
  constructor(
    @InjectRepository(AlumniProfile)
    private profileRepo: Repository<AlumniProfile>,
    @InjectRepository(AlumniMentorship)
    private mentorshipRepo: Repository<AlumniMentorship>,
    @InjectRepository(AlumniEvent)
    private eventRepo: Repository<AlumniEvent>,
    @InjectRepository(AlumniStory)
    private storyRepo: Repository<AlumniStory>,
    @InjectRepository(AlumniCareer)
    private careerRepo: Repository<AlumniCareer>,
    @InjectRepository(AlumniChapter)
    private chapterRepo: Repository<AlumniChapter>,
    private mailService: MailService,
  ) {}

  // --- PUBLIC METHODS ---

  async registerPublicProfile(data: any) {
    // Accept both FE field names (name) and legacy aliases (full_name).
    const name = String(data?.name || data?.full_name || '').trim();
    const programme = String(data?.programme || '').trim();
    const graduationYear = Number(
      data?.graduationYear ?? data?.graduation_year,
    );

    if (!name) {
      throw new BadRequestException('Name is required');
    }
    if (!programme) {
      throw new BadRequestException('Programme is required');
    }
    if (!Number.isFinite(graduationYear) || graduationYear < 1950) {
      throw new BadRequestException('A valid graduation year is required');
    }

    // Force safe defaults for public submissions
    const safeData = {
      name,
      graduationYear,
      programme,
      industry: data?.industry || null,
      country: data?.country || null,
      employer: data?.employer || null,
      bio: data?.bio || null,
      linkedIn: data?.linkedIn || data?.linkedin || null,
      twitter: data?.twitter || null,
      website: data?.website || null,
      studentNumber: data?.studentNumber || data?.student_number || null,
      image_url: data?.image_url || null,
      verificationStatus: 'pending',
      isPublic: false,
      isFeatured: false,
    };

    const newProfile: any = await this.profileRepo.save(
      this.profileRepo.create(safeData),
    );

    // Dispatch email notification to admin
    const emailBody = `
      <p>A new alumni registration has been submitted and is waiting for verification.</p>
      <ul>
        <li><strong>Name:</strong> ${newProfile.name}</li>
        <li><strong>Student Number:</strong> ${newProfile.studentNumber || 'Not provided'}</li>
        <li><strong>Graduation Year:</strong> ${newProfile.graduationYear}</li>
        <li><strong>Programme:</strong> ${newProfile.programme}</li>
      </ul>
      <p>Please log in to the admin panel to verify or reject this profile.</p>
    `;

    // Assuming a generic alumni admin email, or falls back to system default
    await this.mailService.sendEmail(
      null,
      'alumni@ouk.ac.ke',
      'New Alumni Registration - Pending Verification',
      this.mailService.getBrandedTemplate(
        'New Alumni Registration',
        emailBody,
        'http://localhost:3000/admin/alumni',
        'Alumni Association',
      ),
    );

    return newProfile;
  }

  // Profiles
  async findAllProfiles(query?: any) {
    const {
      year,
      programme,
      industry,
      country,
      search,
      page: pageQuery,
      limit: limitQuery,
    } = query || {};
    const page = pageQuery ? parseInt(pageQuery, 10) : 1;
    const limit = limitQuery ? parseInt(limitQuery, 10) : 9;

    const qb = this.profileRepo.createQueryBuilder('profile');

    if (year) qb.andWhere('profile.graduationYear = :year', { year });
    if (programme)
      qb.andWhere('profile.programme ILIKE :programme', {
        programme: `%${programme}%`,
      });
    if (industry) qb.andWhere('profile.industry = :industry', { industry });
    if (country) qb.andWhere('profile.country = :country', { country });
    if (search) {
      qb.andWhere('(profile.name ILIKE :search OR profile.bio ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('profile.isFeatured', 'DESC').addOrderBy('profile.name', 'ASC');

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit) || 1,
    };
  }

  async findFeaturedProfiles() {
    return this.profileRepo.find({ where: { isFeatured: true }, take: 6 });
  }

  // Mentorship
  async findActiveMentors() {
    return this.mentorshipRepo.find({
      relations: ['alumni'],
      where: { status: 'active' },
    });
  }

  // Events
  async findUpcomingEvents(localeRaw?: string) {
    const locale = normalizeLocale(localeRaw);
    const events = await this.eventRepo.find({
      where: { status: 'upcoming' },
      order: { date: 'ASC' },
      take: 4,
    });
    return events.map((event) => this.localizeEvent(event, locale));
  }

  private localizeEvent(event: AlumniEvent, locale: AppLocale) {
    return {
      ...event,
      title: pickLocalized(locale, event.title, event.title_sw),
      description:
        pickLocalized(locale, event.description, event.description_sw) ||
        event.description,
    };
  }

  // Stories
  async findLatestStories() {
    return this.storyRepo.find({
      relations: ['alumni'],
      order: { createdAt: 'DESC' },
      take: 4,
    });
  }

  // Careers
  async findActiveCareers() {
    return this.careerRepo.find({
      where: { status: 'active' },
      order: { createdAt: 'DESC' },
      take: 6,
    });
  }

  // Chapters
  async findAllChapters() {
    return this.chapterRepo.find();
  }

  // Stats
  async getStats() {
    const registeredCount = await this.profileRepo.count();
    const countries = await this.profileRepo
      .createQueryBuilder('profile')
      .select('DISTINCT profile.country')
      .getRawMany();
    const mentorsCount = await this.mentorshipRepo.count({
      where: { status: 'active' },
    });
    const eventsCount = await this.eventRepo.count();

    return {
      alumniRegistered: registeredCount,
      countriesRepresented: countries.length,
      activeMentors: mentorsCount,
      eventsHosted: eventsCount,
    };
  }

  // --- MANAGEMENT METHODS ---

  async createProfile(data: any) {
    return this.profileRepo.save(this.profileRepo.create(data));
  }

  async updateProfile(id: string, data: any) {
    await this.profileRepo.update(id, data);
    return this.profileRepo.findOneBy({ id });
  }

  async deleteProfile(id: string) {
    return this.profileRepo.delete(id);
  }

  async createMentorship(data: any) {
    return this.mentorshipRepo.save(this.mentorshipRepo.create(data));
  }

  async updateMentorship(id: string, data: any) {
    await this.mentorshipRepo.update(id, data);
    return this.mentorshipRepo.findOneBy({ id });
  }

  async deleteMentorship(id: string) {
    return this.mentorshipRepo.delete(id);
  }

  async createEvent(data: any) {
    return this.eventRepo.save(this.eventRepo.create(data));
  }

  async updateEvent(id: string, data: any) {
    await this.eventRepo.update(id, data);
    return this.eventRepo.findOneBy({ id });
  }

  async deleteEvent(id: string) {
    return this.eventRepo.delete(id);
  }

  async createStory(data: any) {
    return this.storyRepo.save(this.storyRepo.create(data));
  }

  async updateStory(id: string, data: any) {
    await this.storyRepo.update(id, data);
    return this.storyRepo.findOneBy({ id });
  }

  async deleteStory(id: string) {
    return this.storyRepo.delete(id);
  }

  async createCareer(data: any) {
    return this.careerRepo.save(this.careerRepo.create(data));
  }

  async updateCareer(id: string, data: any) {
    await this.careerRepo.update(id, data);
    return this.careerRepo.findOneBy({ id });
  }

  async deleteCareer(id: string) {
    return this.careerRepo.delete(id);
  }

  async createChapter(data: any) {
    return this.chapterRepo.save(this.chapterRepo.create(data));
  }

  async updateChapter(id: string, data: any) {
    await this.chapterRepo.update(id, data);
    return this.chapterRepo.findOneBy({ id });
  }

  async deleteChapter(id: string) {
    return this.chapterRepo.delete(id);
  }
}
