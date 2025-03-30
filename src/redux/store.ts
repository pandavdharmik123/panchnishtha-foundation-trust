import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice"; // Import the user slice
import tokenReducer from "./slices/tokens"; // Import the user slice
import expenseReducer from "./slices/expenses"; // Import the user slice

export const store = configureStore({
  reducer: {
    user: userReducer,
    tokens: tokenReducer,
    expenses: expenseReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
