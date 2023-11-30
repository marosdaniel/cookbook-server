import { Metadata, TMetadataType } from '../models/Metadata';

const metadataResolvers = {
  Query: {
    getMetadataByType: async (_, { type }: { type: TMetadataType }) => {
      try {
        const metadataByType = await Metadata.find({ type });
        return metadataByType;
      } catch (error) {
        throw new Error('No metadata found for this type');
      }
    },
    getMetadataByKey: async (_, { key }: { key: string }) => {
      try {
        const metadataByKey = await Metadata.findOne({ key });
        return metadataByKey;
      } catch (error) {
        throw new Error('No metadata found for this key');
      }
    },
  },
  Mutation: {
    createMetadata: async (_, { createMetadataInput: { key, label, type, name } }) => {
      try {
        const existingMetadata = await Metadata.findOne({ $or: [{ key }, { label }] });

        if (existingMetadata) {
          throw new Error('This metadata already exists.');
        }

        const newMetadata = new Metadata({ key, label, type, name });
        await newMetadata.save();
        return newMetadata;
      } catch (error) {
        throw new Error('Error creating metadata');
      }
    },

    deleteMetadata: async (_, { key }: { key: string }) => {
      try {
        await Metadata.findOneAndDelete({ key });
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};

export default metadataResolvers;
