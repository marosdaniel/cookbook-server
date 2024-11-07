import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {GraphQLFileLoader} from '@graphql-tools/graphql-file-loader';
import {loadSchema} from '@graphql-tools/load';

import resolvers from './server/graphql/resolvers';

import {limiter} from './server/config/rateLimit';
import {helmetConfig} from './server/config/helmetConfig';
import context from './server/context';

dotenv.config();

const MONGO_DB = process.env.MONGO_URI;
const PORT: number = +process.env.PORT || 8080;

const schema = await loadSchema('server/graphql/**/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(helmet(helmetConfig));

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080', // for graphql playground
  'https://teal-light-gazelle.cyclic.app',
  'https://cookbook-client-sepia.vercel.app',
  'https://studio.apollographql.com',
  'https://cookbook-server-drab.vercel.app',
  'https://cookbook-vite.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (!origin && isDevelopment) {
        callback(null, true);
      } else if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  }),
);

app.use(limiter);

app.use(
  bodyParser.json({ limit: '50mb' }),
  expressMiddleware(server, {
    context: async ({ req }) => {
      return await context({req});
    },
  }),
);

mongoose.connect(MONGO_DB.toString()).then(() => {
  console.log('Connected to MongoDB...');
  httpServer.listen({ port: PORT });
  console.log(`🚀 Server ready!`);
});
