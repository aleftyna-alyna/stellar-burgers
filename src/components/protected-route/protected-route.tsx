import { Preloader } from '@ui';
import { Navigate, useLocation, type Location } from 'react-router-dom';

import { selectUser, selectIsAuthChecked } from '../../services/slices/user-slice';
//импорт хук и селекторы из Redux хранилища
import { useSelector } from '../../services/store';

import type { ReactElement } from 'react';

type LocationState = {
  from?: Location;
};

type ProtectedRouteProps = {
  element: ReactElement;
  onlyUnAuth?: boolean; // флаг: доступно только неавторизованным(например для /login)
};

export const ProtectedRoute = ({
  element,
  onlyUnAuth = false,
}: ProtectedRouteProps): ReactElement => {
  const location = useLocation();

  //данные из Redux
  const isAuthChecked = useSelector(selectIsAuthChecked); //проверка профеля завершина
  const user = useSelector(selectUser); //пока не залогинелся

  //проверка наличия токина , при старте крутим прелодер
  if (!isAuthChecked) {
    return <Preloader />;
  }

  //если страница только для гостей(login, register), а пользователь уже вошел-
  if (onlyUnAuth && user) {
    //перенаправляем его на главную страницу
    const state = location.state as LocationState | null;
    const from = state?.from ?? { pathname: '/' };
    return <Navigate to={from} />;
  }
  //если страница требует авторизации (profil) а пользователя нет в системе
  if (!onlyUnAuth && !user) {
    //отправляем на вход, но запоменаем, куда он попытался попасть(в state)
    return <Navigate to="/login" state={{ from: location }} />;
  }

  //если все хорошо показываем нужную страницу
  return element;
};
