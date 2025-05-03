import { Module } from '@nestjs/common';
import { UserViewHistoriesService } from './user-view-histories.service';
import { UserViewHistoriesController } from './user-view-histories.controller';

@Module({
  controllers: [UserViewHistoriesController],
  providers: [UserViewHistoriesService],
})
export class UserViewHistoriesModule {}
