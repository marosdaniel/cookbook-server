const { GraphQLID, GraphQLObjectType, GraphQLString } = require('graphql');
const ClientType = require('../ClientType');
const { clients } = require('../../../sampleData');

const ProjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    client: {
      type: ClientType,
      resolve(parent, args) {
        return clients.find(client => client.id === parent.clientId);
      },
    },
  }),
});

module.exports = ProjectType;
