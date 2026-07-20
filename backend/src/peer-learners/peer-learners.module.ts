import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeerLearner } from './entities/peer-learner.entity';
import { PeerLearnersService } from './peer-learners.service';
import { PeerLearnersController } from './peer-learners.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PeerLearner])],
  providers: [PeerLearnersService],
  controllers: [PeerLearnersController],
  exports: [PeerLearnersService],
})
export class PeerLearnersModule {}
