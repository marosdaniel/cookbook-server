import { deleteRating, rateRecipe } from './rating/mutations';

const ratingResolvers = {
  Query: {},
  Mutation: {
    rateRecipe,
    deleteRating,
  },
};

export default ratingResolvers;
