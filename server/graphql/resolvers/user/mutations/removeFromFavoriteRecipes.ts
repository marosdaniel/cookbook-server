import { Types } from 'mongoose';
import { User, Recipe } from '../../../../graphql/models';
import { throwCustomError } from '../../../../helpers/error-handler.helper';
import { IContext } from '../../../../context/types';
import { IOperationResult } from '../../types';

export const removeFromFavoriteRecipes = async (
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

  const originalLength = user.favoriteRecipes.length;
  user.favoriteRecipes = user.favoriteRecipes.filter(favoriteRecipeId => favoriteRecipeId.toString() !== recipeId);

  if (originalLength === user.favoriteRecipes.length) {
    return {
      success: false,
      message: 'Recipe was not found in the favorites',
      statusCode: 400,
    };
  }

  await user.save();

  return {
    success: true,
    message: 'Recipe successfully removed from favorites',
    statusCode: 200,
  };
};
