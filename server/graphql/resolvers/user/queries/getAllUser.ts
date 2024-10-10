import { User } from '../../../../graphql/models';
import { throwCustomError, ErrorTypes } from '../../../../helpers/error-handler.helper';
import { IGetAllUserInput } from './types';

export const getAllUser = async (_: any, { limit }: IGetAllUserInput) => {
  const users = await User.find().sort({ createdAt: -1 }).limit(limit);

  if (!users) {
    throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
  }

  return users;
};
