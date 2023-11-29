const publicOperations = [
  'getRecipes',
  'getRecipeById',
  'getRecipesByTitle',
  'getRecipesByUserName',
  'getUserById',
  'getUserByUserName',
  'createUser',
  'loginUser',
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

const adminOperations = [...bloggerOperations, 'deleteAllRecipes', 'deleteAllUsers'];

const operationsConfig = {
  publicOperations,
  authenticatedOperations,
  adminOperations,
};

export default operationsConfig;
