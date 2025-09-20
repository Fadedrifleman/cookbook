import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsInt, Min, MaxLength, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class CreateIngredientInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(50)
  quantity: string;
}

@InputType()
class CreateInstructionInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  stepNumber: number;

  @Field()
  @IsNotEmpty()
  text: string;
}

@InputType()
export class CreateRecipeInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @Field({ nullable: true })
  @MaxLength(500)
  description?: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(50)
  cuisine: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(20)
  difficulty: string; // e.g., "Easy", "Medium", "Hard"

  @Field(() => Int)
  @IsInt()
  @Min(1)
  cookingTime: number; // in minutes

  @Field(() => [CreateIngredientInput])
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateIngredientInput)
  ingredients: CreateIngredientInput[];

  @Field(() => [CreateInstructionInput])
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateInstructionInput)
  instructions: CreateInstructionInput[];
}