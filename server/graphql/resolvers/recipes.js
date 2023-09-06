import { Recipe } from '../models/Recipe.js';

const recipeResolvers = {
  Query: {
    async recipe(_, { id }) {
      return await Recipe.findById(id);
    },
    // a limit lekérdezés eredményének maximális számát állítja
    // .skip(offset) metódus a lekérdezés eredményének elhagyandó elemeinek számát állítja be a offset paraméter alapján.
    async getRecipes(_, { limit, offset }) {
      return await Recipe.find().sort({ createdAt: -1 }).limit(limit);
    },
  },
  Mutation: {
    // createMessage: async (_, { messageInput: { text, username } }) => {
    //   const newMessage = new Message({
    //     text: text,
    //     createdAt: new Date().toISOString(),
    //     createdBy: username,
    //   });
    //   const res = await newMessage.save();
    //   console.log(res);
    //   return {
    //     ...res._doc,
    //     id: res.id,
    //   };
    // },
    async createRecipe(_, { recipeInput: { title, description, createdBy } }) {
      const newRecipe = new Recipe({
        title,
        description,
        createdAt: new Date().toISOString(),
        createdBy: createdBy,
      });
      const res = await newRecipe.save();
      return {
        ...res.toObject(),
        id: res.id,
      };
    },
  },
};

export default recipeResolvers;
