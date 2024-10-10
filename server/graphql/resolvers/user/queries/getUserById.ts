import { User } from '../../../../graphql/models';
import { throwCustomError, ErrorTypes } from '../../../../helpers/error-handler.helper';
import { IGetUserById } from './types';

export const getUserById = async (_: any, { id }: IGetUserById) => {
  const user = await User.findById(id).populate('favoriteRecipes').populate('recipes');

  if (!user) {
    throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
  }

  return user;
};
