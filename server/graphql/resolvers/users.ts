import { GraphQLError } from 'graphql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';

import { generateResetToken, sendPasswordResetEmail } from '../../helpers/email';
import { Recipe, User } from '../models';
import { EUserRoles } from '../models/User';
import {
  TRequestPasswordReset,
  TGetUserById,
  TUserRegisterInput,
  TGetAllUserInput,
  TGetUserByNameInput,
} from './types';

const userResolvers = {
  Query: {
    async getUserById(_, { id }: TGetUserById) {
      const user = await User.findById(id).populate('favoriteRecipes').populate('recipes');
      if (!user) {
        throw new GraphQLError('User not found.', {
          extensions: {
            code: 401,
          },
        });
      }
      return user;
    },
    async getUserByUserName(_, { userName }: TGetUserByNameInput) {
      const user = await User.findOne({ userName }).populate('favoriteRecipes').populate('recipes');

      if (!user) {
        throw new GraphQLError('User not found.', {
          extensions: {
            code: 401,
          },
        });
      }
      return user;
    },
    async getAllUser(_, { limit }: TGetAllUserInput) {
      const users = await User.find().sort({ createdAt: -1 }).limit(limit);
      if (!users || users.length === 0) {
        throw new GraphQLError('User not found.', {
          extensions: {
            code: 401,
          },
        });
      }
      return users;
    },
  },
  Mutation: {
    async createUser(_, { userRegisterInput: { firstName, lastName, userName, email, password } }: TUserRegisterInput) {
      if (!firstName || !lastName || !userName || !email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (!validator.isEmail(email)) {
        throw new Error('Invalid email');
      }

      if (!validator.isLength(password, { min: 5, max: 20 })) {
        throw new Error('Password must be at least 5, maximum 20 characters');
      }

      if (!validator.isLength(userName, { min: 3, max: 20 })) {
        throw new Error('Password must be at least 5, maximum 20 characters');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userNameRegex = /^[a-zA-Z0-9]+$/;
      if (!userNameRegex.test(userName)) {
        throw new Error('Invalid username');
      }

      let userExists = await User.findOne({ email });

      if (userExists) {
        throw new Error('Email is already in use');
      }

      userExists = await User.findOne({ userName });

      if (userExists) {
        throw new Error('Username is already in use');
      }

      try {
        const newDate = new Date().toISOString();
        const newUser = new User({
          firstName,
          lastName,
          userName,
          email,
          password: hashedPassword,
          createdAt: newDate,
          locale: 'en-GB',
          recipes: [],
          favoriteRecipes: [],
          role: EUserRoles.USER,
        });
        const res = await newUser.save();
        return res;
      } catch (error) {
        console.error('Error while creating user:', error);
        throw new Error('Could not create user');
      }
    },
    async loginUser(_, { userLoginInput: { userNameOrEmail, password } }) {
      const user = await User.findOne({ $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }] });

      if (!user) {
        throw new GraphQLError('Invalid user.', {
          extensions: {
            code: 401,
          },
        });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        throw new GraphQLError('Invalid password.', {
          extensions: {
            code: 401,
          },
        });
      }

      const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_PRIVATE_KEY, { expiresIn: '30d' });

      return {
        token,
        user,
        userId: user._id.toString(),
      };
    },
    // EDIT USER
    async editUser(_, { id, userEditInput }) {
      try {
        const user = await User.findById(id);

        if (!user) {
          throw new GraphQLError('User not found.', {
            extensions: {
              code: 401,
            },
          });
        }

        Object.assign(user, userEditInput);

        // mongoose pre-save hook will hash the password if it was changed
        await user.save();

        return user;
      } catch (error) {
        console.error('Error while editing user:', error);
        throw new GraphQLError('Could not edit user.', {
          extensions: {
            code: 401,
          },
        });
      }
    },
    // CHANGE PASSWORD
    async changePassword(_, { id, passwordEditInput }) {
      const { currentPassword, newPassword, confirmNewPassword } = passwordEditInput;

      const user = await User.findById(id).populate('favoriteRecipes').populate('recipes');

      if (!user) {
        throw new GraphQLError('User not found.', {
          extensions: {
            code: 401,
          },
        });
      }

      if (!currentPassword || !newPassword || !confirmNewPassword) {
        throw new Error('Please fill in all fields');
      }

      if (newPassword !== confirmNewPassword) {
        throw new Error('Passwords do not match');
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new Error('Invalid password');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return true;
    },
    // RESET PASSWORD
    resetPassword: async (_, { email }: TRequestPasswordReset) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = generateResetToken();
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1);

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      await user.save();

      sendPasswordResetEmail(user.email, user.resetPasswordToken);

      return true;
    },
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
