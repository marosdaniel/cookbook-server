const publicOperations = [
  'getRecipes',
  'getRecipeById',
  'getRecipesByTitle',
  'getRecipesByUserName',
  'getRecipesByUserId',
  'getUserById',
  'getUserByUserName',
  'createUser',
  'loginUser',
  'getMetadataByType',
  'getMetadataByType',
  'getAllMetadata',
  'resetPassword',
  'setNewPassword',
  'getRatingsByRecipe',
];

const authenticatedOperations = [
  ...publicOperations,
  'createRecipe',
  'editRecipe',
  'deleteRecipe',
  'deleteUser',
  'editUser',
  'changePassword',
  'addToFavoriteRecipes',
  'removeFromFavoriteRecipes',
  'getMetadataByKey',
  'rateRecipe',
  'deleteRating',
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
