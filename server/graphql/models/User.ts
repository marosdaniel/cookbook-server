import { Schema, model, Document, ObjectId } from 'mongoose';
import bcrypt from 'bcrypt';
import { IRecipe } from './Recipe';

export enum EUserRoles {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
interface IUser extends Document {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  createdAt: Date;
  recipes: IRecipe[];
  favoriteRecipes: IRecipe[];
  locale: string;
  role: EUserRoles;
}

const userSchema = new Schema<IUser>({
  id: String,
  firstName: String,
  lastName: String,
  userName: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  recipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  favoriteRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  locale: String,
  role: {
    type: String,
    // enum: EUserRoles,
    enum: Object.values(EUserRoles),
    default: EUserRoles.USER, // Fontos a "as EUserRoles" konverzió itt
  },
});

export const User = model<IUser>('User', userSchema);

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
