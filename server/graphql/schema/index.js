import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';

const currentModuleFile = fileURLToPath(import.meta.url);
const currentModuleDir = dirname(currentModuleFile);

// const typesArray = loadFilesSync(join(currentModuleDir, './'), { extensions: ['graphql'], ignoreIndex: true });

// const mergedTypeDefs = mergeTypeDefs(typesArray);

// const messageSchema = loadSchemaSync(join(currentModuleDir, './message.graphql'));
// const recipeSchema = loadSchemaSync(join(currentModuleDir, './recipe.graphql'));

// const mergedTypeDefs = mergeTypeDefs([messageSchema, recipeSchema]);

// const messageSchema = loadSchemaSync(join(currentModuleDir, './message.graphql'), { extensions: ['graphql'] });
// const recipeSchema = loadSchemaSync(join(currentModuleDir, './recipe.graphql'), { extensions: ['graphql'] });

// const mergedTypeDefs = mergeTypeDefs([messageSchema, recipeSchema]);

const mergedTypeDefs = loadSchemaSync('./**/*.graphql', {
  loaders: [new GraphQLFileLoader()],
});

export default mergedTypeDefs;
