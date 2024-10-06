interface IRecipeInput {
  title: string;
  description: string;
  ingredients: any[];
  preparationSteps: any[];
  category: { value: string };
  imgSrc: string;
  labels: { value: string }[];
  cookingTime: number;
  difficultyLevel: { value: string };
  servings: number;
  youtubeLink: string;
}

export interface ICreateRecipe {
  recipeCreateInput: IRecipeInput;
}

export interface IEditRecipe {
  id: string;
  recipeEditInput: IRecipeInput;
}
