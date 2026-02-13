# FATTS Contractor Onboarding Module
## Phase 0 — System Architecture Clarification

---

## 🛠️ TECHNOLOGY STACK (Existing Project)

Based on the existing codebase analysis:

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Blockchain** | Ethereum (Solidity ^0.8.20) | Smart contract execution |
| **Test Network** | Sepolia | Development & testing |
| **Main Network** | Ethereum Mainnet | Production deployment |
| **Frontend** | React + Vite | User interface |
| **Web3 Library** | Wagmi | React hooks for Ethereum |
| **Wallet Connection** | RainbowKit | MetaMask, WalletConnect, Rainbow |
| **Document Storage** | IPFS | Decentralized file storage |
| **Smart Contract** | [`TransparentTender`](SmartContract/TenderContract.sol) | Existing contract with contractor registry |

### Existing Smart Contract Structure

The existing [`TransparentTender`](SmartContract/TenderContract.sol) contract already has:

```solidity
struct Contractor {
    bool registered;
    string ipfsProfileHash;
    uint256 competenceScore;
}

function approveContractor(
    address _contractor, 
    string memory _ipfsHash, 
    uint256 _aiGeneratedScore
) external onlyGov
```

**This onboarding module will extend the existing contract** to include:
- Enhanced contractor verification data
- Risk category tracking
- Document integrity hashes
- Compliance status

---

## 1️⃣ SYSTEM DATA FLOW

### Complete Lifecycle: Contractor Registration → Public Transparency

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FATTS CONTRACTOR ONBOARDING FLOW                      │
└─────────────────────────────────────────────────────────────────────────────┘

STEP 1: CONTRACTOR REGISTRATION
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Contractor  │────▶│  Frontend    │────▶│  Backend API │
│  (Browser)   │     │  (React)     │     │  (Node.js)   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Wallet       │
                     │ Connection   │
                     │ (MetaMask)   │
                     └──────────────┘

STEP 2: DOCUMENT UPLOAD
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Document    │────▶│  IPFS        │────▶│  CID         │
│  Selection   │     │  Node        │     │  Generated   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Encrypted    │
                     │ Storage      │
                     │ (Off-chain)  │
                     └──────────────┘

STEP 3: DATA VALIDATION
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Structured  │────▶│  Format      │────▶│  Government  │
│  Form Data   │     │  Validation  │     │  API Verify  │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Compliance   │
                     │ Checks       │
                     └──────────────┘

STEP 4: AI EVALUATION
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Structured  │────▶│  AI Scoring  │────▶│  Competence  │
│  Fields      │     │  Engine      │     │  Score       │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Risk Profile │
                     │ Generated    │
                     └──────────────┘

STEP 5: ON-CHAIN ANCHORING
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  IPFS CID    │────▶│  Smart       │────▶│  Blockchain  │
│  + Score     │     │  Contract    │     │  Record      │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Wallet       │
                     │ Signature    │
                     └──────────────┘

STEP 6: PUBLIC TRANSPARENCY
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Citizen     │────▶│  Blockchain  │────▶│  Public      │
│  Query       │     │  Explorer    │     │  Dashboard   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ IPFS Document│
                     │ Access       │
                     └──────────────┘
```

### Detailed Step Breakdown

| Step | Actor | Action | Output |
|------|-------|--------|--------|
| 1 | Contractor | Connects wallet, initiates registration | Wallet address captured |
| 2 | Contractor | Uploads documents (PDF) | IPFS CID per document |
| 3 | Contractor | Fills structured form | Validated JSON payload |
| 4 | Backend | Validates formats (PAN, GSTIN, CIN) | Validation report |
| 5 | Backend | Calls government APIs for verification | Verification status |
| 6 | AI Engine | Processes structured fields | Competence score (0-100) |
| 7 | Backend | Prepares on-chain payload | CID + Score + Metadata |
| 8 | Contractor | Signs transaction | Digital signature |
| 9 | Smart Contract | Stores minimal data on-chain | Immutable record |
| 10 | Public | Views transparent records | Audit trail |

### What Citizens Can See vs Private Data

| Data Type | Public | Government Only | Contractor Only |
|-----------|--------|-----------------|-----------------|
| Competence Score | ✅ | ✅ | ✅ |
| IPFS Document Hash | ✅ | ✅ | ✅ |
| Approval Status | ✅ | ✅ | ✅ |
| Tender Participation | ✅ | ✅ | ✅ |
| PAN Number | ❌ | ✅ | ✅ |
| GSTIN | ❌ | ✅ | ✅ |
| Financial Documents | ❌ | ✅ | ✅ |
| Litigation Details | ❌ | ✅ | ✅ |
| Raw Uploaded PDFs | ❌ | ✅ | ✅ |

---

## 2️⃣ STORAGE STRATEGY

### A. ON-CHAIN DATA (Ethereum - Sepolia/Mainnet)

**Existing Smart Contract Structure:**

The current [`TransparentTender`](SmartContract/TenderContract.sol) contract stores:

```solidity
// EXISTING STRUCTURE
struct Contractor {
    bool registered;           // Registration status
    string ipfsProfileHash;    // IPFS hash of profile documents
    uint256 competenceScore;   // AI-generated score (0-100)
}

mapping(address => Contractor) public contractors;
```

**Proposed Extension for Onboarding Module:**

```solidity
// EXTENDED STRUCTURE (to be added via contract upgrade or new contract)
struct ContractorVerification {
    bytes32 contractorId;        // Unique identifier (hash of PAN + salt)
    address walletAddress;       // Linked wallet (key to existing mapping)
    bytes32 documentRootHash;    // Merkle root of all document hashes
    uint256 competenceScore;     // AI-generated score (0-100)
    uint256 registrationTime;    // Timestamp
    uint8 verificationStatus;    // 0=Pending, 1=Approved, 2=Rejected
    uint8 riskCategory;          // 0=LOW, 1=MEDIUM, 2=HIGH
    uint8 complianceScore;       // Compliance score (0-100)
}
```

**Why ONLY these fields?**
- Gas efficiency (storing large data is expensive)
- Privacy compliance (GDPR-like requirements)
- Immutability consideration (sensitive data should be mutable off-chain)
- Transparency requirement (public must verify without exposing raw data)

**What must NEVER go on-chain:**
- PAN number (directly)
- GSTIN (directly)
- CIN/LLPIN (directly)
- Financial turnover figures
- Bank account details
- Litigation case details
- Raw document content
- Personal addresses
- Director names

### B. OFF-CHAIN SECURE STORAGE (Database + Encrypted)

**Storage Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    OFF-CHAIN STORAGE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  PostgreSQL DB  │    │  Encryption     │                │
│  │  (Structured)   │    │  Layer (AES-256)│                │
│  └─────────────────┘    └─────────────────┘                │
│           │                      │                          │
│           ▼                      ▼                          │
│  ┌─────────────────────────────────────────────────┐       │
│  │              Encrypted Tables                    │       │
│  │  - contractors (PII encrypted)                   │       │
│  │  - documents (metadata only)                     │       │
│  │  - verification_logs                             │       │
│  │  - audit_trail                                   │       │
│  └─────────────────────────────────────────────────┘       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Access Control Logic:**

| Role | Access Level | Permissions |
|------|--------------|-------------|
| Contractor | Own data only | Read/Update own records |
| Government Admin | All contractors | Read/Verify/Approve/Reject |
| Auditor | Read-only | View all verification logs |
| Public | Transparent subset | View scores, status, IPFS hashes |
| AI System | Structured fields | Read for scoring only |

### C. IPFS LAYER

**What gets uploaded to IPFS:**

```
IPFS Directory Structure:
/QmXxx... (Root CID)
├── /identity
│   ├── pan_proof.pdf
│   ├── gst_certificate.pdf
│   └── cin_certificate.pdf
├── /financial
│   ├── ca_turnover_certificate.pdf
│   └── bank_solvency.pdf
├── /technical
│   └── past_projects.pdf
├── /compliance
│   ├── litigation_disclosure.pdf
│   ├── esic_registration.pdf
│   └── labour_license.pdf
└── metadata.json (structured fields, NOT raw PII)
```

**Upload Process:**

1. **Who uploads?** Backend service (not client-side)
2. **When?** After initial validation, before on-chain anchoring
3. **How CID is used:**
   - Root CID stored on-chain
   - Individual file CIDs stored in off-chain DB
   - CID acts as integrity proof (tampering detection)

**IPFS Security Considerations:**

```
┌─────────────────────────────────────────────────────────────┐
│                    IPFS SECURITY MODEL                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Option A: Public IPFS (NOT RECOMMENDED for sensitive docs) │
│  - Anyone with CID can access                               │
│  - Only use for public documents                            │
│                                                              │
│  Option B: Private IPFS Cluster (RECOMMENDED)               │
│  - Access-controlled IPFS nodes                             │
│  - Documents encrypted before upload                        │
│  - CID only meaningful with decryption key                  │
│                                                              │
│  Option C: IPFS + Encryption Layer (HYBRID)                 │
│  - Documents encrypted client-side                          │
│  - Encrypted blob uploaded to IPFS                          │
│  - Decryption key stored in off-chain DB                    │
│  - Key access controlled by smart contract                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

DECISION: Option C (IPFS + Encryption Layer)
```

---

## 3️⃣ TRUST MODEL

### Who Can Manipulate What?

| Entity | Can Create | Can Read | Can Update | Can Delete |
|--------|------------|----------|------------|------------|
| Contractor | Own profile | Own data | Own data (before approval) | Nothing |
| Government Admin | Nothing | All data | Verification status | Nothing |
| AI System | Scores | Structured fields | Scores | Nothing |
| Smart Contract | On-chain records | On-chain data | Status only | Nothing |
| Auditor | Audit logs | All logs | Nothing | Nothing |

### Tamper Prevention Mechanisms

```
┌─────────────────────────────────────────────────────────────┐
│                    TAMPER PREVENTION                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DOCUMENT INTEGRITY                                       │
│     ┌─────────────┐     ┌─────────────┐                     │
│     │ Document    │────▶│ IPFS CID    │ (Immutable)         │
│     │ Upload      │     │ Generated   │                     │
│     └─────────────┘     └─────────────┘                     │
│            │                   │                             │
│            ▼                   ▼                             │
│     ┌─────────────┐     ┌─────────────┐                     │
│     │ SHA-256     │     │ CID on      │ (Tamper-proof)      │
│     │ Hash        │     │ Blockchain  │                     │
│     └─────────────┘     └─────────────┘                     │
│                                                              │
│  2. IDENTITY BINDING                                         │
│     ┌─────────────┐     ┌─────────────┐                     │
│     │ PAN + Salt  │────▶│ Keccak256   │                     │
│     └─────────────┘     └─────────────┘                     │
│            │                   │                             │
│            ▼                   ▼                             │
│     ┌─────────────┐     ┌─────────────┐                     │
│     │ contractorId│────▶│ On-chain    │                     │
│     │             │     │ Record      │                     │
│     └─────────────┘     └─────────────┘                     │
│                                                              │
│  3. SCORE INTEGRITY                                          │
│     ┌─────────────┐     ┌─────────────┐                     │
│     │ AI Score    │────▶│ Signed by   │                     │
│     │ Generation  │     │ AI System   │                     │
│     └─────────────┘     └─────────────┘                     │
│            │                   │                             │
│            ▼                   ▼                             │
│     ┌─────────────┐     ┌─────────────┐                     │
│     │ Score Hash  │────▶│ On-chain    │                     │
│     │             │     │ Storage     │                     │
│     └─────────────┘     └─────────────┘                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Fake Identity Prevention

| Attack Vector | Prevention Mechanism |
|---------------|---------------------|
| Fake PAN | Government API verification (Income Tax Dept) |
| Fake GSTIN | GST Portal API verification |
| Fake CIN | MCA (Ministry of Corporate Affairs) API |
| Stolen Identity | Wallet signature + OTP to registered mobile |
| Sybil Attack | One PAN = One contractorId (enforced on-chain) |
| Document Forgery | CA digital signature verification |

### Wallet-Identity Linkage

```
┌─────────────────────────────────────────────────────────────┐
│              WALLET-IDENTITY BINDING PROCESS                 │
│              (Using RainbowKit + Wagmi)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Contractor connects wallet via RainbowKit          │
│          Supported: MetaMask, WalletConnect, Rainbow        │
│          │                                                   │
│          ▼                                                   │
│  Step 2: Contractor enters PAN                               │
│          │                                                   │
│          ▼                                                   │
│  Step 3: Backend verifies PAN with Income Tax API            │
│          │                                                   │
│          ▼                                                   │
│  Step 4: Backend generates challenge message                 │
│          "FATTS Registration: Sign this message to link      │
│           wallet 0x... to PAN ****X1234"                     │
│          │                                                   │
│          ▼                                                   │
│  Step 5: Contractor signs with wallet (Wagmi useSignMessage)│
│          │                                                   │
│          ▼                                                   │
│  Step 6: Backend verifies signature                          │
│          │                                                   │
│          ▼                                                   │
│  Step 7: Binding stored:                                     │
│          - Off-chain: PAN ↔ wallet mapping (encrypted)       │
│          - On-chain: contractorId ↔ wallet (public)          │
│                                                              │
│  Wagmi Hook Example:                                         │
│  const { signMessage } = useSignMessage()                   │
│  const signature = await signMessage({ message: challenge })│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Attack Vectors and Mitigations

| Attack | Description | Mitigation |
|--------|-------------|------------|
| Front-running | Attacker observes pending tx | Commit-reveal for registration |
| Replay Attack | Reuse signature elsewhere | Nonce + timestamp in message |
| Data Injection | Malicious input to AI | Input sanitization + rate limiting |
| CID Collision | Fake document with same CID | Cryptographically impossible (IPFS) |
| Admin Compromise | Malicious government actor | Multi-sig for approvals + audit logs |

---

## 4️⃣ COMPLIANCE ALIGNMENT (INDIA)

### GST Compliance Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GST VERIFICATION FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input: GSTIN (11-digit state code + PAN + entity + Z)      │
│         Example: 27AAPFU0939K1ZM                             │
│                                                              │
│  Validation Steps:                                           │
│  1. Format validation (regex)                               │
│  2. Check digit verification (Luhn algorithm)               │
│  3. GST Portal API call                                     │
│     - Verify registration status                            │
│     - Verify business name matches                          │
│     - Verify address matches                                │
│     - Check for suspension/cancellation                     │
│                                                              │
│  Data Extracted:                                             │
│  - Legal business name                                       │
│  - Registration date                                         │
│  - Business type (Regular/Composition)                      │
│  - Taxpayer status (Active/Suspended/Cancelled)             │
│                                                              │
│  Red Flags:                                                  │
│  - GSTIN cancelled                                           │
│  - Composition scheme (may indicate small turnover)         │
│  - Recent registration (less than 3 years)                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### PAN Verification Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PAN VERIFICATION FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Input: PAN (10-character alphanumeric)                     │
│         Example: AAPFU0939K                                  │
│                                                              │
│  Format Rules:                                               │
│  - First 3 chars: alphabetic (AAA-ZZZ)                      │
│  - 4th char: entity type (AOP/BOI/Company/Trust/etc.)       │
│  - 5th char: first letter of surname/org                    │
│  - 6-9 chars: sequential number                              │
│  - 10th char: check digit                                    │
│                                                              │
│  Verification Steps:                                         │
│  1. Format validation                                        │
│  2. Income Tax API verification (via NSDL)                  │
│  3. Verify name match                                        │
│  4. Verify status (Active/Inactive)                         │
│                                                              │
│  Entity Type Mapping (4th character):                        │
│  A = AOP (Association of Persons)                           │
│  B = BOI (Body of Individuals)                              │
│  C = Company                                                 │
│  F = Firm/LLP                                               │
│  G = Government Agency                                       │
│  H = HUF (Hindu Undivided Family)                           │
│  L = Local Authority                                         │
│  J = Artificial Juridical Person                            │
│  P = Individual                                              │
│  T = Trust                                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### CIN/LLPIN Validation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 CIN/LLPIN VERIFICATION FLOW                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CIN (Corporate Identity Number):                            │
│  Format: U12345MH2015PTC123456 (21 characters)              │
│  - U + 5-digit listing code + 2-digit state + 4-digit year  │
│    + 3-digit ownership + 6-digit registration               │
│                                                              │
│  LLPIN (Limited Liability Partnership ID):                   │
│  Format: AAA-1234 (variable format)                         │
│                                                              │
│  Verification:                                               │
│  1. Format validation                                        │
│  2. MCA (Ministry of Corporate Affairs) API                 │
│  3. Verify company status (Active/Strike-off/Dormant)       │
│  4. Verify director details match                           │
│  5. Check for disqualifications                             │
│                                                              │
│  Red Flags:                                                  │
│  - Company under liquidation                                 │
│  - Directors disqualified                                    │
│  - Company struck off                                        │
│  - Dormant status                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Financial Document Authenticity

| Document | Issuing Authority | Verification Method |
|----------|-------------------|---------------------|
| CA Turnover Certificate | Chartered Accountant | ICAI membership verification + UDIN check |
| Bank Solvency Certificate | Bank | Bank API verification (if available) or manual |
| Bank Statement | Bank | Manual verification by admin |

### Litigation Disclosure Handling

```
┌─────────────────────────────────────────────────────────────┐
│                LITIGATION DISCLOSURE ARCHITECTURE            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Required Disclosures:                                       │
│  1. Pending criminal cases                                   │
│  2. Pending civil cases (above ₹10 lakh)                    │
│  3. Arbitration cases                                        │
│  4. Tax disputes                                             │
│  5. Labour law violations                                    │
│  6. Blacklisting by any government department               │
│                                                              │
│  Verification:                                               │
│  - Cross-check with Indian Judiciary eCourts API            │
│  - Check government blacklist databases                     │
│  - Verify with GST litigation database                      │
│                                                              │
│  Risk Scoring:                                               │
│  - No litigation: Base score                                 │
│  - Civil cases: -5 per case                                  │
│  - Criminal cases: -20 per case (potential rejection)       │
│  - Blacklisted: Auto-reject                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ AI BOUNDARY DEFINITION

### What AI IS Allowed to Decide

| Decision | AI Authority | Rationale |
|----------|--------------|-----------|
| Competence Score (0-100) | ✅ Full authority | Based on structured inputs |
| Risk Category | ✅ Full authority | Derived from scoring logic |
| Document Completeness | ✅ Full authority | Checklist-based |
| Experience Weighting | ✅ Full authority | Based on project history |
| Financial Strength Score | ✅ Full authority | Based on turnover data |

### What AI CANNOT Override

| Decision | AI Authority | Who Decides |
|----------|--------------|-------------|
| Final Approval/Rejection | ❌ No authority | Government Admin |
| Blacklist Status | ❌ No authority | Government Admin |
| Legal Validity | ❌ No authority | Government verification APIs |
| Fraud Investigation | ❌ No authority | Human auditor |
| Exception Handling | ❌ No authority | Government Admin |

### Government Override Power

```
┌─────────────────────────────────────────────────────────────┐
│                  GOVERNMENT OVERRIDE MODEL                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Scenario 1: AI Approves, Government Rejects                │
│  ────────────────────────────────────────────               │
│  - Government can reject with documented reason              │
│  - Override logged in audit trail                           │
│  - Contractor can appeal                                    │
│                                                              │
│  Scenario 2: AI Rejects, Government Approves                │
│  ────────────────────────────────────────────               │
│  - Government can approve with documented justification      │
│  - Requires higher authority sign-off                       │
│  - Override logged in audit trail                           │
│  - Flagged for periodic review                              │
│                                                              │
│  Transparency Requirements:                                  │
│  - All overrides must have written justification            │
│  - Override reason stored on-chain (hashed)                 │
│  - Full audit trail accessible to auditors                  │
│  - Annual override report published                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### AI Score Storage

| Storage Location | What's Stored | Access |
|------------------|---------------|--------|
| On-chain | Final competence score (uint256) | Public |
| On-chain | Risk category hash | Public |
| Off-chain | Detailed score breakdown | Government only |
| Off-chain | AI confidence level | Government only |
| Off-chain | Feature importance | Government only |

---

## 6️⃣ TRANSPARENCY MODEL

### What Citizens Can Publicly View

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC TRANSPARENCY VIEW                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ VISIBLE (On-chain + Public Dashboard)                    │
│  ────────────────────────────────────────────               │
│  • Contractor approval status (Pending/Approved/Rejected)   │
│  • Competence score (0-100)                                 │
│  • Risk category (LOW/MEDIUM/HIGH)                          │
│  • IPFS document hash (for integrity verification)          │
│  • Registration timestamp                                   │
│  • Wallet address (anonymized identifier)                   │
│  • Tender participation history                             │
│  • Milestone completion records                             │
│  • Any government overrides (with reason hash)              │
│                                                              │
│  ❌ HIDDEN (Off-chain + Access Controlled)                   │
│  ────────────────────────────────────────────               │
│  • PAN number                                               │
│  • GSTIN                                                    │
│  • CIN/LLPIN                                                │
│  • Financial turnover figures                               │
│  • Bank details                                             │
│  • Director names                                           │
│  • Business address                                         │
│  • Litigation case details                                  │
│  • Raw uploaded documents                                   │
│  • Detailed score breakdown                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### IPFS Hash Exposure Model

```
┌─────────────────────────────────────────────────────────────┐
│                  IPFS HASH EXPOSURE STRATEGY                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  What is exposed:                                            │
│  • Root CID (QmXxx...) - stored on-chain                    │
│  • Citizens can verify document integrity                   │
│  • Citizens CANNOT access document content                  │
│                                                              │
│  How it works:                                               │
│  1. Citizen queries contractor record on-chain              │
│  2. Gets: contractorId, score, status, CID                  │
│  3. Citizen can verify:                                     │
│     - CID exists (integrity proof)                          │
│     - Score matches on-chain record                         │
│  4. Citizen CANNOT:                                         │
│     - Download actual documents                             │
│     - View PII                                              │
│     - Access without authorization                          │
│                                                              │
│  Document Access Control:                                    │
│  • Documents encrypted before IPFS upload                   │
│  • Decryption key stored in off-chain DB                    │
│  • Key access requires government authentication            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Audit-Friendly JSON Format (Public View)

```json
{
  "contractorId": "0x1a2b3c4d5e6f...",
  "walletAddress": "0x1234567890abcdef...",
  "registrationTime": 1707820800,
  "verificationStatus": 1,
  "competenceScore": 78,
  "riskCategory": "LOW",
  "ipfsDocumentHash": "QmXxx...",
  "tenderParticipation": [
    {
      "tenderId": "0xabc123...",
      "status": "awarded",
      "milestones": [
        { "id": 1, "status": "completed", "timestamp": 1707907200 },
        { "id": 2, "status": "in_progress", "timestamp": null }
      ]
    }
  ],
  "auditTrail": [
    {
      "action": "APPROVED",
      "timestamp": 1707824400,
      "actor": "GOVERNMENT_ADMIN",
      "overrideReason": null
    }
  ]
}
```

---

## ARCHITECTURE SUMMARY

### Data Flow
- Contractor → Frontend → Backend → IPFS → AI → Blockchain → Public
- Documents encrypted and stored on IPFS
- Only CID + score stored on-chain
- Structured fields processed by AI, not raw PDFs

### Storage Strategy
- **On-chain**: contractorId, wallet, CID, score, status, risk category
- **Off-chain**: All PII, raw documents, detailed scores, audit logs
- **IPFS**: Encrypted documents with access-controlled decryption keys

### Trust Model
- Government APIs verify identity documents (PAN, GSTIN, CIN)
- Wallet signature binds identity to blockchain address
- IPFS CID provides tamper-proof document integrity
- Multi-sig and audit logs prevent admin abuse

### Compliance Alignment
- GST Portal API for GSTIN verification
- Income Tax API for PAN verification
- MCA API for CIN/LLPIN verification
- eCourts API for litigation verification
- ICAI UDIN for CA certificate authenticity

### AI Boundaries
- AI decides: Competence score, risk category, completeness
- AI cannot: Approve/reject, override blacklist, investigate fraud
- Government has override power with mandatory documentation
- All overrides logged and auditable

### Transparency Model
- Public sees: Score, status, CID, participation history
- Public cannot see: PII, raw documents, financial details
- IPFS hash exposed for integrity verification only
- Document access requires government authorization

---

## PHASE 0 COMPLETE
## READY FOR NEXT PHASE
