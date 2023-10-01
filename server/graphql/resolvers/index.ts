import { mergeResolvers } from '@graphql-tools/merge';
import recipeResolvers from './recipes';
import userResolvers from './users';

const resolvers = mergeResolvers([recipeResolvers, userResolvers]);

export default resolvers;
