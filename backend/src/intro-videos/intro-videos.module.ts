import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntroVideosService } from './intro-videos.service';
import { IntroVideosController } from './intro-videos.controller';
import { IntroVideo } from './entities/intro-video.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IntroVideo])],
  controllers: [IntroVideosController],
  providers: [IntroVideosService],
  exports: [IntroVideosService],
})
export class IntroVideosModule {}
