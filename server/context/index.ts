import { parse } from 'graphql';
import operationsConfig from './operationsConfig';
import { getUser } from './utils';

const context = async ({ req }) => {
  const firstOperationDefinition = ast => ast.definitions[0];
  const firstFieldValueNameFromOperation = operationDefinition =>
    operationDefinition.selectionSet.selections[0].name.value;

  const { operationName, query } = req.body;
  const parsedQuery = parse(query);

  const operationDefinition = firstFieldValueNameFromOperation(firstOperationDefinition(parsedQuery));

  if (operationName === 'IntrospectionQuery') {
    // console.log('Introspection query - no user required.');
    return {};
  }

  const userTokenNotRequired = operationsConfig.publicOperations.includes(operationDefinition);

  const token = req.headers.authorization || '';

  if (userTokenNotRequired) {
    if (token) {
      const user = await getUser(token, operationDefinition);
      return user ? { _id: user._id, ...user } : {};
    } else {
      return {};
    }
  }

  const user = await getUser(token, operationDefinition);

  if (!user) {
    return {};
  }

  return { _id: user._id, ...user };
};

export default context;
