import { mergeResolvers } from '@graphql-tools/merge';
import recipeResolvers from './recipes';
import userResolvers from './users';
import metadataResolvers from './metadata';
import scalarResolvers from './scalarResolver';
import ratingResolvers from './rating';

const resolvers = mergeResolvers([recipeResolvers, userResolvers, metadataResolvers, scalarResolvers, ratingResolvers]);

export default resolvers;
