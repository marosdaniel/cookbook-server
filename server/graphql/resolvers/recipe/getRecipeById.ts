import { IContext } from 'server/context/types';
import { Recipe, Rating } from '../../models';

interface IGetRecipeById {
  _id: string;
}

export const getRecipeById = async (_: any, { _id }: IGetRecipeById, context: IContext) => {
  const recipe = await Recipe.findById(_id).lean();
  if (!recipe) {
    throw new Error('Recipe not found');
  }

  let userRating = null;
  let averageRating = 0.0;
  let ratingsCount = 0;

  const userId = context._id;

  const ratings = await Rating.find({ recipeId: _id });

  if (ratings.length > 0) {
    ratingsCount = ratings.length;
    const totalRating = ratings.reduce((sum, rating) => sum + rating.ratingValue, 0);
    averageRating = totalRating / ratingsCount;
  }

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
