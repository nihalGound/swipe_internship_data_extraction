"use client";

import type { Product } from "@/redux/productSlice";
import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateProduct, setProductErrors } from "@/redux/productSlice";
import { updateInvoice } from "@/redux/invoiceSlice";
import { validateProduct } from "@/lib/validation";
import { AlertCircle } from "lucide-react";
import { FieldErrorBadge } from "./field-error";

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

  const getFieldErrors = (product: Product, field: string): string[] => {
    return (
      product.validationErrors
        ?.filter((err) => err.field === field)
        .map((err) => err.message) || []
    );
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
                      <div className="space-y-1">
                        <input
                          value={prod.name}
                          onChange={(e) =>
                            handleFieldChange(idx, "name", e.target.value)
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-xs border ${
                            getFieldErrors(prod, "name").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Product name"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(prod, "name")}
                          label={getFieldErrors(prod, "name")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 ${
                          !prod.name ? "text-red-400 font-semibold" : ""
                        }`}
                      >
                        {prod.name || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={prod.unitPrice}
                          onChange={(e) =>
                            handleFieldChange(idx, "unitPrice", e.target.value)
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs border ${
                            getFieldErrors(prod, "unitPrice").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Price"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(prod, "unitPrice")}
                          label={getFieldErrors(prod, "unitPrice")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span className="text-slate-200">{prod.unitPrice}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={prod.quantity}
                          onChange={(e) =>
                            handleFieldChange(idx, "quantity", e.target.value)
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs border ${
                            getFieldErrors(prod, "quantity").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Qty"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(prod, "quantity")}
                          label={getFieldErrors(prod, "quantity")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 ${
                          !prod.quantity ? "text-red-400 font-semibold" : ""
                        }`}
                      >
                        {prod.quantity || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={prod.taxPercent}
                          onChange={(e) =>
                            handleFieldChange(idx, "taxPercent", e.target.value)
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs border ${
                            getFieldErrors(prod, "taxPercent").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Tax %"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(prod, "taxPercent")}
                          label={getFieldErrors(prod, "taxPercent")[0] || ""}
                        />
                      </div>
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
          <div className="flex gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <h3 className="text-red-400 font-semibold">
              Validation Issues Found
            </h3>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {products.map((prod, idx) => {
              if (!hasErrors(prod)) return null;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/50 rounded p-3 border border-red-900/50"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <strong className="text-red-300 text-sm">
                      {prod.name || "Unknown Product"}
                    </strong>
                  </div>
                  <div className="space-y-1 ml-6">
                    {prod.validationErrors?.map((err, errIdx) => (
                      <div
                        key={errIdx}
                        className="text-xs text-red-300 flex items-start gap-2"
                      >
                        <span className="text-red-500 font-bold">•</span>
                        <span>
                          <span className="font-semibold text-red-200">
                            {err.field}:
                          </span>{" "}
                          {err.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-red-300 bg-red-900/20 p-2 rounded">
            Click on a row to edit and fill in missing fields. Fields
            highlighted in red require attention.
          </div>
        </div>
      )}
    </div>
  );
}
