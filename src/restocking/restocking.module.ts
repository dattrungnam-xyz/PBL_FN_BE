import { Module } from '@nestjs/common';
import { RestockingService } from './restocking.service';
import { RestockingController } from './restocking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entity/user.entity';
import { Restocking } from './entity/restocking.entity';
import { Product } from '../products/entity/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Restocking, User, Product])], 
  controllers: [RestockingController],
  providers: [RestockingService],
  exports: [RestockingService],
})
export class RestockingModule {}
