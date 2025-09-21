import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { User } from './user.entity';

@ObjectType()
export class UserProfile {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field(() => Int, { description: 'The number of users this user is following' })
  followingCount: number;

  @Field(() => Int, { description: 'The number of users following this user' })
  followersCount: number;

  @Field(() => [Recipe], { nullable: 'itemsAndList' })
  recipes: Recipe[];

  // You could add more fields here like bio, profile picture, etc.
}

@ObjectType()
export class FollowResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}