import {
  setInvoices,
  setLoading as setInvoicesLoading,
  setError as setInvoicesError,
} from "@/redux/invoiceSlice";
import {
  setProducts,
  setLoading as setProductsLoading,
  setError as setProductsError,
} from "@/redux/productSlice";
import {
  setCustomers,
  setLoading as setCustomersLoading,
  setError as setCustomersError,
} from "@/redux/customerSlice";
import type { AppDispatch } from "@/redux/store";
export const uploadFiles = async (
  formData: FormData,
  dispatch: AppDispatch
) => {
  try {
    dispatch(setInvoicesLoading(true));
    dispatch(setProductsLoading(true));
    dispatch(setCustomersLoading(true));

    const response = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = `Upload failed: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.invoices && !data.products && !data.customers) {
      throw new Error("No data could be extracted from the uploaded files");
    }

    if (data.invoices) {
      dispatch(setInvoices(data.invoices));
    }
    if (data.products) {
      dispatch(setProducts(data.products));
    }
    if (data.customers) {
      dispatch(setCustomers(data.customers));
    }

    return { success: true, data };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    dispatch(setInvoicesError(errorMessage));
    dispatch(setProductsError(errorMessage));
    dispatch(setCustomersError(errorMessage));
    return { success: false, error: errorMessage };
  } finally {
    dispatch(setInvoicesLoading(false));
    dispatch(setProductsLoading(false));
    dispatch(setCustomersLoading(false));
  }
};
