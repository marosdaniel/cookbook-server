export type TRequestPasswordReset = {
  email: string;
};

export type TGetUserById = {
  id: string;
};

export type TUserRegisterInput = {
  userRegisterInput: {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    password: string;
  };
};

export type TGetAllUserInput = {
  limit: number;
};

export type TGetUserByNameInput = {
  userName: string;
};
