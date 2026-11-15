import { FeedInfoUI } from '@ui';

import { selectOrderState } from '../../services/slices/order-slice';
// Импортируем хук и селектор заказов
import { useSelector } from '../../services/store';

import type { TOrder } from '@utils-types';

const getOrders = (orders: TOrder[], status: string): number[] =>
  orders
    .filter((item) => item.status === status)
    .map((item) => item.number)
    .slice(0, 20);

export const FeedInfo = (): React.JSX.Element => {
  const { feedOrders, total, totalToday, isFeedLoading, error } =
    useSelector(selectOrderState);

  const feed = {
    orders: feedOrders,
    total,
    totalToday,
    isLoading: isFeedLoading,
    error: error ? new Error(error) : null,
  };

  const readyOrders = getOrders(feedOrders, 'done');
  const pendingOrders = getOrders(feedOrders, 'pending');

  return (
    <FeedInfoUI readyOrders={readyOrders} pendingOrders={pendingOrders} feed={feed} />
  );
};
