import { RegisterUI } from '@ui-pages';
import { type SyntheticEvent, useState, useEffect } from 'react';

import {
  registerUser,
  selectUserState,
  clearUserError,
} from '../../services/slices/user-slice';
// импорт хук и экшены для регистрации
import { useDispatch, useSelector } from '../../services/store';

export const Register = (): React.JSX.Element => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const { error } = useSelector(selectUserState);

  //очищаем ошибку при открытии страницы
  useEffect(() => {
    dispatch(clearUserError());
  }, [dispatch]);

  const handleSubmit = (e: SyntheticEvent): void => {
    e.preventDefault();
    if (!userName || !email || !password) return;

    // запрос на регистрацию нового пользователя
    void dispatch(registerUser({ name: userName, email, password }));
  };

  return (
    <RegisterUI
      errorText={error ?? ''}
      email={email}
      userName={userName}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      setUserName={setUserName}
      handleSubmit={handleSubmit}
    />
  );
};
