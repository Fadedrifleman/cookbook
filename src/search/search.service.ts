import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Recipe, Ingredient } from '@prisma/client';

export interface RecipeSearchDocument {
    id: string;
    title: string;
    description: string;
    cuisine: string;
    difficulty: string;
    cookingTime: number;
    ingredients: string[]; // We will flatten the ingredients to an array of names
}

@Injectable()
export class SearchService {
    private readonly logger = new Logger(SearchService.name);
    private readonly INDEX_NAME = 'recipes';

    constructor(private readonly esService: ElasticsearchService) { }

    async onModuleInit() {
        // It's good practice to ensure the index exists when the module initializes.
        const indexExists = await this.esService.indices.exists({ index: this.INDEX_NAME });
        if (!indexExists) {
            this.logger.log(`Index "${this.INDEX_NAME}" not found. Creating...`);
            await this.esService.indices.create({
                index: this.INDEX_NAME,
                // We can define mappings here for better search precision, but for now, defaults are fine.
            });
        } else {
            this.logger.log(`Index "${this.INDEX_NAME}" already exists.`);
        }
    }

    async indexRecipe(recipe: Recipe & { ingredients: Ingredient[] }) {
        const document: RecipeSearchDocument = {
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            cuisine: recipe.cuisine,
            difficulty: recipe.difficulty,
            cookingTime: recipe.cookingTime,
            ingredients: recipe.ingredients.map(i => i.name.toLowerCase()), // Store as lowercase for case-insensitive matching
        };

        return this.esService.index({
            index: this.INDEX_NAME,
            id: recipe.id,
            document,
        });
    }

    async removeRecipe(recipeId: string) {
        return this.esService.delete({
            index: this.INDEX_NAME,
            id: recipeId,
        });
    }

    async updateRecipe(recipe: Recipe & { ingredients: Ingredient[] }) {
        // For Elasticsearch, updating is the same as re-indexing the document.
        return this.indexRecipe(recipe);
    }

    async search(query: string, ingredients: string[]) {
        const mustClauses: any[] = [];

        // 1. Full-text search on title and description if a query string is provided
        if (query) {
            mustClauses.push({
                multi_match: {
                    query,
                    fields: ['title', 'description'],
                    fuzziness: 'AUTO', // Allows for small typos
                },
            });
        }

        // 2. "Cook with what I have" - Must match ALL provided ingredients
        if (ingredients && ingredients.length > 0) {
            ingredients.forEach(ingredient => {
                mustClauses.push({
                    match: {
                        ingredients: {
                            query: ingredient.toLowerCase(),
                        },
                    },
                });
            });
        }

        // If no search criteria, return nothing (or you could return all)
        if (mustClauses.length === 0) {
            return [];
        }

        const { hits } = await this.esService.search<RecipeSearchDocument>({
            index: this.INDEX_NAME,
            query: {
                bool: {
                    must: mustClauses,
                },
            },
        });

        return hits.hits.map((hit) => hit._source);
    }
}