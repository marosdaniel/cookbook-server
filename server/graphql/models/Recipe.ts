import { model, ObjectId, Schema } from 'mongoose';

enum TMetadataType {
  LEVEL = 'level',
  CATEGORY = 'category',
  UNIT = 'unit',
  LABEL = 'label',
}

export interface IIngredient {
  _id: ObjectId;
  localId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface IPreparationStep {
  _id: ObjectId;
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

export interface IRecipe {
  id: string;
  title: string;
  description?: string;
  preparationSteps: IPreparationStep[];
  ingredients: IIngredient[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  author: { type: typeof Schema.Types.ObjectId; ref: string };
  category: TCategory;
  imgSrc?: string;
  cookingTime: number;
  difficultyLevel: TDifficultyLevel;
  labels?: TLabel[];
  servings: number;
  youtubeLink?: string;
}

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

const ingredientSchema = new Schema<IIngredient>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  localId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
});

const preparationStepSchema = new Schema<IPreparationStep>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
});

const recipeSchema = new Schema<IRecipe>({
  id: String,
  title: { type: String, required: true },
  description: String,
  preparationSteps: [preparationStepSchema],
  ingredients: [ingredientSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  category: categorySchema,
  imgSrc: String,
  cookingTime: { type: Number, required: true },
  difficultyLevel: difficultyLevelSchema,
  labels: [labelSchema],
  servings: { type: Number, default: 1 },
  youtubeLink: String,
});

recipeSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Recipe = model('Recipe', recipeSchema);
