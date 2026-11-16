import { LoginUI } from '@ui-pages';
import { type SyntheticEvent, useState, useEffect } from 'react';

import {
  loginUser,
  selectUserState,
  clearUserError,
} from '../../services/slices/user-slice';
// импорт хук и экшены для авторизации
import { useDispatch, useSelector } from '../../services/store';

export const Login = (): React.JSX.Element => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const { error } = useSelector(selectUserState);

  //очищаем старую ошибку при открытии страницы
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (!email || !password) return;

    //отправляем запрос на вход
    //обновление user и  ProtectedRoute сам перенаправит
    void dispatch(loginUser({ email, password }));
  };

  return (
    <LoginUI
      errorText={error ?? ''}
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      handleSubmit={handleSubmit}
    />
  );
};
