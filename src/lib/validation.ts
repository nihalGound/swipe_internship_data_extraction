export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidatedData {
  isValid: boolean;
  errors: ValidationError[];
}

export const REQUIRED_FIELDS = {
  invoices: [
    "serialNumber",
    "invoiceDate",
    "customerName",
    "productName",
    "quantity",
    "taxPercent",
    "priceWithTax",
    "totalAmount",
  ],
  products: ["name", "quantity", "unitPrice", "taxPercent", "priceWithTax"],
  customers: ["customerName", "phoneNumber"],
};

export function validateInvoice(
  invoice: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!invoice.serialNumber?.trim()) {
    errors.push({
      field: "serialNumber",
      message: "Serial number is required",
    });
  }

  if (!invoice.invoiceDate?.trim()) {
    errors.push({ field: "invoiceDate", message: "Invoice date is required" });
  }

  if (!invoice.customerName?.trim()) {
    errors.push({
      field: "customerName",
      message: "Customer name is required",
    });
  }

  if (!invoice.productName?.trim()) {
    errors.push({ field: "productName", message: "Product name is required" });
  }

  const quantity = Number.parseFloat(invoice.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    errors.push({
      field: "quantity",
      message: "Quantity must be a positive number",
    });
  }

  const taxPercent = Number.parseFloat(invoice.taxPercent);
  if (isNaN(taxPercent) || taxPercent < 0) {
    errors.push({
      field: "taxPercent",
      message: "Tax percent must be non-negative",
    });
  }

  return errors;
}

export function validateProduct(
  product: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!product.name?.trim()) {
    errors.push({ field: "name", message: "Product name is required" });
  }

  const quantity = Number.parseFloat(product.quantity);
  if (isNaN(quantity) || quantity <= 0) {
    errors.push({
      field: "quantity",
      message: "Quantity must be a positive number",
    });
  }

  const unitPrice = Number.parseFloat(product.unitPrice);
  if (isNaN(unitPrice) || unitPrice < 0) {
    errors.push({
      field: "unitPrice",
      message: "Unit price must be non-negative",
    });
  }

  return errors;
}

export function validateCustomer(
  customer: Record<string, any>
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!customer.customerName?.trim()) {
    errors.push({
      field: "customerName",
      message: "Customer name is required",
    });
  }

  if (!customer.phoneNumber?.trim()) {
    errors.push({ field: "phoneNumber", message: "Phone number is required" });
  }

  return errors;
}
