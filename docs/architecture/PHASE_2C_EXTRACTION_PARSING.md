# FATTS Contractor Onboarding Module
## Phase 2C — Document Extraction and Parsing Hierarchy

---

## OBJECTIVE

Design how the system extracts structured data from uploaded documents.

**This phase defines ONLY the extraction and parsing architecture.**

- Do NOT compute risk.
- Do NOT design scoring.
- Do NOT define fraud detection yet.

---

## 1️⃣ EXTRACTION HIERARCHY

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    DOCUMENT EXTRACTION HIERARCHY                                         │
│                    From Raw Document to Structured Data                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXTRACTION PIPELINE FLOW                                                                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐
  │  RAW DOCUMENT   │
  │  (PDF/Image)    │
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 1: DOCUMENT CLASSIFICATION                                                   │
  │  ─────────────────────────────────────────────────────────────────────────────────  │
  │  • Identify document type (if not pre-declared)                                     │
  │  • Verify document matches expected type                                            │
  │  • Detect document quality (resolution, clarity, orientation)                       │
  │  • Output: documentType, qualityScore, needsRotation                                │
  └────────┬────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 2: TEXT EXTRACTION (Primary)                                                 │
  │  ─────────────────────────────────────────────────────────────────────────────────  │
  │  METHOD: Text-based PDF Parsing                                                     │
  │  ───────────────────────────────────────────────────────────────────────────────    │
  │  • Tool: pdf-parse / pdfjs-dist / Apache PDFBox                                    │
  │  • Applicable: Native PDFs with embedded text (not scanned images)                  │
  │  • Process:                                                                         │
  │    1. Extract raw text content from PDF                                             │
  │    2. Preserve text positioning and structure                                       │
  │    3. Identify tables and structured regions                                        │
  │    4. Extract metadata (creation date, author, etc.)                                │
  │  • Success criteria: Text content extracted with > 80% coverage                     │
  │  • Output: rawText, textBlocks[], metadata                                          │
  │                                                                                      │
  │  DECISION POINT:                                                                     │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │
  │  │  IF textContent.length > MIN_THRESHOLD (100 chars)                          │    │
  │  │  AND textQuality > 0.7                                                       │    │
  │  │  THEN proceed to Layer 3 (Regex/NER)                                        │    │
  │  │  ELSE fall back to Layer 2B (OCR)                                           │    │
  │  └─────────────────────────────────────────────────────────────────────────────┘    │
  └────────┬────────────────────────────────────────────────────────────────────────────┘
           │
           ▼ (if text extraction failed)
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 2B: OCR FALLBACK                                                             │
  │  ─────────────────────────────────────────────────────────────────────────────────  │
  │  METHOD: Optical Character Recognition                                              │
  │  ───────────────────────────────────────────────────────────────────────────────    │
  │  • Primary Tool: Tesseract.js (client-side) / Tesseract (server-side)              │
  │  • Alternative: AWS Textract / Google Cloud Vision / Azure Form Recognizer         │
  │  • Applicable: Scanned PDFs, images (JPEG, PNG)                                    │
  │  • Process:                                                                         │
  │    1. Pre-process image (deskew, denoise, enhance contrast)                        │
  │    2. Detect text regions using computer vision                                    │
  │    3. Apply OCR with language model (English + Hindi if needed)                    │
  │    4. Post-process: spell correction, structure reconstruction                     │
  │  • Quality indicators:                                                              │
  │    - OCR confidence score per word/line                                            │
  │    - Detected text regions coverage                                                │
  │    - Character recognition accuracy                                                │
  │  • Output: rawText, ocrConfidence, boundingBoxes[]                                 │
  │                                                                                      │
  │  OCR CONFIGURATION:                                                                  │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │
  │  │  {                                                                           │    │
  │  │    "engine": "tesseract",                                                   │    │
  │  │    "languages": ["eng", "hin"],                                             │    │
  │  │    "preprocessing": {                                                        │    │
  │  │      "deskew": true,                                                        │    │
  │  │      "denoise": true,                                                       │    │
  │  │      "contrastEnhancement": true                                            │    │
  │  │    },                                                                        │    │
  │  │    "minConfidence": 0.60,                                                   │    │
  │  │    "outputFormat": "text_with_positions"                                    │    │
  │  │  }                                                                           │    │
  │  └─────────────────────────────────────────────────────────────────────────────┘    │
  └────────┬────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 3: FIELD EXTRACTION                                                          │
  │  ─────────────────────────────────────────────────────────────────────────────────  │
  │  METHOD A: Regex Pattern Matching (Primary)                                         │
  │  ───────────────────────────────────────────────────────────────────────────────    │
  │  • Applicable: Structured fields with known patterns                                │
  │  • Examples:                                                                         │
  │    - PAN: /[A-Z]{3}[ABCFGLPTJ][A-Z][0-9]{4}[A-Z]/                                  │
  │    - GSTIN: /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/              │
  │    - CIN: /[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}/                       │
  │    - Date: /(\d{2}[\/-]\d{2}[\/-]\d{4})|(\d{4}[\/-]\d{2}[\/-]\d{2})/               │
  │    - Amount: /₹?\s*[\d,]+\.?\d*\s*(Crore|Lakh|Thousand)?/i                         │
  │  • Process:                                                                         │
  │    1. Apply document-specific regex patterns                                        │
  │    2. Extract matched values with positions                                         │
  │    3. Calculate confidence based on pattern specificity                             │
  │  • Output: extractedFields[], patternMatches[]                                      │
  │                                                                                      │
  │  ───────────────────────────────────────────────────────────────────────────────    │
  │  METHOD B: Named Entity Recognition (NER) - Secondary                               │
  │  ───────────────────────────────────────────────────────────────────────────────    │
  │  • Applicable: Unstructured text, names, addresses                                  │
  │  • Tools: spaCy NER / Stanford NER / AWS Comprehend / Custom NER model             │
  │  • Entity types to detect:                                                          │
  │    - PERSON: Names of individuals, directors                                       │
  │    - ORG: Company names, organization names                                         │
  │    - GPE: Geographic locations (states, cities)                                    │
  │    - DATE: Dates in various formats                                                │
  │    - MONEY: Monetary amounts                                                        │
  │    - CARDINAL: Numbers, percentages                                                 │
  │    - CUSTOM: PAN, GSTIN, CIN, UDIN (custom patterns)                               │
  │  • Process:                                                                         │
  │    1. Run NER model on extracted text                                              │
  │    2. Map detected entities to schema fields                                       │
  │    3. Calculate confidence based on model certainty                                 │
  │  • Output: entities[], nerConfidence                                                │
  │                                                                                      │
  │  DECISION POINT:                                                                     │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │
  │  │  IF regex extraction confidence > 0.85                                      │    │
  │  │  THEN use regex results (higher precision)                                  │    │
  │  │  ELSE IF NER confidence > 0.70                                              │    │
  │  │  THEN use NER results                                                       │    │
  │  │  ELSE combine both with weighted confidence                                 │    │
  │  └─────────────────────────────────────────────────────────────────────────────┘    │
  └────────┬────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 4: CONTEXT-AWARE EXTRACTION                                                  │
  │  ─────────────────────────────────────────────────────────────────────────────────  │
  │  METHOD: Key-Value Pair Detection                                                   │
  │  ───────────────────────────────────────────────────────────────────────────────    │
  │  • Applicable: Form-like documents with labeled fields                              │
  │  • Process:                                                                         │
  │    1. Identify key phrases (labels) in document                                    │
  │    2. Locate associated values (spatial proximity)                                 │
  │    3. Handle multi-line values                                                      │
  │    4. Handle table structures                                                       │
  │  • Key phrase patterns:                                                             │
  │    - "PAN:", "PAN Number:", "Permanent Account Number:"                            │
  │    - "GSTIN:", "GST Number:", "GST Identification Number:"                         │
  │    - "Name:", "Legal Name:", "Company Name:"                                       │
  │    - "Date:", "Date of Issue:", "Registration Date:"                               │
  │  • Output: keyValuePairs[], tableData[]                                             │
  │                                                                                      │
  │  TABLE EXTRACTION:                                                                   │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │
  │  │  For documents with tabular data (Past Projects, Turnover):                 │    │
  │  │  1. Detect table boundaries                                                  │    │
  │  │  2. Identify header row                                                      │    │
  │  │  3. Extract each row as a record                                             │    │
  │  │  4. Map columns to schema fields                                             │    │
  │  │  5. Handle merged cells and spanning rows                                    │    │
  │  └─────────────────────────────────────────────────────────────────────────────┘    │
  └────────┬────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 5: VALIDATION & CONFIDENCE SCORING                                           │
  │  ─────────────────────────────────────────────────────────────────────────────────  │
  │  • Validate extracted fields against schema rules                                   │
  │  • Calculate overall extraction confidence                                          │
  │  • Flag fields requiring manual review                                              │
  │  • Output: validatedFields[], confidenceScore, validationFlags[]                    │
  └────────┬────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │  DECISION: MANUAL REVIEW REQUIRED?                                                  │
  │  ─────────────────────────────────────────────────────────────────────────────────  │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │
  │  │  IF overallConfidence < 0.70                                                │    │
  │  │  OR any mandatory field missing                                             │    │
  │  │  OR any critical validation failed                                          │    │
  │  │  THEN flag for manual review                                                │    │
  │  │  ELSE proceed to structured output                                          │    │
  │  └─────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │  LAYER 6: MANUAL REVIEW FALLBACK                                                    │
  │  ─────────────────────────────────────────────────────────────────────────────────  │
  │  TRIGGER CONDITIONS:                                                                │
  │  • Overall confidence < 0.70                                                        │
  │  • Mandatory field extraction failed                                                │
  │  • Multiple conflicting values detected                                             │
  │  • Document quality too poor for automated extraction                               │
  │  • New document format not in training data                                         │
  │                                                                                      │
  │  MANUAL REVIEW WORKFLOW:                                                            │
  │  ┌─────────────────────────────────────────────────────────────────────────────┐    │
  │  │  1. Create review task in queue                                             │    │
  │  │  2. Assign to data entry operator                                           │    │
  │  │  3. Display: original document + extracted fields + confidence scores       │    │
  │  │  4. Operator verifies/corrects each field                                   │    │
  │  │  5. Supervisor approval for critical documents                              │    │
  │  │  6. Final data stored with "MANUAL_VERIFIED" flag                           │    │
  │  └─────────────────────────────────────────────────────────────────────────────┘    │
  │                                                                                      │
  │  MANUAL REVIEW UI ELEMENTS:                                                         │
  │  • Side-by-side view: Document image | Extracted fields form                       │
  │  • Highlighted regions on document for each field                                   │
  │  • Confidence indicator for each field                                              │
  │  • Validation error messages                                                        │
  │  • Approve/Reject/Correct buttons                                                   │
  └─────────────────────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────┐
  │  STRUCTURED     │
  │  OUTPUT         │
  └─────────────────┘
```

---

## EXTRACTION METHOD SELECTION MATRIX

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXTRACTION METHOD SELECTION BY DOCUMENT TYPE                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Document Type         │ Primary Method    │ Secondary │ NER Required │ Manual Review   │
│  ──────────────────────┼───────────────────┼───────────┼──────────────┼─────────────────│
│  PAN Card              │ Regex             │ OCR       │ No           │ If conf < 0.80  │
│  GST Certificate       │ Regex + Key-Value │ OCR       │ No           │ If conf < 0.85  │
│  CIN Certificate       │ Regex + Key-Value │ OCR       │ No           │ If conf < 0.85  │
│  LLPIN Certificate     │ Regex + Key-Value │ OCR       │ No           │ If conf < 0.85  │
│  Past Projects PDF     │ Table Extraction  │ OCR + NER │ Yes          │ If conf < 0.70  │
│  CA Turnover Cert      │ Regex + Key-Value │ OCR       │ Partial      │ If conf < 0.80  │
│  Bank Solvency         │ Key-Value         │ OCR       │ Partial      │ If conf < 0.75  │
│  Litigation Disclosure │ NER + Key-Value   │ OCR       │ Yes          │ If conf < 0.70  │
│  ESIC Certificate      │ Regex + Key-Value │ OCR       │ No           │ If conf < 0.80  │
│  Labour License        │ Key-Value         │ OCR       │ No           │ If conf < 0.75  │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ VALIDATION LAYERS

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    VALIDATION LAYER ARCHITECTURE                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 1: FORMAT VALIDATION                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  PURPOSE: Validate each extracted field against its expected format                     │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FIELD TYPE          │ VALIDATION RULES                                          │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  PAN                 │ • Length: exactly 10 characters                           │    │
│  │                      │ • Pattern: ^[A-Z]{3}[ABCFGLPTJ][A-Z][0-9]{4}[A-Z]$        │    │
│  │                      │ • All uppercase                                           │    │
│  │                      │ • Entity type char valid (position 4)                     │    │
│  │                      │                                                            │    │
│  │  GSTIN               │ • Length: exactly 15 characters                           │    │
│  │                      │ • Pattern: ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$ │
│  │                      │ • Check digit valid (Luhn algorithm)                      │    │
│  │                      │ • State code valid (positions 1-2)                        │    │
│  │                      │                                                            │    │
│  │  CIN                 │ • Length: exactly 21 characters                           │    │
│  │                      │ • Pattern: ^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$ │
│  │                      │ • Year valid (positions 9-12)                             │    │
│  │                      │ • Ownership code valid (positions 13-15)                  │    │
│  │                      │                                                            │    │
│  │  Date                │ • Valid calendar date                                     │    │
│  │                      │ • Not in future (for most fields)                         │    │
│  │                      │ • Within reasonable range (e.g., incorporation year)      │    │
│  │                      │ • Format: ISO 8601 (YYYY-MM-DD) after parsing             │    │
│  │                      │                                                            │    │
│  │  Amount              │ • Positive integer (in paise)                             │    │
│  │                      │ • Within reasonable range                                 │    │
│  │                      │ • Not zero for mandatory financial fields                 │    │
│  │                      │                                                            │    │
│  │  Name                │ • Length: 3-200 characters                                │    │
│  │                      │ • Alphabetic + spaces + basic punctuation                 │    │
│  │                      │ • Not empty or whitespace only                            │    │
│  │                      │                                                            │    │
│  │  Address             │ • Required fields present (line1, city, state, pincode)   │    │
│  │                      │ • Pincode: ^[1-9][0-9]{5}$                                │    │
│  │                      │ • State: valid enum value                                 │    │
│  │                      │                                                            │    │
│  │  Email               │ • Valid email format                                      │    │
│  │                      │ • Pattern: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$│
│  │                      │                                                            │    │
│  │  Phone               │ • Pattern: ^[+]?[0-9]{10,15}$                            │    │
│  │                      │ • Valid Indian mobile (10 digits starting with 6-9)       │    │
│  │                      │                                                            │    │
│  │  Wallet Address      │ • Pattern: ^0x[a-fA-F0-9]{40}$                           │    │
│  │                      │ • Checksum valid (EIP-55 for mixed case)                  │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  OUTPUT: formatValidationResults[]                                                       │
│  [                                                                                        │
│    {                                                                                      │
│      field: "legalIdentity.pan",                                                         │
│      value: "AAPFU0939K",                                                                │
│      valid: true,                                                                         │
│      errors: [],                                                                          │
│      warnings: []                                                                         │
│    }                                                                                      │
│  ]                                                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 2: CROSS-FIELD CONSISTENCY VALIDATION                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  PURPOSE: Validate relationships between multiple fields                                 │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  VALIDATION RULE                     │ DESCRIPTION                              │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  PAN-GSTIN Consistency               │ GSTIN positions 3-7 must match PAN       │    │
│  │                                       │ GSTIN position 12 must match PAN pos 4   │    │
│  │                                       │                                           │    │
│  │  Name Consistency                    │ Legal name must match across:            │    │
│  │                                       │   - PAN card                             │    │
│  │                                       │   - GST certificate                      │    │
│  │                                       │   - CIN certificate                      │    │
│  │                                       │   - CA certificate                       │    │
│  │                                       │ Tolerance: minor punctuation differences │    │
│  │                                       │                                           │    │
│  │  Entity Type Consistency             │ Entity type from PAN must match:         │    │
│  │                                       │   - Declared entity type                 │    │
│  │                                       │   - GST business type                    │    │
│  │                                       │   - CIN ownership code                   │    │
│  │                                       │                                           │    │
│  │  State Consistency                   │ State from GSTIN must match:             │    │
│  │                                       │   - Registered address state             │    │
│  │                                       │   - GST certificate state                │    │
│  │                                       │                                           │    │
│  │  Date Consistency                    │ Registration date checks:                │    │
│  │                                       │   - GST reg date >= Incorporation date   │    │
│  │                                       │   - All dates <= current date            │    │
│  │                                       │   - Turnover FY dates are sequential     │    │
│  │                                       │                                           │    │
│  │  Financial Consistency               │ Turnover consistency:                    │    │
│  │                                       │   - CA cert turnover matches declared    │    │
│  │                                       │   - No negative growth without reason    │    │
│  │                                       │                                           │    │
│  │  Project Date Consistency            │ For each project:                        │    │
│  │                                       │   - completionDate >= startDate          │    │
│  │                                       │   - actualCompletionDate >= originalDate │    │
│  │                                       │   - delayDays calculated correctly       │    │
│  │                                       │                                           │    │
│  │  Address Consistency                 │ Address across documents:                │    │
│  │                                       │   - City/state should match              │    │
│  │                                       │   - Minor variations allowed             │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  NAME MATCHING ALGORITHM:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  1. Normalize both names:                                                        │    │
│  │     - Convert to uppercase                                                       │    │
│  │     - Remove punctuation                                                         │    │
│  │     - Remove extra spaces                                                        │    │
│  │     - Expand abbreviations (PVT → PRIVATE, LTD → LIMITED)                       │    │
│  │                                                                                  │    │
│  │  2. Calculate similarity:                                                        │    │
│  │     - Levenshtein distance                                                       │    │
│  │     - Jaro-Winkler similarity                                                    │    │
│  │     - Token-based similarity (word order independent)                           │    │
│  │                                                                                  │    │
│  │  3. Determine match:                                                             │    │
│  │     - similarity >= 0.95: EXACT_MATCH                                           │    │
│  │     - similarity >= 0.85: LIKELY_MATCH                                          │    │
│  │     - similarity >= 0.70: PARTIAL_MATCH (flag for review)                       │    │
│  │     - similarity < 0.70: MISMATCH (error)                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  OUTPUT: consistencyValidationResults[]                                                  │
│  [                                                                                        │
│    {                                                                                      │
│      rule: "PAN_GSTIN_CONSISTENCY",                                                      │
│      fields: ["legalIdentity.pan", "legalIdentity.gstin"],                               │
│      status: "PASS",                                                                      │
│      details: "PAN AAPFU0939K matches GSTIN positions 3-7"                               │
│    },                                                                                     │
│    {                                                                                      │
│      rule: "NAME_CONSISTENCY",                                                           │
│      fields: ["legalIdentity.legalName", "extracted.panName", "extracted.gstName"],      │
│      status: "PARTIAL_MATCH",                                                             │
│      details: "Name similarity: 0.82 - minor variation detected",                        │
│      requiresReview: true                                                                 │
│    }                                                                                      │
│  ]                                                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  LAYER 3: DATA TYPE VALIDATION                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  PURPOSE: Ensure extracted values match expected data types                              │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  DATA TYPE           │ VALIDATION                                               │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  String              │ • Type check: typeof === 'string'                        │    │
│  │                      │ • Length constraints                                      │    │
│  │                      │ • Character set validation                               │    │
│  │                      │                                                           │    │
│  │  Integer             │ • Type check: Number.isInteger()                        │    │
│  │                      │ • Range check (min, max)                                 │    │
│  │                      │ • No NaN or Infinity                                     │    │
│  │                      │                                                           │    │
│  │  Number (Float)      │ • Type check: typeof === 'number'                       │    │
│  │                      │ • Range check                                            │    │
│  │                      │ • Precision check (for currency)                         │    │
│  │                      │                                                           │    │
│  │  Boolean             │ • Type check: typeof === 'boolean'                      │    │
│  │                      │ • Or string conversion: "true"/"false" → boolean        │    │
│  │                      │                                                           │    │
│  │  Date                │ • Valid Date object                                      │    │
│  │                      │ • Not NaN                                                │    │
│  │                      │ • Parseable from string formats                          │    │
│  │                      │                                                           │    │
│  │  Enum                │ • Value in allowed list                                  │    │
│  │                      │ • Case-insensitive matching                              │    │
│  │                      │                                                           │    │
│  │  Array               │ • Type check: Array.isArray()                           │    │
│  │                      │ • Length constraints                                     │    │
│  │                      │ • Item type validation                                   │    │
│  │                      │                                                           │    │
│  │  Object              │ • Type check: typeof === 'object' && !Array.isArray()  │    │
│  │                      │ • Required properties check                              │    │
│  │                      │ • Schema validation                                      │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  TYPE COERCION RULES:                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  SOURCE TYPE    │ TARGET TYPE   │ COERCION RULE                                │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  String         │ Integer       │ parseInt() with radix 10, validate result   │    │
│  │  String         │ Number        │ parseFloat(), validate result               │    │
│  │  String         │ Boolean       │ "true"/"yes"/"1" → true, else false        │    │
│  │  String         │ Date          │ Date.parse() with multiple format support  │    │
│  │  Number         │ String        │ toString()                                   │    │
│  │  Any            │ Enum          │ Case-insensitive match against allowed     │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  OUTPUT: typeValidationResults[]                                                         │
│  [                                                                                        │
│    {                                                                                      │
│      field: "financialQualification.turnoverHistory[0].amount",                          │
│      originalValue: "5,00,00,000",                                                        │
│      coercedValue: 5000000000,                                                            │
│      targetType: "integer",                                                               │
│      valid: true,                                                                         │
│      coercionApplied: true                                                                │
│    }                                                                                      │
│  ]                                                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## VALIDATION SEVERITY LEVELS

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION SEVERITY CLASSIFICATION                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  SEVERITY    │ CODE │ DESCRIPTION              │ ACTION                                  │
│  ────────────┼──────┼──────────────────────────┼────────────────────────────────────────│
│  INFO        │ 0    │ Informational, no issue  │ Log only, no blocking                   │
│  WARNING     │ 1    │ Minor issue detected     │ Log, flag for review, allow proceed    │
│  ERROR       │ 2    │ Significant issue        │ Block automated processing             │
│  CRITICAL    │ 3    │ Blocking issue           │ Block and require manual intervention  │
│                                                                                          │
│  SEVERITY ASSIGNMENT BY VALIDATION TYPE:                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  VALIDATION FAILURE                              │ SEVERITY                      │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  Format validation failure (mandatory field)     │ ERROR                         │    │
│  │  Format validation failure (optional field)      │ WARNING                       │    │
│  │  Cross-field consistency mismatch                │ ERROR                         │    │
│  │  Name similarity 0.70-0.85                       │ WARNING                       │    │
│  │  Name similarity < 0.70                          │ ERROR                         │    │
│  │  Type coercion applied successfully              │ INFO                          │    │
│  │  Type coercion failed                            │ ERROR                         │    │
│  │  Missing mandatory field                         │ CRITICAL                      │    │
│  │  API verification failed                         │ ERROR                         │    │
│  │  Extraction confidence < threshold               │ WARNING                       │    │
│  │  Extraction confidence < 0.50                    │ ERROR                         │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ STRUCTURED EXTRACTION OUTPUT FORMAT

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  STANDARDIZED EXTRACTION RESULT OBJECT                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

{
  "extractionId": "550e8400-e29b-41d4-a716-446655440001",
  "documentId": "550e8400-e29b-41d4-a716-446655440002",
  "contractorId": "550e8400-e29b-41d4-a716-446655440003",
  "documentType": "PAN_CARD",
  "extractionTimestamp": "2024-02-15T10:30:00.000Z",
  
  "extractionMethod": {
    "primary": "REGEX",
    "secondary": "OCR",
    "nerUsed": false,
    "manualReview": false,
    "toolVersion": "tesseract@5.3.0",
    "modelVersion": "ner-model-v1.2.0"
  },
  
  "extractedFields": {
    "panNumber": {
      "value": "AAPFU0939K",
      "confidence": 0.98,
      "source": {
        "method": "REGEX",
        "pattern": "^[A-Z]{3}[ABCFGLPTJ][A-Z][0-9]{4}[A-Z]$",
        "matchPosition": {
          "page": 1,
          "boundingBox": {
            "x": 150,
            "y": 200,
            "width": 180,
            "height": 30
          }
        }
      },
      "validationStatus": "VALID",
      "validationDetails": {
        "formatValid": true,
        "entityTypeMatch": true,
        "apiVerified": true
      }
    },
    "nameOnCard": {
      "value": "ABC CONSTRUCTIONS PRIVATE LIMITED",
      "confidence": 0.95,
      "source": {
        "method": "KEY_VALUE",
        "keyPhrase": "Name:",
        "matchPosition": {
          "page": 1,
          "boundingBox": {
            "x": 100,
            "y": 120,
            "width": 350,
            "height": 25
          }
        }
      },
      "validationStatus": "VALID",
      "validationDetails": {
        "lengthValid": true,
        "crossDocumentMatch": {
          "gstCertificate": {
            "matched": true,
            "similarity": 0.98
          }
        }
      }
    },
    "entityType": {
      "value": "PRIVATE_LIMITED",
      "confidence": 1.0,
      "source": {
        "method": "DERIVED",
        "derivedFrom": "panNumber",
        "derivationRule": "PAN position 4 = 'C' indicates Company"
      },
      "validationStatus": "VALID"
    },
    "fatherName": {
      "value": null,
      "confidence": 0,
      "source": {
        "method": "NOT_APPLICABLE",
        "reason": "Entity type is Company, father name not applicable"
      },
      "validationStatus": "NOT_REQUIRED"
    },
    "dateOfBirth": {
      "value": null,
      "confidence": 0,
      "source": {
        "method": "NOT_APPLICABLE",
        "reason": "Entity type is Company, DOB not applicable"
      },
      "validationStatus": "NOT_REQUIRED"
    }
  },
  
  "confidenceScore": {
    "overall": 0.96,
    "breakdown": {
      "textExtraction": 0.98,
      "fieldExtraction": 0.95,
      "validation": 1.0,
      "crossDocumentConsistency": 0.98
    },
    "calculationMethod": "weighted_average",
    "weights": {
      "textExtraction": 0.25,
      "fieldExtraction": 0.40,
      "validation": 0.20,
      "crossDocumentConsistency": 0.15
    }
  },
  
  "validationFlags": [
    {
      "flagId": "val-001",
      "type": "FORMAT_VALIDATION",
      "field": "extractedFields.panNumber",
      "severity": "INFO",
      "status": "PASS",
      "message": "PAN format validation passed",
      "timestamp": "2024-02-15T10:30:05.000Z"
    },
    {
      "flagId": "val-002",
      "type": "CROSS_FIELD_CONSISTENCY",
      "field": "extractedFields.nameOnCard",
      "severity": "INFO",
      "status": "PASS",
      "message": "Name matches across PAN and GST certificate (similarity: 0.98)",
      "timestamp": "2024-02-15T10:30:10.000Z"
    }
  ],
  
  "validationResults": {
    "formatValidation": {
      "status": "PASS",
      "totalFields": 5,
      "passed": 3,
      "failed": 0,
      "notApplicable": 2,
      "details": []
    },
    "consistencyValidation": {
      "status": "PASS",
      "rulesChecked": 4,
      "passed": 4,
      "failed": 0,
      "details": []
    },
    "typeValidation": {
      "status": "PASS",
      "fieldsChecked": 3,
      "passed": 3,
      "coercionApplied": 0,
      "details": []
    }
  },
  
  "processingMetadata": {
    "totalProcessingTimeMs": 1250,
    "breakdown": {
      "textExtractionMs": 400,
      "fieldExtractionMs": 350,
      "validationMs": 300,
      "confidenceCalculationMs": 200
    },
    "documentQuality": {
      "resolution": 300,
      "isScanned": false,
      "hasEmbeddedText": true,
      "pageCount": 1,
      "fileSizeBytes": 245678
    },
    "extractionAttempts": [
      {
        "method": "TEXT_PDF",
        "success": true,
        "confidence": 0.98
      }
    ]
  },
  
  "requiresManualReview": false,
  "manualReviewReasons": [],
  
  "status": "COMPLETED",
  "nextSteps": [
    "API_VERIFICATION_PENDING",
    "CROSS_DOCUMENT_VALIDATION_PENDING"
  ]
}
```

---

## EXTRACTION OUTPUT SCHEMA (JSON Schema)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://fatts.gov.in/schemas/extraction-result.json",
  "title": "FATTS Document Extraction Result Schema",
  "type": "object",
  "required": [
    "extractionId",
    "documentId",
    "contractorId",
    "documentType",
    "extractionTimestamp",
    "extractionMethod",
    "extractedFields",
    "confidenceScore",
    "validationFlags",
    "requiresManualReview",
    "status"
  ],
  "properties": {
    "extractionId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for this extraction attempt"
    },
    "documentId": {
      "type": "string",
      "format": "uuid",
      "description": "Reference to the source document"
    },
    "contractorId": {
      "type": "string",
      "format": "uuid",
      "description": "Reference to the contractor"
    },
    "documentType": {
      "type": "string",
      "enum": [
        "PAN_CARD",
        "GST_CERTIFICATE",
        "CIN_CERTIFICATE",
        "LLPIN_CERTIFICATE",
        "CA_TURNOVER_CERTIFICATE",
        "BANK_SOLVENCY_CERTIFICATE",
        "PAST_PROJECTS_DOCUMENT",
        "LITIGATION_DISCLOSURE",
        "ESIC_CERTIFICATE",
        "LABOUR_LICENSE",
        "WALLET_DECLARATION"
      ]
    },
    "extractionTimestamp": {
      "type": "string",
      "format": "date-time"
    },
    "extractionMethod": {
      "type": "object",
      "required": ["primary"],
      "properties": {
        "primary": {
          "type": "string",
          "enum": ["TEXT_PDF", "OCR", "REGEX", "KEY_VALUE", "NER", "TABLE_EXTRACTION", "MANUAL"]
        },
        "secondary": {
          "type": "string",
          "enum": ["OCR", "NER", "MANUAL", null]
        },
        "nerUsed": {
          "type": "boolean"
        },
        "manualReview": {
          "type": "boolean"
        },
        "toolVersion": {
          "type": "string"
        },
        "modelVersion": {
          "type": "string"
        }
      }
    },
    "extractedFields": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["value", "confidence", "validationStatus"],
        "properties": {
          "value": {
            "description": "The extracted value (type varies by field)"
          },
          "confidence": {
            "type": "number",
            "minimum": 0,
            "maximum": 1
          },
          "source": {
            "type": "object",
            "properties": {
              "method": {
                "type": "string"
              },
              "pattern": {
                "type": "string"
              },
              "keyPhrase": {
                "type": "string"
              },
              "matchPosition": {
                "type": "object",
                "properties": {
                  "page": { "type": "integer" },
                  "boundingBox": {
                    "type": "object",
                    "properties": {
                      "x": { "type": "number" },
                      "y": { "type": "number" },
                      "width": { "type": "number" },
                      "height": { "type": "number" }
                    }
                  }
                }
              },
              "derivedFrom": {
                "type": "string"
              },
              "derivationRule": {
                "type": "string"
              },
              "reason": {
                "type": "string"
              }
            }
          },
          "validationStatus": {
            "type": "string",
            "enum": ["VALID", "INVALID", "PENDING", "NOT_REQUIRED", "NEEDS_REVIEW"]
          },
          "validationDetails": {
            "type": "object"
          }
        }
      }
    },
    "confidenceScore": {
      "type": "object",
      "required": ["overall"],
      "properties": {
        "overall": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "breakdown": {
          "type": "object",
          "properties": {
            "textExtraction": { "type": "number" },
            "fieldExtraction": { "type": "number" },
            "validation": { "type": "number" },
            "crossDocumentConsistency": { "type": "number" }
          }
        },
        "calculationMethod": {
          "type": "string"
        },
        "weights": {
          "type": "object"
        }
      }
    },
    "validationFlags": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["flagId", "type", "severity", "status", "message"],
        "properties": {
          "flagId": { "type": "string" },
          "type": {
            "type": "string",
            "enum": ["FORMAT_VALIDATION", "CONSISTENCY_VALIDATION", "TYPE_VALIDATION", "API_VALIDATION"]
          },
          "field": { "type": "string" },
          "severity": {
            "type": "string",
            "enum": ["INFO", "WARNING", "ERROR", "CRITICAL"]
          },
          "status": {
            "type": "string",
            "enum": ["PASS", "FAIL", "SKIP"]
          },
          "message": { "type": "string" },
          "timestamp": {
            "type": "string",
            "format": "date-time"
          }
        }
      }
    },
    "validationResults": {
      "type": "object",
      "properties": {
        "formatValidation": {
          "$ref": "#/definitions/validationSummary"
        },
        "consistencyValidation": {
          "$ref": "#/definitions/validationSummary"
        },
        "typeValidation": {
          "$ref": "#/definitions/validationSummary"
        }
      }
    },
    "processingMetadata": {
      "type": "object",
      "properties": {
        "totalProcessingTimeMs": { "type": "integer" },
        "breakdown": {
          "type": "object"
        },
        "documentQuality": {
          "type": "object"
        },
        "extractionAttempts": {
          "type": "array",
          "items": {
            "type": "object"
          }
        }
      }
    },
    "requiresManualReview": {
      "type": "boolean"
    },
    "manualReviewReasons": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "status": {
      "type": "string",
      "enum": ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED", "MANUAL_REVIEW_REQUIRED"]
    },
    "nextSteps": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "definitions": {
    "validationSummary": {
      "type": "object",
      "properties": {
        "status": {
          "type": "string",
          "enum": ["PASS", "FAIL", "PARTIAL"]
        },
        "totalFields": { "type": "integer" },
        "passed": { "type": "integer" },
        "failed": { "type": "integer" },
        "notApplicable": { "type": "integer" },
        "details": {
          "type": "array"
        }
      }
    }
  }
}
```

---

## CONFIDENCE SCORE CALCULATION

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  CONFIDENCE SCORE CALCULATION METHODOLOGY                                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  OVERALL CONFIDENCE = Σ (fieldConfidence × fieldWeight)                                 │
│                                                                                          │
│  WHERE:                                                                                  │
│  • fieldConfidence = extraction confidence for each field                               │
│  • fieldWeight = importance weight based on field criticality                           │
│                                                                                          │
│  FIELD WEIGHTS BY DOCUMENT TYPE:                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  DOCUMENT           │ FIELD                    │ WEIGHT                         │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  PAN Card           │ panNumber                │ 0.40                           │    │
│  │                     │ nameOnCard               │ 0.35                           │    │
│  │                     │ entityType               │ 0.15                           │    │
│  │                     │ fatherName/DOB           │ 0.10                           │    │
│  │                                                                                  │    │
│  │  GST Certificate    │ gstin                    │ 0.35                           │    │
│  │                     │ legalName                │ 0.25                           │    │
│  │                     │ registrationDate         │ 0.15                           │    │
│  │                     │ status                   │ 0.15                           │    │
│  │                     │ other fields             │ 0.10                           │    │
│  │                                                                                  │    │
│  │  Past Projects      │ Each project             │ 1/N (N = number of projects)   │    │
│  │                     │ Within each project:                                      │    │
│  │                     │   projectName            │ 0.15                           │    │
│  │                     │   clientName             │ 0.15                           │    │
│  │                     │   projectValue           │ 0.25                           │    │
│  │                     │   startDate              │ 0.15                           │    │
│  │                     │   completionDate         │ 0.15                           │    │
│  │                     │   completionStatus       │ 0.15                           │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  CONFIDENCE ADJUSTMENTS:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FACTOR                           │ ADJUSTMENT                                │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  OCR used (vs native text)        │ -0.05                                     │    │
│  │  Multiple extraction attempts     │ -0.03 per extra attempt                   │    │
│  │  Cross-document validation passed │ +0.05                                     │    │
│  │  API verification passed          │ +0.10                                     │    │
│  │  Manual review completed          │ Set to 1.0                                │    │
│  │  Low document quality             │ -0.10                                     │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  CONFIDENCE THRESHOLDS:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  CONFIDENCE RANGE  │ ACTION                                                     │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  0.95 - 1.00       │ Accept automatically, no review needed                     │    │
│  │  0.85 - 0.94       │ Accept, log for audit                                      │    │
│  │  0.70 - 0.84       │ Accept with warning, flag for sampling review              │    │
│  │  0.50 - 0.69       │ Require manual review before acceptance                    │    │
│  │  0.00 - 0.49       │ Reject extraction, require re-upload or manual entry       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PHASE 2C COMPLETE
## READY FOR NEXT PHASE
