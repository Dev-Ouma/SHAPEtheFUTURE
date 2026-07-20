import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { ShapeDashboardService } from './shape-dashboard.service';

@Controller('shape/dashboard')
export class ShapeDashboardController {
  constructor(private readonly service: ShapeDashboardService) {}

  @Public()
  @Get()
  getStats() {
    return this.service.getPublicStats();
  }
}
