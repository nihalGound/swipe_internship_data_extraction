"use client";

import type { Invoice } from "@/redux/invoiceSlice";
import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateInvoice, setInvoiceErrors } from "@/redux/invoiceSlice";
import { updateProduct } from "@/redux/productSlice";
import { validateInvoice } from "@/lib/validation";
import { AlertCircle } from "lucide-react";
import { FieldErrorBadge } from "./field-error";

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

      const errors = validateInvoice(invoice);
      dispatch(setInvoiceErrors({ index: invoiceIndex, errors }));
      dispatch(updateInvoice({ index: invoiceIndex, invoice }));

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

  const hasErrors = (invoice: Invoice) => {
    return invoice.validationErrors && invoice.validationErrors.length > 0;
  };

  const getFieldErrors = (invoice: Invoice, field: string): string[] => {
    return (
      invoice.validationErrors
        ?.filter((err) => err.field === field)
        .map((err) => err.message) || []
    );
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
                      <div className="space-y-1">
                        <input
                          value={inv.serialNumber}
                          onChange={(e) =>
                            handleFieldChange(
                              globalIdx,
                              "serialNumber",
                              e.target.value
                            )
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-xs border ${
                            getFieldErrors(inv, "serialNumber").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Serial number"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(inv, "serialNumber")}
                          label={getFieldErrors(inv, "serialNumber")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 ${
                          !inv.serialNumber?.trim()
                            ? "text-red-400 font-semibold"
                            : ""
                        }`}
                      >
                        {inv.serialNumber || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={inv.invoiceDate}
                          onChange={(e) =>
                            handleFieldChange(
                              globalIdx,
                              "invoiceDate",
                              e.target.value
                            )
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-xs border ${
                            getFieldErrors(inv, "invoiceDate").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Date"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(inv, "invoiceDate")}
                          label={getFieldErrors(inv, "invoiceDate")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 ${
                          !inv.invoiceDate?.trim()
                            ? "text-red-400 font-semibold"
                            : ""
                        }`}
                      >
                        {inv.invoiceDate || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={inv.customerName}
                          onChange={(e) =>
                            handleFieldChange(
                              globalIdx,
                              "customerName",
                              e.target.value
                            )
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-xs border ${
                            getFieldErrors(inv, "customerName").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Customer name"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(inv, "customerName")}
                          label={getFieldErrors(inv, "customerName")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 ${
                          !inv.customerName?.trim()
                            ? "text-red-400 font-semibold"
                            : ""
                        }`}
                      >
                        {inv.customerName || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={inv.productName}
                          onChange={(e) =>
                            handleFieldChange(
                              globalIdx,
                              "productName",
                              e.target.value
                            )
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-xs border ${
                            getFieldErrors(inv, "productName").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Product name"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(inv, "productName")}
                          label={getFieldErrors(inv, "productName")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 truncate max-w-xs ${
                          !inv.productName?.trim()
                            ? "text-red-400 font-semibold"
                            : ""
                        }`}
                      >
                        {inv.productName || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={inv.quantity}
                          onChange={(e) =>
                            handleFieldChange(
                              globalIdx,
                              "quantity",
                              e.target.value
                            )
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs border ${
                            getFieldErrors(inv, "quantity").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Qty"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(inv, "quantity")}
                          label={getFieldErrors(inv, "quantity")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 ${
                          !inv.quantity?.trim()
                            ? "text-red-400 font-semibold"
                            : ""
                        }`}
                      >
                        {inv.quantity || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={inv.taxPercent}
                          onChange={(e) =>
                            handleFieldChange(
                              globalIdx,
                              "taxPercent",
                              e.target.value
                            )
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-right text-xs border ${
                            getFieldErrors(inv, "taxPercent").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Tax %"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(inv, "taxPercent")}
                          label={getFieldErrors(inv, "taxPercent")[0] || ""}
                        />
                      </div>
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
          <div className="flex gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <h3 className="text-red-400 font-semibold">
              Validation Issues Found
            </h3>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {invoices.map((inv, idx) => {
              if (!hasErrors(inv)) return null;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/50 rounded p-3 border border-red-900/50"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <strong className="text-red-300 text-sm">
                      Row {idx + 1}: {inv.serialNumber || "Unknown"}
                    </strong>
                  </div>
                  <div className="space-y-1 ml-6">
                    {inv.validationErrors?.map((err, errIdx) => (
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
