import { BurgerConstructorUI } from '@ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  selectConstructorItems,
  clearConstructor,
} from '../../services/slices/constructor-slice';
import {
  createOrder,
  selectOrderState,
  clearOrderModal,
} from '../../services/slices/order-slice';
import { selectUser } from '../../services/slices/user-slice';
// Импортируем хуки, селекторы и экшены из наших слайсов
import { useDispatch, useSelector } from '../../services/store';

import type { TConstructorIngredient } from '@utils-types';

export const BurgerConstructor = (): React.JSX.Element | null => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Достаем данные из всех нужных слайсов
  const constructorItems = useSelector(selectConstructorItems);
  const user = useSelector(selectUser);
  const { orderRequest, orderModalData } = useSelector(selectOrderState);

  const onOrderClick = (): void => {
    // Если не выбрана булка или заказ уже отправляется — ничего не делаем
    if (!constructorItems.bun || orderRequest) return;

    // Если пользователь НЕ авторизован — перенаправляем на страницу входа
    if (!user) {
      void navigate('/login');
      return;
    }

    // Собираем массив всех _id: булка снизу, начинки, булка сверху
    const ingredientsIds = [
      constructorItems.bun._id,
      ...constructorItems.ingredients.map((item) => item._id),
      constructorItems.bun._id,
    ];

    // Отправляем заказ на сервер. После успеха очищаем конструктор!
    dispatch(createOrder(ingredientsIds))
      .unwrap()
      .then(() => {
        dispatch(clearConstructor());
      })
      .catch(() => {
        // Ошибка уже сохранится в order-slice
      });
  };

  const closeOrderModal = (): void => {
    dispatch(clearOrderModal());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TConstructorIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
