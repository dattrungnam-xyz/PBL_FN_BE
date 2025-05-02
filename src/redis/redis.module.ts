import { Module } from '@nestjs/common'; 
import { RedisPubService } from './redis.service';

@Module({
  providers: [RedisPubService],
  exports: [RedisPubService], 
})
export class RedisModule {}
