import { configureStore } from "@reduxjs/toolkit";
import invoicesReducer from "./invoiceSlice";
import productsReducer from "./productSlice";
import customersReducer from "./customerSlice";

export const store = configureStore({
  reducer: {
    invoices: invoicesReducer,
    products: productsReducer,
    customers: customersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
