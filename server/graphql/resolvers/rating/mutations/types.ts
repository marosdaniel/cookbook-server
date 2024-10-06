export interface IRateRecipe {
  ratingInput: { recipeId: string; ratingValue: number };
}

export interface IDeleteRecipe {
  recipeId: string;
}
