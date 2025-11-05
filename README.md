Automated Data Extraction API
Intelligent Invoice, Product, and Customer Data Extraction using Google Gemini

AI-Powered Extraction

At the core of this system lies Google Gemini 2.5 Flash, an advanced multimodal AI model.
It processes uploaded documents to extract and normalize key business information into structured JSON with unified field naming — regardless of formatting differences in source files.

✨ AI Capabilities

Handles multi-file uploads in a single request

Understands and maps field name variations (e.g., “Invoice No” → serialNumber)

Extracts tabular data from Excel, PDF, or images

Merges, deduplicates, and normalizes data intelligently

Detects missing fields and includes them in output

Returns clean JSON ready for frontend rendering or database ingestion

## Tech

Next.js,Tailwind CSS, ShadCN, Gemin API

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`GEMINI_API_KEY`

## Run Locally

Clone the project

```bash
  git clone https://github.com/nihalGound/swipe_internship_data_extraction.git
```

Go to the project directory

```bash
  cd swipe_internship_data_extraction
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```

## Documentation

### How It Works — Step-by-Step Flow

#### Step 1: File Upload

Users upload one or more files (.xlsx, .pdf, .jpg, .png) through the frontend dashboard.
The files are sent to the backend via a multipart/form-data request.

Upload handled by Formidable

Files are temporarily stored under /public/uploads

Example: Upload 3 files → 1 Excel, 1 PDF, 1 Image invoice.

#### Step 2: File Preprocessing

Once uploaded, each file type is preprocessed:

File Type Preprocessing Action
Excel (.xlsx/.xls) Read via xlsx → converted to CSV-like text per sheet
PDF Uploaded to Gemini’s file storage using the @google/genai SDK
Image (.jpg/.png) Uploaded to Gemini for multimodal analysis

Excel content is directly appended as text input for the model, while PDF and image files are uploaded and referenced using Gemini’s fileUri system.

#### Step 3: AI Context Preparation

All file content (text + Gemini references) is combined with a system prompt designed to guide Gemini in understanding and standardizing data.

The prompt includes:

Field mapping definitions (e.g., "Invoice No" → serialNumber)

Rules for data normalization

JSON schema for consistent output

Deduplication logic (for customers/products)

Number and tax formatting instructions

```console
You are an AI data extraction model for an invoice management system.
Map similar fields such as:
- "Invoice No", "Bill No", "Receipt No" → serialNumber
- "Date", "Invoice Date" → invoiceDate
- "Customer Name", "Party Name" → customerName
...
Always return valid JSON with:
{ invoices: [...], products: [...], customers: [...], missing_fields: [] }
```

#### Step 4: Gemini Model Processing

The backend invokes Gemini 2.5 Flash via the generateContent() method:

```console
const result = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: content,
});
```

Gemini performs:

    OCR and text interpretation for images and PDFs
    Semantic mapping of similar field names
    Entity recognition (customers, products, invoices)
    Deduplication and merging of related records
    Automatic data type inference (dates, numbers, tax rates)
    JSON generation according to the defined schema
    This allows Gemini to handle mixed file batches in one query and produce unified, structured data output.
