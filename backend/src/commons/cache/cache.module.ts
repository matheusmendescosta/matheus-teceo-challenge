import { Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { CacheService } from './cache.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const redisClient: RedisClientType = createClient({
          socket: {
            host: 'localhost',
            port: 6379,
          },
        });

        await redisClient.connect();

        return {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          store: 'redis' as unknown as any,
          client: redisClient,
          ttl: 300, // 5 minutos padrão
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModuleConfig {}
