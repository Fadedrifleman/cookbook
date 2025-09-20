import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Ingredient } from './ingredient.entity';
import { Instruction } from './instruction.entity';

@ObjectType()
export class Recipe {
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

  @Field()
  createdAt: Date;

  @Field(() => User)
  author: User;

  @Field(() => [Ingredient])
  ingredients: Ingredient[];

  @Field(() => [Instruction])
  instructions: Instruction[];
}