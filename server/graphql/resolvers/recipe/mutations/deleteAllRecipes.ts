import { EUserRoles } from '../../../../graphql/models/User';
import { IContext } from '../../../../context/types';
import { User, Recipe, Rating } from '../../../../graphql/models';
import { throwCustomError, ErrorTypes } from '../../../../helpers/error-handler.helper';

export const deleteAllRecipes = async (_: any, __: {}, context: IContext) => {
  const user = await User.findById(context._id);
  if (!user) {
    throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
  }

  if (user.role !== EUserRoles.ADMIN) {
    throwCustomError('You have no rights to do that operation', ErrorTypes.UNAUTHENTICATED);
  }

  const res = await Recipe.deleteMany({});

  await Rating.deleteMany({});

  await User.updateMany({}, { $set: { favoriteRecipes: [] } });

  return res.deletedCount;
};
