"use client";

import type { Customer } from "@/redux/customerSlice";
import { useState, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateCustomer, setCustomerErrors } from "@/redux/customerSlice";
import { updateInvoice } from "@/redux/invoiceSlice";
import { validateCustomer } from "@/lib/validation";
import { AlertCircle } from "lucide-react";
import { FieldErrorBadge } from "./field-error";

interface CustomersTableProps {
  customers: Customer[];
  isLoading: boolean;
}

export function CustomersTable({ customers, isLoading }: CustomersTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const dispatch = useAppDispatch();
  const invoices = useAppSelector((state) => state.invoices.data);

  const handleFieldChange = useCallback(
    (customerIndex: number, field: string, value: string) => {
      const customer = { ...customers[customerIndex], [field]: value };

      const errors = validateCustomer(customer);
      dispatch(setCustomerErrors({ index: customerIndex, errors }));
      dispatch(updateCustomer({ index: customerIndex, customer }));

      if (field === "customerName") {
        const invoiceIndices = invoices
          .map((inv, idx) =>
            inv.customerName === customers[customerIndex].customerName
              ? idx
              : -1
          )
          .filter((idx) => idx !== -1);

        invoiceIndices.forEach((invoiceIndex) => {
          dispatch(
            updateInvoice({
              index: invoiceIndex,
              invoice: {
                ...invoices[invoiceIndex],
                customerName: value,
                phoneNumber: customer.phoneNumber,
                companyName: customer.companyName || "",
              },
            })
          );
        });
      }
    },
    [customers, invoices, dispatch]
  );

  const getFieldErrors = (customer: Customer, field: string): string[] => {
    return (
      customer.validationErrors
        ?.filter((err) => err.field === field)
        .map((err) => err.message) || []
    );
  };

  const hasErrors = (customer: Customer) => {
    return customer.validationErrors && customer.validationErrors.length > 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading customers...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-slate-500 mb-2">No customers extracted yet</div>
        <p className="text-sm text-slate-600">
          Upload files to see customer data
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
                Customer Name
              </th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                Phone
              </th>
              <th className="text-left py-3 px-4 text-slate-300 font-semibold">
                Company
              </th>
              <th className="text-right py-3 px-4 text-slate-300 font-semibold">
                Total Purchases
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((cust, idx) => {
              const isEditing = editingIndex === idx;
              const rowHasErrors = hasErrors(cust);

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
                          value={cust.customerName}
                          onChange={(e) =>
                            handleFieldChange(
                              idx,
                              "customerName",
                              e.target.value
                            )
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-xs border ${
                            getFieldErrors(cust, "customerName").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Customer name"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(cust, "customerName")}
                          label={getFieldErrors(cust, "customerName")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 ${
                          !cust.customerName?.trim()
                            ? "text-red-400 font-semibold"
                            : ""
                        }`}
                      >
                        {cust.customerName || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          value={cust.phoneNumber}
                          onChange={(e) =>
                            handleFieldChange(
                              idx,
                              "phoneNumber",
                              e.target.value
                            )
                          }
                          className={`bg-slate-700 text-white px-2 py-1 rounded w-full text-xs border ${
                            getFieldErrors(cust, "phoneNumber").length > 0
                              ? "border-red-500 bg-red-900/20"
                              : "border-slate-600"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Phone number"
                        />
                        <FieldErrorBadge
                          errors={getFieldErrors(cust, "phoneNumber")}
                          label={getFieldErrors(cust, "phoneNumber")[0] || ""}
                        />
                      </div>
                    ) : (
                      <span
                        className={`text-slate-200 ${
                          !cust.phoneNumber?.trim()
                            ? "text-red-400 font-semibold"
                            : ""
                        }`}
                      >
                        {cust.phoneNumber || "Missing"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-200">
                      {cust.companyName || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">
                    <span className="text-slate-200">
                      {cust.totalPurchaseAmount}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {customers.some((cust) => hasErrors(cust)) && (
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-4">
          <div className="flex gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <h3 className="text-red-400 font-semibold">
              Validation Issues Found
            </h3>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {customers.map((cust, idx) => {
              if (!hasErrors(cust)) return null;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/50 rounded p-3 border border-red-900/50"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <strong className="text-red-300 text-sm">
                      {cust.customerName || "Unknown Customer"}
                    </strong>
                  </div>
                  <div className="space-y-1 ml-6">
                    {cust.validationErrors?.map((err, errIdx) => (
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
