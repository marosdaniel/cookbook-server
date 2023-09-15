import { Recipe, User } from '../models';
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
      const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(limit);
      if (!recipes) {
        throw new Error('Recipes not found');
      }
      return recipes;
    },
    async getRecipesByTitle(_, { title, limit }: { title: string; limit: number }) {
      const recipes = await Recipe.find({ title: { $regex: new RegExp(title, 'i') } })
        .sort({ createdAt: -1 })
        .limit(limit);
      if (!recipes || recipes.length === 0) {
        throw new Error('Recipes not found');
      }
      return recipes;
    },
  },
  Mutation: {
    async createRecipe(_, { recipeCreateInput: { title, description } }, context) {
      try {
        const user = await User.findById(context.userId);
        if (!user) {
          throwCustomError('Unauthenticated operation', ErrorTypes.UNAUTHENTICATED);
        }
        const newDate = new Date().toISOString();
        const newRecipe = new Recipe({
          title,
          description,
          createdBy: user.userName,
          createdAt: newDate,
          updatedAt: newDate,
        });
        const res = await newRecipe.save();
        user.recipes.push(res);
        const res2 = await user.save();
        console.log('res2', res2);
        return res;
      } catch (error) {
        throw new Error(error);
      }
    },

    async editRecipe(_, { id, recipeEditInput: { title, description } }, context) {
      const user = await User.findById(context.userId);
      if (!user) {
        throwCustomError('Unauthenticated operation', ErrorTypes.UNAUTHENTICATED);
      }

      const res = await Recipe.findByIdAndUpdate(
        id,
        { title, description, updatedAt: new Date().toISOString() },
        { new: true },
      );
      if (!res) {
        throw new Error('Recipe not found');
      }
      return res.toObject();
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
      return wasDeleted.deletedCount; // 1 if deleted, 0 if not
    },
    async deleteAllRecipes() {
      const res = await Recipe.deleteMany({});
      return res.deletedCount;
    },
  },
};

export default recipeResolvers;
