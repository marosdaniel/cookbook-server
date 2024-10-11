import bcrypt from 'bcrypt';
import validator from 'validator';
import { EUserRoles } from '../../../../graphql/models/User';
import { User } from '../../../../graphql/models';
import { IUserRegisterInput } from './types';
import { throwCustomError } from '../../../../helpers/error-handler.helper';
import { IContext } from '../../../../context/types';

export const createUser = async (
  _: any,
  { userRegisterInput: { firstName, lastName, userName, email, password } }: IUserRegisterInput,
  context: IContext,
) => {
  const currentUser = context;

  // Ha van bejelentkezett felhasználó és nem admin, visszadobunk egy hibát
  if (currentUser) {
    throwCustomError('Unauthorized operation - insufficient permissions', {
      errorCode: 'UNAUTHORIZED',
      errorStatus: 403,
    });
  }

  if (!firstName || !lastName || !userName || !email || !password) {
    throwCustomError('Please fill in all fields', { errorCode: 'INVALID_INPUT', errorStatus: 400 });
  }

  if (!validator.isEmail(email)) {
    throwCustomError('Invalid email', { errorCode: 'INVALID_EMAIL', errorStatus: 400 });
  }

  if (!validator.isLength(password, { min: 5, max: 20 })) {
    throwCustomError('Password must be at least 5, maximum 20 characters', {
      errorCode: 'INVALID_PASSWORD',
      errorStatus: 400,
    });
  }

  if (!validator.isLength(userName, { min: 3, max: 20 })) {
    throwCustomError('Username must be between 3 and 20 characters', {
      errorCode: 'INVALID_USERNAME',
      errorStatus: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userNameRegex = /^[a-zA-Z0-9]+$/;
  if (!userNameRegex.test(userName)) {
    throwCustomError('Invalid username', { errorCode: 'INVALID_USERNAME', errorStatus: 400 });
  }

  let userExists = await User.findOne({ email });

  if (userExists) {
    throwCustomError('Email is already in use', { errorCode: 'EMAIL_IN_USE', errorStatus: 409 });
  }

  userExists = await User.findOne({ userName });

  if (userExists) {
    throwCustomError('Username is already in use', { errorCode: 'USERNAME_IN_USE', errorStatus: 409 });
  }

  try {
    const newDate = new Date().toISOString();
    const newUser = new User({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      createdAt: newDate,
      locale: 'en-GB',
      recipes: [],
      favoriteRecipes: [],
      role: EUserRoles.USER,
    });
    const res = await newUser.save();
    return res;
  } catch (error) {
    console.error('Error while creating user:', error);
    throwCustomError('Could not create user', { errorCode: 'INTERNAL_ERROR', errorStatus: 500 });
  }
};
