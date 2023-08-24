const { GraphQLID, GraphQLSchema, GraphQLObjectType, GraphQLList } = require('graphql');
const ClientType = require('./types/ClientType');
const ProjectType = require('./types/ProjectType');
const clientsField = require('./fields/Clients');
const { clients, projects } = require('../sampleData');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // clients: clientsField,
    clients: {
      type: new GraphQLList(ClientType),
      resolve(_, args) {
        // code to get data from db from mongoose
        return clients;
      },
    },
    client: {
      type: ClientType,
      args: { id: { type: GraphQLID } },
      resolve(_, args) {
        // code to get data from db from mongoose
        return clients.find(client => client.id === args.id);
      },
    },
    projects: {
      type: new GraphQLList(ProjectType),
      resolve(_, args) {
        // code to get data from db from mongoose
        return projects;
      },
    },
    project: {
      type: ProjectType,
      args: { id: { type: GraphQLID } },
      resolve(_, args) {
        // code to get data from db from mongoose
        return projects.find(project => project.id === args.id);
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
