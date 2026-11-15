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
} from '@pages';
import { Preloader } from '@ui';
import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  fetchIngredients,
  selectIngredientsState,
} from '../../services/slices/ingredients-slice';
import { checkUserAuth } from '../../services/slices/user-slice';
import { useDispatch, useSelector } from '../../services/store';
import { ProtectedRoute } from '../protected-route/protected-route';

import '../../index.css';

import styles from './app.module.css';

// Вспомогательная обёртка для модалки заказа, чтобы вывести его номер в заголовке
const OrderModal = ({ onClose }: { onClose: () => void }): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();
  return (
    <Modal title={`#${number ?? ''}`} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};

const App = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const { ingredients, isLoading, error } = useSelector(selectIngredientsState);
  const background = (location.state as { background?: Location } | null)?.background;

  useEffect(() => {
    void dispatch(fetchIngredients());
    void dispatch(checkUserAuth());
  }, [dispatch]);

  const handleModalClose = (): void => {
    void navigate(-1);
  };

  return (
    <div className={styles.app}>
      <AppHeader />

      {isLoading ? (
        <Preloader />
      ) : error ? (
        <p className={`${styles.message} text text_type_main-medium`}>
          Не удалось загрузить ингредиенты: {error}
        </p>
      ) : !ingredients.length ? (
        <p className={`${styles.message} text text_type_main-medium`}>
          Нет ингредиентов
        </p>
      ) : (
        <>
          <Routes location={background ?? location}>
            {/* Публичные маршруты */}
            <Route path="/" element={<ConstructorPage />} />
            <Route path="/feed" element={<Feed />} />

            {/* Маршруты для гостей */}
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

            {/* Защищенные маршруты профиля */}
            <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
            <Route
              path="/profile/orders"
              element={<ProtectedRoute element={<ProfileOrders />} />}
            />

            {/* Прямые страницы деталей ингредиента и заказа (при переходе по прямой ссылке) */}
            <Route
              path="/ingredients/:id"
              element={
                <div className={styles.detailPageWrap}>
                  <h3 className={`text text_type_main-large ${styles.detailHeader}`}>
                    Детали ингредиента
                  </h3>
                  <IngredientDetails />
                </div>
              }
            />
            <Route path="/feed/:number" element={<OrderInfo />} />
            <Route
              path="/profile/orders/:number"
              element={<ProtectedRoute element={<OrderInfo />} />}
            />

            {/* 404 */}
            <Route path="*" element={<NotFound404 />} />
          </Routes>

          {/* Модальные окна поверх основного интерфейса */}
          {background && (
            <Routes>
              <Route
                path="/ingredients/:id"
                element={
                  <Modal title="Детали ингредиента" onClose={handleModalClose}>
                    <IngredientDetails />
                  </Modal>
                }
              />
              <Route
                path="/feed/:number"
                element={<OrderModal onClose={handleModalClose} />}
              />
              <Route
                path="/profile/orders/:number"
                element={
                  <ProtectedRoute element={<OrderModal onClose={handleModalClose} />} />
                }
              />
            </Routes>
          )}
        </>
      )}
    </div>
  );
};

export default App;
