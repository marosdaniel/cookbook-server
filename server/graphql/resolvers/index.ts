import { mergeResolvers } from '@graphql-tools/merge';
import messageResolvers from './messages';
import recipeResolvers from './recipes';
import userResolvers from './users';

const resolvers = mergeResolvers([messageResolvers, recipeResolvers, userResolvers]);

export default resolvers;
