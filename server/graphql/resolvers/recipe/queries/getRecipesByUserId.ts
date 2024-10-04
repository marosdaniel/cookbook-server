import { IContext } from '../../../../context/types';
import { Recipe } from '../../../models/Recipe';
import { Rating } from '../../../models/Rating';

export const getRecipesByUserId = async (
  _: any,
  { userId, limit }: { userId: string; limit: number },
  context: IContext,
) => {
  const totalRecipes = await Recipe.countDocuments({ createdBy: userId });

  const recipes = await Recipe.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(limit).lean();

  if (!recipes || recipes.length === 0) {
    throw new Error('Recipes not found for this user');
  }

  const loggedInUserId = context._id;

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

      if (loggedInUserId) {
        const userRatingRecord = await Rating.findOne({
          recipeId: recipe._id,
          userId: loggedInUserId,
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
