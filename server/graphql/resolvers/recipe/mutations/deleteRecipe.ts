import { IContext } from '../../../../context/types';
import { User, Recipe, Rating } from '../../../../graphql/models';
import { throwCustomError, ErrorTypes } from '../../../../helpers/error-handler.helper';
import { IDeleteRecipe } from './types';

export const deleteRecipe = async (_: any, { id }: IDeleteRecipe, context: IContext) => {
  const user = await User.findById(context._id);
  if (!user) {
    throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
  }

  const wasDeleted = await Recipe.deleteOne({ _id: id });
  if (wasDeleted.deletedCount === 0) {
    throw new Error('Recipe not found');
  }

  await Rating.deleteMany({ recipeId: id });

  await User.updateMany({}, { $pull: { favoriteRecipes: id } });

  return wasDeleted.deletedCount;
};
