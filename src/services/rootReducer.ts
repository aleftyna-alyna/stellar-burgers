import { combineReducers } from '@reduxjs/toolkit';

import { constructorReducer } from './slices/constructor-slice';
import { ingredientsReducer } from './slices/ingredients-slice';
import { orderReducer } from './slices/order-slice';
import { userReducer } from './slices/user-slice';

// корневой редьюсер
export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  burgerConstructor: constructorReducer,
  user: userReducer,
  order: orderReducer,
});
