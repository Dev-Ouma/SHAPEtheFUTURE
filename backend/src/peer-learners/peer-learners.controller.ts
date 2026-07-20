import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { PeerLearnersService } from './peer-learners.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import {
  CreatePeerLearnerDto,
  UpdatePeerLearnerDto,
} from './dto/peer-learner.dto';

@Controller('peer-learners')
export class PeerLearnersController {
  constructor(private readonly peerLearnersService: PeerLearnersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: CreatePeerLearnerDto) {
    return this.peerLearnersService.create(data);
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('schoolId') schoolId?: string,
    @Query('is_active') is_active?: string,
  ) {
    return this.peerLearnersService.findAll({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      schoolId,
      is_active:
        is_active === 'true' ? true : is_active === 'false' ? false : undefined,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() data: UpdatePeerLearnerDto) {
    return this.peerLearnersService.update(id, data);
  }

  @Patch(':id/toggle-status')
  @UseGuards(JwtAuthGuard)
  toggleStatus(@Param('id') id: string) {
    return this.peerLearnersService.toggleStatus(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.peerLearnersService.remove(id);
  }
}
