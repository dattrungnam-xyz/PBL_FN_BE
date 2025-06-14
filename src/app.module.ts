import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './common/config/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { UsersModule } from './users/users.module';

import { ScheduleModule } from '@nestjs/schedule';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OrderDetailsModule } from './order-details/order-details.module';
import { SellersModule } from './sellers/sellers.module';
import { CartsModule } from './carts/carts.module';
import { VerifyModule } from './verify/verify.module';
import { UserAddressModule } from './user-address/user-address.module';
import { CartItemsModule } from './cart-items/cart-items.module';
import { RestockingModule } from './restocking/restocking.module';
import { SearchHistoryModule } from './search-history/search-history.module';
import { SeedDataModule } from './seedData/seedData.module';
import { RedisModule } from './redis/redis.module';
import { UserViewHistoriesModule } from './user-view-histories/user-view-histories.module';
import { ChatModule } from './chat/chat.module';
import { LocationModule } from './location/location.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    MailModule,
    CloudinaryModule,
    UsersModule,
    ScheduleModule.forRoot(),
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    ReviewsModule,
    OrderDetailsModule,
    SellersModule,
    CartsModule,
    VerifyModule,
    UserAddressModule,
    CartItemsModule,
    RestockingModule,
    SearchHistoryModule,
    SeedDataModule,
    RedisModule,
    UserViewHistoriesModule,
    ChatModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
