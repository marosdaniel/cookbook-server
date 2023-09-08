import { model, Schema } from 'mongoose';

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
});

export const User = model('User', userSchema);
