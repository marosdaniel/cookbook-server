import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mergeResolvers } from '@graphql-tools/merge';
import { loadFilesSync } from '@graphql-tools/load-files';
import messageResolvers from './messages.js';
import recipeResolvers from './recipes.js';

// const currentModuleFile = fileURLToPath(import.meta.url);
// const currentModuleDir = dirname(currentModuleFile);

// const resolversArray = loadFilesSync(join(currentModuleDir, 'server', 'graphql', 'resolvers'), {
//   extensions: ['js'],
//   ignoreIndex: true,
// });

// export const resolvers = mergeResolvers(resolversArray);
const resolvers = mergeResolvers([messageResolvers, recipeResolvers]);

export default resolvers;
