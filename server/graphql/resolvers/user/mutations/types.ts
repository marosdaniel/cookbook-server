export interface IUserRegisterInput {
  userRegisterInput: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
  };
}

export interface ILoginUserInput {
  userLoginInput: {
    userNameOrEmail: string;
    password: string;
  };
}

export interface IEditUserInput {
  id: string;
  userEditInput: {
    firstName?: string;
    lastName?: string;
    locale?: string;
  };
}

export interface IRequestPasswordReset {
  email: string;
}

export interface IChangePassword {
  id: string;
  passwordEditInput: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  };
}

export interface IDeleteUser {
  id: string;
}

export interface ISetNewPassword {
  token: string;
  newPassword: string;
}

export interface IAddToFavoriteRecipes {
  userId: string;
  recipeId: string;
}

export interface IRemoveFromFavoriteRecipes {
  userId: string;
  recipeId: string;
}
