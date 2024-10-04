import { Recipe, Rating } from '../../../models';
import { IContext } from '../../../../context/types';

export const getRecipes = async (_: any, { limit }: { limit: number }, context: IContext) => {
  const totalRecipes = await Recipe.countDocuments();

  const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(limit).lean();

  if (!recipes || recipes.length === 0) {
    throw new Error('Recipes not found');
  }

  const userId = context._id;

  const recipesWithRatings = await Promise.all(
    recipes.map(async recipe => {
      const ratings = await Rating.find({ recipeId: recipe._id });

      let averageRating = 0.0;
      let ratingsCount = 0;
      let userRating = null;

      if (ratings.length > 0) {
        ratingsCount = ratings.length;
        const totalRating = ratings.reduce((sum, rating) => sum + rating.ratingValue, 0);
        averageRating = totalRating / ratingsCount;
      }

      if (userId) {
        const userRatingRecord = await Rating.findOne({
          recipeId: recipe._id,
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
    }),
  );

  return { recipes: recipesWithRatings, totalRecipes };
};
