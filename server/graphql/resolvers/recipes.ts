import { Recipe } from '../models';

const recipeResolvers = {
  Query: {
    async recipe(_, { id }) {
      return await Recipe.findById(id);
    },
    async getRecipes(_, { limit }) {
      return await Recipe.find().sort({ createdAt: -1 }).limit(limit);
    },
  },
  Mutation: {
    async createRecipe(_, { recipeInput: { title, description, createdBy } }) {
      const newDate = new Date().toISOString();
      const newRecipe = new Recipe({
        title,
        description,
        createdBy,
        createdAt: newDate,
        updatedAt: newDate,
      });
      const res = await newRecipe.save();
      return {
        ...res.toObject(),
        id: res.id,
      };
    },
    async editRecipe(_, { id, recipeEditInput: { title, description } }) {
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
    async deleteRecipe(_, { id }) {
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
