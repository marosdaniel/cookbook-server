import { Recipe, Rating } from '../../../models';
import { IContext } from '../../../../context/types';
import { getRatingsStats } from '../../rating/utils';
import { IGetRecipes } from './types';

export const getRecipes = async (_: any, { limit }: IGetRecipes, context: IContext) => {
  const totalRecipes = await Recipe.countDocuments();

  const recipes = await Recipe.find().sort({ createdAt: -1 }).limit(limit).lean();

  if (!recipes || recipes.length === 0) {
    throw new Error('Recipes not found');
  }

  const userId = context._id;

  const recipesWithRatings = await Promise.all(
    recipes.map(async recipe => {
      const { averageRating, ratingsCount } = await getRatingsStats(recipe._id.toString());

      let userRating = null;
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
