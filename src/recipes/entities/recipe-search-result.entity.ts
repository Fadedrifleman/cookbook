import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class RecipeSearchResult {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  cuisine: string;

  @Field()
  difficulty: string;

  @Field(() => Int)
  cookingTime: number;
}