import { Recipe, User } from '../models';
import throwCustomError, { ErrorTypes } from '../../helpers/error-handler.helper';
import { EUserRoles } from '../models/User';

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
  },
  Mutation: {
    async createRecipe(_, { recipeCreateInput: { title, description, ingredients, preparationSteps } }, context) {
      try {
        const user = await User.findById(context.userId);
        if (!user) {
          throwCustomError('Unauthenticated operation', ErrorTypes.UNAUTHENTICATED);
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
        });

        const res = await newRecipe.save();
        // not needed to save recipe to user
        // user.recipes.push(res);
        // const res2 = await user.save();
        return res;
      } catch (error) {
        throw new Error(error);
      }
    },

    async editRecipe(_, { id, recipeEditInput: { title, description, ingredients, preparationSteps } }, context) {
      try {
        const user = await User.findById(context.userId);
        if (!user) {
          throwCustomError('Unauthenticated operation', ErrorTypes.UNAUTHENTICATED);
        }

        const updatedFields = {
          title,
          description,
          ingredients,
          preparationSteps,
          updatedAt: new Date().toISOString(),
        };

        if (ingredients) {
          const existingRecipe = await Recipe.findById(id);

          const updatedIngredients = existingRecipe.ingredients.map(existingIngredient => {
            const newIngredient = ingredients.find(newIngredient => newIngredient.name === existingIngredient.name);
            return newIngredient || existingIngredient;
          });

          updatedFields.ingredients = updatedIngredients;
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });

        return updatedRecipe;
      } catch (error) {
        throw new Error(error);
      }
    },

    async deleteRecipe(_, { id }, context) {
      const user = await User.findById(context.userId);
      if (!user) {
        throwCustomError('Unauthenticated operation', ErrorTypes.UNAUTHENTICATED);
      }
      const wasDeleted = await Recipe.deleteOne({ _id: id });
      if (!wasDeleted) {
        throw new Error('Recipe not found');
      }

      // remove recipe from user's favorite recipes
      // to be verified
      await User.updateMany({}, { $pull: { favoriteRecipes: id } });

      return wasDeleted.deletedCount; // 1 if deleted, 0 if not
    },
    async deleteAllRecipes(_, {}, context) {
      const user = await User.findById(context.userId);
      if (!user) {
        throwCustomError('Unauthenticated operation', ErrorTypes.UNAUTHENTICATED);
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
