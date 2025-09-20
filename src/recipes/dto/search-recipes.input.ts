import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

@InputType()
export class SearchRecipesInput {
  @Field({ nullable: true, description: 'A general search term for title or description' })
  @IsOptional()
  @IsString()
  query?: string;

  @Field(() => [String], { nullable: true, description: 'A list of ingredients the recipe must contain' })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  ingredients?: string[];
}