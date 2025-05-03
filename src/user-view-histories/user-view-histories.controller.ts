import { Controller } from '@nestjs/common';
import { UserViewHistoriesService } from './user-view-histories.service';

@Controller('user-view-histories')
export class UserViewHistoriesController {
  constructor(private readonly userViewHistoriesService: UserViewHistoriesService) {}
}
