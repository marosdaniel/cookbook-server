const publicOperations = [
  'getRecipes',
  'getRecipeById',
  'getRecipesByTitle',
  'getRecipesByUserName',
  'getUserById',
  'getUserByUserName',
  'createUser',
  'loginUser',
  'addToFavoriteRecipes',
];

const authenticatedOperations = [
  ...publicOperations,
  'createRecipe',
  'editRecipe',
  'deleteRecipe',
  'deleteUser',
  'editUser',
];

// TODO: add operations for blogger role
const bloggerOperations = [...authenticatedOperations, ''];

const adminOperations = [
  ...bloggerOperations,
  'deleteAllRecipes',
  'deleteAllUsers',
  'getMetadataByType',
  'getMetadataByKey',
  'createMetadata',
  'deleteMetadata',
  'getAllUser',
];

const operationsConfig = {
  publicOperations,
  authenticatedOperations,
  adminOperations,
};

export default operationsConfig;
