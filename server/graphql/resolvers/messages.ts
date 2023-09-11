import { Message } from '../models/';

const messageResolvers = {
  Query: {
    messages: async (_, { id }) => {
      const message = await Message.findById(id);
      return message;
    },
    // simple example for testing
    me: () => {
      console.log('me query executed');
      return 'asdasdasdasd';
    },
  },
  Mutation: {
    createMessage: async (_, { messageInput: { text, username } }) => {
      const newMessage = new Message({
        text: text,
        createdAt: new Date().toISOString(),
        createdBy: username,
      });

      const res = await newMessage.save();
      return {
        ...res.toObject(),
        id: res.id,
      };
    },
  },
};

export default messageResolvers;
