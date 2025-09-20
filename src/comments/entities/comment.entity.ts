import { ObjectType, Field, ID } from '@nestjs/graphql'; 
import { User } from '../../users/entities/user.entity';
import { DateTimeResolver } from 'graphql-scalars';

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field()
  text: string;

  @Field(() => DateTimeResolver)
  createdAt: Date;

  @Field(() => User)
  user: User;

  // We don't need to expose recipeId directly, as the comment
  // will be queried as part of a recipe.
}