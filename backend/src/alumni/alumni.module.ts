import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlumniController } from './alumni.controller';
import { AlumniService } from './alumni.service';
import { AlumniProfile } from './entities/alumni-profile.entity';
import { AlumniMentorship } from './entities/alumni-mentorship.entity';
import { AlumniEvent } from './entities/alumni-event.entity';
import { AlumniStory } from './entities/alumni-story.entity';
import { AlumniCareer } from './entities/alumni-career.entity';
import { AlumniChapter } from './entities/alumni-chapter.entity';

import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AlumniProfile,
      AlumniMentorship,
      AlumniEvent,
      AlumniStory,
      AlumniCareer,
      AlumniChapter,
    ]),
    MailModule,
  ],
  controllers: [AlumniController],
  providers: [AlumniService],
  exports: [AlumniService],
})
export class AlumniModule {}
