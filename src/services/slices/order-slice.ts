import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  orderBurgerApi,
  getFeedsApi,
  getOrdersApi,
  getOrderByNumberApi,
} from '../../utils/burger-api';

import type { TOrder } from '../../utils/types';
import type { RootState } from '../store';

type OrderState = {
  orderRequest: boolean; // Идет ли сейчас оформление заказа
  orderModalData: TOrder | null; // Данные только что созданного заказа (для модалки)
  feedOrders: TOrder[]; // Список всех заказов в общей ленте
  total: number; // Выполнено за все время
  totalToday: number; // Выполнено за сегодня
  userOrders: TOrder[]; // Список заказов текущего пользователя
  currentOrder: TOrder | null; // Детали одного конкретного заказа (по номеру)
  isFeedLoading: boolean; // отдельный флаг загрузки ленты и истории
  isOrderLoading: boolean; // отдельный флаг загрузки одного заказа
  error: string | null;
};

const initialState: OrderState = {
  orderRequest: false,
  orderModalData: null,
  feedOrders: [],
  total: 0,
  totalToday: 0,
  userOrders: [],
  currentOrder: null,
  isFeedLoading: false,
  isOrderLoading: false,
  error: null,
};

// 1. Оформление нового заказа (только для авторизованных)
export const createOrder = createAsyncThunk<TOrder, string[], { rejectValue: string }>(
  'order/create',
  async (ingredientsIds, { rejectWithValue }) => {
    try {
      const response = await orderBurgerApi(ingredientsIds);
      return response.order;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Ошибка оформления заказа'
      );
    }
  }
);

// 2. Получение общей ленты заказов (/feed)
export const fetchFeeds = createAsyncThunk<
  { orders: TOrder[]; total: number; totalToday: number },
  void,
  { rejectValue: string }
>('order/fetchFeeds', async (_, { rejectWithValue }) => {
  try {
    const response = await getFeedsApi();
    return {
      orders: response.orders,
      total: response.total,
      totalToday: response.totalToday,
    };
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Ошибка загрузки ленты заказов'
    );
  }
});

// 3. Получение истории заказов пользователя (/profile/orders)
export const fetchUserOrders = createAsyncThunk<TOrder[], void, { rejectValue: string }>(
  'order/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const orders = await getOrdersApi();
      return orders;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Ошибка загрузки истории заказов'
      );
    }
  }
);

// 4. Получение одного заказа по его номеру (для модалки и прямой страницы)
export const fetchOrderByNumber = createAsyncThunk<
  TOrder,
  number,
  { rejectValue: string }
>('order/fetchByNumber', async (number, { rejectWithValue }) => {
  try {
    const response = await getOrderByNumberApi(number);
    return response.orders[0];
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Ошибка загрузки деталей заказа'
    );
  }
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Закрытие модального окна с номером нового заказа
    clearOrderModal: (state) => {
      state.orderModalData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Создание заказа
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.payload ?? 'Ошибка при создании заказа';
      })

      // Общая лента заказов
      .addCase(fetchFeeds.pending, (state) => {
        state.isFeedLoading = true;
        state.error = null;
      })
      .addCase(fetchFeeds.fulfilled, (state, action) => {
        state.isFeedLoading = false;
        state.feedOrders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(fetchFeeds.rejected, (state, action) => {
        state.isFeedLoading = false;
        state.error = action.payload ?? 'Ошибка загрузки ленты';
      })

      // История заказов пользователя
      .addCase(fetchUserOrders.pending, (state) => {
        state.isFeedLoading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.isFeedLoading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.isFeedLoading = false;
        state.error = action.payload ?? 'Ошибка загрузки истории';
      })

      // Детали одного заказа
      .addCase(fetchOrderByNumber.pending, (state) => {
        state.isOrderLoading = true;
        state.currentOrder = null;
      })
      .addCase(fetchOrderByNumber.fulfilled, (state, action) => {
        state.isOrderLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByNumber.rejected, (state, action) => {
        state.isOrderLoading = false;
        state.error = action.payload ?? 'Заказ не найден';
      });
  },
});

export const { clearOrderModal } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;

// Селекторы
export const selectOrderState = (state: RootState): RootState['order'] => state.order;
