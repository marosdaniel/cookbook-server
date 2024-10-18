import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../../../graphql/models';
import { throwCustomError } from '../../../../helpers/error-handler.helper';
import { ILoginUserInput } from './types';

export const loginUser = async (_: any, { userLoginInput: { userNameOrEmail, password } }: ILoginUserInput) => {
  try {
    const user = await User.findOne({ $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }] });

    if (!user) {
      throwCustomError('Invalid user.', { errorCode: 'INVALID_USER', errorStatus: 401 });
    }

    if (!user._id) {
      throwCustomError('User ID not found', { errorCode: 'USER_ID_NOT_FOUND', errorStatus: 500 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throwCustomError('Invalid password.', { errorCode: 'INVALID_PASSWORD', errorStatus: 401 });
    }

    if (!process.env.JWT_PRIVATE_KEY) {
      throwCustomError('Internal server error: JWT key not set.', { errorCode: 'INTERNAL_ERROR', errorStatus: 500 });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      },
      process.env.JWT_PRIVATE_KEY,
      {
        expiresIn: '30d',
        algorithm: 'HS256',
      },
    );

    return {
      token,
      user: {
        _id: user._id.toString(),
        userName: user.userName,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
        locale: user.locale,
      },
      userId: user._id.toString(),
    };
  } catch (error) {
    console.error('Login error:', error);
    throwCustomError('Could not log in user.', { errorCode: 'LOGIN_FAILED', errorStatus: 500 });
  }
};
