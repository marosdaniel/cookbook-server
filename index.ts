import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import userSchema from './server/graphql/schema/userSchema';
import recipeSchema from './server/graphql/schema/recipeSchema';
import metadataSchema from './server/graphql/schema/metadataSchema';
import resolvers from './server/graphql/resolvers/index.js';
import context from './server/context/index.js';

dotenv.config();

const MONGO_DB = process.env.MONGO_URI;
const PORT: number = +process.env.PORT || 8080;

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
  typeDefs: [userSchema, recipeSchema, metadataSchema],
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  '/graphql',
  cors<cors.CorsRequest>({
    // origin: '*',
    origin: [
      'http://localhost:8080',
      'http://localhost:3000',
      'https://teal-light-gazelle.cyclic.app',
      'https://cookbook-client-sepia.vercel.app',
      'https://studio.apollographql.com',
    ],
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
    console.log(`🚀 Server ready!`);
  });
