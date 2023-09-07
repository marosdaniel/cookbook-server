import { mergeResolvers } from '@graphql-tools/merge';
import messageResolvers from './messages.js';
import recipeResolvers from './recipes.js';

const resolvers = mergeResolvers([messageResolvers, recipeResolvers]);

export default resolvers;
