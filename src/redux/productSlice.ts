import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ValidationError } from "@/lib/validation";

export interface Product {
  name: string;
  quantity: string;
  unitPrice: string;
  taxPercent: string;
  priceWithTax: string;
  discount: string | null;
  validationErrors?: ValidationError[];
}

interface ProductsState {
  data: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  data: [],
  loading: false,
  error: null,
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.data = action.payload;
    },
    updateProduct: (
      state,
      action: PayloadAction<{ index: number; product: Product }>
    ) => {
      if (state.data[action.payload.index]) {
        state.data[action.payload.index] = action.payload.product;
      }
    },
    setProductErrors: (
      state,
      action: PayloadAction<{ index: number; errors: ValidationError[] }>
    ) => {
      if (state.data[action.payload.index]) {
        state.data[action.payload.index].validationErrors =
          action.payload.errors;
      }
    },
    clearProducts: (state) => {
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
  setProducts,
  updateProduct,
  setProductErrors,
  clearProducts,
  setLoading,
  setError,
} = productsSlice.actions;
export default productsSlice.reducer;
