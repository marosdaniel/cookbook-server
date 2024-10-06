import { IContext } from '../../../../context/types';
import { Recipe, Rating } from '../../../models';
import { getRatingsStats } from '../../rating/utils';
import { IGetRecipesByTitle } from './types';

export const getRecipesByTitle = async (_: any, { title, limit }: IGetRecipesByTitle, context: IContext) => {
  const totalRecipes = await Recipe.countDocuments({
    title: { $regex: new RegExp(title, 'i') },
  });

  const recipes = await Recipe.find({ title: { $regex: new RegExp(title, 'i') } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

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
