import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { GoogleGenAI } from "@google/genai";
import * as XLSX from "xlsx";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Helper function to wait for file processing
async function waitForProcessing(file: any) {
  let currentFile = file;
  while (currentFile.state === "PROCESSING") {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    currentFile = await ai.files.get(file.name);
  }
  return currentFile;
}

// Helper function to create part from URI
function createPartFromUri(uri: string, mimeType: string) {
  return {
    fileData: {
      fileUri: uri,
      mimeType: mimeType,
    },
  };
}

async function excelToText(filePath: string): Promise<string> {
  const buffer = await fs.readFile(filePath);
  const workbook = XLSX.read(buffer, { type: "buffer" });

  let allText = "";
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    allText += `\n=== Sheet: ${sheetName} ===\n${csv}\n`;
  });

  return allText;
}

// Convert NextRequest to Node.js IncomingMessage for formidable
async function convertToNodeRequest(request: NextRequest) {
  const arrayBuffer = await request.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);

  const nodeRequest = Object.assign(readable, {
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
    url: request.url,
  });

  return nodeRequest as any;
}

const PROMPT = `You are an AI data extraction model for an invoice management system. You will receive files (Excel, PDF, or Images) containing invoices, receipts, or transaction details.

**IMPORTANT: Field names vary across documents. Map these variations to standard fields:**

Common field variations:
- Serial Number: "Serial Number", "Invoice Number", "Invoice No", "Bill No", "Receipt No", "Order ID", "Transaction ID"
- Invoice Date: "Invoice Date", "Date", "Bill Date", "Transaction Date", "Order Date"
- Customer Name: "Customer Name", "Party Name", "Client Name", "Buyer Name", "Customer"
- Product Name: "Product Name", "Item Name", "Item Description", "Product", "Description", "HSN Description"
- Quantity: "Qty", "Quantity", "Units", "Nos"
- Tax Percent: "Tax (%)", "Tax", "GST %", "Tax Rate", "CGST+SGST", "IGST"
- Price with Tax: "Price with Tax", "Amount", "Total", "Gross Amount", "Item Total Amount"
- Total Amount: "Total Amount", "Grand Total", "Net Amount", "Bill Amount", "Invoice Total"
- Company Name: "Company Name", "Party Company Name", "Organization", "Firm Name"
- Phone Number: "Phone Number", "Mobile", "Contact Number", "Phone", "Mobile No"

Extract and return **structured JSON** with ALL these fields:

{
  "invoices": [
    {
      "serialNumber": "",
      "invoiceDate": "",
      "customerName": "",
      "productName": "",
      "quantity": "",
      "taxPercent": "",
      "priceWithTax": "",
      "totalAmount": "",
      "companyName": "",
      "phoneNumber": ""
    }
  ],
  "products": [
    {
      "name": "",
      "quantity": "",
      "unitPrice": "",
      "taxPercent": "",
      "priceWithTax": "",
      "discount": ""
    }
  ],
  "customers": [
    {
      "customerName": "",
      "phoneNumber": "",
      "companyName": "",
      "totalPurchaseAmount": ""
    }
  ],
  "missing_fields": []
}

**CRITICAL RULES:**
1. **Always include ALL fields** - use null if data is missing
2. **Map field variations correctly** - recognize different column names for same data
3. **Each product line = separate invoice entry** - if one invoice has 5 products, create 5 invoice objects
4. **Deduplicate intelligently:**
   - Products: Same product name → one entry (sum quantities, keep highest unit price)
   - Customers: Same customer → one entry (sum all their purchase amounts)
5. **Handle multiple invoices in one file** - extract all rows/entries
6. **Numbers:** Remove commas, keep decimals (e.g., "69,183.35" → "69183.35")
7. **Tax:** If CGST+SGST shown separately, add them (9%+9%=18%)
8. **Total Amount:** This is the GRAND TOTAL per invoice (not per line item)
9. **For missing_fields:** List any critical fields that couldn't be extracted
10. **Return ONLY valid JSON** - no explanations, no markdown, no extra text`;

export async function POST(request: NextRequest) {
  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Configure formidable
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      multiples: true,
      filename: (name, ext, part) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        return `${part.originalFilename || "file"}-${uniqueSuffix}${ext}`;
      },
    });

    // Convert NextRequest to Node.js request
    const nodeRequest = await convertToNodeRequest(request);

    // Parse the form
    const [fields, files] = await form.parse(nodeRequest);

    // Get file array
    const fileArray: formidable.File[] = [];
    for (const [fieldName, fileList] of Object.entries(files)) {
      const filesArr = Array.isArray(fileList) ? fileList : [fileList];
      fileArray.push(
        ...filesArr.filter((f): f is formidable.File => f !== undefined)
      );
    }

    if (fileArray.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // AI Extraction Logic
    const content: (string | any)[] = [PROMPT];

    // Process each file
    for (const file of fileArray) {
      const mimeType = file.mimetype!;
      const filePath = file.filepath;

      // Handle Excel files - convert to text
      if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
        const excelText = await excelToText(filePath);
        content.push(
          `\n\n=== Excel File: ${file.originalFilename} ===\n${excelText}`
        );
      }
      // Handle PDF and Images - upload to Gemini
      else if (mimeType.includes("pdf") || mimeType.includes("image")) {
        const buffer = await fs.readFile(filePath);
        const blob = new Blob([buffer], { type: mimeType });

        const uploaded = await ai.files.upload({
          file: blob,
          config: {
            displayName: file.originalFilename!,
          },
        });

        const processed = await waitForProcessing(uploaded);

        if (processed.uri && processed.mimeType) {
          const fileContent = createPartFromUri(
            processed.uri,
            processed.mimeType
          );
          content.push(fileContent);
        }
      }
    }

    // Generate content with Gemini
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: content,
    });
    const text = result.text;

    const cleaned = text
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned!);
    } catch (error) {
      console.error("JSON Parse Error:", error);
      parsed = {
        error: "Failed to parse JSON",
        raw: cleaned,
      };
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error("Processing error:", error);
    return NextResponse.json(
      {
        error: "Failed to process files",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

//test_1:51s
//test_2:
//test_3:82s
//test_4:103s
//test_5:4.3m
