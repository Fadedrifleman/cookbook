import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesResolver } from './recipes.resolver';
import { UsersModule } from '../users/users.module'; // Import UsersModule

@Module({
  imports: [UsersModule], // Add UsersModule here
  providers: [RecipesResolver, RecipesService],
})
export class RecipesModule {}