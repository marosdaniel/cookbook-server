const operationsConfig = {
  publicOperations: ['getRecipes', 'getRecipeById', 'getRecipesByTitle', 'getUserById', 'createUser', 'loginUser'],
  authenticatedOperations: ['createRecipe', 'editRecipe', 'deleteRecipe', 'deleteUser', 'editUser'],
  adminOperations: ['deleteAllRecipes', 'deleteAllUsers'],
};

export default operationsConfig;
