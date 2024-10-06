import { IContext } from '../../../../context/types';
import { Recipe } from '../../../models/Recipe';
import { Rating } from '../../../models/Rating';
import { getRatingsStats } from '../../rating/utils';
import { IGetRecipesByUserId } from './types';

export const getRecipesByUserId = async (_: any, { userId, limit }: IGetRecipesByUserId, context: IContext) => {
  const totalRecipes = await Recipe.countDocuments({ createdBy: userId });

  const recipes = await Recipe.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(limit).lean();

  if (!recipes || recipes.length === 0) {
    throw new Error('Recipes not found for this user');
  }

  const loggedInUserId = context._id;

  const recipesWithRatings = await Promise.all(
    recipes.map(async recipe => {
      const { averageRating, ratingsCount } = await getRatingsStats(recipe._id.toString());

      let userRating = null;
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
