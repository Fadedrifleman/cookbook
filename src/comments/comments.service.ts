import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { PUB_SUB } from '../pubsub/pubsub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Comment as CommentModel } from '@prisma/client';

const COMMENT_ADDED_EVENT = 'commentAdded';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(PUB_SUB) private pubSub: RedisPubSub, // Inject our PubSub engine
  ) {}

  async create(createCommentInput: CreateCommentInput, userId: string) {
    const newComment = await this.prisma.comment.create({
      data: {
        text: createCommentInput.text,
        recipeId: createCommentInput.recipeId,
        userId: userId,
      },
      include: {
        user: true, // Include user data for the payload
      },
    });

    // Publish the event to the 'commentAdded' channel.
    // The payload is the new comment itself.
    this.pubSub.publish(COMMENT_ADDED_EVENT, { commentAdded: newComment });

    return newComment;
  }

  async findForRecipe(recipeId: string) {
    return this.prisma.comment.findMany({
      where: { recipeId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}