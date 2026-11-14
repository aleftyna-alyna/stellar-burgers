import { Preloader, IngredientDetailsUI } from '@ui';
import { useParams } from 'react-router-dom';

import { selectIngredientsState } from '../../services/slices/ingredients-slice';
//импортируем наш хук и селектор списка всех ингредиентов
import { useSelector } from '../../services/store';

export const IngredientDetails = (): React.JSX.Element => {
  // достаем пораметр :id из URL
  const { id } = useParams<{ id: string }>();

  //достаем массив всех ингредиентов
  const { ingredients } = useSelector(selectIngredientsState);

  // ищем в массиве тот самый ингредиент по которому клик
  const ingredientData = ingredients.find((item) => item._id === id);

  if (!ingredientData) {
    return <Preloader />;
  }

  return <IngredientDetailsUI ingredientData={ingredientData} />;
};
