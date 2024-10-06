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

    async editRecipe(
      _,
      {
        id,
        recipeEditInput: {
          title,
          description,
          ingredients,
          preparationSteps,
          category,
          imgSrc,
          labels,
          cookingTime,
          difficultyLevel,
          servings,
          youtubeLink,
        },
      },
      context,
    ) {
      try {
        const user = await User.findById(context._id);
        if (!user) {
          throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
        }

        const existingRecipe = await Recipe.findById(id);
        if (!existingRecipe) {
          throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
        }

        if (existingRecipe.createdBy !== user.userName) {
          throwCustomError('You have no rights to do that operation', ErrorTypes.UNAUTHENTICATED);
        }

        if (
          !title ||
          !description ||
          !ingredients ||
          !preparationSteps ||
          !cookingTime ||
          !category ||
          !difficultyLevel ||
          !servings
        ) {
          throwCustomError('All fields are required', ErrorTypes.BAD_REQUEST);
        }

        const labelsFromDb = await Metadata.find({ key: { $in: labels.map(label => label.value) } });
        const categoryFromDb = await Metadata.findOne({ key: category.value });
        const difficultyLevelFromDb = await Metadata.findOne({ key: difficultyLevel.value });

        const updatedFields = {
          title,
          description,
          ingredients,
          preparationSteps,
          updatedAt: new Date(),
          category: categoryFromDb,
          labels: labelsFromDb,
          imgSrc,
          cookingTime,
          difficultyLevel: difficultyLevelFromDb,
          servings,
          youtubeLink,
        };

        const updatedRecipe = await Recipe.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });

        return updatedRecipe;
      } catch (error) {
        throw new Error(error);
      }
    },

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
