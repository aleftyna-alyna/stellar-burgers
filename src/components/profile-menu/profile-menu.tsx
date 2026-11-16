import { ProfileMenuUI } from '@ui';
import { useLocation } from 'react-router-dom';

import { logoutUser } from '../../services/slices/user-slice';
//импортируем dispatch и экшен выхода из аккаунта
import { useDispatch } from '../../services/store';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const handleLogout = (): void => {
    //разлогиневаем пользователя
    void dispatch(logoutUser());
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
