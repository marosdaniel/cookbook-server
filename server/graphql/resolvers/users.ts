import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import throwCustomError, { ErrorTypes } from '../../helpers/error-handler.helper';
import { User } from '../models';
import { EUserRoles } from '../models/User';

const userResolvers = {
  Query: {
    async getUserById(_, { id }: { id: string }) {
      const user = await User.findById(id);
      if (!user) {
        throwCustomError('User not found', ErrorTypes.UNAUTHENTICATED);
      }
      return user;
    },
    async getAllUser(_, { limit }: { limit: number }) {
      const users = await User.find().sort({ createdAt: -1 }).limit(limit);
      if (!users || users.length === 0) {
        throwCustomError('User not found', ErrorTypes.UNAUTHENTICATED);
      }
      return users;
    },
  },
  Mutation: {
    async createUser(_, { userRegisterInput: { firstName, lastName, userName, email, password } }) {
      if (!firstName || !lastName || !userName || !email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (!validator.isEmail(email)) {
        throw new Error('Invalid email');
      }

      if (!validator.isLength(password, { min: 5, max: 20, allow_whitespace: false })) {
        throw new Error('Password must be at least 5, maximum 20 characters');
      }

      if (!validator.isLength(userName, { min: 3, max: 20, allow_whitespace: false })) {
        throw new Error('Password must be at least 5, maximum 20 characters');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

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
          password: hashedPassword,
          createdAt: newDate,
          locale: 'en-GB',
          recipes: [],
          favoriteRecipes: [],
          role: EUserRoles.USER,
        });
        const res = await newUser.save();
        return res;
      } catch (error) {
        console.error('Error while creating user:', error);
        throw new Error('Could not create user');
      }
    },
    async loginUser(_, { userLoginInput: { userNameOrEmail, password } }) {
      const user = await User.findOne({ $or: [{ userName: userNameOrEmail }, { email: userNameOrEmail }] });

      if (!user) {
        throwCustomError('Invalid user', ErrorTypes.UNAUTHENTICATED);
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        throwCustomError('Invalid password', ErrorTypes.UNAUTHENTICATED);
      }

      const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_PRIVATE_KEY, { expiresIn: '30d' });

      return {
        token,
        user,
        userId: user._id.toString(),
      };
    },
    async editUser(_, { id, userEditInput }) {
      try {
        const user = await User.findById(id);

        if (!user) {
          throwCustomError('User not found', ErrorTypes.UNAUTHENTICATED);
        }

        Object.assign(user, userEditInput);

        // mongoose pre-save hook will hash the password if it was changed
        await user.save();

        return user;
      } catch (error) {
        console.error('Error while editing user:', error);
        throwCustomError('Could not edit user', ErrorTypes.UNAUTHENTICATED);
      }
    },
    async deleteUser(_, { id }) {
      const wasDeleted = await User.deleteOne({ _id: id });
      if (!wasDeleted) {
        throwCustomError('User not found', ErrorTypes.UNAUTHENTICATED);
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
