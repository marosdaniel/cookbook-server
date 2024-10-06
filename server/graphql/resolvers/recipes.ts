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

const recipeResolvers = {
  Query: {
    getRecipeById,
    getRecipesByTitle,
    getRecipes,
    getRecipesByUserName,
    getRecipesByUserId,
    // async getFavoriteRecipes(_, { userId, limit }: { userId: string; limit: number }) {
    //   const user = await User.findById(userId).populate({
    //     path: 'favoriteRecipes',
    //     options: { sort: { createdAt: -1 }, limit },
    //   });
    //   if (!user) {
    //     throw new Error('User not found');
    //   }
    //   return user.favoriteRecipes;
    // },
  },
  Mutation: {
    createRecipe,
    editRecipe,
    deleteRecipe,
    deleteAllRecipes,
  },
};

export default recipeResolvers;
