import { CreateRecipeInput } from './create-recipe.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRecipeInput extends PartialType(CreateRecipeInput) {
  // All fields from CreateRecipeInput are now optional.
  // We don't need to add anything here unless we have a field
  // specific to updating that doesn't exist in creation.
}