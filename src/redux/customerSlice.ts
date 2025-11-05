import { ValidationError } from "@/lib/validation";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Customer {
  customerName: string;
  phoneNumber: string;
  companyName: string | null;
  totalPurchaseAmount: string;
  validationErrors?: ValidationError[];
}

interface CustomerState {
  data: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  data: [],
  loading: false,
  error: null,
};

export const customerSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.data = action.payload;
    },
    updateCustomer: (
      state,
      action: PayloadAction<{ index: number; customer: Customer }>
    ) => {
      if (state.data[action.payload.index]) {
        state.data[action.payload.index] = action.payload.customer;
      }
    },
    setCustomerErrors: (
      state,
      action: PayloadAction<{ index: number; errors: ValidationError[] }>
    ) => {
      if (state.data[action.payload.index]) {
        state.data[action.payload.index].validationErrors =
          action.payload.errors;
      }
    },
    clearCustomers: (state) => {
      state.data = [];
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCustomerErrors,
  updateCustomer,
  setCustomers,
  clearCustomers,
  setLoading,
  setError,
} = customerSlice.actions;
export default customerSlice.reducer;
