import { parse } from 'graphql';

import operationsConfig from './operationsConfig';
import { getUser } from './utils';

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

  const user = await getUser(token, operationDefinition);

  // add the user to the context
  return user;
};

export default context;
