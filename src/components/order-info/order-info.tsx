import { Preloader, OrderInfoUI } from '@ui';
import { useMemo, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import { selectIngredientsState } from '../../services/slices/ingredients-slice';
import { fetchOrderByNumber, selectOrderState } from '../../services/slices/order-slice';
// Импортируем хуки, экшены и селекторы
import { useDispatch, useSelector } from '../../services/store';

import type { TIngredient } from '@utils-types';

export const OrderInfo = (): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  const location = useLocation();
  const dispatch = useDispatch();

  const isModal = Boolean(
    (location.state as { background?: unknown } | null)?.background
  );
  const orderNumber = Number(number);

  const { feedOrders, userOrders, currentOrder } = useSelector(selectOrderState);
  const { ingredients } = useSelector(selectIngredientsState);

  // Сначала ищем заказ среди уже загруженых в стор
  const orderData = useMemo(
    () =>
      feedOrders.find((item) => item.number === orderNumber) ??
      userOrders.find((item) => item.number === orderNumber) ??
      (currentOrder?.number === orderNumber ? currentOrder : null),
    [feedOrders, userOrders, currentOrder, orderNumber]
  );

  // Запрашиваем с сервера только если заказ ещё не найден в сторе
  useEffect(() => {
    if (!orderData && orderNumber) {
      void dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = Record<string, TIngredient & { count: number }>;

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1,
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total,
    };
  }, [orderData, ingredients]);

  if (!orderInfo) {
    return <Preloader />;
  }

  return (
    <>
      {!isModal && (
        <p
          className="text text_type_digits-default mb-10"
          style={{ textAlign: 'center', marginTop: '120px' }}
        >
          #{orderInfo.number}
        </p>
      )}
      <OrderInfoUI orderInfo={orderInfo} />
    </>
  );
};
