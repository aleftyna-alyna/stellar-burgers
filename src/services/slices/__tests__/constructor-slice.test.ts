import {
  constructorReducer,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
} from '../constructor-slice';

import type { TIngredient, TConstructorIngredient } from '../../../utils/types';

// Моковые ингредиенты
const mockBun: TIngredient = {
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
};

const mockMain: TIngredient = {
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
};

const mockSauce: TIngredient = {
  _id: '643d69a5c3f7b9001cfa0942',
  name: 'Соус Spicy-X',
  type: 'sauce',
  proteins: 30,
  fat: 20,
  carbohydrates: 40,
  calories: 30,
  price: 90,
  image: 'https://yandex.net',
  image_mobile: 'https://yandex.net',
  image_large: 'https://yandex.net',
};

describe('Тесты редьюсера constructorReducer', () => {
  const initialState = {
    bun: null,
    ingredients: [],
  };

  test('должен возвращать начальное состояние при передаче undefined и неизвестного экшена', () => {
    const result = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual(initialState);
  });

  test('должен добавлять булку в поле bun и генерировать уникальный id', () => {
    const action = addIngredient(mockBun);
    const result = constructorReducer(initialState, action);

    expect(result.bun).toMatchObject(mockBun);
    expect(result.bun?.id).toEqual(expect.any(String));
    expect(result.ingredients).toEqual([]);
  });

  test('должен добавлять начинку в массив ingredients и генерировать уникальный id', () => {
    const action = addIngredient(mockMain);
    const result = constructorReducer(initialState, action);

    expect(result.bun).toBeNull();
    expect(result.ingredients).toHaveLength(1);
    expect(result.ingredients[0]).toMatchObject(mockMain);
    expect(result.ingredients[0].id).toEqual(expect.any(String));
  });

  test('должен удалять ингредиент из массива по его id', () => {
    const firstItem: TConstructorIngredient = { ...mockMain, id: 'item-1' };
    const secondItem: TConstructorIngredient = { ...mockSauce, id: 'item-2' };

    const prevState = {
      bun: null,
      ingredients: [firstItem, secondItem],
    };

    const result = constructorReducer(prevState, removeIngredient('item-1'));

    expect(result.ingredients).toEqual([secondItem]);
  });

  test('должен перемещать ингредиенты в списке конструктора (moveIngredient)', () => {
    const firstItem: TConstructorIngredient = { ...mockMain, id: 'item-1' };
    const secondItem: TConstructorIngredient = { ...mockSauce, id: 'item-2' };

    const prevState = {
      bun: null,
      ingredients: [firstItem, secondItem],
    };

    // Перемещаем первый элемент на вторую позицию (index 0 -> index 1)
    const result = constructorReducer(
      prevState,
      moveIngredient({ fromIndex: 0, toIndex: 1 })
    );

    expect(result.ingredients).toEqual([secondItem, firstItem]);
  });

  test('должен полностью очищать конструктор при вызове clearConstructor', () => {
    const prevState = {
      bun: { ...mockBun, id: 'bun-1' },
      ingredients: [{ ...mockMain, id: 'item-1' }],
    };

    const result = constructorReducer(prevState, clearConstructor());

    expect(result).toEqual(initialState);
  });
});
