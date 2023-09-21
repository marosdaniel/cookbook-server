import { model, Schema } from 'mongoose';

export interface IIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}
export interface IRecipe {
  id: string;
  title: string;
  description?: string;
  instructions: string;
  ingredients: IIngredient[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  author: { type: typeof Schema.Types.ObjectId; ref: string };
}
const recipeSchema = new Schema<IRecipe>({
  id: String,
  title: { type: String, required: true },
  description: String,
  instructions: { type: String, required: true },
  ingredients: [{ name: String, quantity: Number, unit: String }],
  createdAt: String,
  createdBy: { type: String, required: true },
  updatedAt: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const Recipe = model('Recipe', recipeSchema);
