import { Metadata, Recipe, User } from '../models';
import { EUserRoles } from '../models/User';
import throwCustomError, { ErrorTypes } from '../../helpers/error-handler.helper';
import { Rating } from '../models/Rating';
import { getRecipeById, getRecipesByTitle } from './recipe';

const recipeResolvers = {
  Query: {
    getRecipeById,
    getRecipesByTitle,
    async getRecipes(_, { limit }, context) {
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
    },

    async getRecipesByUserName(_, { userName, limit }, context) {
      const totalRecipes = await Recipe.countDocuments({ createdBy: userName });

      const recipes = await Recipe.find({ createdBy: userName }).sort({ createdAt: -1 }).limit(limit).lean();

      if (!recipes || recipes.length === 0) {
        throw new Error('Recipes not found for this user');
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
    },
    async getRecipesByUserId(_, { userId, limit }, context) {
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
    },
    // async getFavoriteRecipes(_, { userId, limit }: { userId: string; limit: number }) {
    //   const user = await User.findById(userId).populate({
    //     path: 'favoriteRecipes',
    //     options: { sort: { createdAt: -1 }, limit },
    //   });
    //   if (!user) {
    //     throw new Error('User not found');
    //   }
    //   return user.favoriteRecipes;
    // },
  },
  Mutation: {
    async createRecipe(
      _,
      {
        recipeCreateInput: {
          title,
          description,
          ingredients,
          preparationSteps,
          category,
          imgSrc,
          labels,
          cookingTime,
          difficultyLevel,
          servings,
          youtubeLink,
        },
      },
      context,
    ) {
      if (
        !title ||
        !description ||
        !ingredients ||
        !preparationSteps ||
        !category ||
        !cookingTime ||
        !difficultyLevel ||
        !servings
      ) {
        throwCustomError('All fields are required', ErrorTypes.BAD_REQUEST);
      }
      try {
        const user = await User.findById(context._id);
        if (!user) {
          throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
        }

        const labelsFromDb = await Metadata.find({ key: { $in: labels.map(label => label.value) } });
        const categoryFromDb = await Metadata.findOne({ key: category.value });
        const difficultyLevelFromDb = await Metadata.findOne({ key: difficultyLevel.value });

        const newDate = new Date().toISOString();

        const newRecipe = new Recipe({
          title,
          description,
          ingredients,
          preparationSteps,
          createdBy: user.userName,
          createdAt: newDate,
          updatedAt: newDate,
          category: categoryFromDb,
          imgSrc,
          labels: labelsFromDb,
          cookingTime,
          difficultyLevel: difficultyLevelFromDb,
          servings,
          youtubeLink,
          averageRating: 0.0,
          ratingsCount: 0,
        });

        const res = await newRecipe.save();

        user.recipes.push(res);
        await user.save();

        return res;
      } catch (error) {
        throw new Error(error);
      }
    },

    async editRecipe(
      _,
      {
        id,
        recipeEditInput: {
          title,
          description,
          ingredients,
          preparationSteps,
          category,
          imgSrc,
          labels,
          cookingTime,
          difficultyLevel,
          servings,
          youtubeLink,
        },
      },
      context,
    ) {
      try {
        const user = await User.findById(context._id);
        if (!user) {
          throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
        }

        const existingRecipe = await Recipe.findById(id);
        if (!existingRecipe) {
          throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
        }

        if (existingRecipe.createdBy !== user.userName) {
          throwCustomError('You have no rights to do that operation', ErrorTypes.UNAUTHENTICATED);
        }

        if (
          !title ||
          !description ||
          !ingredients ||
          !preparationSteps ||
          !cookingTime ||
          !category ||
          !difficultyLevel ||
          !servings
        ) {
          throwCustomError('All fields are required', ErrorTypes.BAD_REQUEST);
        }

        const labelsFromDb = await Metadata.find({ key: { $in: labels.map(label => label.value) } });
        const categoryFromDb = await Metadata.findOne({ key: category.value });
        const difficultyLevelFromDb = await Metadata.findOne({ key: difficultyLevel.value });

        const updatedFields = {
          title,
          description,
          ingredients,
          preparationSteps,
          updatedAt: new Date(),
          category: categoryFromDb,
          labels: labelsFromDb,
          imgSrc,
          cookingTime,
          difficultyLevel: difficultyLevelFromDb,
          servings,
          youtubeLink,
        };

        const updatedRecipe = await Recipe.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });

        return updatedRecipe;
      } catch (error) {
        throw new Error(error);
      }
    },

    async deleteRecipe(_, { id }, context) {
      const user = await User.findById(context.userId);
      if (!user) {
        throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
      }

      const wasDeleted = await Recipe.deleteOne({ _id: id });
      if (wasDeleted.deletedCount === 0) {
        throw new Error('Recipe not found');
      }

      await User.updateMany({}, { $pull: { favoriteRecipes: id } });

      return wasDeleted.deletedCount;
    },

    async deleteAllRecipes(_, {}, context) {
      const user = await User.findById(context.userId);
      if (!user) {
        throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
      }

      if (user.role !== EUserRoles.ADMIN) {
        throwCustomError('You have no rights to do that operation', ErrorTypes.UNAUTHENTICATED);
      }

      const res = await Recipe.deleteMany({});
      return res.deletedCount;
    },
  },
};

export default recipeResolvers;
