"use client";

import type { Product } from "@/redux/productSlice";
import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateProduct, setProductErrors } from "@/redux/productSlice";
import { updateInvoice } from "@/redux/invoiceSlice";
import { validateProduct } from "@/lib/validation";
import { AlertCircle } from "lucide-react";

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductsTable({ products, isLoading }: ProductsTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const invoices = useAppSelector((state) => state.invoices.data);

  const handleFieldChange = useCallback(
    (productIndex: number, field: string, value: string) => {
      const product = { ...products[productIndex], [field]: value };

      // Validate the updated product
      const errors = validateProduct(product);
      dispatch(setProductErrors({ index: productIndex, errors }));
      dispatch(updateProduct({ index: productIndex, product }));

      // If product name changed, sync to invoices tab
      if (field === "name") {
        const invoiceIndices = invoices
          .map((inv, idx) =>
            inv.productName === products[productIndex].name ? idx : -1
          )
          .filter((idx) => idx !== -1);

        invoiceIndices.forEach((invoiceIndex) => {
          dispatch(
            updateInvoice({
              index: invoiceIndex,
              invoice: {
                ...invoices[invoiceIndex],
                productName: value,
                quantity: product.quantity,
                taxPercent: product.taxPercent,
                priceWithTax: product.priceWithTax,
              },
            })
          );
        });
      }
    },
    [products, invoices, dispatch]
  );

  const hasErrors = (product: Product) => {
    return product.validationErrors && product.validationErrors.length > 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading products...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-slate-500 mb-2">No products extracted yet</div>
        <p className="text-sm text-slate-600">
          Upload files to see product data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                Product Name
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Unit Price
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Quantity
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Tax %
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Price w/ Tax
              </th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                Discount
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod, idx) => {
              const isEditing = editingIndex === idx;
              const rowHasErrors = hasErrors(prod);

              return (
                <tr
                  key={idx}
                  className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                    rowHasErrors ? "bg-red-950/20" : ""
                  }`}
                  onClick={() => setEditingIndex(isEditing ? null : idx)}
                >
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        value={prod.name}
                        onChange={(e) =>
                          handleFieldChange(idx, "name", e.target.value)
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{prod.name}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <input
                        value={prod.unitPrice}
                        onChange={(e) =>
                          handleFieldChange(idx, "unitPrice", e.target.value)
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{prod.unitPrice}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <input
                        value={prod.quantity}
                        onChange={(e) =>
                          handleFieldChange(idx, "quantity", e.target.value)
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{prod.quantity}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <input
                        value={prod.taxPercent}
                        onChange={(e) =>
                          handleFieldChange(idx, "taxPercent", e.target.value)
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{prod.taxPercent}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span className="text-slate-200">{prod.priceWithTax}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-200">
                      {prod.discount || "-"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.some((prod) => hasErrors(prod)) && (
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-4">
          <div className="flex gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <h3 className="text-red-400 font-semibold">Validation Errors</h3>
          </div>
          <div className="space-y-2">
            {products.map((prod, idx) => {
              if (!hasErrors(prod)) return null;
              return (
                <div key={idx} className="text-sm text-red-300">
                  <strong>{prod.name}:</strong>{" "}
                  {prod.validationErrors?.map((err) => err.message).join(", ")}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
