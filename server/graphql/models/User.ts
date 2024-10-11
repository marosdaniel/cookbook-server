import bcrypt from 'bcrypt';
import { Document, Schema, Types, model } from 'mongoose';

export enum EUserRoles {
  USER = 'USER',
  ADMIN = 'ADMIN',
  BLOGGER = 'BLOGGER',
}

interface IUser extends Document {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  createdAt: Date;
  recipes?: Types.ObjectId[];
  favoriteRecipes?: Types.ObjectId[];
  locale: string;
  role: EUserRoles;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>({
  id: String,
  firstName: String,
  lastName: String,
  userName: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  recipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe', default: [] }],
  favoriteRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe', default: [] }],
  locale: String,
  role: {
    type: String,
    enum: Object.values(EUserRoles),
    default: EUserRoles.USER,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    return next();
  } catch (error) {
    return next(error);
  }
});

export const User = model<IUser>('User', userSchema);
