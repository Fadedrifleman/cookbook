import { Global, Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

// This constant will be used as an injection token
export const PUB_SUB = 'PUB_SUB';

@Global() // Make this module and its exports available globally
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PUB_SUB,
      // We use a factory to configure the RedisPubSub instance
      useFactory: (configService: ConfigService) => {
        // In a real app, you would get these from the ConfigService
        const redisOptions = {
          host: 'localhost', // The name of our service in docker-compose.yml
          port: 6379,
        };

        return new RedisPubSub({
          // ioredis is recommended for both publisher and subscriber
          publisher: new Redis(redisOptions),
          subscriber: new Redis(redisOptions),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [PUB_SUB], // Export the provider so it can be injected elsewhere
})
export class PubSubModule {}