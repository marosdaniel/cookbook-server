import { IContext } from '../../../../context/types';
import { User, Recipe, Metadata } from '../../../../graphql/models';
import { throwCustomError, ErrorTypes } from '../../../../helpers/error-handler.helper';
import { IEditRecipe } from './types';

export const editRecipe = async (
  _: any,
  {
    id,
    recipeEditInput: {
      title,
      description,
      ingredients,
      preparationSteps,
      category,
      imgSrc,
      labels,
      cookingTime,
      difficultyLevel,
      servings,
      youtubeLink,
    },
  }: IEditRecipe,
  context: IContext,
) => {
  try {
    const user = await User.findById(context._id);
    if (!user) {
      throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
    }

    const existingRecipe = await Recipe.findById(id);
    if (!existingRecipe) {
      throwCustomError('Recipe not found', ErrorTypes.NOT_FOUND);
    }

    if (existingRecipe.createdBy !== user.userName) {
      throwCustomError('You have no rights to do that operation', ErrorTypes.UNAUTHENTICATED);
    }

    if (
      !title ||
      !description ||
      !ingredients ||
      !preparationSteps ||
      !cookingTime ||
      !category ||
      !difficultyLevel ||
      !servings
    ) {
      throwCustomError('All fields are required', ErrorTypes.BAD_REQUEST);
    }

    const labelsFromDb = await Metadata.find({ key: { $in: labels.map(label => label.value) } });
    const categoryFromDb = await Metadata.findOne({ key: category.value });
    const difficultyLevelFromDb = await Metadata.findOne({ key: difficultyLevel.value });

    const updatedFields = {
      title,
      description,
      ingredients,
      preparationSteps,
      updatedAt: new Date(),
      category: categoryFromDb,
      labels: labelsFromDb,
      imgSrc,
      cookingTime,
      difficultyLevel: difficultyLevelFromDb,
      servings,
      youtubeLink,
    };

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, { $set: updatedFields }, { new: true });

    return updatedRecipe;
  } catch (error) {
    throw new Error(error);
  }
};
