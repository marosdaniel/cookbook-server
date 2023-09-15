import { model, Schema } from 'mongoose';

// not sure if it is necessary to define the interface
interface IRecipe {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  author: { type: typeof Schema.Types.ObjectId; ref: string };
}
const recipeSchema = new Schema<IRecipe>({
  id: String,
  title: { type: String, required: true },
  description: String,
  createdAt: String,
  createdBy: { type: String, required: true },
  updatedAt: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const Recipe = model('Recipe', recipeSchema);
