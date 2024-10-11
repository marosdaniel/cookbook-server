import {
  addToFavoriteRecipes,
  changePassword,
  createUser,
  deleteAllUser,
  deleteUser,
  editUser,
  getAllUser,
  getUserById,
  getUserByUserName,
  loginUser,
  removeFromFavoriteRecipes,
  resetPassword,
  setNewPassword,
} from './user';

const userResolvers = {
  Query: {
    getUserById,
    getUserByUserName,
    getAllUser,
  },
  Mutation: {
    createUser,
    loginUser,
    editUser,
    changePassword,
    resetPassword,
    setNewPassword,
    deleteUser,
    deleteAllUser,
    addToFavoriteRecipes,
    removeFromFavoriteRecipes,
  },
};

export default userResolvers;
