import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { useEffect } from 'react';

import { fetchFeeds, selectOrderState } from '../../services/slices/order-slice';
// Импортируем хуки, экшен и селектор заказов
import { useDispatch, useSelector } from '../../services/store';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const { feedOrders, isLoading } = useSelector(selectOrderState);

  useEffect(() => {
    void dispatch(fetchFeeds());
  }, [dispatch]);

  const handleGetFeeds = (): void => {
    void dispatch(fetchFeeds());
  };

  if (isLoading || !feedOrders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={feedOrders} handleGetFeeds={handleGetFeeds} />;
};
