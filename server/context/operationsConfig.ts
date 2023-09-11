const operationsConfig = {
  publicOperations: ['getRecipes', 'getRecipeById', 'getRecipesByTitle', 'getUserById', 'createUser', 'loginUser'],
  authenticatedOperations: ['createRecipe'],
  adminOperations: ['AddAdmin', 'DeleteAdmin'],
};

export default operationsConfig;
