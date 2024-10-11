import {
  getRecipeById,
  getRecipes,
  getRecipesByTitle,
  getRecipesByUserId,
  getRecipesByUserName,
  createRecipe,
  editRecipe,
  deleteRecipe,
  deleteAllRecipes,
} from './recipe';
import { getFavoriteRecipes } from './user';

const recipeResolvers = {
  Query: {
    getRecipeById,
    getRecipesByTitle,
    getRecipes,
    getRecipesByUserName,
    getRecipesByUserId,
    getFavoriteRecipes,
  },
  Mutation: {
    createRecipe,
    editRecipe,
    deleteRecipe,
    deleteAllRecipes,
  },
};

export default recipeResolvers;
