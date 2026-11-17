import {
  ingredientsReducer,
  fetchIngredients,
  initialState,
} from '../ingredients-slice';

import type { TIngredient } from '../../../utils/types';

const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://yandex.net',
    image_mobile: 'https://yandex.net',
    image_large: 'https://yandex.net',
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://yandex.net',
    image_mobile: 'https://yandex.net',
    image_large: 'https://yandex.net',
  },
];

describe('Тесты редьюсера ingredientsReducer', () => {
  test('должен возвращать начальное состояние при передаче undefined и неизвестного экшена', () => {
    const result = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  test('должен устанавливать isLoading: true и сбрасывать error при fetchIngredients.pending', () => {
    const prevState = {
      ...initialState,
      error: 'Предыдущая ошибка',
    };
    const action = fetchIngredients.pending('requestId');
    const result = ingredientsReducer(prevState, action);

    expect(result).toEqual({
      ingredients: [],
      isLoading: true,
      error: null,
    });
  });

  test('должен сохранять ингредиенты и устанавливать isLoading: false при fetchIngredients.fulfilled', () => {
    const prevState = {
      ...initialState,
      isLoading: true,
    };
    const action = fetchIngredients.fulfilled(mockIngredients, 'requestId');
    const result = ingredientsReducer(prevState, action);

    expect(result).toEqual({
      ingredients: mockIngredients,
      isLoading: false,
      error: null,
    });
  });

  test('должен записывать ошибку и устанавливать isLoading: false при fetchIngredients.rejected', () => {
    const prevState = {
      ...initialState,
      isLoading: true,
    };
    const errorMessage = 'Ошибка загрузки ингредиентов';
    const action = fetchIngredients.rejected(null, 'requestId', undefined, errorMessage);
    const result = ingredientsReducer(prevState, action);

    expect(result).toEqual({
      ingredients: [],
      isLoading: false,
      error: errorMessage,
    });
  });
});
