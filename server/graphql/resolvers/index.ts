import { mergeResolvers } from '@graphql-tools/merge';
import recipeResolvers from './recipes';
import userResolvers from './users';
import metadataResolvers from './metadata';

const resolvers = mergeResolvers([recipeResolvers, userResolvers, metadataResolvers]);

export default resolvers;
