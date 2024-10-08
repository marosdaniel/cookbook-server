import { IContext } from 'server/context/types';
import { Recipe, Rating } from '../../../models';
import { getRatingsStats } from '../../rating/utils';
import { IGetRecipeById } from './types';
import { throwCustomError } from '../../../../helpers/error-handler.helper';

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
  const userId = context._id;

  if (userId) {
    const userRatingRecord = await Rating.findOne({
      recipeId: _id,
      userId: userId,
    });

    if (userRatingRecord) {
      userRating = userRatingRecord.ratingValue;
    }
  }

  return {
    ...recipe,
    averageRating,
    ratingsCount,
    userRating,
  };
};
