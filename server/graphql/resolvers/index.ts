import { mergeResolvers } from '@graphql-tools/merge';
import recipeResolvers from './recipes';
import userResolvers from './users';
import metadataResolvers from './metadata';
import scalarResolvers from './scalarResolver';

const resolvers = mergeResolvers([recipeResolvers, userResolvers, metadataResolvers, scalarResolvers]);

export default resolvers;
