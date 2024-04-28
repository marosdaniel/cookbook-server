import { Recipe, User } from '../models';
import { EUserRoles } from '../models/User';
import throwCustomError, { ErrorTypes } from '../../helpers/error-handler.helper';

const recipeResolvers = {
  Query: {
    async getRecipeById(_, { _id }: { _id: string }) {
      const recipe = await Recipe.findById(_id);
      if (!recipe) {
        throw new Error('Recipe not found');
      }
      return recipe;
    },
    async getRecipes(_, { limit }: { limit: number }) {
      const totalRecipes = await Recipe.countDocuments();
      const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(limit);
      if (!recipes) {
        throw new Error('Recipes not found');
      }
      return { recipes, totalRecipes };
    },
    async getRecipesByTitle(_, { title, limit }: { title: string; limit: number }) {
      const totalRecipes = await Recipe.countDocuments();
      const recipes = await Recipe.find({ title: { $regex: new RegExp(title, 'i') } })
        .sort({ createdAt: -1 })
        .limit(limit);
      if (!recipes || recipes.length === 0) {
        throw new Error('Recipes not found');
      }
      return { recipes, totalRecipes };
    },
    async getRecipesByUserName(_, { userName, limit }: { userName: string; limit: number }) {
      const totalRecipes = await Recipe.countDocuments({ createdBy: userName });
      const recipes = await Recipe.find({ createdBy: userName }).sort({ createdAt: -1 }).limit(limit);

      if (!recipes || recipes.length === 0) {
        throw new Error('Recipes not found for this user');
      }

      return { recipes, totalRecipes };
    },
    async getRecipesByUserId(_, { userId, limit }: { userId: string; limit: number }) {
      const totalRecipes = await Recipe.countDocuments({ createdBy: userId });
      const recipes = await Recipe.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(limit);

      if (!recipes || recipes.length === 0) {
        throw new Error('Recipes not found for this user');
      }

      return { recipes, totalRecipes };
    },
  },
  Mutation: {
    async createRecipe(
      _,
      {
        recipeCreateInput: {
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
      if (
        !title ||
        !description ||
        !ingredients ||
        !preparationSteps ||
        !category ||
        !cookingTime ||
        !difficultyLevel ||
        !servings
      ) {
        throwCustomError('All fields are required', ErrorTypes.BAD_REQUEST);
      }
      try {
        const user = await User.findById(context._id);
        if (!user) {
          throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
        }
        const newDate = new Date().toISOString();
        const newRecipe = new Recipe({
          title,
          description,
          ingredients,
          preparationSteps,
          createdBy: user.userName,
          createdAt: newDate,
          updatedAt: newDate,
          category,
          imgSrc,
          labels,
          cookingTime,
          difficultyLevel,
          servings,
          youtubeLink,
        });

        const res = await newRecipe.save();

        user.recipes.push(res);
        await user.save();

        return res;
      } catch (error) {
        throw new Error(error);
      }
    },

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

        const updatedFields = {
          title,
          description,
          ingredients,
          preparationSteps,
          updatedAt: new Date().toISOString(),
          category,
          labels,
          imgSrc,
          cookingTime,
          difficultyLevel,
          servings,
          youtubeLink,
        };

        const updatedRecipe = await Recipe.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });

        const usersToUpdate = await User.find({ 'favoriteRecipes._id': id });
        await Promise.all(
          usersToUpdate.map(async userToUpdate => {
            const updatedFavoriteRecipes = userToUpdate.favoriteRecipes.map(favoriteRecipe => {
              return favoriteRecipe.id.toString() === id ? { ...favoriteRecipe, ...updatedFields } : favoriteRecipe;
            });

            userToUpdate.favoriteRecipes = updatedFavoriteRecipes;
            await userToUpdate.save();
          }),
        );

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
      if (!wasDeleted) {
        throw new Error('Recipe not found');
      }

      // TODO: remove recipe from user's favorite recipes
      // to be verified
      await User.updateMany({}, { $pull: { favoriteRecipes: id } });

      return wasDeleted.deletedCount; // 1 if deleted, 0 if not
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
