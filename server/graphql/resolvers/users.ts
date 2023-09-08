import { User } from '../models';

const userResolvers = {
  Query: {
    async getUserById(_, { id }: { id: string }) {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    },
    async getAllUser(_, { limit }: { limit: number }) {
      const users = await User.find().sort({ createdAt: -1 }).limit(limit);
      if (!users || users.length === 0) {
        throw new Error('Users not found');
      }
      return users;
    },
  },
  Mutation: {
    async createUser(_, { userCreateInput: { firstName, lastName, userName, email, password } }) {
      if (!firstName || !lastName || !userName || !email || !password) {
        throw new Error('Please fill in all fields');
      }

      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email');
      }
      const userNameRegex = /^[a-zA-Z0-9]+$/;
      if (!userNameRegex.test(userName)) {
        throw new Error('Invalid username');
      }

      let userExists = await User.findOne({ email });

      if (userExists) {
        throw new Error('Email is already in use');
      }

      userExists = await User.findOne({ userName });

      if (userExists) {
        throw new Error('Username is already in use');
      }

      try {
        const newDate = new Date().toISOString();
        const newUser = new User({
          firstName,
          lastName,
          userName,
          email,
          password,
          createdAt: newDate,
        });
        const res = await newUser.save();
        return res;
      } catch (error) {
        console.error('Error while creating user:', error);
        throw new Error('Could not create user');
      }
    },
    // async editRecipe(_, { id, recipeEditInput: { title, description } }) {
    //   const res = await Recipe.findByIdAndUpdate(
    //     id,
    //     { title, description, updatedAt: new Date().toISOString() },
    //     { new: true },
    //   );
    //   if (!res) {
    //     throw new Error('Recipe not found');
    //   }
    //   return res.toObject();
    // },
    async deleteUser(_, { id }) {
      const wasDeleted = await User.deleteOne({ _id: id });
      if (!wasDeleted) {
        throw new Error('User not found');
      }
      return wasDeleted.deletedCount; // 1 if deleted, 0 if not
    },
    async deleteAllUser() {
      const res = await User.deleteMany({});
      return res.deletedCount;
    },
  },
};

export default userResolvers;
