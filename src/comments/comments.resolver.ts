import { Resolver, Mutation, Args, Subscription, ID } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PUB_SUB } from '../pubsub/pubsub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Comment as CommentModel } from '@prisma/client';

const COMMENT_ADDED_EVENT = 'commentAdded';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub, // Also inject here for the subscription
  ) {}

  @Mutation(() => Comment)
  @UseGuards(GqlAuthGuard)
  createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.create(createCommentInput, user.id);
  }

  // --- THE SUBSCRIPTION RESOLVER ---
  @Subscription(() => Comment, {
    name: 'commentAdded',
    // This filter ensures that clients only receive updates
    // for the specific recipe they are subscribed to.
    filter: (payload, variables) => {
      return payload.commentAdded.recipeId === variables.recipeId;
    },
    // This resolves the payload into the shape our schema expects.
    resolve: (payload: { commentAdded: CommentModel & { createdAt: string } }) => {
        return {
          ...payload.commentAdded,
          createdAt: new Date(payload.commentAdded.createdAt),
        };
      },
  })
  subscribeToCommentAdded(@Args('recipeId', { type: () => ID }) recipeId: string) {
    // asyncIterator creates a listener for the specified event.
    return this.pubSub.asyncIterator(COMMENT_ADDED_EVENT);
  }
}