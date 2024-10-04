import { ObjectId, Schema, model } from 'mongoose';

export interface IRating {
  recipeId: ObjectId;
  userId: ObjectId;
  ratingValue: number;
  createdAt: Date;
  updatedAt: Date;
}
const ratingSchema = new Schema<IRating>({
  recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ratingValue: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Rating = model<IRating>('Rating', ratingSchema);
