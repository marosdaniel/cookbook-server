import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';

import resolvers from './server/graphql/resolvers';
import context from './server/context';

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
const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
  '/',
  cors<cors.CorsRequest>({
    // origin: '*',
    origin: 'http://localhost:8080',
    credentials: true,
  }),
  // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
  bodyParser.json({ limit: '50mb' }),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context,
  }),
);

mongoose
  .connect(MONGO_DB.toString())
  .then(() => {
    console.log('Connected to MongoDB...');
  })
  .then(() => {
    new Promise<void>(resolve => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:8080/`);
  });
