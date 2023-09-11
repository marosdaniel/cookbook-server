import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { Recipe } from './Recipe';

const userSchema = new Schema({
  id: String,
  firstName: String,
  lastName: String,
  userName: String,
  email: String,
  password: String,
  createdAt: String,
  recipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  favoriteRecipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }],
  locale: String,
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

export const User = model('User', userSchema);
