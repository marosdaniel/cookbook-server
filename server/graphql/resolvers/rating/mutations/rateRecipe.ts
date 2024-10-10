import { Rating, Recipe } from '../../../../graphql/models';
import { IContext } from '../../../../context/types';
import { throwCustomError, ErrorTypes } from '../../../../helpers/error-handler.helper';
import { updateRecipeRatingStats } from '../utils';
import { IRateRecipe } from './types';

export const rateRecipe = async (_: any, { ratingInput }: IRateRecipe, context: IContext) => {
  const userId = context._id;
  if (!userId) {
    throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
  }

  const existingRating = await Rating.findOne({ recipeId: ratingInput.recipeId, userId });

  if (existingRating) {
    existingRating.ratingValue = ratingInput.ratingValue;
    await existingRating.save();
  } else {
    const newRating = new Rating({
      recipeId: ratingInput.recipeId,
      userId,
      ratingValue: ratingInput.ratingValue,
    });
    await newRating.save();
  }

  await updateRecipeRatingStats(ratingInput.recipeId);

  const updatedRecipe = await Recipe.findById(ratingInput.recipeId).lean();
  return updatedRecipe;
};
