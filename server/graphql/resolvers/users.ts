import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql';
import validator from 'validator';

import { Recipe, User } from '../models';
import {
  changePassword,
  createUser,
  editUser,
  getAllUser,
  getUserById,
  getUserByUserName,
  loginUser,
  resetPassword,
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
    // SET NEW PASSWORD
    setNewPassword: async (_, { token, newPassword }) => {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      if (!validator.isLength(newPassword, { min: 5, max: 20 })) {
        throw new Error('Password must be at least 5, maximum 20 characters');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return true;
    },
    // DELETE USER
    async deleteUser(_, { id }) {
      const wasDeleted = await User.deleteOne({ _id: id });
      if (!wasDeleted) {
        throw new GraphQLError('User not found.', {
          extensions: {
            code: 401,
          },
        });
      }
      return wasDeleted.deletedCount; // 1 if deleted, 0 if not
    },
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
