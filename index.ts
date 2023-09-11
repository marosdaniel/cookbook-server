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

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
});

mongoose
  .connect(MONGO_DB)
  .then(() => {
    console.log('Connected to MongoDB...');
    return startStandaloneServer(server, {
      context,
      listen: { port: PORT },
    });
  })
  .then(server => {
    console.log(`🚀  Server ready at: ${server.url}`);
  });
