import { Recipe } from '../../models/Recipe';
import { Rating } from '../../models/Rating';

export const getRatingsStats = async (recipeId: string) => {
  const ratingsStats = await Rating.aggregate([
    { $match: { recipeId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$ratingValue' },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  if (ratingsStats.length > 0) {
    return {
      averageRating: ratingsStats[0].averageRating || 0,
      ratingsCount: ratingsStats[0].ratingsCount || 0,
    };
  } else {
    return {
      averageRating: 0,
      ratingsCount: 0,
    };
  }
};

export const updateRecipeRatingStats = async (recipeId: string) => {
  const ratingsStats = await Rating.aggregate([
    { $match: { recipeId: recipeId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$ratingValue' },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = ratingsStats.length > 0 ? ratingsStats[0].averageRating : 0;
  const ratingsCount = ratingsStats.length > 0 ? ratingsStats[0].ratingsCount : 0;

  await Recipe.findByIdAndUpdate(recipeId, { averageRating, ratingsCount });
};
