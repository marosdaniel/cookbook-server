import { model, Schema } from 'mongoose';
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

type TCategory = {
  name: string;
  key: string;
};

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
  preparationTime?: number;
  category: TCategory;
  imgSrc?: string;
}

const recipeSchema = new Schema<IRecipe>({
  id: String,
  title: { type: String, required: true },
  description: String,
  preparationSteps: [{ description: String, order: Number }],
  ingredients: [{ name: String, quantity: Number, unit: String }],
  createdAt: String,
  createdBy: { type: String, required: true },
  updatedAt: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  preparationTime: Number,
  category: { name: String, key: String },
  imgSrc: String,
});

export const Recipe = model('Recipe', recipeSchema);
