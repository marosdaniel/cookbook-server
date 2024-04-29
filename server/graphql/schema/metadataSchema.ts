import { gql } from 'apollo-server-core';

export default gql`
  type Metadata {
    key: String!
    label: String!
    type: String!
    name: String!
  }

  input CreateMetadataInput {
    key: String!
    label: String!
    type: String!
    name: String!
  }

  type Query {
    getMetadataByType(type: String!): [Metadata]!
    getMetadataByKey(key: String!): Metadata
  }

  type Mutation {
    createMetadata(createMetadataInput: CreateMetadataInput!): Metadata!
    deleteMetadata(key: String!): Boolean!
  }
`;
