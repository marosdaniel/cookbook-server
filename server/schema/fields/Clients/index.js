const { GraphQLList } = require('graphql');
const clients = require('../../../sampleData');
const ClientType = require('../../types/ClientType');

const clientsField = {
  type: new GraphQLList(ClientType),
  resolve(_, args) {
    // code to get data from db from mongoose
    return clients;
  },
};

module.exports = clientsField;
