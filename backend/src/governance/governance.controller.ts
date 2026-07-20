import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { GovernanceService } from './governance.service';
import { PublishStatus } from '../common/enums/publish-status.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/permissions.decorator';

@Controller('governance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @RequirePermission('governance.manage')
  @Get('pending')
  getPendingApprovals() {
    return this.governanceService.getPendingApprovals();
  }

  @RequirePermission('governance.manage')
  @Patch('status/:entityType/:id')
  updateStatus(
    @Param('entityType') entityType: string,
    @Param('id') id: string,
    @Body()
    body: { status: PublishStatus; reviewNotes: string; approverId: string },
  ) {
    return this.governanceService.updateStatus(
      entityType,
      id,
      body.status,
      body.reviewNotes,
      body.approverId,
    );
  }
}
