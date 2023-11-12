import mongoose, { model, Schema } from 'mongoose';
export interface IIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface IPreparationStep {
  _id: string;
  description: string;
  order: number;
}
export interface IRecipe {
  id: string;
  title: string;
  description?: string;
  preparationSteps: IPreparationStep[];
  ingredients: IIngredient[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  author: { type: typeof Schema.Types.ObjectId; ref: string };
  prepareTime?: number;
}

const preparationStepSchema = new Schema<IPreparationStep>({
  _id: String,
  description: { type: String, required: true },
  order: { type: Number, required: true },
});

const recipeSchema = new Schema<IRecipe>({
  id: String,
  title: { type: String, required: true },
  description: String,
  preparationSteps: [preparationStepSchema],
  ingredients: [{ name: String, quantity: Number, unit: String }],
  createdAt: String,
  createdBy: { type: String, required: true },
  updatedAt: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  prepareTime: Number,
});

export const PreparationStepModel = mongoose.model<IPreparationStep>('PreparationStep', preparationStepSchema);
export const Recipe = model('Recipe', recipeSchema);
