import { Recipe, Rating, User } from '../../../models';
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

  let favoriteRecipesIds: string[] = [];
  if (userId) {
    const loggedInUser = await User.findById(userId).select('favoriteRecipes').lean();
    if (loggedInUser) {
      favoriteRecipesIds = loggedInUser.favoriteRecipes.map(favRecipeId => favRecipeId.toString());
    }
  }

  const recipesWithRatingsAndFavorites = await Promise.all(
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

      const isFavorite = favoriteRecipesIds.includes(recipe._id.toString());

      return {
        ...recipe,
        averageRating,
        ratingsCount,
        userRating,
        isFavorite,
      };
    }),
  );

  return { recipes: recipesWithRatingsAndFavorites, totalRecipes };
};