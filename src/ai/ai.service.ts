import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import the new library
import { Recipe, Ingredient, Instruction } from '@prisma/client';

type FullRecipe = Recipe & { ingredients: Ingredient[]; instructions: Instruction[] };

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY'); // Use the new key
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in the environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generates recipe improvement suggestions using the Google Gemini API.
   * @param recipe The full recipe object with ingredients and instructions.
   * @returns A string containing AI-generated suggestions.
   */
  async getRecipeSuggestions(recipe: FullRecipe): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' }); 
    const prompt = this.buildPrompt(recipe);

    try {
      this.logger.log(`Sending prompt for recipe "${recipe.title}" to Gemini...`);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      this.logger.log(`Received response from Gemini.`);
      return text.trim();

    } catch (error) {
      this.logger.error('Error fetching suggestions from Gemini API', error.stack);
      // Check for safety ratings blocks
      if (error.response && error.response.promptFeedback) {
        this.logger.error('Prompt was blocked due to:', error.response.promptFeedback.blockReason);
        throw new Error('The recipe prompt was blocked for safety reasons. Please adjust the recipe content.');
      }
      throw new Error('Failed to get AI suggestions at this time. Please try again later.');
    }
  }

  /**
   * Constructs a detailed prompt for the Gemini model.
   * @param recipe The recipe to build the prompt for.
   * @returns A formatted string to be used as the prompt.
   */
  private buildPrompt(recipe: FullRecipe): string {
    const ingredientsList = recipe.ingredients.map(i => `- ${i.quantity} of ${i.name}`).join('\n');
    const instructionsList = recipe.instructions.map(i => `${i.stepNumber}. ${i.text}`).join('\n');

    // The prompt is slightly adjusted. Gemini responds well to direct instructions and role-playing.
    return `
      **Role:** You are a world-class culinary expert and food critic named "Chef Connect".
      **Task:** Analyze the following recipe and provide three actionable suggestions for improvement. Respond in clear, well-formatted markdown.

      **Recipe to Analyze:**

      **Title:** ${recipe.title}
      **Cuisine:** ${recipe.cuisine}
      **Difficulty:** ${recipe.difficulty}
      **Description:** ${recipe.description}

      ---
      **Ingredients:**
      ${ingredientsList}

      ---
      **Instructions:**
      ${instructionsList}
      ---

      **Your Suggestions:**

      Format your response under the heading "### Chef Connect's Suggestions".
      Your suggestions must cover the following three categories, one for each:
      1.  **Flavor Enhancement:** A tip to make the dish more delicious (e.g., adding a new ingredient, a technique).
      2.  **Ingredient Substitution:** A healthy or alternative ingredient swap.
      3.  **Presentation Tip:** A suggestion on how to plate or serve the dish beautifully.
    `;
  }
}