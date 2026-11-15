import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { NavLink, Link } from 'react-router-dom';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => (
  <header className={styles.header}>
    <nav className={`${styles.menu} p-4`}>
      <div className={styles.menu_part_left}>
        {/* Ссылка на Конструктор (активна только на главной '/') */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => clsx(styles.link, isActive && styles.link_active)}
        >
          {({ isActive }) => (
            <>
              <BurgerIcon type={isActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
            </>
          )}
        </NavLink>

        {/* Ссылка на Ленту заказов (активна на '/feed' и '/feed/:number') */}
        <NavLink
          to="/feed"
          className={({ isActive }) => clsx(styles.link, isActive && styles.link_active)}
        >
          {({ isActive }) => (
            <>
              <ListIcon type={isActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">Лента заказов</p>
            </>
          )}
        </NavLink>
      </div>

      {/* Логотип ведет на главную страницу */}
      <div className={styles.logo}>
        <Link to="/">
          <Logo className="" />
        </Link>
      </div>

      {/* Ссылка на Личный кабинет (активна на '/profile' и всех вложенных путях) */}
      <div className={styles.link_position_last}>
        <NavLink
          to="/profile"
          className={({ isActive }) => clsx(styles.link, isActive && styles.link_active)}
        >
          {({ isActive }) => (
            <>
              <ProfileIcon type={isActive ? 'primary' : 'secondary'} />
              <p className="text text_type_main-default ml-2">
                {userName ?? 'Личный кабинет'}
              </p>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  </header>
);
