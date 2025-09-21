import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecipesResolver } from './recipes.resolver';
import { UsersModule } from '../users/users.module';
import { SearchModule } from '../search/search.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [UsersModule, SearchModule, AiModule],
  providers: [RecipesResolver, RecipesService],
})
export class RecipesModule { }