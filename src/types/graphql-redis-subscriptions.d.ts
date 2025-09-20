// This file tells TypeScript about the 'graphql-redis-subscriptions' module.
declare module 'graphql-redis-subscriptions' {
    import { PubSubEngine } from 'graphql-subscriptions';
    import { Redis, RedisOptions } from 'ioredis';
  
    export interface RedisPubSubOptions {
      connection?: RedisOptions | string;
      triggerTransform?: TriggerTransform;
      connectionListener?: (err: Error) => void;
      publisher?: Redis;
      subscriber?: Redis;
      parseMessage?: (message: string) => any;
    }
  
    export class RedisPubSub extends PubSubEngine {
      constructor(options?: RedisPubSubOptions);
      publish<T>(trigger: string, payload: T): Promise<void>;
      subscribe<T = any>(trigger: string, onMessage: (payload: T) => void, options?: any): Promise<number>;
      unsubscribe(subId: number): void;
    }
  
    type TriggerTransform = (trigger: string, channelOptions: object) => string;
  }