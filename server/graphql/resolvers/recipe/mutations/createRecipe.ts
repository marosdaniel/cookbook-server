import { Metadata, Recipe, User } from '../../../../graphql/models';
import { IContext } from '../../../../context/types';
import throwCustomError, { ErrorTypes } from '../../../../helpers/error-handler.helper';
import { ICreateRecipe } from './types';

export const createRecipe = async (
  _: any,
  {
    recipeCreateInput: {
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
  }: ICreateRecipe,
  context: IContext,
) => {
  if (
    !title ||
    !description ||
    !ingredients ||
    !preparationSteps ||
    !category ||
    !cookingTime ||
    !difficultyLevel ||
    !servings
  ) {
    throwCustomError('All fields are required', ErrorTypes.BAD_REQUEST);
  }

  try {
    const user = await User.findById(context._id);
    if (!user) {
      throwCustomError('Unauthenticated operation - no user found', ErrorTypes.UNAUTHENTICATED);
    }

    const labelsFromDb = await Metadata.find({ key: { $in: labels.map(label => label.value) } });
    const categoryFromDb = await Metadata.findOne({ key: category.value });
    const difficultyLevelFromDb = await Metadata.findOne({ key: difficultyLevel.value });

    const newDate = new Date().toISOString();

    const newRecipe = new Recipe({
      title,
      description,
      ingredients,
      preparationSteps,
      createdBy: user.userName,
      createdAt: newDate,
      updatedAt: newDate,
      category: categoryFromDb,
      imgSrc,
      labels: labelsFromDb,
      cookingTime,
      difficultyLevel: difficultyLevelFromDb,
      servings,
      youtubeLink,
      averageRating: 0.0,
      ratingsCount: 0,
    });

    const res = await newRecipe.save();

    user.recipes.push(res);
    await user.save();

    return res;
  } catch (error) {
    throw new Error(error);
  }
};
