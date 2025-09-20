import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesResolver } from './recipes.resolver';
import { UsersModule } from '../users/users.module';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [UsersModule, SearchModule], 
  providers: [RecipesResolver, RecipesService],
})
export class RecipesModule { }