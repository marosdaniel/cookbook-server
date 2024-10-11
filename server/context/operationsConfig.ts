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
  'getAllUser',
];

const authenticatedOperations = [
  ...publicOperations,
  'createRecipe',
  'editRecipe',
  'deleteRecipe',
  'deleteUser',
  'editUser',
  'changePassword',
  'getFavoriteRecipes',
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
  'cleanUserRecipes',
];

const operationsConfig = {
  publicOperations,
  authenticatedOperations,
  bloggerOperations,
  adminOperations,
};

export default operationsConfig;
