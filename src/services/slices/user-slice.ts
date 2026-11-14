import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
  registerUserApi,
  loginUserApi,
  getUserApi,
  updateUserApi,
  logoutApi,
} from '../../utils/burger-api';
import { setCookie, deleteCookie, getCookie } from '../../utils/cookie';

import type { TRegisterData, TLoginData } from '../../utils/burger-api';
import type { TUser } from '../../utils/types';
import type { RootState } from '../store';

type UserState = {
  user: TUser | null;
  isAuthChecked: boolean; // проверка токина при запуске приложения
  isLoading: boolean;
  error: string | null;
};

const initialState: UserState = {
  user: null,
  isAuthChecked: false,
  isLoading: false,
  error: null,
};

//регистрация пользователя
export const registerUser = createAsyncThunk<
  TUser,
  TRegisterData,
  { rejectValue: string }
>('user/register', async (data, { rejectWithValue }) => {
  try {
    const response = await registerUserApi(data);
    setCookie('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    return response.user;
  } catch (err: unknown) {
    return rejectWithValue(err instanceof Error ? err.message : 'Ошибка регистрации');
  }
});

// 2. Вход в систему (Авторизация)
export const loginUser = createAsyncThunk<TUser, TLoginData, { rejectValue: string }>(
  'user/login',
  async (data, { rejectWithValue }) => {
    try {
      const response = await loginUserApi(data);
      setCookie('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return response.user;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка входа');
    }
  }
);

// 3. Проверка авторизации при запуске приложения (получение данных профиля)
export const checkUserAuth = createAsyncThunk<TUser, void, { rejectValue: string }>(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      if (!getCookie('accessToken')) {
        return rejectWithValue('Токен отсутствует');
      }
      const response = await getUserApi();
      return response.user;
    } catch (err: unknown) {
      return rejectWithValue(
        err instanceof Error ? err.message : 'Ошибка проверки сессии'
      );
    }
  }
);

// 4. Обновление данных в личном кабинете
export const updateUser = createAsyncThunk<
  TUser,
  Partial<TRegisterData>,
  { rejectValue: string }
>('user/update', async (data, { rejectWithValue }) => {
  try {
    const response = await updateUserApi(data);
    return response.user;
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Ошибка обновления данных'
    );
  }
});

// 5. Выход из аккаунта
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      deleteCookie('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Ошибка при выходе');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Очистка текста ошибки при переходе между формами
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload! || 'Ошибка регистрации';
      })

      // Вход
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload! || 'Ошибка входа';
      })

      // Проверка токена при старте
      .addCase(checkUserAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthChecked = true;
      })
      .addCase(checkUserAuth.rejected, (state) => {
        state.user = null;
        state.isAuthChecked = true; // Проверка завершена, но пользователь не вошел
      })

      // Обновление профиля
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload! || 'Ошибка обновления профиля';
      })

      // Выход
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export const userReducer = userSlice.reducer;

// Селекторы для компонентов
export const selectUserState = (state: RootState): RootState['user'] => state.user;
export const selectUser = (state: RootState): RootState['user']['user'] =>
  state.user.user;
export const selectIsAuthChecked = (state: RootState): boolean =>
  state.user.isAuthChecked;
