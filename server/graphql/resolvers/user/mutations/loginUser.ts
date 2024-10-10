import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../../../graphql/models';
import { throwCustomError } from '../../../../helpers/error-handler.helper';
import { ILoginUserInput } from './types';

export const loginUser = async (_: any, { userLoginInput: { userNameOrEmail, password } }: ILoginUserInput) => {
  const user = await User.findOne({ $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }] });

  if (!user) {
    throwCustomError('Invalid user.', { errorCode: 'INVALID_USER', errorStatus: 401 });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throwCustomError('Invalid password.', { errorCode: 'INVALID_PASSWORD', errorStatus: 401 });
  }

  const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_PRIVATE_KEY, { expiresIn: '30d' });

  return {
    token,
    user,
    userId: user._id.toString(),
  };
};
