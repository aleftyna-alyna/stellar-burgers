import { AppHeaderUI } from '@ui';

import { selectUser } from '../../services/slices/user-slice';
//импорт хук и селектор пользователя из Redux
import { useSelector } from '../../services/store';

export const AppHeader = (): React.JSX.Element => {
  // Получение имя пользователя из хранилища
  const user = useSelector(selectUser);

  return <AppHeaderUI userName={user?.name} />;
};
