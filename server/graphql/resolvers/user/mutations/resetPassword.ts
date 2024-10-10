import { generateResetToken, sendPasswordResetEmail } from '../../../../helpers/email';
import { throwCustomError } from '../../../../helpers/error-handler.helper';
import { User } from '../../../../graphql/models';
import { IRequestPasswordReset } from './types';

export const resetPassword = async (_: any, { email }: IRequestPasswordReset) => {
  const user = await User.findOne({ email });

  if (!user) {
    throwCustomError('User not found', { errorCode: 'USER_NOT_FOUND', errorStatus: 404 });
  }

  const resetToken = generateResetToken();
  const resetExpires = new Date();
  resetExpires.setHours(resetExpires.getHours() + 1);

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetExpires;
  await user.save();

  sendPasswordResetEmail(user.email, user.resetPasswordToken);

  return true;
};
