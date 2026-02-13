# FATTS Contractor Onboarding Module
## Phase 2A — Document Lifecycle Architecture

---

## OBJECTIVE

Design the complete lifecycle of contractor documents in FATTS from upload to AI readiness.

**This phase defines ONLY the high-level document lifecycle architecture.**

- Do NOT define extraction rules yet.
- Do NOT define fraud detection yet.
- Do NOT define scoring logic.
- Do NOT define UI.

---

## DOCUMENT LIFECYCLE FLOW (STEP-BY-STEP)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    FATTS DOCUMENT LIFECYCLE PIPELINE                                     │
│                    From Upload to AI Readiness                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  STAGE 1: UPLOAD LAYER                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  1.1 CONTRACTOR INITIATES UPLOAD                                         │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Contractor selects document type from predefined list                 │
         │  │  • Document types: PAN_CARD, GST_CERTIFICATE, CIN_CERTIFICATE, etc.      │
         │  │  • Frontend captures file via browser file input                          │
         │  │  • Multiple file selection allowed for batch upload                       │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  1.2 CLIENT-SIDE PRE-VALIDATION                                          │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • File type check: Only PDF, JPEG, PNG allowed                          │
         │  │  • File size check: Maximum 10MB per file                                │
         │  │  • File integrity: Basic corruption check (can file be opened?)          │
         │  │  • Duplicate check: Compare file hash with already uploaded files        │
         │  │  • Rejection: Invalid files rejected immediately with error message      │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  1.3 SECURE TRANSFER MECHANISM                                           │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Protocol: HTTPS only (TLS 1.3 minimum)                                │
         │  │  • Transfer method: Multipart form-data to backend API                   │
         │  │  • Chunked upload: Files > 5MB split into 1MB chunks                     │
         │  │  • Resume capability: Interrupted uploads can resume                      │
         │  │  • Progress tracking: Real-time upload progress to frontend               │
         │  │  • Authentication: JWT token + wallet signature verification              │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  1.4 SERVER-SIDE VALIDATION                                              │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • MIME type verification (not just extension)                           │
         │  │  • Virus/malware scan via ClamAV or similar                              │
         │  │  • File structure validation (valid PDF header, image header)             │
         │  │  • Generate SHA-256 hash for integrity tracking                          │
         │  │  • Assign temporary storage location                                     │
         │  │  • Create upload log entry with timestamp, IP, user agent                │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  STAGE 2: SECURE STORAGE LAYER                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  2.1 RAW FILE STORAGE LOCATION                                           │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Primary storage: AWS S3 / Azure Blob / MinIO (self-hosted)            │
         │  │  • Storage path: /contractors/{contractorId}/raw/{documentType}/          │
         │  │  • File naming: {documentId}_{timestamp}.{extension}                      │
         │  │  • Retention policy: Raw files kept for 7 years (audit requirement)      │
         │  │  • Backup: Cross-region replication enabled                               │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  2.2 ENCRYPTION REQUIREMENTS                                             │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Encryption at rest: AES-256-GCM                                       │
         │  │  • Key management: AWS KMS / Azure Key Vault / HashiCorp Vault            │
         │  │  • Key rotation: Every 90 days                                           │
         │  │  • Encryption scope:                                                     │
         │  │    - File content encrypted before writing to disk                        │
         │  │    - Metadata (filename, type) stored separately in encrypted DB          │
         │  │    - Encryption keys never stored with encrypted data                     │
         │  │  • Decryption: Only authorized services can request decryption key        │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  2.3 ACCESS CONTROL RULES                                                │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Contractor: Can view/download own documents only                       │
         │  │  • Government Admin: Can view all documents for verification             │
         │  │  • AI System: Can request document for processing (time-limited URL)      │
         │  │  • Auditor: Read-only access with audit log entry                         │
         │  │  • Public: NO access to raw documents                                    │
         │  │  • Access logging: Every access logged with timestamp, actor, purpose     │
         │  │  • Time-limited URLs: Pre-signed URLs expire in 15 minutes                │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  STAGE 3: IPFS ANCHORING LAYER                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  3.1 WHEN FILES ARE UPLOADED TO IPFS                                     │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Trigger: After server-side validation passes                          │
         │  │  • Timing: Asynchronous, within 30 seconds of upload                     │
         │  │  • Condition: Only after contractor confirms document submission          │
         │  │  • Batch processing: Documents grouped by contractor for efficiency       │
         │  │  • Retry logic: 3 attempts with exponential backoff on failure            │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  3.2 WHO UPLOADS (BACKEND VS CLIENT)                                     │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • DECISION: Backend service uploads to IPFS                             │
         │  │  • Rationale:                                                           │
         │  │    - Ensures consistent encryption before upload                         │
         │  │    - Prevents client-side manipulation                                   │
         │  │    - Centralized access control and audit trail                          │
         │  │    - Rate limiting and quota management                                  │
         │  │  • Client role: Only uploads to backend API, never directly to IPFS      │
         │  │  • Backend service: Dedicated IPFS uploader microservice                 │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  3.3 HOW CID IS GENERATED                                                │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Process:                                                             │
         │  │    1. Document encrypted with AES-256-GCM (key from KMS)                 │
         │  │    2. Encrypted blob wrapped in IPFS UnixFS structure                    │
         │  │    3. IPFS node calculates CID using SHA-256 hash                        │
         │  │    4. CID v1 preferred (case-insensitive, base32 encoded)                │
         │  │  • CID format: bafybeig... (CID v1) or Qm... (CID v0)                    │
         │  │  • Deterministic: Same encrypted content = same CID                      │
         │  │  • Directory structure: Each contractor gets a directory CID             │
         │  │    /ipfs/{rootCID}/                                                      │
         │  │         ├── pan_proof.pdf                                               │
         │  │         ├── gst_certificate.pdf                                         │
         │  │         └── ...                                                         │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  3.4 WHERE CID IS STORED                                                 │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Off-chain database:                                                  │
         │  │    - Table: contractor_documents                                         │
         │  │    - Fields: document_id, ipfs_cid, upload_timestamp, file_hash          │
         │  │  • On-chain (smart contract):                                           │
         │  │    - Root CID: Stored in ContractorVerification.documentRootHash         │
         │  │    - Only root CID stored on-chain (gas efficiency)                      │
         │  │    - Individual document CIDs in off-chain DB only                       │
         │  │  • IPFS node:                                                           │
         │  │    - Pinned to ensure availability                                      │
         │  │    - Replicated across multiple IPFS nodes (3+ replicas)                 │
         │  │    - Private IPFS cluster (not public gateway)                           │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  STAGE 4: EXTRACTION TRIGGER LAYER                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  4.1 WHEN DOCUMENT PARSING STARTS                                        │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Trigger conditions (ALL must be true):                                │
         │  │    1. Document successfully uploaded to IPFS (CID generated)             │
         │  │    2. Document not already processed (check extraction_status)            │
         │  │    3. Contractor has submitted application (status = SUBMITTED)          │
         │  │  • Immediate trigger: For identity documents (PAN, GST, CIN)              │
         │  │  • Batch trigger: For supporting documents (past projects, etc.)          │
         │  │  • Manual trigger: Government admin can request re-extraction            │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  4.2 HOW PROCESSING QUEUE WORKS                                          │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Queue technology: Redis Queue (RQ) / RabbitMQ / AWS SQS               │
         │  │  • Queue structure:                                                     │
         │  │    ┌─────────────────────────────────────────────────────────────────┐   │
         │  │    │  Priority Queue                                                  │   │
         │  │    │  ├── HIGH: Identity documents (PAN, GST, CIN)                   │   │
         │  │    │  ├── MEDIUM: Financial documents (Turnover, Solvency)           │   │
         │  │    │  └── LOW: Supporting documents (Past projects, etc.)            │   │
         │  │    └─────────────────────────────────────────────────────────────────┘   │
         │  │  • Queue entry format:                                                 │
         │  │    {                                                                    │
         │  │      "jobId": "uuid",                                                   │
         │  │      "contractorId": "uuid",                                            │
         │  │      "documentId": "uuid",                                              │
         │  │      "documentType": "PAN_CARD",                                        │
         │  │      "ipfsCID": "bafybeig...",                                          │
         │  │      "priority": "HIGH",                                                │
         │  │      "createdAt": "2024-02-15T10:30:00.000Z",                           │
         │  │      "retryCount": 0                                                    │
         │  │    }                                                                    │
         │  │  • Dead letter queue: Failed jobs after 3 retries                      │
         │  │  • Queue monitoring: Dashboard for job status and backlog               │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  4.3 ASYNC VS SYNC PROCESSING                                            │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • DECISION: Asynchronous processing (primary)                           │
         │  │  • Rationale:                                                           │
         │  │    - Document extraction can take 5-30 seconds                          │
         │  │    - OCR processing is CPU intensive                                    │
         │  │    - Government API calls add latency                                   │
         │  │    - Prevents HTTP timeout on upload endpoint                           │
         │  │  • Sync processing (exception cases):                                   │
         │  │    - Only for real-time validation during form fill                     │
         │  │    - Example: PAN format validation (not extraction)                    │
         │  │  • Status communication:                                               │
         │  │    - WebSocket: Real-time status updates to frontend                    │
         │  │    - Polling: Frontend polls /extraction-status endpoint                │
         │  │    - Email: Notification when all documents processed                   │
         │  │  • Processing flow:                                                    │
         │  │    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐             │
         │  │    │  QUEUED     │────▶│ PROCESSING  │────▶│ COMPLETED   │             │
         │  │    └─────────────┘     └─────────────┘     └─────────────┘             │
         │  │                               │                                          │
         │  │                               ▼                                          │
         │  │                         ┌─────────────┐                                 │
         │  │                         │   FAILED    │                                 │
         │  │                         └─────────────┘                                 │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  STAGE 5: STRUCTURED DATA MAPPING LAYER                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  5.1 HOW EXTRACTED FIELDS MAP TO PHASE 1 SCHEMA                          │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Mapping process:                                                     │
         │  │    1. AI/OCR extracts raw text from document                            │
         │  │    2. NLP identifies key-value pairs                                    │
         │  │    3. Schema mapper transforms to Phase 1 JSON structure                │
         │  │    4. Validation layer checks format and constraints                    │
         │  │  • Mapping table (document type → schema path):                         │
         │  │    ┌─────────────────────────────────────────────────────────────────┐   │
         │  │    │  DOCUMENT TYPE          │ SCHEMA PATH                           │   │
         │  │    ├─────────────────────────────────────────────────────────────────┤   │
         │  │    │  PAN_CARD               │ legalIdentity.pan                     │   │
         │  │    │  GST_CERTIFICATE        │ legalIdentity.gstin                   │   │
         │  │    │  CIN_CERTIFICATE        │ legalIdentity.cin                     │   │
         │  │    │  CA_TURNOVER_CERTIFICATE│ financialQualification.turnoverHistory│   │
         │  │    │  BANK_SOLVENCY_CERTIFICATE│ financialQualification.solvencyCertificate│
         │  │    │  PAST_PROJECTS_DOCUMENT │ technicalExperience.pastProjects      │   │
         │  │    │  LITIGATION_DISCLOSURE  │ compliance.litigationDisclosure       │   │
         │  │    │  ESIC_CERTIFICATE       │ compliance.esicRegistration           │   │
         │  │    │  LABOUR_LICENSE         │ compliance.labourLicense              │   │
         │  │    └─────────────────────────────────────────────────────────────────┘   │
         │  │  • Field transformation examples:                                       │
         │  │    - Raw: "PAN: AAPFU0939K" → Schema: legalIdentity.pan = "AAPFU0939K"  │
         │  │    - Raw: "Turnover: ₹5,00,00,000" → Schema: amount = 5000000000 (paise)│
         │  │    - Raw: "Date: 15/02/2024" → Schema: "2024-02-15" (ISO 8601)          │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  5.2 HOW VALIDATION FLAGS ARE ATTACHED                                  │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Validation flag structure:                                           │
         │  │    {                                                                    │
         │  │      "field": "legalIdentity.pan",                                      │
         │  │      "value": "AAPFU0939K",                                              │
         │  │      "validationStatus": "PENDING|VERIFIED|FAILED|MISMATCH",             │
         │  │      "validationSource": "INCOME_TAX_API|GST_PORTAL|FORMAT_CHECK",       │
         │  │      "validationTimestamp": "2024-02-15T11:00:00.000Z",                  │
         │  │      "validationDetails": {                                              │
         │  │        "formatValid": true,                                              │
         │  │        "apiVerified": true,                                              │
         │  │        "nameMatch": true,                                                │
         │  │        "status": "ACTIVE"                                                │
         │  │      },                                                                  │
         │  │      "confidenceScore": 0.98                                             │
         │  │    }                                                                     │
         │  │  • Flag attachment points:                                              │
         │  │    - Field level: Each extracted field gets validation status           │
         │  │    - Document level: documentReference.verified (true/false)            │
         │  │    - Record level: verificationStatus.currentStatus                     │
         │  │  • Validation sources:                                                  │
         │  │    ┌─────────────────────────────────────────────────────────────────┐   │
         │  │    │  FIELD           │ VALIDATION SOURCE                             │   │
         │  │    ├─────────────────────────────────────────────────────────────────┤   │
         │  │    │  PAN             │ Income Tax API (NSDL)                         │   │
         │  │    │  GSTIN           │ GST Portal API                                │   │
         │  │    │  CIN/LLPIN       │ MCA API                                       │   │
         │  │    │  Turnover        │ ICAI UDIN verification                        │   │
         │  │    │  Litigation      │ eCourts API                                   │   │
         │  │    │  ESIC            │ ESIC Portal API                               │   │
         │  │    │  Format fields   │ Regex validation (local)                      │   │
         │  │    └─────────────────────────────────────────────────────────────────┘   │
         │  │  • Cross-document validation:                                           │
         │  │    - PAN in PAN_CARD must match PAN in GSTIN (positions 3-7)            │
         │  │    - Legal name must match across all documents                         │
         │  │    - Address consistency check across documents                         │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  STAGE 6: AI READINESS GATE                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  6.1 CONDITIONS REQUIRED BEFORE MOVING TO AI SCORING                     │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • All mandatory documents uploaded:                                    │
         │  │    ┌─────────────────────────────────────────────────────────────────┐   │
         │  │    │  MANDATORY DOCUMENTS                                             │   │
         │  │    │  ├── PAN_CARD                                                    │   │
         │  │    │  ├── GST_CERTIFICATE                                             │   │
         │  │    │  ├── CIN_CERTIFICATE (if Company)                                │   │
         │  │    │  ├── LLPIN_CERTIFICATE (if LLP)                                  │   │
         │  │    │  ├── CA_TURNOVER_CERTIFICATE                                     │   │
         │  │    │  ├── BANK_SOLVENCY_CERTIFICATE                                   │   │
         │  │    │  ├── PAST_PROJECTS_DOCUMENT                                      │   │
         │  │    │  └── LITIGATION_DISCLOSURE                                       │   │
         │  │    └─────────────────────────────────────────────────────────────────┘   │
         │  │  • All documents successfully extracted:                               │
         │  │    - extraction_status = "COMPLETED" for all documents                 │
         │  │    - No documents in "QUEUED" or "PROCESSING" state                    │
         │  │    - Failed documents must be re-uploaded or manually resolved          │
         │  │  • All identity verifications completed:                               │
         │  │    - panVerificationStatus ≠ "PENDING"                                 │
         │  │    - gstinVerificationStatus ≠ "PENDING"                               │
         │  │    - cinVerificationStatus ≠ "PENDING" (if applicable)                 │
         │  │  • No blocking validation errors:                                      │
         │  │    - No CRITICAL severity risk flags                                   │
         │  │    - No unresolved document mismatches                                 │
         │  │  • Application status = "SUBMITTED" or "UNDER_REVIEW"                  │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  6.2 REQUIRED DOCUMENT COMPLETENESS RULES                               │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Completeness scoring:                                                │
         │  │    ┌─────────────────────────────────────────────────────────────────┐   │
         │  │    │  COMPLETENESS CHECK                              │ WEIGHT        │   │
         │  │    ├─────────────────────────────────────────────────────────────────┤   │
         │  │    │  PAN uploaded and verified                       │ 15%           │   │
         │  │    │  GSTIN uploaded and verified                     │ 15%           │   │
         │  │    │  CIN/LLPIN uploaded and verified (if applicable) │ 10%           │   │
         │  │    │  Turnover certificate uploaded and extracted     │ 15%           │   │
         │  │    │  Solvency certificate uploaded and extracted     │ 10%           │   │
         │  │    │  Past projects document uploaded and extracted   │ 15%           │   │
         │  │    │  Litigation disclosure uploaded and verified     │ 10%           │   │
         │  │    │  ESIC/Labour license (if applicable)             │ 5%            │   │
         │  │    │  All extracted fields validated                  │ 5%            │   │
         │  │    ├─────────────────────────────────────────────────────────────────┤   │
         │  │    │  MINIMUM COMPLETENESS FOR AI SCORING             │ 90%           │   │
         │  │    └─────────────────────────────────────────────────────────────────┘   │
         │  │  • Blocking conditions (prevent AI scoring):                            │
         │  │    - Completeness score < 90%                                           │
         │  │    - Any mandatory document missing                                     │
         │  │    - PAN or GSTIN verification failed                                   │
         │  │    - Blacklist status = true                                            │
         │  │    - Criminal cases detected (requires manual review)                   │
         │  │  • Warning conditions (allow AI scoring with flag):                     │
         │  │    - Optional documents missing (ESIC, Labour License)                  │
         │  │    - Low extraction confidence (< 0.80) on some documents               │
         │  │    - Turnover decline detected                                          │
         │  │    - Minor litigation cases pending                                     │
         │  │  • AI Readiness Gate output:                                            │
         │  │    {                                                                    │
         │  │      "ready": true,                                                      │
         │  │      "completenessScore": 95,                                            │
         │  │      "blockingConditions": [],                                           │
         │  │      "warningConditions": [                                              │
         │  │        "Low extraction confidence on PAST_PROJECTS_DOCUMENT (0.75)"      │
         │  │      ],                                                                  │
         │  │      "readyTimestamp": "2024-02-15T12:00:00.000Z"                        │
         │  │    }                                                                     │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
         │  ┌──────────────────────────────────────────────────────────────────────────┐
         │  │  6.3 TRANSITION TO AI SCORING PHASE                                      │
         │  │  ─────────────────────────────────────────────────────────────────────── │
         │  │  • Automatic transition trigger:                                        │
         │  │    - When all conditions in 6.1 and 6.2 are satisfied                   │
         │  │    - System automatically queues contractor for AI scoring               │
         │  │  • Status update:                                                       │
         │  │    - verificationStatus.currentStatus → "AI_SCORED" (after scoring)      │
         │  │    - Or → "UNDER_REVIEW" (if waiting for manual review)                 │
         │  │  • Notification:                                                        │
         │  │    - Government admin notified of ready-for-scoring contractor           │
         │  │    - Contractor notified of application progress                         │
         │  │  • Audit log entry:                                                     │
         │  │    {                                                                    │
         │  │      "action": "AI_READINESS_GATE_PASSED",                               │
         │  │      "timestamp": "2024-02-15T12:00:00.000Z",                            │
         │  │      "actor": "SYSTEM",                                                  │
         │  │      "details": {                                                        │
         │  │        "completenessScore": 95,                                          │
         │  │        "documentsProcessed": 8,                                          │
         │  │        "validationPassed": true                                          │
         │  │      }                                                                   │
         │  │    }                                                                     │
         │  └──────────────────────────────────────────────────────────────────────────┘
         │                                      │
         ▼                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  END OF DOCUMENT LIFECYCLE PIPELINE                                                      │
│  NEXT PHASE: AI SCORING (NOT DEFINED IN THIS PHASE)                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## LIFECYCLE STAGE SUMMARY

| Stage | Name | Input | Output | Key Actions |
|-------|------|-------|--------|-------------|
| 1 | Upload Layer | Raw file from contractor | Validated file on server | File validation, secure transfer |
| 2 | Secure Storage Layer | Validated file | Encrypted file in storage | Encryption, access control setup |
| 3 | IPFS Anchoring Layer | Encrypted file | CID (Content Identifier) | IPFS upload, CID generation |
| 4 | Extraction Trigger Layer | CID + document metadata | Extraction job queued | Queue management, async processing |
| 5 | Structured Data Mapping | Extracted raw data | Mapped JSON per Phase 1 schema | Field mapping, validation flags |
| 6 | AI Readiness Gate | Mapped data + validation status | AI readiness decision | Completeness check, blocking condition check |

---

## DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         DOCUMENT LIFECYCLE DATA FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  CONTRACTOR                 FRONTEND                    BACKEND                     STORAGE
      │                          │                          │                          │
      │  1. Select file          │                          │                          │
      │ ─────────────────────▶   │                          │                          │
      │                          │  2. Pre-validate          │                          │
      │                          │    (type, size)          │                          │
      │                          │                          │                          │
      │                          │  3. Upload via HTTPS      │                          │
      │                          │ ──────────────────────▶  │                          │
      │                          │                          │  4. Server validation    │
      │                          │                          │                          │
      │                          │                          │  5. Store encrypted      │
      │                          │                          │ ──────────────────────▶  │
      │                          │                          │                          │
      │                          │                          │  6. Upload to IPFS       │
      │                          │                          │ ──────────────────────▶  │
      │                          │                          │                          │ IPFS
      │                          │                          │  7. Return CID           │ NETWORK
      │                          │                          │ ◀──────────────────────  │
      │                          │                          │                          │
      │                          │                          │  8. Queue extraction     │
      │                          │                          │                          │
      │                          │  9. Status update        │                          │
      │                          │    (WebSocket)           │                          │
      │ ◀─────────────────────   │                          │                          │
      │                          │                          │                          │
      │                          │                          │  10. Extract & Map       │
      │                          │                          │                          │
      │                          │                          │  11. Validate fields     │
      │                          │                          │                          │
      │                          │                          │  12. Check AI readiness  │
      │                          │                          │                          │
      │                          │  13. Ready notification  │                          │
      │ ◀─────────────────────   │                          │                          │
      │                          │                          │                          │
      │                          │                          │  14. Queue for AI        │
      │                          │                          │      scoring             │
      │                          │                          │                          │
```

---

## ERROR HANDLING AT EACH STAGE

| Stage | Error Type | Handling Strategy |
|-------|------------|-------------------|
| 1 - Upload | Invalid file type | Immediate rejection with error message |
| 1 - Upload | File too large | Immediate rejection with size limit info |
| 1 - Upload | Corrupted file | Rejection with retry suggestion |
| 1 - Upload | Network failure | Resume capability, retry prompt |
| 2 - Storage | Encryption failure | Retry with new key, alert admin |
| 2 - Storage | Storage quota exceeded | Alert admin, queue for later |
| 3 - IPFS | Upload timeout | Retry with exponential backoff (3 attempts) |
| 3 - IPFS | IPFS node unavailable | Failover to backup node |
| 4 - Extraction | Queue overflow | Scale workers, priority processing |
| 4 - Extraction | Processing timeout | Move to dead letter queue, alert |
| 5 - Mapping | Extraction failure | Manual review flag, notify contractor |
| 5 - Mapping | Schema validation failure | Flag for review, partial data saved |
| 6 - AI Gate | Incomplete documents | Block AI scoring, notify contractor |
| 6 - AI Gate | Validation failures | Block AI scoring, flag for review |

---

## SECURITY CONSIDERATIONS

### At Each Stage

| Stage | Security Measure |
|-------|------------------|
| Upload | TLS 1.3, JWT authentication, wallet signature verification |
| Storage | AES-256-GCM encryption, KMS key management, access logging |
| IPFS | Pre-upload encryption, private IPFS cluster, pinning policy |
| Extraction | Isolated processing environment, no persistent data in memory |
| Mapping | Input sanitization, output validation, audit logging |
| AI Gate | Completeness verification, no data exposure before ready |

---

## PHASE 2A COMPLETE
## READY FOR NEXT PHASE
