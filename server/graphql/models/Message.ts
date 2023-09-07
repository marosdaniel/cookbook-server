import { model, Schema } from 'mongoose';

const messageSchema = new Schema({
  id: String,
  text: String,
  createdAt: String,
  createdBy: String,
});

export const Message = model('Message', messageSchema);
