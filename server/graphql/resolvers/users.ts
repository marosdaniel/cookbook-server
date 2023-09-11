import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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
          locale: 'en-GB',
          recipes: [],
          favoriteRecipes: [],
        });
        const res = await newUser.save();
        return res;
      } catch (error) {
        console.error('Error while creating user:', error);
        throw new Error('Could not create user');
      }
    },
    async loginUser(_, { userLoginInput: { userNameOrEmail, password } }) {
      // Ellenőrizd, hogy a felhasználó létezik
      const user = await User.findOne({ $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }] });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Ellenőrizd a jelszót
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        throw new Error('Invalid credentials');
      }

      // Ha minden rendben van, generálj egy token-t
      const token = jwt.sign({ userId: user.id }, process.env.JWT_PRIVATE_KEY, { expiresIn: '30d' });

      return {
        token,
        user,
      };
    },
    async editUser(_, { id, userEditInput }) {
      try {
        const user = await User.findById(id);

        if (!user) {
          throw new Error('User not found');
        }

        Object.assign(user, userEditInput);

        // mongoose pre-save hook will hash the password if it was changed
        await user.save();

        return user;
      } catch (error) {
        console.error('Error while editing user:', error);
        throw new Error('Could not edit user');
      }
    },
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
