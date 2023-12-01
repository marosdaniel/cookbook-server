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
  'getMetadataByType',
  'getMetadataByType',
];

const authenticatedOperations = [
  ...publicOperations,
  'createRecipe',
  'editRecipe',
  'deleteRecipe',
  'deleteUser',
  'editUser',
  'getMetadataByKey',
];

// TODO: add operations for blogger role
const bloggerOperations = [...authenticatedOperations, ''];

const adminOperations = [
  ...bloggerOperations,
  'deleteAllRecipes',
  'deleteAllUsers',
  'createMetadata',
  'deleteMetadata',
  'getAllUser',
];

const operationsConfig = {
  publicOperations,
  authenticatedOperations,
  bloggerOperations,
  adminOperations,
};

export default operationsConfig;
