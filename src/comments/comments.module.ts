import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsResolver } from './comments.resolver';
// Note: We don't need to import PubSubModule here because it's global.

@Module({
  providers: [CommentsResolver, CommentsService],
})
export class CommentsModule {}