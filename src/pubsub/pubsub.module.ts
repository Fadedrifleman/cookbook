import { Global, Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const PUB_SUB = 'PUB_SUB';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      // Inject the ConfigService to read environment variables
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Check if a production REDIS_URL is provided
        const redisUrl = configService.get<string>('REDIS_URL');

        // This allows the app to work both locally (with docker-compose)
        // and in production (with the Upstash URL from Render).
        const redisOptions = redisUrl
          ? { url: redisUrl } // For production (Upstash)
          : { host: 'localhost', port: 6379 }; // For local development

        return new RedisPubSub({
          publisher: new Redis(redisUrl || 'redis://localhost:6379'),
          subscriber: new Redis(redisUrl || 'redis://localhost:6379'),
        });
      },
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}