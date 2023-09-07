import { model, Schema } from 'mongoose';

const recipeSchema = new Schema({
  title: String,
  description: String,
  createdAt: String,
  createdBy: String,
});

export const Recipe = model('Recipe', recipeSchema);
