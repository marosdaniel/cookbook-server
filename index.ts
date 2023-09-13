import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import context from './server/context';

import resolvers from './server/graphql/resolvers';

dotenv.config();

const MONGO_DB = process.env.MONGO_URI;
const PORT: number = +process.env.PORT || 8080;

const schema = await loadSchema('server/graphql/**/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});

// TODO: swap to using expressMiddleware
// https://www.apollographql.com/docs/apollo-server/api/express-middleware
// expressMiddleware will enable using subscriptions

// TODO: add CORS config
// https://www.apollographql.com/docs/apollo-server/security/cors/
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

mongoose
  .connect(MONGO_DB)
  .then(() => {
    console.log('Connected to MongoDB...');
    return startStandaloneServer(server, {
      // if the playground is open, it runs introspection against the graph at an interval
      // not a problem
      context,
      listen: { port: PORT },
    });
  })
  .then(server => {
    console.log(`🚀  Server ready at: ${server.url}`);
  });
