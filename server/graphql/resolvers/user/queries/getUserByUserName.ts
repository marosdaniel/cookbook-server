import { User } from '../../../../graphql/models';
import { throwCustomError, ErrorTypes } from '../../../../helpers/error-handler.helper';
import { IGetUserByNameInput } from './types';

export const getUserByUserName = async (_: any, { userName }: IGetUserByNameInput) => {
  const user = await User.findOne({ userName }).populate('favoriteRecipes').populate('recipes');

  if (!user) {
    throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
  }

  return user;
};
