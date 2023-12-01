import jwt from 'jsonwebtoken';
import { EUserRoles, User } from '../../server/graphql/models/User';

import throwCustomError, { ErrorTypes } from '../helpers/error-handler.helper';
import operationsConfig from './operationsConfig';

const getUserById = async (userId: string) => {
  try {
    if (userId) {
      const authorizedUser = await User.findById(userId);
      return authorizedUser || null;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getUser = async (token: string, operationDefinition: string) => {
  try {
    if (!token) {
      throwCustomError('User is not authenticated', ErrorTypes.UNAUTHENTICATED);
    }

    const user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    if (!user) {
      throwCustomError('User is not authenticated', ErrorTypes.UNAUTHENTICATED);
    }

    const authorizedUser = await getUserById(user.userId);
    if (!authorizedUser) {
      throwCustomError('User not found', ErrorTypes.UNAUTHENTICATED);
    }

    const { role } = authorizedUser;
    const isAdmin = role === EUserRoles.ADMIN;

    if (role === EUserRoles.USER && operationsConfig.authenticatedOperations.includes(operationDefinition)) {
      return authorizedUser;
    }
    if (isAdmin && operationsConfig.adminOperations.includes(operationDefinition)) {
      return authorizedUser;
    }

    throwCustomError('User is not Authorized', ErrorTypes.UNAUTHORIZED);
  } catch (error) {
    throwCustomError('Authentication failed', ErrorTypes.UNAUTHENTICATED);
  }
};
