"use client";

import type { Invoice } from "@/redux/invoiceSlice";
import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateInvoice, setInvoiceErrors } from "@/redux/invoiceSlice";
import { updateProduct } from "@/redux/productSlice";
import { validateInvoice } from "@/lib/validation";
import { AlertCircle } from "lucide-react";

interface InvoicesTableProps {
  invoices: Invoice[];
  isLoading: boolean;
}

export function InvoicesTable({ invoices, isLoading }: InvoicesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.data);
  const customers = useAppSelector((state) => state.customers.data);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const visibleInvoices = invoices.slice(startIdx, startIdx + itemsPerPage);

  const handleFieldChange = useCallback(
    (invoiceIndex: number, field: string, value: string) => {
      const invoice = { ...invoices[invoiceIndex], [field]: value };

      // Validate the updated invoice
      const errors = validateInvoice(invoice);
      dispatch(setInvoiceErrors({ index: invoiceIndex, errors }));
      dispatch(updateInvoice({ index: invoiceIndex, invoice }));

      // If product name changed, sync to products tab
      if (field === "productName") {
        const productIndex = products.findIndex((p) => p.name === value);
        if (productIndex !== -1) {
          const product = products[productIndex];
          dispatch(
            updateProduct({
              index: productIndex,
              product: {
                ...product,
                quantity: invoice.quantity,
                taxPercent: invoice.taxPercent,
              },
            })
          );
        }
      }
    },
    [invoices, dispatch, products]
  );

  const getMissingFields = (invoice: Invoice): string[] => {
    const missing = [];
    if (!invoice.serialNumber?.trim()) missing.push("Serial #");
    if (!invoice.invoiceDate?.trim()) missing.push("Date");
    if (!invoice.customerName?.trim()) missing.push("Customer");
    if (!invoice.productName?.trim()) missing.push("Product");
    if (!invoice.quantity?.trim()) missing.push("Quantity");
    return missing;
  };

  const hasErrors = (invoice: Invoice) => {
    return invoice.validationErrors && invoice.validationErrors.length > 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading invoices...</div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-slate-500 mb-2">No invoices extracted yet</div>
        <p className="text-sm text-slate-600">
          Upload files to see invoice data
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
                Serial #
              </th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                Date
              </th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                Product
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Quantity
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Tax %
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Price
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Total
              </th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                Company
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleInvoices.map((inv, idx) => {
              const globalIdx = startIdx + idx;
              const isEditing = editingIndex === globalIdx;
              const rowHasErrors = hasErrors(inv);

              return (
                <tr
                  key={idx}
                  className={`border-b border-slate-800 hover:bg-slate-800/30 transition-colors ${
                    rowHasErrors ? "bg-red-950/20" : ""
                  }`}
                  onClick={() => setEditingIndex(isEditing ? null : globalIdx)}
                >
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        value={inv.serialNumber}
                        onChange={(e) =>
                          handleFieldChange(
                            globalIdx,
                            "serialNumber",
                            e.target.value
                          )
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{inv.serialNumber}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        value={inv.invoiceDate}
                        onChange={(e) =>
                          handleFieldChange(
                            globalIdx,
                            "invoiceDate",
                            e.target.value
                          )
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{inv.invoiceDate}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        value={inv.customerName}
                        onChange={(e) =>
                          handleFieldChange(
                            globalIdx,
                            "customerName",
                            e.target.value
                          )
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{inv.customerName}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <input
                        value={inv.productName}
                        onChange={(e) =>
                          handleFieldChange(
                            globalIdx,
                            "productName",
                            e.target.value
                          )
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200 truncate max-w-xs">
                        {inv.productName}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <input
                        value={inv.quantity}
                        onChange={(e) =>
                          handleFieldChange(
                            globalIdx,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{inv.quantity}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <input
                        value={inv.taxPercent}
                        onChange={(e) =>
                          handleFieldChange(
                            globalIdx,
                            "taxPercent",
                            e.target.value
                          )
                        }
                        className="bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-slate-200">{inv.taxPercent}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-slate-200">{inv.priceWithTax}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span className="text-slate-200">{inv.totalAmount}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-200 truncate">
                      {inv.companyName}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {invoices.some((inv) => hasErrors(inv)) && (
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-4">
          <div className="flex gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <h3 className="text-red-400 font-semibold">Validation Errors</h3>
          </div>
          <div className="space-y-2">
            {invoices.map((inv, idx) => {
              if (!hasErrors(inv)) return null;
              return (
                <div key={idx} className="text-sm text-red-300">
                  <strong>Row {idx + 1}:</strong>{" "}
                  {inv.validationErrors?.map((err) => err.message).join(", ")}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
          >
            Prev
          </button>
          <span className="text-slate-400 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-50 hover:bg-slate-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
