import { Message } from '../models/Message.js';

const messageResolvers = {
  Query: {
    messages: async (_, { id }) => {
      console.log('1111232323');
      const message = await Message.findById(id);
      return message;
    },
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

      // return {
      //   id: '123',
      //   text: 'text',
      //   createdAt: 'createdAt',
      //   createdBy: 'createdBy',
      // };

      return {
        ...res._doc,
        id: res.id,
      };
    },
  },
};

export default messageResolvers;
