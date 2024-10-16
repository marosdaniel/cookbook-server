import jwt, { JwtPayload } from 'jsonwebtoken';
import { EUserRoles, User } from '../../server/graphql/models/User';

import { throwCustomError, ErrorTypes } from '../helpers/error-handler.helper';
import operationsConfig from './operationsConfig';

const getUserById = async (userId: string | JwtPayload) => {
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

    const jwtToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    const user = jwt.verify(jwtToken, process.env.JWT_PRIVATE_KEY);
    if (!user) {
      throwCustomError('User is not authenticated', ErrorTypes.UNAUTHENTICATED);
    }

    const userId: string = (user as JwtPayload).userId;
    const authorizedUser = await getUserById(userId);
    if (!authorizedUser) {
      throwCustomError('User not found', ErrorTypes.UNAUTHENTICATED);
    }

    const { role } = authorizedUser;

    if (role === EUserRoles.USER && operationsConfig.authenticatedOperations.includes(operationDefinition)) {
      return authorizedUser;
    }
    if (role === EUserRoles.BLOGGER && operationsConfig.bloggerOperations.includes(operationDefinition)) {
      return authorizedUser;
    }
    if (role === EUserRoles.ADMIN && operationsConfig.adminOperations.includes(operationDefinition)) {
      return authorizedUser;
    }

    throwCustomError('User is not Authorized', ErrorTypes.UNAUTHORIZED);
  } catch (error) {
    throwCustomError(error, ErrorTypes.UNAUTHENTICATED);
  }
};
