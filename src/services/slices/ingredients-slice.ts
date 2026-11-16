import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getIngredientsApi } from '../../utils/burger-api';

import type { TIngredient } from '../../utils/types';
import type { RootState } from '../store';
import type { PayloadAction } from '@reduxjs/toolkit';

//описываем структуру хранилища для ингридиентов
type IngredientsState = {
  ingredients: TIngredient[];
  isLoading: boolean;
  error: string | null;
};

const initialState: IngredientsState = {
  ingredients: [],
  isLoading: false,
  error: null,
};

//асинхронный Thunk для получения ингредиентов с сервера
export const fetchIngredients = createAsyncThunk<
  TIngredient[],
  void,
  { rejectValue: string }
>('ingredients/fetchIngredients', async (_, { rejectWithValue }) => {
  try {
    //getIngredientsApi возвращает Promis<TIngredient[]>
    const data = await getIngredientsApi();
    return data;
  } catch (err: unknown) {
    return rejectWithValue(
      err instanceof Error ? err.message : 'Ошибка загрузки ингридиентов'
    );
  }
});

const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchIngredients.fulfilled,
        (state, action: PayloadAction<TIngredient[]>) => {
          state.isLoading = false;
          state.ingredients = action.payload;
        }
      )
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Что-то пошло не так';
      });
  },
});

export const ingredientsReducer = ingredientsSlice.reducer;

//селектор вытаскивания данных
export const selectIngredientsState = (state: RootState): RootState['ingredients'] =>
  state.ingredients;
