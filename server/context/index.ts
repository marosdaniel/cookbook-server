import jwt from 'jsonwebtoken';
import { parse } from 'graphql';

import { EUserRoles, User } from '../../server/graphql/models/User';
import throwCustomError, { ErrorTypes } from '../helpers/error-handler.helper';
import operationsConfig from './operationsConfig';

const getUser = async token => {
  try {
    if (token) {
      const user = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
      return user;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const getUserById = async userId => {
  try {
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return null;
      }
      return user;
    }
    return null;
  } catch (error) {
    return null;
  }
};

const context = async ({ req }) => {
  const firstOperationDefinition = ast => ast.definitions[0];
  const firstFieldValueNameFromOperation = operationDefinition =>
    operationDefinition.selectionSet.selections[0].name.value;
  const { operationName } = req.body;
  const { query } = req.body;
  const parsedQuery = parse(query);

  const operationDefinition = firstFieldValueNameFromOperation(firstOperationDefinition(parsedQuery));

  // do not remove this, it is needed for the introspection query to work
  if (operationName === 'IntrospectionQuery') {
    return {};
  }

  const userTokenNotRequired = operationsConfig.publicOperations.includes(operationDefinition);

  if (userTokenNotRequired) {
    return {};
  }

  const token = req.headers.authorization || '';
  const user = await getUser(token);

  if (!user) {
    throwCustomError(operationName, ErrorTypes.UNAUTHENTICATED);
  }

  const { role } = await getUserById(user.userId);

  if (role === EUserRoles.USER && operationsConfig.authenticatedOperations.includes(operationDefinition)) {
    return user;
  }
  if (role === EUserRoles.ADMIN && operationsConfig.adminOperations.includes(operationDefinition)) {
    return user;
  }

  throwCustomError('User is not Authorized', ErrorTypes.UNAUTHORIZED);

  // add the user to the context
  return user;
};

export default context;
