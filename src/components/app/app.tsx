import { AppHeader, Modal, IngredientDetails, OrderInfo } from '@components';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404,
} from '@pages'; // импортаруем все необходимые страницы
import { Preloader } from '@ui';
import { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useLocation, type Location } from 'react-router-dom';

import {
  fetchIngredients,
  selectIngredientsState,
} from '../../services/slices/ingredients-slice';
import { checkUserAuth } from '../../services/slices/user-slice';
//импортируем хуки из  store.ts и методы из слайса
import { useDispatch, useSelector } from '../../services/store';
import { ProtectedRoute } from '../protected-route/protected-route'; //импортируем нашу защиту

import type { AppContentProps } from './type';

import '../../index.css';

import styles from './app.module.css';

type LocationState = {
  background?: Location;
};

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();

  // достаем из Redux реальный массив, флаг загрузки и текст ошибок
  const { ingredients, isLoading, error } = useSelector(selectIngredientsState);

  useEffect(() => {
    //запускаем фсинхронный экшен получения данных при старте приложения
    void dispatch(fetchIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <AppContent
        ingredients={ingredients}
        isLoading={isLoading}
        error={error ? { message: error, name: 'Error' } : null}
      />
    </div>
  );
};

export default App;

/* Маршруты показываются только когда ингредиенты загружены: без них не
   отрисовать ни конструктор, ни состав заказа. */
const AppContent = ({
  ingredients,
  isLoading,
  error,
}: AppContentProps): React.JSX.Element => {
  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>
        Не удалось загрузить ингредиенты
        {error.message ? `: ${error.message}` : '.'}
      </p>
    );
  }

  if (!ingredients.length) {
    return (
      <p className={`${styles.message} text text_type_main-medium`}>Нет ингредиентов</p>
    );
  }

  return <RouteComponent />;
};

const RouteComponent = (): React.JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();

  // попытаемся достать фоновую локацию для модалок
  const state = location.state as LocationState | null;
  const background = state?.background;

  const handleModalClose = (): void => {
    void navigate(-1); //функция используется в модалках
  };

  return (
    <>
      <Routes location={background ?? location}>
        {/*публичный маршрут*/}
        <Route path="/" element={<ConstructorPage />} />
        <Route path="/feed" element={<Feed />} />

        {/*маршрут для гостей, только для неавторизованных */}
        <Route
          path="/login"
          element={<ProtectedRoute onlyUnAuth element={<Login />} />}
        />
        <Route
          path="/register"
          element={<ProtectedRoute onlyUnAuth element={<Register />} />}
        />
        <Route
          path="/forgot-password"
          element={<ProtectedRoute onlyUnAuth element={<ForgotPassword />} />}
        />
        <Route
          path="/reset-password"
          element={<ProtectedRoute onlyUnAuth element={<ResetPassword />} />}
        />

        {/*защищенные маршруты только для авторизованых*/}
        <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
        <Route
          path="/profile/orders"
          element={<ProtectedRoute element={<ProfileOrders />} />}
        />

        {/*прямые ссылки на мнгредиенты / заказ без модалки (если открыли в новой вкладке)*/}
        <Route path="/ingredients/:id" element={<IngredientDetails />} />
        <Route path="/feed/:number" element={<OrderInfo />} />
        <Route
          path="/profile/orders/:number"
          element={<ProtectedRoute element={<OrderInfo />} />}
        />

        {/*ошибка 404 для любого дрегого фдреса*/}
        <Route path="*" element={<NotFound404 />} />
      </Routes>

      {/*отрисовка ьодальных окон поверх основного интерфейса*/}
      {background && (
        <Routes>
          <Route
            path="/ingredients/:id"
            element={
              <Modal title="Детaли ингредиента" onClose={handleModalClose}>
                <IngredientDetails />
              </Modal>
            }
          />
          <Route
            path="/feed/:number"
            element={
              <Modal title="Информация о заказе" onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            }
          />

          <Route
            path="/profile/orders/:number"
            element={
              <ProtectedRoute
                element={
                  <Modal title="Информация о заказе" onClose={handleModalClose}>
                    <OrderInfo />
                  </Modal>
                }
              />
            }
          />
        </Routes>
      )}
    </>
  );
};
