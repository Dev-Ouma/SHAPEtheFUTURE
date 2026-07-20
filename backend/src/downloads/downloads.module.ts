import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DownloadsController } from './downloads.controller';
import { DownloadsService } from './downloads.service';
import { Download } from './entities/download.entity';
import { DownloadCategory } from './entities/download-category.entity';
import { DownloadTag } from './entities/download-tag.entity';
import { DownloadLog } from './entities/download-log.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Download,
      DownloadCategory,
      DownloadTag,
      DownloadLog,
    ]),
    AuthModule,
  ],
  controllers: [DownloadsController],
  providers: [DownloadsService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
