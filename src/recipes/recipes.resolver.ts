import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { RecipesService } from './recipes.service';
import { Recipe } from './entities/recipe.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateRecipeInput } from './dto/create-recipe.input';
import { UpdateRecipeInput } from './dto/update-recipe.input';

@Resolver(() => Recipe)
export class RecipesResolver {
  constructor(
    private readonly recipesService: RecipesService,
    private readonly usersService: UsersService, // Inject UsersService
  ) {}

  @Mutation(() => Recipe)
  @UseGuards(GqlAuthGuard) // Protect this mutation
  createRecipe(
    @Args('createRecipeInput') createRecipeInput: CreateRecipeInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.recipesService.create(createRecipeInput, user.id);
  }

  @Query(() => [Recipe], { name: 'recipes' })
  findAll() {
    return this.recipesService.findAll();
  }

  @Query(() => Recipe, { name: 'recipe' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.recipesService.findOne(id);
  }

  @Mutation(() => Recipe)
  @UseGuards(GqlAuthGuard) // Protect this mutation
  updateRecipe(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateRecipeInput') updateRecipeInput: UpdateRecipeInput,
    @CurrentUser() user: { id: string },
  ) {
    return this.recipesService.update(id, updateRecipeInput, user.id);
  }

  @Mutation(() => Recipe)
  @UseGuards(GqlAuthGuard) // Protect this mutation
  removeRecipe(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: { id:string },
  ) {
    return this.recipesService.remove(id, user.id);
  }

  // --- Field Resolvers ---
  // This is an efficient way to resolve related data.
  // When a query asks for the 'author' of a recipe, this function will be called.
  @ResolveField('author', () => User)
  async getAuthor(@Parent() recipe: Recipe) {
    const { authorId } = recipe as any; // Prisma result includes authorId
    const author = await this.usersService.findOneById(authorId);
    // Exclude password from the response
    const { password, ...result } = author;
    return result;
  }
}