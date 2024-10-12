import { Types } from 'mongoose';
import { User, Recipe } from '../../../../graphql/models';
import { throwCustomError } from '../../../../helpers/error-handler.helper';
import { IContext } from '../../../../context/types';
import { IOperationResult } from '../../types';

export const addToFavoriteRecipes = async (
  _: any,
  { userId, recipeId }: { userId: string; recipeId: string },
  context: IContext,
): Promise<IOperationResult> => {
  const currentUser = context;

  if (!currentUser || (currentUser._id.toString() !== userId && currentUser.role !== 'ADMIN')) {
    throwCustomError('Unauthorized operation - insufficient permissions', {
      errorCode: 'UNAUTHORIZED',
      errorStatus: 403,
    });
  }

  if (!Types.ObjectId.isValid(userId)) {
    return {
      success: false,
      message: 'Invalid userId format',
      statusCode: 400,
    };
  }

  if (!Types.ObjectId.isValid(recipeId)) {
    return {
      success: false,
      message: 'Invalid recipeId format',
      statusCode: 400,
    };
  }

  const user = await User.findById(new Types.ObjectId(userId));
  if (!user) {
    return {
      success: false,
      message: 'User not found',
      statusCode: 404,
    };
  }

  const recipe = await Recipe.findById(new Types.ObjectId(recipeId));
  if (!recipe) {
    return {
      success: false,
      message: 'Recipe not found',
      statusCode: 404,
    };
  }

  if (user.favoriteRecipes.includes(new Types.ObjectId(recipeId))) {
    return {
      success: false,
      message: 'Recipe already in favorites',
      statusCode: 400,
    };
  }

  user.favoriteRecipes.push(new Types.ObjectId(recipeId));
  await user.save();

  return {
    success: true,
    message: 'Recipe successfully added to favorites',
    statusCode: 200,
  };
};
