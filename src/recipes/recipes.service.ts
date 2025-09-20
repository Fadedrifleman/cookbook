import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateRecipeInput } from './dto/create-recipe.input';
import { UpdateRecipeInput } from './dto/update-recipe.input';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(createRecipeInput: CreateRecipeInput, authorId: string) {
    const { ingredients, instructions, ...recipeData } = createRecipeInput;

    // Prisma can create the recipe and its related ingredients/instructions in one transaction
    const recipe = await this.prisma.recipe.create({
      data: {
        ...recipeData,
        author: {
          connect: { id: authorId },
        },
        ingredients: {
          create: ingredients,
        },
        instructions: {
          create: instructions,
        },
      },
      include: {
        ingredients: true,
        instructions: true,
      },
    });
    return recipe;
  }

  async findAll() {
    return this.prisma.recipe.findMany({
      include: {
        author: true, // Include author details
        ingredients: true,
        instructions: true,
      },
    });
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: true,
        ingredients: true,
        instructions: true,
      },
    });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }
    return recipe;
  }

  async update(id: string, updateRecipeInput: UpdateRecipeInput, userId: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }

    if (recipe.authorId !== userId) {
      throw new UnauthorizedException('You can only update your own recipes');
    }

    const { ingredients, instructions, ...recipeData } = updateRecipeInput;

    // A more complex update transaction is needed for relations
    // We will delete the old ones and create the new ones.
    const updateTransaction: Prisma.PrismaPromise<any>[] = [];

    // Update the scalar fields of the recipe
    if (Object.keys(recipeData).length > 0) {
      updateTransaction.push(this.prisma.recipe.update({
        where: { id },
        data: recipeData,
      }));
    }

    // If new ingredients are provided, delete old ones and create new ones
    if (ingredients) {
      updateTransaction.push(this.prisma.ingredient.deleteMany({ where: { recipeId: id } }));
      updateTransaction.push(this.prisma.recipe.update({
        where: { id },
        data: { ingredients: { create: ingredients } },
      }));
    }

    // If new instructions are provided, do the same
    if (instructions) {
      updateTransaction.push(this.prisma.instruction.deleteMany({ where: { recipeId: id } }));
      updateTransaction.push(this.prisma.recipe.update({
        where: { id },
        data: { instructions: { create: instructions } },
      }));
    }
    
    await this.prisma.$transaction(updateTransaction);

    // Return the updated recipe with all its relations
    return this.findOne(id);
  }

  async remove(id: string, userId: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id } });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID "${id}" not found`);
    }

    if (recipe.authorId !== userId) {
      throw new UnauthorizedException('You can only delete your own recipes');
    }

    // Thanks to `onDelete: Cascade` in our Prisma schema, deleting the recipe
    // will automatically delete its related ingredients and instructions.
    await this.prisma.recipe.delete({ where: { id } });

    return recipe; // Return the deleted recipe data
  }
}