import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import validator from 'validator';

import { Recipe, User } from '../models';
import {
  changePassword,
  createUser,
  deleteUser,
  editUser,
  getAllUser,
  getUserById,
  getUserByUserName,
  loginUser,
  resetPassword,
  setNewPassword,
} from './user';

const userResolvers = {
  Query: {
    getUserById,
    getUserByUserName,
    getAllUser,
  },
  Mutation: {
    createUser,
    loginUser,
    editUser,
    changePassword,
    resetPassword,
    setNewPassword,
    deleteUser,
    // DELETE ALL USERS
    async deleteAllUser() {
      const res = await User.deleteMany({});
      return res.deletedCount;
    },
    // ADD TO FAVORITE RECIPES
    addToFavoriteRecipes: async (_, { userId, recipeId }) => {
      const user = await User.findById(userId);
      if (!user) {
        throw new GraphQLError('User not found.', {
          extensions: {
            code: 401,
          },
        });
      }

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      if (user.favoriteRecipes.includes(recipeId)) {
        throw new Error('Recipe has already been added to favorites');
      }

      user.favoriteRecipes.push(recipeId);
      await user.save();

      return user;
    },
    // REMOVE FROM FAVORITE RECIPES
    removeFromFavoriteRecipes: async (_, { userId, recipeId }) => {
      // TO BE VERIFIED
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      user.favoriteRecipes = user.favoriteRecipes.filter(favoriteRecipe => favoriteRecipe.id.toString() !== recipeId);
      await user.save();

      return user;
    },
  },
};

export default userResolvers;
