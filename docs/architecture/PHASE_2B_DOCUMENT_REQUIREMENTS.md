# FATTS Contractor Onboarding Module
## Phase 2B — Document-Specific Requirements

---

## OBJECTIVE

Define structured handling requirements for each contractor document.

**This phase defines ONLY document-specific requirements.**

- Do NOT design extraction engine yet.
- Do NOT design scoring.
- Do NOT define fraud detection yet.

---

## DOCUMENT SPECIFICATIONS

---

### 1. PAN (Permanent Account Number) Card

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: PAN CARD                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (scanned copy of PAN card)                                       │
│  • Alternative formats: JPEG, PNG (photograph of PAN card)                              │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 5 MB                                                              │
│  • Color mode: Color preferred (for security feature detection)                         │
│  • Orientation: Portrait (standard PAN card orientation)                                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "PAN_CARD"                              │
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" or "image/jpeg" etc.  │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name (default: "PAN Card")│
│  source                  │ string   │ NO       │ "UPLOAD" or "DIGILOCKER"                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  panNumber               │ string   │ ^[A-Z]{3}[ABCFGLPTJ][A-Z][0-9]{4}[A-Z]$ │ legalIdentity.pan │
│  nameOnCard              │ string   │ 3-200 chars, alphabetic + spaces   │ legalIdentity.legalName │
│  entityType              │ string   │ Derived from PAN position 4        │ legalIdentity.entityType │
│  fatherName              │ string   │ 3-200 chars (for individuals)      │ (not stored in schema) │
│  dateOfBirth             │ date     │ For individuals/HUF only           │ (not stored in schema) │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.90                                                           │
│  If confidence < 0.90, flag for manual review                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  cardIssueDate           │ date     │ Date of PAN card issue (if visible)      │
│  cardSerialNumber        │ string   │ Serial number on card (if present)       │
│  signaturePresent        │ boolean  │ Whether signature is present on card     │
│  photographPresent       │ boolean  │ Whether photograph is present            │
│  hologramDetected        │ boolean  │ Security hologram detection (for fraud)  │
│  qrCodeData              │ string   │ Data from QR code if present             │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Format Validation       │ PAN must match regex pattern                                 │
│  Entity Type Check       │ Position 4 character must match declared entity type:       │
│                          │   C = PRIVATE_LIMITED, PUBLIC_LIMITED                        │
│                          │   F = LLP, PARTNERSHIP                                       │
│                          │   P = PROPRIETORSHIP                                         │
│                          │   T = TRUST                                                  │
│                          │   A = AOP                                                    │
│                          │   H = HUF (Hindu Undivided Family)                           │
│                          │   G = GOVERNMENT                                             │
│  API Verification        │ Call Income Tax API (NSDL) to verify:                        │
│                          │   - PAN exists and is active                                 │
│                          │   - Name matches registered name                             │
│                          │   - Entity type matches                                      │
│  Name Matching           │ Extracted name must match:                                   │
│                          │   - Name on GST certificate                                  │
│                          │   - Name on CIN certificate (if applicable)                  │
│                          │   - Declared legal name in form                              │
│  Cross-Reference         │ PAN must match positions 3-7 of GSTIN                       │
│                                                                                         │
│  VALIDATION STATUS FLOW:                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │ PENDING     │────▶│ FORMAT_OK   │────▶│ API_VERIFIED│────▶│ CROSS_MATCH │          │
│  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘          │
│         │                   │                   │                   │                  │
│         ▼                   ▼                   ▼                   ▼                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │ FORMAT_FAIL │     │ API_FAIL    │     │ MISMATCH    │     │ VERIFIED    │          │
│  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. GST (Goods and Services Tax) Certificate

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: GST CERTIFICATE                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (downloaded from GST portal)                                     │
│  • Alternative formats: JPEG, PNG (scanned copy)                                        │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 5 MB                                                              │
│  • Preferred source: Direct download from GST portal (has digital signature)            │
│  • Certificate types: Registration Certificate, Amendment Certificate                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "GST_CERTIFICATE"                       │
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" preferred             │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name                      │
│  certificateType         │ string   │ NO       │ "REGISTRATION" or "AMENDMENT"           │
│  downloadSource          │ string   │ NO       │ "GST_PORTAL" or "UPLOAD"                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  gstin                   │ string   │ ^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$ │ legalIdentity.gstin │
│  legalName               │ string   │ 3-200 chars                        │ legalIdentity.legalName │
│  tradeName               │ string   │ 3-200 chars (if different)         │ legalIdentity.tradeName │
│  registrationDate        │ date     │ Valid date, not future             │ legalIdentity.registrationDate │
│  taxpayerType            │ string   │ "Regular" or "Composition"         │ (derived field) │
│  businessType            │ string   │ Entity type description            │ (cross-check with entityType) │
│  state                   │ string   │ Indian state name                  │ legalIdentity.registeredAddress.state │
│  status                  │ string   │ "Active", "Suspended", "Cancelled" │ (verification status) │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.92                                                           │
│  If confidence < 0.92, flag for manual review                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  constitutionOfBusiness  │ string   │ Legal structure description               │
│  dateOfLiability         │ date     │ Date of GST liability                     │
│  cancellationDate        │ date     │ If status is cancelled                    │
│  cancellationReason      │ string   │ Reason for cancellation                   │
│  principalPlaceOfBusiness│ object   │ Main business address                     │
│  additionalPlacesOfBusiness│ array  │ List of other business locations          │
│  natureOfBusinessActivity│ array    │ Business activity codes                   │
│  jurisdiction            │ string   │ Tax jurisdiction details                  │
│  digitalSignaturePresent │ boolean  │ Whether certificate has digital signature │
│  qrCodeData              │ string   │ QR code content if present                │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Format Validation       │ GSTIN must match 15-character pattern                        │
│  Check Digit Validation  │ Luhn algorithm on GSTIN (position 15)                        │
│  State Code Check        │ Positions 1-2 must be valid Indian state code                │
│  PAN Match               │ Positions 3-7 must match contractor's PAN                    │
│  Entity Type Match       │ Position 12 must match PAN position 4                        │
│  API Verification        │ Call GST Portal API to verify:                               │
│                          │   - GSTIN exists                                             │
│                          │   - Status is "Active"                                       │
│                          │   - Legal name matches                                       │
│                          │   - Not suspended or cancelled                               │
│  Name Matching           │ Legal name must match:                                       │
│                          │   - Name on PAN card                                         │
│                          │   - Name on CIN certificate (if applicable)                  │
│                          │   - Declared legal name in form                              │
│  Address Validation      │ State in GSTIN must match registered address state          │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • Status = "Suspended" or "Cancelled" → BLOCK                                          │
│  • Taxpayer type = "Composition" → WARNING (may indicate small turnover)                │
│  • Registration date < 3 years ago → INFO (newly registered)                            │
│  • Cancellation date present → BLOCK                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. CIN (Corporate Identity Number) / LLPIN (LLP Identification Number)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: CIN / LLPIN CERTIFICATE                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (Certificate of Incorporation from MCA)                          │
│  • Alternative formats: JPEG, PNG (scanned copy)                                        │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 5 MB                                                              │
│  • Document types:                                                                       │
│    - Certificate of Incorporation (for Companies)                                       │
│    - Certificate of Registration (for LLPs)                                             │
│  • Applicability:                                                                        │
│    - CIN: Required for PRIVATE_LIMITED, PUBLIC_LIMITED                                  │
│    - LLPIN: Required for LLP                                                            │
│    - NOT required for PROPRIETORSHIP, PARTNERSHIP, AOP, TRUST                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "CIN_CERTIFICATE" or "LLPIN_CERTIFICATE"│
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" preferred             │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name                      │
│  entityType              │ string   │ NO       │ "COMPANY" or "LLP"                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS - CIN                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  cin                     │ string   │ ^[A-Z]{1}[0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$ │ legalIdentity.cin │
│  companyName             │ string   │ 3-200 chars                        │ legalIdentity.legalName │
│  registrationDate        │ date     │ Valid date, not future             │ legalIdentity.registrationDate │
│  state                   │ string   │ 2-letter state code                │ legalIdentity.registeredAddress.state │
│  yearOfIncorporation     │ integer  │ 1950-current year                  │ legalIdentity.incorporationYear │
│  companyCategory         │ string   │ "Company Limited by Shares", etc.  │ (validation) │
│  ownershipCode           │ string   │ "PTC", "PLC", "ULC", etc.          │ (validation) │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.90                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS - LLPIN                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  llpin                   │ string   │ ^[A-Z]{3}-[0-9]{4}$ or AAA0000     │ legalIdentity.llpin │
│  llpName                 │ string   │ 3-200 chars                        │ legalIdentity.legalName │
│  registrationDate        │ date     │ Valid date, not future             │ legalIdentity.registrationDate │
│  yearOfIncorporation     │ integer  │ 1950-current year                  │ legalIdentity.incorporationYear │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.90                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  authorizedCapital       │ integer  │ Authorized capital in INR                │
│  paidUpCapital           │ integer  │ Paid-up capital in INR                   │
│  numberOfMembers         │ integer  │ Number of members/shareholders            │
│  registeredOfficeAddress │ string   │ Registered office address                 │
│  directors               │ array    │ List of directors with DIN                │
│  partners                │ array    │ List of partners (for LLP)                │
│  companySubCategory      │ string   │ "Non-govt company", "Govt company"        │
│  listingStatus           │ string   │ "Listed" or "Unlisted" (CIN position 1)   │
│  industryCode            │ string   │ 5-digit industry code (CIN positions 2-6) │
│  rocCode                 │ string   │ Registrar of Companies code               │
│  emailId                 │ string   │ Company email ID                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Format Validation       │ CIN: 21 characters, LLPIN: variable format                   │
│  Listing Status Check    │ CIN position 1: U=Unlisted, L=Listed                         │
│  Year Validation         │ CIN positions 9-12 must be valid year (1950-current)        │
│  Ownership Code Check    │ CIN positions 13-15: PTC, PLC, ULC, NPL, GSC                │
│  API Verification        │ Call MCA (Ministry of Corporate Affairs) API:               │
│                          │   - CIN/LLPIN exists                                         │
│                          │   - Company/LLP status is "Active"                          │
│                          │   - Not under liquidation                                   │
│                          │   - Not struck off                                          │
│                          │   - Directors not disqualified                              │
│  Name Matching           │ Company name must match:                                     │
│                          │   - Name on PAN card                                        │
│                          │   - Name on GST certificate                                 │
│                          │   - Declared legal name in form                             │
│  Director Verification   │ For each director:                                           │
│                          │   - DIN format validation (8 digits)                        │
│                          │   - DIN status check with MCA                               │
│                          │   - Not disqualified                                        │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • Company status = "Strike Off" → BLOCK                                               │
│  • Company status = "Under Liquidation" → BLOCK                                        │
│  • Company status = "Dormant" → WARNING                                                │
│  • Any director disqualified → BLOCK                                                   │
│  • Incorporation year < 3 years → INFO (newly incorporated)                            │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Past Projects PDF

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: PAST PROJECTS DOCUMENT                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (consolidated project list)                                      │
│  • Alternative formats: JPEG, PNG (scanned documents)                                   │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 10 MB (larger due to multiple projects)                           │
│  • Document structure:                                                                   │
│    - Preferred: Tabular format (table with project details)                             │
│    - Acceptable: List format with consistent structure                                  │
│    - May include: Work orders, completion certificates as attachments                   │
│  • Number of projects: Minimum 1, Maximum 50 projects per document                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "PAST_PROJECTS_DOCUMENT"                │
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" preferred             │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name                      │
│  projectCount            │ integer  │ NO       │ Number of projects in document          │
│  documentPeriod          │ string   │ NO       │ "2018-2023" etc.                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS (Per Project)                                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  projectName             │ string   │ 3-500 chars                        │ pastProjects[].projectName │
│  clientName              │ string   │ 3-200 chars                        │ pastProjects[].clientName │
│  projectValue            │ integer  │ > 0 (in paise)                     │ pastProjects[].projectValue.amount │
│  startDate               │ date     │ Valid date, not future             │ pastProjects[].startDate │
│  completionDate          │ date     │ >= startDate                       │ pastProjects[].actualCompletionDate │
│  completionStatus        │ string   │ COMPLETED|ONGOING|TERMINATED       │ pastProjects[].completionStatus │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.75 (per project)                                             │
│  Note: Lower threshold due to varied document formats                                            │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS (Per Project)                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  projectDescription      │ string   │ Brief description of work (max 2000 chars)│
│  clientType              │ string   │ CENTRAL_GOVERNMENT, STATE_GOVERNMENT, PSU, PRIVATE, INTERNATIONAL │
│  clientDepartment        │ string   │ Name of department                        │
│  contractNumber          │ string   │ Contract/work order number                │
│  workOrderNumber         │ string   │ Work order reference                      │
│  originalCompletionDate  │ date     │ Originally planned completion             │
│  completionPercentage    │ integer  │ 0-100                                     │
│  delayDays               │ integer  │ Days delayed beyond original date         │
│  delayReason             │ string   │ Reason for delay if any                   │
│  projectLocation         │ object   │ Address of project site                   │
│  projectCategory         │ string   │ Type of work (ROAD, BRIDGE, BUILDING, etc.)│
│  satisfactoryCertificate │ boolean  │ Whether satisfactory certificate obtained │
│  performanceRating       │ string   │ EXCELLENT, GOOD, SATISFACTORY, POOR       │
│  remarks                 │ string   │ Additional notes                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Minimum Projects        │ At least 1 project must be extracted successfully           │
│  Date Consistency        │ completionDate >= startDate                                  │
│  Value Validation        │ Project value must be positive integer                      │
│  Status Validation       │ completionStatus must be valid enum value                   │
│  Duplicate Check         │ Same project should not appear multiple times               │
│  Date Range              │ Projects should be within last 10 years preferred           │
│                                                                                         │
│  DERIVED CALCULATIONS:                                                                 │
│  • Project duration (days) = completionDate - startDate                                  │
│  • Delay percentage = (delayDays / originalDuration) * 100                              │
│  • Value category:                                                                      │
│    - Small: < ₹1 Crore                                                                  │
│    - Medium: ₹1-10 Crore                                                                │
│    - Large: ₹10-50 Crore                                                                │
│    - Very Large: > ₹50 Crore                                                            │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • No projects extracted → BLOCK                                                        │
│  • All projects TERMINATED → BLOCK                                                      │
│  • > 50% projects with delays > 1 year → WARNING                                        │
│  • > 30% projects TERMINATED → WARNING                                                  │
│  • Performance rating = POOR on multiple projects → WARNING                             │
│  • All projects from same client → INFO (limited experience)                            │
│  • No government/PSU projects → INFO (no public sector experience)                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5. CA Certificate of Turnover

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: CA CERTIFICATE OF TURNOVER                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (CA letterhead with certificate)                                 │
│  • Alternative formats: JPEG, PNG (scanned copy)                                        │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 5 MB                                                              │
│  • Required elements:                                                                    │
│    - CA letterhead with firm name and address                                           │
│    - CA membership number                                                                │
│    - UDIN (Unique Document Identification Number)                                        │
│    - CA signature and stamp                                                              │
│    - Date of certificate                                                                 │
│  • Certificate must be issued by a practicing Chartered Accountant                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "CA_TURNOVER_CERTIFICATE"               │
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" preferred             │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name                      │
│  certificateDate         │ date     │ NO       │ Date of certificate issuance            │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  udin                    │ string   │ ^[0-9]{6}[A-Z]{6}[0-9]{6}$ (18 chars) │ financialQualification.caCertificateDetails.udin │
│  caName                  │ string   │ 3-200 chars                        │ financialQualification.caCertificateDetails.caName │
│  caMembershipNumber      │ string   │ 5-6 digits                         │ financialQualification.caCertificateDetails.caMembershipNumber │
│  caFirmName              │ string   │ 3-200 chars                        │ financialQualification.caCertificateDetails.caFirmName │
│  certificateDate         │ date     │ Within last 6 months               │ financialQualification.caCertificateDetails.certificateDate │
│  turnoverFY1             │ object   │ {fy: "2023-24", amount: integer}   │ financialQualification.turnoverHistory[0] │
│  turnoverFY2             │ object   │ {fy: "2022-23", amount: integer}   │ financialQualification.turnoverHistory[1] │
│  turnoverFY3             │ object   │ {fy: "2021-22", amount: integer}   │ financialQualification.turnoverHistory[2] │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.85                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  turnoverFY4             │ object   │ 4th year turnover (optional)              │
│  turnoverFY5             │ object   │ 5th year turnover (optional)              │
│  averageTurnover         │ integer  │ Average of 3 years (in paise)             │
│  turnoverGrowthRate      │ number   │ Year-over-year growth percentage          │
│  caFirmRegistrationNumber│ string   │ Firm's registration number                │
│  caAddress               │ string   │ CA firm address                           │
│  caContactNumber         │ string   │ CA contact number                         │
│  caEmail                 │ string   │ CA email address                          │
│  clientName              │ string   │ Name of contractor as per certificate      │
│  clientPAN               │ string   │ PAN of contractor (for cross-verification)│
│  certificatePurpose      │ string   │ Purpose stated in certificate             │
│  auditType               │ string   │ "AUDITED" or "CERTIFIED"                  │
│  financialYearEnd        │ string   │ Financial year end date                   │
│  remarks                 │ string   │ Any remarks by CA                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  UDIN Format             │ 18 characters: DDMMYY + ICAI membership + serial            │
│  UDIN Verification       │ Call ICAI UDIN portal API to verify:                        │
│                          │   - UDIN exists and is valid                                 │
│                          │   - CA membership number matches                             │
│                          │   - Document type matches                                    │
│                          │   - UDIN not cancelled                                       │
│  CA Membership Check     │ Verify CA is practicing member with ICAI:                   │
│                          │   - Membership number is valid                               │
│                          │   - CA is active (not suspended/cancelled)                  │
│                          │   - Certificate of Practice (COP) is valid                   │
│  Certificate Date        │ Must be within last 6 months from application date          │
│  Financial Years         │ Must have at least 3 consecutive years                      │
│  Turnover Values         │ All values must be positive integers                        │
│  Name Matching           │ Contractor name on certificate must match legal name        │
│  PAN Matching            │ PAN on certificate must match contractor's PAN              │
│                                                                                         │
│  DERIVED CALCULATIONS:                                                                 │
│  • Average turnover = (FY1 + FY2 + FY3) / 3                                             │
│  • Growth rate FY2-FY3 = ((FY3 - FY2) / FY2) * 100                                      │
│  • Declining trend = true if 2+ consecutive years of decline                            │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • UDIN verification failed → BLOCK                                                     │
│  • CA membership invalid/suspended → BLOCK                                              │
│  • Certificate date > 6 months → WARNING (may need fresh certificate)                   │
│  • Turnover declining for 2+ years → WARNING                                            │
│  • Turnover declining for 3 years → ERROR                                               │
│  • Name/PAN mismatch → ERROR                                                            │
│  • Less than 3 years data → WARNING                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6. Bank Solvency Certificate

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: BANK SOLVENCY CERTIFICATE                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (Bank letterhead with certificate)                               │
│  • Alternative formats: JPEG, PNG (scanned copy)                                        │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 5 MB                                                              │
│  • Required elements:                                                                    │
│    - Bank letterhead with bank name and branch                                          │
│    - Bank stamp and authorized signatory signature                                      │
│    - Certificate number                                                                  │
│    - Issue date and validity date                                                        │
│    - Solvency amount in figures and words                                               │
│  • Must be from a scheduled bank (RBI recognized)                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "BANK_SOLVENCY_CERTIFICATE"             │
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" preferred             │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  bankName                │ string   │ 3-100 chars, scheduled bank        │ financialQualification.solvencyCertificate.bankName │
│  branchName              │ string   │ 3-100 chars                        │ financialQualification.solvencyCertificate.branchName │
│  solvencyAmount          │ integer  │ > 0 (in paise)                     │ financialQualification.solvencyCertificate.solvencyAmount.amount │
│  issueDate               │ date     │ Valid date, not future             │ financialQualification.solvencyCertificate.issueDate │
│  validUntil              │ date     │ > issueDate                        │ financialQualification.solvencyCertificate.validUntil │
│  certificateNumber       │ string   │ 1-50 chars                         │ financialQualification.solvencyCertificate.certificateNumber │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.85                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  beneficiaryName         │ string   │ Name of contractor/beneficiary            │
│  beneficiaryAddress      │ string   │ Address of contractor                     │
│  accountNumber           │ string   │ Account number (masked, last 4 digits)    │
│  accountType             │ string   │ Current/Savings/Cash Credit               │
│  ifscCode                │ string   │ Bank IFSC code                            │
│  authorizedSignatory     │ string   │ Name of bank official                     │
│  signatoryDesignation    │ string   │ Designation of signing official           │
│  bankContactNumber       │ string   │ Bank contact number                       │
│  bankEmail               │ string   │ Bank email address                        │
│  purpose                 │ string   │ Purpose for which certificate issued      │
│  termsAndConditions      │ string   │ Any T&C mentioned                         │
│  amountInWords           │ string   │ Solvency amount in words                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Bank Verification       │ Bank must be a scheduled bank (RBI list)                    │
│  IFSC Validation         │ IFSC code format: ^[A-Z]{4}0[A-Z0-9]{6}$                   │
│  Date Validation         │ validUntil must be > current date (not expired)             │
│  Amount Validation       │ Solvency amount must be positive                            │
│  Certificate Validity    │ Certificate should be valid for at least 3 months          │
│  Name Matching           │ Beneficiary name must match contractor's legal name        │
│                                                                                         │
│  MANUAL VERIFICATION REQUIRED:                                                         │
│  • Bank API verification not widely available in India                                  │
│  • Government admin must verify:                                                        │
│    - Bank stamp authenticity                                                            │
│    - Signatory authorization                                                            │
│    - Certificate not tampered                                                           │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • Certificate expired → BLOCK                                                          │
│  • Certificate expiring within 1 month → WARNING                                        │
│  • Bank not in scheduled bank list → ERROR                                              │
│  • Solvency amount < tender requirement → WARNING (for specific tender)                │
│  • Name mismatch → ERROR                                                                │
│  • Issue date > 1 year ago → WARNING                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 7. Litigation Disclosure

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: LITIGATION DISCLOSURE                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (Signed declaration on company letterhead)                       │
│  • Alternative formats: JPEG, PNG (scanned copy)                                        │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 10 MB (may include case documents as attachments)                 │
│  • Document structure:                                                                   │
│    - Declaration statement                                                               │
│    - List of pending cases (if any)                                                     │
│    - Case details with court, case number, status                                       │
│    - Authorized signatory signature and stamp                                            │
│  • May include: Court orders, case filings as supporting documents                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "LITIGATION_DISCLOSURE"                 │
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" preferred             │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name                      │
│  declarationDate         │ date     │ NO       │ Date of declaration                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  hasPendingLitigation    │ boolean  │ true/false                         │ compliance.litigationDisclosure.hasPendingLitigation │
│  hasCriminalCases        │ boolean  │ true/false                         │ compliance.litigationDisclosure.hasCriminalCases │
│  hasArbitrationCases     │ boolean  │ true/false                         │ compliance.litigationDisclosure.hasArbitrationCases │
│  declarationDate         │ date     │ Within last 3 months               │ (document metadata) │
│  authorizedSignatory     │ string   │ Name of signatory                  │ (validation) │
│                                                                                                   │
│  IF hasPendingLitigation = true:                                                                  │
│  ─────────────────────────────────────────────────────────────────────────────────────│
│  litigationCases[]       │ array    │ List of civil/arbitration cases    │ compliance.litigationDisclosure.litigationCases │
│    ├── caseNumber        │ string   │ Court case number                  │ litigationCases[].caseNumber │
│    ├── court             │ string   │ Court name                         │ litigationCases[].court │
│    ├── caseType          │ string   │ CIVIL|ARBITRATION|TAX|LABOUR|OTHER │ litigationCases[].caseType │
│    ├── claimAmount       │ integer  │ Amount in paise                    │ litigationCases[].claimAmount.amount │
│    ├── status            │ string   │ PENDING|DISPOSED|SETTLED|APPEAL_PENDING │ litigationCases[].status │
│    └── againstContractor │ boolean  │ Is case against contractor         │ litigationCases[].againstContractor │
│                                                                                                   │
│  IF hasCriminalCases = true:                                                                      │
│  ─────────────────────────────────────────────────────────────────────────────────────│
│  criminalCases[]         │ array    │ List of criminal cases             │ compliance.litigationDisclosure.criminalCases │
│    ├── firNumber         │ string   │ FIR number                         │ criminalCases[].firNumber │
│    ├── policeStation     │ string   │ Police station name                │ criminalCases[].policeStation │
│    ├── sections          │ string   │ IPC sections                       │ criminalCases[].sections │
│    └── status            │ string   │ Case status                        │ criminalCases[].status │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.80                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  totalExposureAmount     │ integer  │ Total financial exposure (in paise)       │
│  filingDate              │ date     │ Date of case filing                       │
│  description             │ string   │ Brief description of case                 │
│  advocateDetails         │ string   │ Lawyer/advocate handling the case         │
│  nextHearingDate         │ date     │ Next hearing date                         │
│  expectedOutcome         │ string   │ Expected outcome assessment               │
│  counterClaimAmount      │ integer  │ Counter-claim amount if any               │
│  insuranceCoverage       │ boolean  │ Whether covered by insurance              │
│  provisionMade           │ boolean  │ Whether provision made in accounts        │
│  remarks                 │ string   │ Additional remarks                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Declaration Check       │ Must be signed declaration on company letterhead            │
│  Date Validation         │ Declaration date within last 3 months                       │
│  Cross-Verification      │ Call eCourts API to verify:                                 │
│                          │   - Cases against contractor's PAN/directors                │
│                          │   - Cases against company name                              │
│                          │   - Match disclosed cases with actual records               │
│  Director Check          │ Check criminal cases against directors:                     │
│                          │   - Using DIN with MCA data                                 │
│                          │   - Criminal database verification                          │
│  Blacklist Check         │ Verify contractor not blacklisted:                           │
│                          │   - Check government blacklist databases                    │
│                          │   - Check GST blacklist                                     │
│                                                                                         │
│  CROSS-VERIFICATION WITH ECOURTS:                                                      │
│  1. Search by party name (company name)                                                 │
│  2. Search by PAN (if available in case)                                                │
│  3. Search by director names                                                            │
│  4. Compare disclosed cases with found cases                                            │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • Criminal cases = true → BLOCK (requires manual review)                               │
│  • Undisclosed cases found via eCourts → BLOCK (fraud)                                  │
│  • Total exposure > 50% of net worth → WARNING                                          │
│  • Multiple pending cases (> 5) → WARNING                                               │
│  • Cases against contractor (not by contractor) → WARNING                               │
│  • Blacklisted in any database → BLOCK                                                  │
│  • Declaration date > 3 months → WARNING (need fresh declaration)                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 8. ESIC (Employee State Insurance Corporation) Registration

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: ESIC REGISTRATION CERTIFICATE                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (ESIC registration certificate)                                  │
│  • Alternative formats: JPEG, PNG (scanned copy)                                        │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 5 MB                                                              │
│  • Required elements:                                                                    │
│    - ESIC logo and header                                                                │
│    - Registration number (17 digits)                                                    │
│    - Establishment name and address                                                      │
│    - Registration date                                                                   │
│    - Coverage details                                                                    │
│  • Applicability: Required if employee count >= 10                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "ESIC_CERTIFICATE"                      │
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" preferred             │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name                      │
│  applicable              │ boolean  │ NO       │ Whether ESIC is applicable              │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  isRegistered            │ boolean  │ true/false                         │ compliance.esicRegistration.isRegistered │
│                                                                                                   │
│  IF isRegistered = true:                                                                          │
│  ─────────────────────────────────────────────────────────────────────────────────────│
│  registrationNumber      │ string   │ ^[0-9]{17}$ (17 digits)            │ compliance.esicRegistration.registrationNumber │
│  registrationDate        │ date     │ Valid date                         │ compliance.esicRegistration.registrationDate │
│  establishmentName       │ string   │ Must match legal name              │ (validation) │
│  employeeCount           │ integer  │ >= 0                               │ compliance.esicRegistration.employeeCount │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.88                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  applicable              │ boolean  │ Whether ESIC is applicable                │
│  establishmentAddress    │ string   │ Registered establishment address           │
│  coverageDate            │ date     │ Date of coverage start                    │
│  regionalOffice          │ string   │ ESIC regional office details              │
│  branchOffice            │ string   │ ESIC branch office                        │
│  natureOfWork            │ string   │ Nature of work/industry                   │
│  factoryActLicense       │ string   │ Factory act license number if applicable  │
│  lastContributionPeriod  │ string   │ Last contribution period paid             │
│  complianceStatus        │ string   │ Compliance status with ESIC               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Applicability Check     │ ESIC required if employee count >= 10                        │
│  Registration Number     │ 17-digit format validation                                   │
│  API Verification        │ Call ESIC Portal API to verify:                              │
│                          │   - Registration number exists                               │
│                          │   - Registration is active                                   │
│                          │   - Contributions are up to date                             │
│  Name Matching           │ Establishment name must match legal name                     │
│  Employee Count          │ Cross-check with declared workforce size                     │
│                                                                                         │
│  CONDITIONAL REQUIREMENTS:                                                             │
│  • If employee count >= 10: ESIC registration is MANDATORY                              │
│  • If employee count < 10: ESIC registration is OPTIONAL                               │
│  • If not applicable: Document not required, but declaration needed                     │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • ESIC applicable but not registered → ERROR                                          │
│  • Registration number invalid → ERROR                                                 │
│  • ESIC registration suspended/cancelled → BLOCK                                       │
│  • Contributions not up to date → WARNING                                              │
│  • Employee count mismatch with declared → WARNING                                     │
│  • Name mismatch → ERROR                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 9. Labour License

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: LABOUR LICENSE (Contract Labour License)                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • Primary format: PDF (Labour license certificate)                                     │
│  • Alternative formats: JPEG, PNG (scanned copy)                                        │
│  • Minimum resolution: 300 DPI for scanned documents                                    │
│  • Maximum file size: 5 MB                                                              │
│  • Required elements:                                                                    │
│    - License number                                                                      │
│    - Contractor name and address                                                         │
│    - Validity period (from - to)                                                         │
│    - Maximum number of workers allowed                                                   │
│    - Issuing authority name and designation                                              │
│    - Government seal/stamp                                                               │
│  • Applicability: Required if contract labourers >= 20                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "LABOUR_LICENSE"                        │
│  uploadTimestamp         │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  fileSize                │ integer  │ YES      │ Size in bytes                           │
│  fileHash                │ string   │ YES      │ SHA-256 hash of file                    │
│  mimeType                │ string   │ YES      │ "application/pdf" preferred             │
│  ipfsCID                 │ string   │ YES      │ IPFS Content Identifier                 │
│  documentName            │ string   │ NO       │ User-provided name                      │
│  isRequired              │ boolean  │ NO       │ Whether license is required             │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  isRequired              │ boolean  │ true if workforce >= 20            │ compliance.labourLicense.isRequired │
│  isObtained              │ boolean  │ true/false                         │ compliance.labourLicense.isObtained │
│                                                                                                   │
│  IF isObtained = true:                                                                            │
│  ─────────────────────────────────────────────────────────────────────────────────────│
│  licenseNumber           │ string   │ 1-50 chars                         │ compliance.labourLicense.licenseNumber │
│  issuingAuthority        │ string   │ 3-200 chars                        │ compliance.labourLicense.issuingAuthority │
│  validFrom               │ date     │ Valid date                         │ compliance.labourLicense.validFrom │
│  validUntil              │ date     │ > validFrom                        │ compliance.labourLicense.validUntil │
│  workforceSize           │ integer  │ >= 0                               │ compliance.labourLicense.workforceSize │
│                                                                                                   │
│  EXTRACTION CONFIDENCE THRESHOLD: 0.85                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  contractorName          │ string   │ Name of contractor as per license         │
│  contractorAddress       │ string   │ Address as per license                    │
│  principalEmployer       │ string   │ Principal employer name                   │
│  workLocation            │ string   │ Location of work                          │
│  natureOfWork            │ string   │ Type of work permitted                    │
│  maxWorkersAllowed       │ integer  │ Maximum workers permitted                 │
│  licenseFee              │ integer  │ License fee paid                          │
│  renewalDate             │ date     │ Next renewal due date                     │
│  conditions              │ string   │ License conditions                        │
│  previousViolations      │ array    │ Any previous violations                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Applicability Check     │ License required if contract labourers >= 20                │
│  Validity Check          │ validUntil must be > current date (not expired)             │
│  API Verification        │ Call Labour Department API (if available):                  │
│                          │   - License number exists                                    │
│                          │   - License is valid and active                              │
│                          │   - No violations recorded                                   │
│  Name Matching           │ Contractor name must match legal name                        │
│  Workforce Check         │ Workforce size should match declared size                   │
│                                                                                         │
│  CONDITIONAL REQUIREMENTS:                                                             │
│  • If workforce >= 20: Labour license is MANDATORY                                      │
│  • If workforce < 20: Labour license is OPTIONAL                                       │
│  • If not required: Document not required, but declaration needed                       │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • License required but not obtained → ERROR                                           │
│  • License expired → BLOCK                                                             │
│  • License expiring within 3 months → WARNING                                          │
│  • License suspended/cancelled → BLOCK                                                 │
│  • Violations recorded → WARNING                                                       │
│  • Workforce size mismatch → WARNING                                                   │
│  • Name mismatch → ERROR                                                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 10. Wallet Address Declaration

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT: WALLET ADDRESS DECLARATION                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  EXPECTED FILE FORMAT                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  • This is NOT a traditional document but a cryptographic declaration                   │
│  • Format: Digital signature + structured data                                          │
│  • Components:                                                                           │
│    1. Wallet address (0x...)                                                             │
│    2. Declaration message (standardized text)                                           │
│    3. Cryptographic signature                                                           │
│    4. Chain ID (network identifier)                                                     │
│    5. Timestamp                                                                          │
│  • Generated via: MetaMask / WalletConnect / Rainbow (Wagmi hooks)                      │
│  • No file upload required - captured through frontend interaction                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUIRED METADATA                                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Required │ Description                             │
│  ────────────────────────┼──────────┼──────────┼────────────────────────────────────────│
│  documentType            │ string   │ YES      │ "WALLET_DECLARATION"                    │
│  captureTimestamp        │ datetime │ YES      │ ISO 8601 UTC timestamp                  │
│  contractorId            │ UUID     │ YES      │ Reference to contractor                 │
│  source                  │ string   │ YES      │ "METAMASK", "WALLETCONNECT", etc.       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  MANDATORY EXTRACTED FIELDS                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Validation Rule                    │ Schema Path │
│  ────────────────────────┼──────────┼────────────────────────────────────┼─────────────│
│  declaredAddress         │ string   │ ^0x[a-fA-F0-9]{40}$ (42 chars)     │ compliance.walletDeclaration.declaredAddress │
│  signature               │ string   │ Hex string (65 bytes)              │ compliance.walletDeclaration.signature │
│  declarationMessage      │ string   │ Standardized message text          │ compliance.walletDeclaration.declarationMessage │
│  declarationTimestamp    │ datetime │ ISO 8601 UTC                       │ compliance.walletDeclaration.declarationTimestamp │
│  chainId                 │ integer  │ 1 (Mainnet) or 11155111 (Sepolia)  │ compliance.walletDeclaration.chainId │
│                                                                                                   │
│  STANDARD DECLARATION MESSAGE FORMAT:                                                             │
│  ─────────────────────────────────────────────────────────────────────────────────────│
│  "FATTS Registration Declaration                                                          │
│                                                                                           │
│  I hereby declare that I am an authorized representative of                              │
│  [LEGAL_NAME] (PAN: [PAN_NUMBER]) and confirm that the wallet                           │
│  address 0x... is the official wallet address for this contractor                       │
│  registration in the FATTS system.                                                       │
│                                                                                           │
│  I understand that:                                                                       │
│  1. This wallet will be used for all blockchain transactions                            │
│  2. Only this wallet can sign tender submissions and milestone approvals                 │
│  3. Changing this wallet requires government approval                                    │
│  4. I am legally bound by all transactions signed with this wallet                      │
│                                                                                           │
│  Timestamp: [ISO_8601_UTC]"                                                              │
│                                                                                                   │
│  EXTRACTION CONFIDENCE: N/A (cryptographic verification)                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  OPTIONAL EXTRACTED FIELDS                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Field                   │ Type     │ Description                              │
│  ────────────────────────┼──────────┼─────────────────────────────────────────│
│  walletType              │ string   │ "METAMASK", "WALLETCONNECT", "RAINBOW"    │
│  walletVersion           │ string   │ Wallet software version                   │
│  browserInfo             │ string   │ Browser user agent                        │
│  ipAddress               │ string   │ IP address (for audit)                    │
│  previousAddress         │ string   │ Previous wallet if updated                │
│  changeReason            │ string   │ Reason for wallet change                  │
│  approvedBy              │ string   │ Admin who approved wallet change          │
│  nonce                   │ integer  │ Transaction nonce                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  VALIDATION EXPECTATIONS                                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  VALIDATION TYPE         │ DESCRIPTION                                                  │
│  ────────────────────────┼──────────────────────────────────────────────────────────────│
│  Address Format          │ Must be valid Ethereum address (42 chars, starts with 0x)   │
│  Checksum Validation     │ Mixed-case address must pass EIP-55 checksum                │
│  Signature Verification  │ Verify signature using ecrecover:                           │
│                          │   - Signature must be from declared address                 │
│                          │   - Message must match exactly                              │
│                          │   - Signature must not be reused (nonce check)              │
│  Chain ID Check          │ Must match expected network:                                │
│                          │   - 1 = Ethereum Mainnet                                     │
│                          │   - 11155111 = Sepolia Testnet                              │
│  Duplicate Check         │ Wallet address must not be linked to another contractor     │
│  Message Integrity       │ Message must contain correct PAN and legal name             │
│                                                                                         │
│  SIGNATURE VERIFICATION PROCESS:                                                       │
│  1. Reconstruct message that was signed                                                 │
│  2. Hash message using keccak256                                                        │
│  3. Recover signer address from signature using ecrecover                               │
│  4. Compare recovered address with declared address                                     │
│  5. If match: signature is valid                                                        │
│                                                                                         │
│  WAGMI IMPLEMENTATION:                                                                  │
│  ```javascript                                                                          │
│  import { useSignMessage, useAccount } from 'wagmi'                                     │
│  import { verifyMessage } from 'viem'                                                   │
│                                                                                         │
│  const { address } = useAccount()                                                       │
│  const { signMessage } = useSignMessage()                                               │
│                                                                                         │
│  const message = `FATTS Registration Declaration...`                                    │
│  const signature = await signMessage({ message })                                       │
│                                                                                         │
│  // Verify on backend                                                                   │
│  const isValid = verifyMessage({ address, message, signature })                         │
│  ```                                                                                    │
│                                                                                         │
│  RED FLAGS:                                                                            │
│  • Signature verification failed → BLOCK                                                │
│  • Address already registered to another contractor → BLOCK                             │
│  • Chain ID mismatch → ERROR                                                           │
│  • Message tampered (PAN/name mismatch) → BLOCK                                         │
│  • Reused signature (nonce already used) → BLOCK                                       │
│  • Address is smart contract (not EOA) → WARNING                                       │
│  • Address has no transaction history → INFO (new wallet)                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## DOCUMENT REQUIREMENTS SUMMARY TABLE

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT REQUIREMENTS SUMMARY                                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  Document              │ Required │ Format    │ Max Size │ Confidence │ Primary Validation Source       │
│  ──────────────────────┼──────────┼───────────┼──────────┼────────────┼─────────────────────────────────│
│  PAN Card              │ YES      │ PDF/JPEG  │ 5 MB     │ 0.90       │ Income Tax API (NSDL)           │
│  GST Certificate       │ YES      │ PDF/JPEG  │ 5 MB     │ 0.92       │ GST Portal API                  │
│  CIN Certificate       │ Conditional│ PDF/JPEG │ 5 MB     │ 0.90       │ MCA API                         │
│  LLPIN Certificate     │ Conditional│ PDF/JPEG │ 5 MB     │ 0.90       │ MCA API                         │
│  Past Projects         │ YES      │ PDF       │ 10 MB    │ 0.75       │ AI Extraction + Manual          │
│  CA Turnover Cert      │ YES      │ PDF/JPEG  │ 5 MB     │ 0.85       │ ICAI UDIN API                   │
│  Bank Solvency         │ YES      │ PDF/JPEG  │ 5 MB     │ 0.85       │ Manual + Bank API (if avail)    │
│  Litigation Disclosure │ YES      │ PDF       │ 10 MB    │ 0.80       │ eCourts API + Manual            │
│  ESIC Certificate      │ Conditional│ PDF/JPEG │ 5 MB     │ 0.88       │ ESIC Portal API                 │
│  Labour License        │ Conditional│ PDF/JPEG │ 5 MB     │ 0.85       │ Labour Dept API (if avail)      │
│  Wallet Declaration    │ YES      │ Digital   │ N/A      │ N/A        │ Cryptographic (ecrecover)       │
│                                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘

CONDITIONAL REQUIREMENTS:
• CIN: Required for PRIVATE_LIMITED, PUBLIC_LIMITED entities
• LLPIN: Required for LLP entities
• ESIC: Required if employee count >= 10
• Labour License: Required if contract labourers >= 20
```

---

## PHASE 2B COMPLETE
## READY FOR NEXT PHASE
