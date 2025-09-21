import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // The factory will now inject the ConfigService to read environment variables
      useFactory: (configService: ConfigService) => {
        // Read the production ELASTICSEARCH_URL from the environment
        const esUrl = configService.get<string>('ELASTICSEARCH_URL');

        return {
          // If the esUrl exists (in production), use it.
          // Otherwise (in local dev), fall back to the Docker container URL.
          node: esUrl || 'http://localhost:9200',
          maxRetries: 10,
          requestTimeout: 60000,
        };
      },
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}