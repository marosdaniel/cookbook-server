export interface IGetUserById {
  id: string;
}

export interface IGetUserByNameInput {
  userName: string;
}

export interface IGetAllUserInput {
  limit: number;
}

export interface IGetFavoriteRecipes {
  userId: string;
  limit?: number;
}
