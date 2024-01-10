import { model, Schema } from 'mongoose';

enum TMetadataType {
  LEVEL = 'level',
  CATEGORY = 'category',
  UNIT = 'unit',
  LABEL = 'label',
}

export interface IIngredient {
  _id: string;
  localId: string;
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
  label: string;
  type: TMetadataType.CATEGORY;
};

type TDifficultyLevel = {
  key: string;
  label: string;
  name: string;
  type: TMetadataType.LEVEL;
};

type TLabel = {
  key: string;
  name: string;
  label: string;
  type: TMetadataType.LABEL;
};

const categorySchema = new Schema({
  name: String,
  key: String,
  label: String,
  type: String,
});

const difficultyLevelSchema = new Schema({
  name: String,
  key: String,
  label: String,
  type: String,
});

const labelSchema = new Schema({
  name: String,
  key: String,
  label: String,
  type: String,
});

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
  category: TCategory;
  imgSrc?: string;
  cookingTime: number;
  difficultyLevel: TDifficultyLevel;
  labels?: TLabel[];
}

const recipeSchema = new Schema<IRecipe>({
  id: String,
  title: { type: String, required: true },
  description: String,
  preparationSteps: [{ description: String, order: Number }],
  ingredients: [{ name: String, quantity: Number, unit: String, localId: String }],
  createdAt: String,
  createdBy: { type: String, required: true },
  updatedAt: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  category: categorySchema,
  imgSrc: String,
  cookingTime: { type: Number, required: true },
  difficultyLevel: difficultyLevelSchema,
  labels: [labelSchema],
});

export const Recipe = model('Recipe', recipeSchema);
