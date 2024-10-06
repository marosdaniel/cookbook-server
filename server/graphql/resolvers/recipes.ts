import { Metadata, Recipe, User } from '../models';
import { EUserRoles } from '../models/User';
import throwCustomError, { ErrorTypes } from '../../helpers/error-handler.helper';
import {
  getRecipeById,
  getRecipes,
  getRecipesByTitle,
  getRecipesByUserId,
  getRecipesByUserName,
  createRecipe,
  editRecipe,
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

    async deleteRecipe(_, { id }, context) {
      const user = await User.findById(context.userId);
      if (!user) {
        throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
      }

      const wasDeleted = await Recipe.deleteOne({ _id: id });
      if (wasDeleted.deletedCount === 0) {
        throw new Error('Recipe not found');
      }

      await User.updateMany({}, { $pull: { favoriteRecipes: id } });

      return wasDeleted.deletedCount;
    },

    async deleteAllRecipes(_, {}, context) {
      const user = await User.findById(context.userId);
      if (!user) {
        throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
      }

      if (user.role !== EUserRoles.ADMIN) {
        throwCustomError('You have no rights to do that operation', ErrorTypes.UNAUTHENTICATED);
      }

      const res = await Recipe.deleteMany({});
      return res.deletedCount;
    },
  },
};

export default recipeResolvers;
