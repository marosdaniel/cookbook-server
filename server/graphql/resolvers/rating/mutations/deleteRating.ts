import { Rating, Recipe } from '../../../../graphql/models';
import { IContext } from '../../../../context/types';
import { throwCustomError, ErrorTypes } from '../../../../helpers/error-handler.helper';

import { updateRecipeRatingStats } from '../utils';
import { IDeleteRecipe } from './types';

export const deleteRating = async (_: any, { recipeId }: IDeleteRecipe, context: IContext) => {
  const userId = context._id;
  if (!userId) {
    throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
  }

  const rating = await Rating.findOneAndDelete({ recipeId, userId });

  if (!rating) {
    throwCustomError('Rating not found', ErrorTypes.NOT_FOUND);
  }

  await updateRecipeRatingStats(recipeId);

  const updatedRecipe = await Recipe.findById(recipeId).lean();
  return updatedRecipe;
};
