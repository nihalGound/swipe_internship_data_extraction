import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ValidationError } from "@/lib/validation";

export interface Invoice {
  serialNumber: string;
  invoiceDate: string;
  customerName: string;
  productName: string;
  quantity: string;
  taxPercent: string;
  priceWithTax: string;
  totalAmount: string;
  companyName: string;
  phoneNumber: string;
  status?: string;
  validationErrors?: ValidationError[];
}

interface InvoicesState {
  data: Invoice[];
  loading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  data: [],
  loading: false,
  error: null,
};

export const invoicesSlice = createSlice({
  name: "invoices",
  initialState,
  reducers: {
    setInvoices: (state, action: PayloadAction<Invoice[]>) => {
      state.data = action.payload;
    },
    updateInvoice: (
      state,
      action: PayloadAction<{ index: number; invoice: Invoice }>
    ) => {
      if (state.data[action.payload.index]) {
        state.data[action.payload.index] = action.payload.invoice;
      }
    },
    setInvoiceErrors: (
      state,
      action: PayloadAction<{ index: number; errors: ValidationError[] }>
    ) => {
      if (state.data[action.payload.index]) {
        state.data[action.payload.index].validationErrors =
          action.payload.errors;
      }
    },
    clearInvoices: (state) => {
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
  setInvoices,
  updateInvoice,
  setInvoiceErrors,
  clearInvoices,
  setLoading,
  setError,
} = invoicesSlice.actions;
export default invoicesSlice.reducer;
