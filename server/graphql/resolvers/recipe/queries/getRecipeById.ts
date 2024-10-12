import { IContext } from '../../../../context/types';
import { Recipe, Rating, User } from '../../../models';
import { throwCustomError } from '../../../../helpers/error-handler.helper';
import { getRatingsStats } from '../../rating/utils';
import { IGetRecipeById } from './types';

export const getRecipeById = async (_: any, { _id }: IGetRecipeById, context: IContext) => {
  const recipe = await Recipe.findById(_id).lean();
  if (!recipe) {
    throwCustomError('Recipe not found', {
      errorCode: 'NOT_FOUND',
      errorStatus: 404,
    });
  }

  const { averageRating, ratingsCount } = await getRatingsStats(_id);

  let userRating = null;
  let isFavorite = false;

  const userId = context._id;

  if (userId) {
    const userRatingRecord = await Rating.findOne({
      recipeId: _id,
      userId: userId,
    });

    if (userRatingRecord) {
      userRating = userRatingRecord.ratingValue;
    }

    const loggedInUser = await User.findById(userId).select('favoriteRecipes').lean();
    if (loggedInUser && loggedInUser.favoriteRecipes) {
      isFavorite = loggedInUser.favoriteRecipes.some(favRecipeId => favRecipeId.toString() === _id.toString());
    }
  }

  return {
    ...recipe,
    averageRating,
    ratingsCount,
    userRating,
    isFavorite,
  };
};
