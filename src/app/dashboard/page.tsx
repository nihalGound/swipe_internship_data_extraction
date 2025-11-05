"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { UploadDialog } from "@/components/upload-dialog";
import { InvoicesTable } from "@/components/invoice";
import { ProductsTable } from "@/components/product";
import { CustomersTable } from "@/components/customer";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { clearInvoices } from "@/redux/invoiceSlice";
import { clearProducts } from "@/redux/productSlice";
import { clearCustomers } from "@/redux/customerSlice";
import { toast } from "sonner";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "invoices" | "products" | "customers"
  >("invoices");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const invoices = useAppSelector((state) => state.invoices);
  const products = useAppSelector((state) => state.products);
  const customers = useAppSelector((state) => state.customers);
  const dispatch = useAppDispatch();

  const handleClearData = () => {
    dispatch(clearInvoices());
    dispatch(clearProducts());
    dispatch(clearCustomers());
    toast.success("Data cleared", {
      description: "All extracted data has been reset.",
    });
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onUploadClick={() => setIsUploadDialogOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {activeTab === "invoices" && "Invoices"}
                {activeTab === "products" && "Products"}
                {activeTab === "customers" && "Customers"}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {activeTab === "invoices" &&
                  `${invoices.data.length} invoices extracted`}
                {activeTab === "products" &&
                  `${products.data.length} products extracted`}
                {activeTab === "customers" &&
                  `${customers.data.length} customers extracted`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearData}
                className="border-slate-600 text-red-400 hover:bg-slate-800 gap-2 bg-transparent"
              >
                <RotateCcw className="w-4 h-4" />
                Clear Data
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "invoices" && (
              <InvoicesTable
                invoices={invoices.data}
                isLoading={invoices.loading}
              />
            )}
            {activeTab === "products" && (
              <ProductsTable
                products={products.data}
                isLoading={products.loading}
              />
            )}
            {activeTab === "customers" && (
              <CustomersTable
                customers={customers.data}
                isLoading={customers.loading}
              />
            )}
          </div>
        </div>
      </main>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
      />
    </div>
  );
}
