import { Types } from 'mongoose';
import { IRecipe } from '../../../../graphql/models/Recipe';
import { User, Recipe } from '../../../../graphql/models';
import { throwCustomError } from '../../../../helpers/error-handler.helper';
import { IContext } from '../../../../context/types';
import { IGetFavoriteRecipes } from './types';

export const getFavoriteRecipes = async (
  _: any,
  { userId, limit }: IGetFavoriteRecipes,
  context: IContext,
): Promise<IRecipe[] | []> => {
  const currentUser = context;

  if (!currentUser || (currentUser._id.toString() !== userId && currentUser.role !== 'ADMIN')) {
    throwCustomError('Unauthorized operation - insufficient permissions', {
      errorCode: 'UNAUTHORIZED',
      errorStatus: 403,
    });
  }

  const user = await User.findById(new Types.ObjectId(userId));
  if (!user) {
    throwCustomError('User not found', { errorCode: 'USER_NOT_FOUND', errorStatus: 404 });
  }

  if (!user.favoriteRecipes || user.favoriteRecipes.length === 0) {
    return [];
  }

  const favoriteRecipes = await Recipe.find({
    _id: { $in: user.favoriteRecipes },
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  return favoriteRecipes;
};
