import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateCommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  text: string;

  @Field(() => ID)
  @IsNotEmpty()
  recipeId: string;
}