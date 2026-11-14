import { BurgerConstructorElementUI } from '@ui';
import { memo } from 'react';

import {
  removeIngredient,
  moveIngredient,
} from '../../services/slices/constructor-slice';
//импортируем хук dispath  и экшены из слайса конструктора
import { useDispatch } from '../../services/store';

import type { BurgerConstructorElementProps } from './type';

export const BurgerConstructorElement = memo(function BurgerConstructorElement({
  ingredient,
  index,
  totalItems,
}: BurgerConstructorElementProps): React.JSX.Element {
  const dispatch = useDispatch();

  const handleMoveDown = (): void => {
    //перемещаем элемент на одну позицию вниз
    dispatch(moveIngredient({ fromIndex: index, toIndex: index + 1 }));
  };

  const handleMoveUp = (): void => {
    //перемещаем элемент на одну позицию вверх
    dispatch(moveIngredient({ fromIndex: index, toIndex: index - 1 }));
  };

  const handleClose = (): void => {
    // удаляем ингридиент из конструктора по его уникальному id
    dispatch(removeIngredient(ingredient.id));
  };

  return (
    <BurgerConstructorElementUI
      ingredient={ingredient}
      index={index}
      totalItems={totalItems}
      handleMoveUp={handleMoveUp}
      handleMoveDown={handleMoveDown}
      handleClose={handleClose}
    />
  );
});
