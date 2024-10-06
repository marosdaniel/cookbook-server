export interface IGetRecipesByUserId {
  userId: string;
  limit: number;
}

export interface IGetRecipesByUserName {
  userName: string;
  limit: number;
}

export interface IGetRecipesByTitle {
  title: string;
  limit: number;
}

export interface IGetRecipes {
  limit: number;
}

export interface IGetRecipeById {
  _id: string;
}
