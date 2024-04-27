import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { expressMiddleware } from '@apollo/server/express4';

import resolvers from './server/graphql/resolvers/index.js';
import context from './server/context/index.js';
import { loadSchema } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { ApolloServer } from '@apollo/server';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(
    '/',
    cors({
      origin: [
        'http://localhost:8080',
        'http://localhost:3000',
        'https://teal-light-gazelle.cyclic.app',
        'https://cookbook-client-sepia.vercel.app',
        'https://studio.apollographql.com',
      ],
      credentials: true,
    }),
    bodyParser.json({ limit: '50mb' }),
    bodyParser.urlencoded({ extended: true }),
  );

  const schema = await loadSchema('server/graphql/**/*.graphql', {
    loaders: [new GraphQLFileLoader()],
  });

  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
  });

  await server.start();

  app.use(
    expressMiddleware(server, {
      context,
    }),
  );

  const PORT = process.env.PORT || 8080;
  const MONGO_DB = process.env.MONGO_URI;

  mongoose
    .connect(MONGO_DB)
    .then(() => {
      console.log('Connected to MongoDB...');
      app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}`);
      });
    })
    .catch(error => {
      console.error('Error connecting to MongoDB:', error);
    });
}

startServer();
