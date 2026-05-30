import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import { cartMiddleware } from './middleware/cartMiddleware';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(cartMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

