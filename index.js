import { buildSchema, printSchema } from 'graphql';
import dotenv from 'dotenv';
import colors from 'colors';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { buildSubgraphSchema } from '@apollo/subgraph';
import mergedTypeDefs from './server/graphql/schema/index.js';
import resolvers from './server/graphql/resolvers/index.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { loadSchemaSync, loadSchema } from '@graphql-tools/load';

dotenv.config();

const MONGO_DB = process.env.MONGO_URI;

const schema = await loadSchema('server/graphql/**/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});

const server = new ApolloServer({
  schema,
  resolvers,
});

console.log(printSchema(schema));
console.log(resolvers);

mongoose
  .connect(MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB..'.magenta.bold);
    return startStandaloneServer(server, {
      listen: { port: process.env.PORT || 8080 },
    });
  })
  .then(server => {
    console.log(`🚀  Server ready at: ${server.url}`.bgMagenta.bold);
  });
