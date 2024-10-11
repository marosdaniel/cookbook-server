import { IContext } from '../../../../context/types';
import { Recipe } from '../../../models/Recipe';
import { Rating } from '../../../models/Rating';
import { User } from '../../../models/User';
import { getRatingsStats } from '../../rating/utils';
import { IGetRecipesByUserId } from './types';

export const getRecipesByUserId = async (_: any, { userId, limit }: IGetRecipesByUserId, context: IContext) => {
  const totalRecipes = await Recipe.countDocuments({ createdBy: userId });

  const recipes = await Recipe.find({ createdBy: userId }).sort({ createdAt: -1 }).limit(limit).lean();

  if (!recipes || recipes.length === 0) {
    throw new Error('Recipes not found for this user');
  }

  const loggedInUserId = context._id;

  let favoriteRecipesIds: string[] = [];
  if (loggedInUserId) {
    const loggedInUser = await User.findById(loggedInUserId).select('favoriteRecipes').lean();
    if (loggedInUser) {
      favoriteRecipesIds = loggedInUser.favoriteRecipes.map(favRecipeId => favRecipeId.toString());
    }
  }

  const recipesWithRatingsAndFavorites = await Promise.all(
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
