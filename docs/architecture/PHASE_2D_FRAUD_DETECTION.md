# FATTS Contractor Onboarding Module
## Phase 2D — Fraud Detection and Tampering Safeguards

---

## OBJECTIVE

Define structured fraud detection logic and integrity safeguards.

**This phase defines ONLY fraud detection and tampering safeguards.**

- Do NOT compute numeric risk scores.
- Do NOT move to AI scoring.

---

## FRAUD DETECTION PRINCIPLES

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  FRAUD INDICATOR DESIGN PRINCIPLES                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Each fraud indicator MUST be:                                                           │
│                                                                                          │
│  1. BOOLEAN             │ Result is true/false, not a probability or score              │
│  2. EXPLAINABLE         │ Clear reason for flag with evidence and rule triggered        │
│  3. AUDITABLE           │ Full audit trail with timestamp, actor, input, output         │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FRAUD INDICATOR STRUCTURE                                                      │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  {                                                                              │    │
│  │    "indicatorId": "uuid",                                                       │    │
│  │    "indicatorType": "DUPLICATE_PAN_DETECTED",                                  │    │
│  │    "detected": true,                    // BOOLEAN                              │    │
│  │    "explanation": "PAN AAPFU0939K already registered to another contractor",   │    │
│  │    "evidence": {                                                                │    │
│  │      "panNumber": "AAPFU0939K",                                                │    │
│  │      "existingContractorId": "uuid-xxx",                                       │    │
│  │      "existingWalletAddress": "0x1234..."                                      │    │
│  │    },                                                                           │    │
│  │    "ruleTriggered": "PAN_UNIQUENESS_CHECK",                                    │    │
│  │    "detectionTimestamp": "2024-02-15T10:30:00.000Z",                           │    │
│  │    "detectionSource": "SYSTEM_AUTOMATED",                                      │    │
│  │    "auditTrail": [                                                              │    │
│  │      {                                                                          │    │
│  │        "action": "CHECK_INITIATED",                                            │    │
│  │        "timestamp": "2024-02-15T10:30:00.000Z"                                 │    │
│  │      },                                                                         │    │
│  │      {                                                                          │    │
│  │        "action": "DUPLICATE_FOUND",                                            │    │
│  │        "timestamp": "2024-02-15T10:30:00.100Z",                                │    │
│  │        "details": "Match found in contractors table"                           │    │
│  │      }                                                                          │    │
│  │    ]                                                                            │    │
│  │  }                                                                              │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ DUPLICATE DETECTION STRATEGY

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DUPLICATE DETECTION STRATEGY                                                            │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  1.1 PAN DUPLICATE DETECTION                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: One PAN can only be associated with one contractor registration                  │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectDuplicatePAN(panNumber: string) → FraudIndicator              │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Normalize PAN: uppercase, trim whitespace                                   │    │
│  │  2. Query database: SELECT * FROM contractors WHERE pan = {panNumber}           │    │
│  │  3. If count > 0:                                                               │    │
│  │     - Check if same contractor (wallet address match)                           │    │
│  │     - If same contractor: INFO (update scenario)                                │    │
│  │     - If different contractor: FRAUD DETECTED                                   │    │
│  │  4. Return FraudIndicator with result                                           │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "DUPLICATE_PAN_DETECTED",                                   │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "PAN {panNumber} is already registered to another contractor",│    │
│  │    "evidence": {                                                                 │    │
│  │      "panNumber": "AAPFU0939K",                                                 │    │
│  │      "existingContractorId": "550e8400-...",                                    │    │
│  │      "existingWalletAddress": "0x1234...",                                      │    │
│  │      "existingRegistrationDate": "2023-01-15"                                   │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "PAN_UNIQUENESS_CONSTRAINT"                                 │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  EXCEPTION CASES:                                                                        │
│  • Same contractor updating registration: NOT A DUPLICATE                               │
│  • PAN change request with government approval: Requires manual verification            │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  1.2 GSTIN DUPLICATE DETECTION                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: One GSTIN can only be associated with one contractor registration                │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectDuplicateGSTIN(gstin: string) → FraudIndicator                │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Normalize GSTIN: uppercase, trim whitespace                                 │    │
│  │  2. Query database for existing GSTIN                                           │    │
│  │  3. If found and different contractor: FRAUD DETECTED                           │    │
│  │  4. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "DUPLICATE_GSTIN_DETECTED",                                 │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "GSTIN {gstin} is already registered",                        │    │
│  │    "evidence": {                                                                 │    │
│  │      "gstin": "27AAPFU0939K1ZM",                                                │    │
│  │      "existingContractorId": "550e8400-...",                                    │    │
│  │      "existingStatus": "APPROVED"                                               │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "GSTIN_UNIQUENESS_CONSTRAINT"                               │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  1.3 WALLET ADDRESS DUPLICATE DETECTION                                                  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: One wallet address can only be linked to one contractor                          │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectDuplicateWallet(walletAddress: string) → FraudIndicator       │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Normalize address: lowercase                                                │    │
│  │  2. Query database AND on-chain smart contract                                  │    │
│  │  3. If found in either:                                                         │    │
│  │     - Check if same contractor                                                  │    │
│  │     - If different: FRAUD DETECTED (potential Sybil attack)                     │    │
│  │  4. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "DUPLICATE_WALLET_DETECTED",                                │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Wallet {address} already linked to another contractor",      │    │
│  │    "evidence": {                                                                 │    │
│  │      "walletAddress": "0x1234567890abcdef...",                                  │    │
│  │      "existingContractorId": "550e8400-...",                                    │    │
│  │      "existingPAN": "AAPFU0939K",                                               │    │
│  │      "source": "DATABASE" | "BLOCKCHAIN"                                        │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "WALLET_UNIQUENESS_CONSTRAINT"                              │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  1.4 DOCUMENT FILE HASH DUPLICATE DETECTION                                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Same document file should not be uploaded for different contractors              │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectDuplicateDocument(fileHash: string) → FraudIndicator          │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Calculate SHA-256 hash of uploaded file                                     │    │
│  │  2. Query documents table for matching hash                                     │    │
│  │  3. If found:                                                                    │    │
│  │     - Same contractor: INFO (re-upload)                                         │    │
│  │     - Different contractor: FRAUD DETECTED (document reuse)                      │    │
│  │  4. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "DUPLICATE_DOCUMENT_DETECTED",                              │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Document file already uploaded by another contractor",       │    │
│  │    "evidence": {                                                                 │    │
│  │      "fileHash": "sha256:a1b2c3d4...",                                          │    │
│  │      "documentType": "PAN_CARD",                                                │    │
│  │      "originalUploaderId": "550e8400-...",                                      │    │
│  │      "originalUploadDate": "2023-06-15"                                         │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "DOCUMENT_UNIQUENESS_CHECK"                                 │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  1.5 DIRECTOR / SIGNATORY DUPLICATE DETECTION                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Same director/signatory should not appear in multiple contractor registrations   │
│        unless legitimately associated with both entities                                │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectDuplicateDirector(din: string, pan: string) → FraudIndicator  │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. For each director DIN extracted from CIN certificate                        │    │
│  │  2. Query for existing director DIN in other contractors                        │    │
│  │  3. If found:                                                                    │    │
│  │     - Check if director is disqualified                                         │    │
│  │     - Flag for manual review (may be legitimate)                                │    │
│  │  4. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "DIRECTOR_ASSOCIATION_DETECTED",                            │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Director DIN {din} is associated with another contractor",   │    │
│  │    "evidence": {                                                                 │    │
│  │      "din": "01234567",                                                         │    │
│  │      "directorName": "John Doe",                                                │    │
│  │      "existingContractorIds": ["uuid-1", "uuid-2"],                             │    │
│  │      "requiresManualReview": true                                               │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "DIRECTOR_ASSOCIATION_CHECK"                                │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ IPFS HASH CONSISTENCY VERIFICATION

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  IPFS HASH CONSISTENCY VERIFICATION                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  2.1 CID INTEGRITY VERIFICATION                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: IPFS CID must match the actual content stored                                    │
│                                                                                          │
│  VERIFICATION LOGIC:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: verifyCIDIntegrity(ipfsCID: string, encryptedContent: Buffer)       │    │
│  │           → FraudIndicator                                                      │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Retrieve encrypted content from IPFS using CID                              │    │
│  │  2. Calculate expected CID from retrieved content                               │    │
│  │  3. Compare provided CID with calculated CID                                    │    │
│  │  4. If mismatch: FRAUD DETECTED (CID tampering)                                 │    │
│  │  5. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "CID_INTEGRITY_MISMATCH",                                   │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "IPFS CID does not match content hash",                       │    │
│  │    "evidence": {                                                                 │    │
│  │      "providedCID": "QmXyz123...",                                              │    │
│  │      "calculatedCID": "QmAbc456...",                                            │    │
│  │      "documentType": "PAN_CARD"                                                 │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "CID_INTEGRITY_CHECK"                                       │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  2.2 ON-CHAIN VS OFF-CHAIN CID CONSISTENCY                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: CID stored on blockchain must match CID in database                              │
│                                                                                          │
│  VERIFICATION LOGIC:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: verifyOnChainCIDConsistency(contractorId: string) → FraudIndicator  │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Fetch documentRootHash from smart contract                                  │    │
│  │  2. Fetch rootCID from database                                                 │    │
│  │  3. Compare both values                                                         │    │
│  │  4. If mismatch: FRAUD DETECTED (database tampering)                            │    │
│  │  5. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "ONCHAIN_OFFCHAIN_CID_MISMATCH",                            │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "On-chain CID does not match database CID",                   │    │
│  │    "evidence": {                                                                 │    │
│  │      "onChainCID": "QmRoot123...",                                              │    │
│  │      "databaseCID": "QmRoot456...",                                             │    │
│  │      "contractorId": "550e8400-...",                                            │    │
│  │      "blockNumber": 12345678                                                    │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "ONCHAIN_CONSISTENCY_CHECK"                                 │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  2.3 DOCUMENT ROOT HASH VERIFICATION                                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Merkle root of all document hashes must match stored root hash                   │
│                                                                                          │
│  VERIFICATION LOGIC:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: verifyDocumentRootHash(contractorId: string) → FraudIndicator       │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Fetch all document file hashes for contractor                               │    │
│  │  2. Calculate Merkle root from individual hashes                                │    │
│  │  3. Compare with stored documentRootHash                                        │    │
│  │  4. If mismatch: FRAUD DETECTED (document tampering)                            │    │
│  │  5. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  MERKLE ROOT CALCULATION:                                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  1. Sort document hashes alphabetically                                         │    │
│  │  2. Hash each document: sha256(documentContent)                                 │    │
│  │  3. Build Merkle tree:                                                          │    │
│  │     - If odd number of leaves, duplicate last hash                              │    │
│  │     - Hash pairs: sha256(hash1 + hash2)                                         │    │
│  │     - Repeat until single root hash remains                                     │    │
│  │  4. Root hash is the documentRootHash                                           │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "DOCUMENT_ROOT_HASH_MISMATCH",                              │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Calculated Merkle root does not match stored root hash",     │    │
│  │    "evidence": {                                                                 │    │
│  │      "storedRootHash": "0xabc123...",                                            │    │
│  │      "calculatedRootHash": "0xdef456...",                                        │    │
│  │      "documentHashes": {                                                         │    │
│  │        "PAN_CARD": "sha256:aaa...",                                              │    │
│  │        "GST_CERTIFICATE": "sha256:bbb...",                                       │    │
│  │        // ... other documents                                                    │    │
│  │      },                                                                          │    │
│  │      "tamperedDocument": "GST_CERTIFICATE"  // if identifiable                  │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "MERKLE_ROOT_INTEGRITY_CHECK"                               │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  2.4 IPFS AVAILABILITY CHECK                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: All CIDs must be retrievable from IPFS network                                   │
│                                                                                          │
│  VERIFICATION LOGIC:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: verifyIPFSAvailability(ipfsCID: string) → FraudIndicator            │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Attempt to retrieve content from IPFS                                       │    │
│  │  2. Try multiple IPFS gateways/nodes                                            │    │
│  │  3. Set timeout (30 seconds)                                                    │    │
│  │  4. If not retrievable: FRAUD DETECTED (CID not pinned/available)               │    │
│  │  5. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "IPFS_CONTENT_UNAVAILABLE",                                 │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "IPFS CID is not retrievable from network",                   │    │
│  │    "evidence": {                                                                 │    │
│  │      "ipfsCID": "QmXyz123...",                                                  │    │
│  │      "gatewaysAttempted": ["ipfs.io", "cloudflare-ipfs.com", "pinata.cloud"],   │    │
│  │      "timeoutSeconds": 30,                                                      │    │
│  │      "lastAvailableDate": "2024-01-15"  // if known                             │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "IPFS_AVAILABILITY_CHECK"                                   │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ PAN–GST MISMATCH DETECTION LOGIC

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  PAN–GST MISMATCH DETECTION LOGIC                                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  3.1 PAN-GSTIN EMBEDDING VERIFICATION                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: GSTIN positions 3-7 must exactly match the PAN                                   │
│                                                                                          │
│  VERIFICATION LOGIC:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: verifyPANinGSTIN(pan: string, gstin: string) → FraudIndicator       │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Extract PAN from GSTIN: gstin.substring(2, 7)                               │    │
│  │  2. Compare with provided PAN                                                   │    │
│  │  3. If mismatch: FRAUD DETECTED                                                 │    │
│  │  4. Return FraudIndicator                                                       │    │
│  │                                                                                  │    │
│  │  EXAMPLE:                                                                        │    │
│  │  PAN: AAPFU0939K                                                                │    │
│  │  GSTIN: 27AAPFU0939K1ZM                                                         │    │
│  │  GSTIN[2:7] = AAPFU (matches PAN[0:5])                                          │    │
│  │  Result: MATCH                                                                   │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "PAN_GSTIN_MISMATCH",                                       │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "PAN embedded in GSTIN does not match provided PAN",          │    │
│  │    "evidence": {                                                                 │    │
│  │      "providedPAN": "AAPFU0939K",                                               │    │
│  │      "gstin": "27XXXXU0939K1ZM",                                                │    │
│  │      "panInGSTIN": "XXXXU",                                                     │    │
│  │      "expectedPANInGSTIN": "AAPFU"                                              │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "PAN_GSTIN_EMBEDDING_CHECK"                                 │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  3.2 ENTITY TYPE CONSISTENCY CHECK                                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: PAN position 4 (entity type) must match GSTIN position 12                        │
│                                                                                          │
│  VERIFICATION LOGIC:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: verifyEntityTypeConsistency(pan: string, gstin: string)             │    │
│  │           → FraudIndicator                                                      │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Get PAN entity type: pan.charAt(3)                                          │    │
│  │  2. Get GSTIN entity type: gstin.charAt(11)                                     │    │
│  │  3. Compare both values                                                         │    │
│  │  4. If mismatch: FRAUD DETECTED                                                 │    │
│  │  5. Return FraudIndicator                                                       │    │
│  │                                                                                  │    │
│  │  ENTITY TYPE MAPPING:                                                            │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │    │
│  │  │  CODE │ ENTITY TYPE                                                     │    │    │
│  │  ├─────────────────────────────────────────────────────────────────────────┤    │    │
│  │  │  A    │ AOP (Association of Persons)                                    │    │    │
│  │  │  B    │ BOI (Body of Individuals)                                       │    │    │
│  │  │  C    │ Company                                                         │    │    │
│  │  │  F    │ Firm/LLP                                                        │    │    │
│  │  │  G    │ Government Agency                                               │    │    │
│  │  │  H    │ HUF (Hindu Undivided Family)                                    │    │    │
│  │  │  L    │ Local Authority                                                 │    │    │
│  │  │  J    │ Artificial Juridical Person                                     │    │    │
│  │  │  P    │ Individual                                                      │    │    │
│  │  │  T    │ Trust                                                           │    │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "ENTITY_TYPE_MISMATCH",                                     │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Entity type in PAN does not match entity type in GSTIN",     │    │
│  │    "evidence": {                                                                 │    │
│  │      "pan": "AAPFU0939K",                                                       │    │
│  │      "gstin": "27AAPFU0939P1ZM",                                                │    │
│  │      "panEntityType": "C (Company)",                                            │    │
│  │      "gstinEntityType": "P (Individual)",                                       │    │
│  │      "declaredEntityType": "PRIVATE_LIMITED"                                    │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "ENTITY_TYPE_CONSISTENCY_CHECK"                             │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  3.3 NAME CONSISTENCY ACROSS PAN AND GST                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Legal name extracted from PAN must match legal name from GST certificate         │
│                                                                                          │
│  VERIFICATION LOGIC:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: verifyNameConsistency(panName: string, gstName: string)             │    │
│  │           → FraudIndicator                                                      │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Normalize both names (uppercase, remove punctuation, expand abbreviations)  │    │
│  │  2. Calculate similarity score using:                                           │    │
│  │     - Levenshtein distance                                                      │    │
│  │     - Jaro-Winkler similarity                                                   │    │
│  │     - Token-based similarity                                                    │    │
│  │  3. If similarity < 0.85: FRAUD DETECTED                                        │    │
│  │  4. If similarity 0.70-0.85: FLAG FOR REVIEW                                    │    │
│  │  5. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  NAME NORMALIZATION RULES:                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  1. Convert to uppercase                                                        │    │
│  │  2. Remove punctuation: ., -, &, @, etc.                                        │    │
│  │  3. Remove extra whitespace                                                     │    │
│  │  4. Expand abbreviations:                                                       │    │
│  │     - PVT → PRIVATE                                                             │    │
│  │     - LTD → LIMITED                                                             │    │
│  │     - CO → COMPANY                                                              │    │
│  │     - CORP → CORPORATION                                                        │    │
│  │  5. Sort words alphabetically (for token matching)                              │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "PAN_GST_NAME_MISMATCH",                                    │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Name on PAN does not match name on GST certificate",         │    │
│  │    "evidence": {                                                                 │    │
│  │      "panName": "ABC CONSTRUCTIONS PRIVATE LIMITED",                            │    │
│  │      "gstName": "XYZ BUILDERS PVT LTD",                                         │    │
│  │      "normalizedPANName": "ABC CONSTRUCTIONS PRIVATE LIMITED",                  │    │
│  │      "normalizedGSTName": "XYZ BUILDERS PRIVATE LIMITED",                       │    │
│  │      "similarityScore": 0.45,                                                   │    │
│  │      "threshold": 0.85                                                          │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "PAN_GST_NAME_CONSISTENCY_CHECK"                            │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  3.4 STATE CODE VERIFICATION                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: GSTIN state code (positions 1-2) must match registered address state             │
│                                                                                          │
│  VERIFICATION LOGIC:                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: verifyStateCodeConsistency(gstin: string, address: Address)         │    │
│  │           → FraudIndicator                                                      │    │
│  │                                                                                  │    │
│  │  STEPS:                                                                          │    │
│  │  1. Extract state code from GSTIN: gstin.substring(0, 2)                        │    │
│  │  2. Map state code to state name                                                │    │
│  │  3. Compare with address.state                                                  │    │
│  │  4. If mismatch: FRAUD DETECTED                                                 │    │
│  │  5. Return FraudIndicator                                                       │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  STATE CODE MAPPING (Partial):                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  CODE │ STATE                    │ CODE │ STATE                                │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  01   │ Jammu & Kashmir          │ 19   │ West Bengal                          │    │
│  │  02   │ Himachal Pradesh         │ 20   │ Jharkhand                            │    │
│  │  03   │ Punjab                   │ 21   │ Odisha                               │    │
│  │  04   │ Chandigarh               │ 22   │ Chhattisgarh                         │    │
│  │  05   │ Uttarakhand              │ 23   │ Madhya Pradesh                       │    │
│  │  06   │ Haryana                  │ 24   │ Gujarat                              │    │
│  │  07   │ Delhi                    │ 27   │ Maharashtra                          │    │
│  │  08   │ Rajasthan                │ 29   │ Karnataka                            │    │
│  │  09   │ Uttar Pradesh            │ 32   │ Kerala                               │    │
│  │  10   │ Bihar                    │ 33   │ Tamil Nadu                           │    │
│  │  18   │ Assam                    │ 36   │ Telangana                            │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "STATE_CODE_MISMATCH",                                      │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "GSTIN state code does not match registered address state",   │    │
│  │    "evidence": {                                                                 │    │
│  │      "gstin": "27AAPFU0939K1ZM",                                                │    │
│  │      "gstinStateCode": "27",                                                    │    │
│  │      "gstinState": "Maharashtra",                                               │    │
│  │      "addressState": "KARNATAKA",                                               │    │
│  │      "expectedStateCode": "29"                                                  │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "STATE_CODE_CONSISTENCY_CHECK"                              │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4️⃣ DOCUMENT FORMAT ANOMALY DETECTION

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  DOCUMENT FORMAT ANOMALY DETECTION                                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  4.1 PDF METADATA ANOMALY DETECTION                                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: PDF metadata should be consistent with expected document characteristics         │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectPDFMetadataAnomaly(pdfBuffer: Buffer) → FraudIndicator        │    │
│  │                                                                                  │    │
│  │  CHECKS:                                                                         │    │
│  │  1. Creation date anomaly:                                                       │    │
│  │     - PDF created before claimed document date                                   │    │
│  │     - PDF created too recently (< 1 day) for old document                       │    │
│  │                                                                                  │    │
│  │  2. Modification anomaly:                                                        │    │
│  │     - PDF modified after upload date                                            │    │
│  │     - Multiple modification attempts detected                                   │    │
│  │                                                                                  │    │
│  │  3. Software anomaly:                                                            │    │
│  │     - PDF created with editing software (Photoshop, etc.)                       │    │
│  │     - PDF creator doesn't match expected source (e.g., not GST portal)          │    │
│  │                                                                                  │    │
│  │  4. Structure anomaly:                                                           │    │
│  │     - Unexpected number of pages                                                │    │
│  │     - Embedded files or scripts                                                 │    │
│  │     - Encrypted content without declaration                                     │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "PDF_METADATA_ANOMALY",                                     │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "PDF metadata indicates potential tampering",                  │    │
│  │    "evidence": {                                                                 │    │
│  │      "anomalies": [                                                              │    │
│  │        {                                                                          │    │
│  │          "type": "SOFTWARE_ANOMALY",                                             │    │
│  │          "detail": "PDF created with Adobe Photoshop, expected GST Portal"       │    │
│  │        },                                                                         │    │
│  │        {                                                                          │    │
│  │          "type": "MODIFICATION_ANOMALY",                                         │    │
│  │          "detail": "PDF modified 5 times after creation"                         │    │
│  │        }                                                                          │    │
│  │      ],                                                                           │    │
│  │      "metadata": {                                                                │    │
│  │        "creator": "Adobe Photoshop 2024",                                        │    │
│  │        "producer": "Adobe PDF Library",                                          │    │
│  │        "creationDate": "2024-02-10T10:00:00Z",                                   │    │
│  │        "modificationDate": "2024-02-15T08:30:00Z",                               │    │
│  │        "pageCount": 1                                                             │    │
│  │      }                                                                            │    │
│  │    },                                                                             │    │
│  │    "ruleTriggered": "PDF_METADATA_CHECK"                                         │    │
│  │  }                                                                                │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  4.2 IMAGE MANIPULATION DETECTION                                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Uploaded images should not show signs of digital manipulation                    │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectImageManipulation(imageBuffer: Buffer) → FraudIndicator       │    │
│  │                                                                                  │    │
│  │  CHECKS:                                                                         │    │
│  │  1. EXIF data analysis:                                                          │    │
│  │     - Missing EXIF (could indicate editing)                                     │    │
│  │     - Software tag indicates editing software                                   │    │
│  │     - Date/time inconsistencies                                                 │    │
│  │                                                                                  │    │
│  │  2. Error Level Analysis (ELA):                                                  │    │
│  │     - Detect areas with different compression levels                            │    │
│  │     - Indicates potential editing/patching                                      │    │
│  │                                                                                  │    │
│  │  3. Metadata consistency:                                                        │    │
│  │     - Camera model vs expected source                                           │    │
│  │     - GPS data inconsistencies                                                  │    │
│  │                                                                                  │    │
│  │  4. Visual anomaly detection:                                                    │    │
│  │     - Inconsistent fonts within document                                        │    │
│  │     - Misaligned text regions                                                   │    │
│  │     - Color inconsistencies in text/regions                                     │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "IMAGE_MANIPULATION_DETECTED",                              │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Image shows signs of digital manipulation",                   │    │
│  │    "evidence": {                                                                 │    │
│  │      "anomalies": [                                                              │    │
│  │        {                                                                          │    │
│  │          "type": "ELA_ANOMALY",                                                  │    │
│  │          "detail": "Error level analysis shows edited region at coordinates",    │    │
│  │          "region": { "x": 150, "y": 200, "width": 100, "height": 30 }            │    │
│  │        },                                                                         │    │
│  │        {                                                                          │    │
│  │          "type": "EXIF_SOFTWARE_ANOMALY",                                        │    │
│  │          "detail": "EXIF indicates Adobe Photoshop editing"                      │    │
│  │        }                                                                          │    │
│  │      ],                                                                           │    │
│  │      "exifData": {                                                                │    │
│  │        "software": "Adobe Photoshop 2024 (Windows)",                             │    │
│  │        "modifyDate": "2024-02-15T08:30:00Z"                                      │    │
│  │      }                                                                            │    │
│  │    },                                                                             │    │
│  │    "ruleTriggered": "IMAGE_MANIPULATION_CHECK"                                   │    │
│  │  }                                                                                │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  4.3 SECURITY FEATURE DETECTION                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Official documents should contain expected security features                     │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectSecurityFeatures(documentBuffer: Buffer, documentType: string)│    │
│  │           → FraudIndicator                                                      │    │
│  │                                                                                  │    │
│  │  CHECKS BY DOCUMENT TYPE:                                                        │    │
│  │                                                                                  │    │
│  │  PAN CARD:                                                                       │    │
│  │  - Hologram presence detection                                                   │    │
│  │  - QR code presence and validity                                                 │    │
│  │  - Official logo detection                                                       │    │
│  │  - Watermark detection                                                           │    │
│  │                                                                                  │    │
│  │  GST CERTIFICATE:                                                                │    │
│  │  - Digital signature verification                                                │    │
│  │  - GST portal watermark detection                                                │    │
│  │  - QR code verification                                                          │    │
│  │                                                                                  │    │
│  │  CIN CERTIFICATE:                                                                │    │
│  │  - MCA logo detection                                                            │    │
│  │  - Digital signature verification                                                │    │
│  │  - Official seal detection                                                       │    │
│  │                                                                                  │    │
│  │  BANK CERTIFICATES:                                                              │    │
│  │  - Bank logo detection                                                           │    │
│  │  - Bank stamp/seal detection                                                     │    │
│  │  - Authorized signatory detection                                                │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "SECURITY_FEATURE_MISSING",                                 │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Expected security features not detected in document",         │    │
│  │    "evidence": {                                                                 │    │
│  │      "documentType": "PAN_CARD",                                                 │    │
│  │      "expectedFeatures": [                                                        │    │
│  │        "HOLOGRAM",                                                               │    │
│  │        "QR_CODE",                                                                │    │
│  │        "INCOME_TAX_LOGO"                                                         │    │
│  │      ],                                                                           │    │
│  │      "detectedFeatures": [                                                        │    │
│  │        "INCOME_TAX_LOGO"                                                          │    │
│  │      ],                                                                           │    │
│  │      "missingFeatures": [                                                         │    │
│  │        "HOLOGRAM",                                                               │    │
│  │        "QR_CODE"                                                                 │    │
│  │      ]                                                                            │    │
│  │    },                                                                             │    │
│  │    "ruleTriggered": "SECURITY_FEATURE_CHECK"                                     │    │
│  │  }                                                                                │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  4.4 FONT AND TEXT CONSISTENCY DETECTION                                                 │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Text within document should use consistent fonts and formatting                  │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectFontAnomalies(documentBuffer: Buffer) → FraudIndicator        │    │
│  │                                                                                  │    │
│  │  CHECKS:                                                                         │    │
│  │  1. Font consistency:                                                            │    │
│  │     - Same field type should use same font                                      │    │
│  │     - Official documents use specific fonts                                     │    │
│  │     - Mixed fonts in same text block = suspicious                               │    │
│  │                                                                                  │    │
│  │  2. Text alignment:                                                              │    │
│  │     - Misaligned text indicates potential editing                               │    │
│  │     - Baseline inconsistencies                                                  │    │
│  │                                                                                  │    │
│  │  3. Character spacing:                                                           │    │
│  │     - Inconsistent character spacing                                            │    │
│  │     - Unusual kerning (could indicate text insertion)                           │    │
│  │                                                                                  │    │
│  │  4. Color consistency:                                                           │    │
│  │     - Text color variations in same document section                            │    │
│  │     - Background color inconsistencies                                          │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "FONT_CONSISTENCY_ANOMALY",                                 │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Inconsistent fonts detected in document",                     │    │
│  │    "evidence": {                                                                 │    │
│  │      "anomalies": [                                                              │    │
│  │        {                                                                          │    │
│  │          "type": "MIXED_FONTS",                                                  │    │
│  │          "detail": "PAN number uses different font than surrounding text",       │    │
│  │          "fonts": ["Arial", "Times New Roman"]                                   │    │
│  │        },                                                                         │    │
│  │        {                                                                          │    │
│  │          "type": "CHARACTER_SPACING_ANOMALY",                                    │    │
│  │          "detail": "Unusual character spacing in name field"                     │    │
│  │        }                                                                          │    │
│  │      ]                                                                            │    │
│  │    },                                                                             │    │
│  │    "ruleTriggered": "FONT_CONSISTENCY_CHECK"                                     │    │
│  │  }                                                                                │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5️⃣ SUSPICIOUS PATTERN PLACEHOLDERS

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  SUSPICIOUS PATTERN PLACEHOLDERS                                                         │
│  (To be enhanced with ML/AI in future phases)                                            │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  5.1 RAPID APPLICATION PATTERN                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Detect unusually rapid submission patterns                                        │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectRapidApplicationPattern(contractorId: string) → FraudIndicator│    │
│  │                                                                                  │    │
│  │  PATTERNS TO DETECT:                                                             │    │
│  │  1. Multiple applications from same IP address in short time                    │    │
│  │  2. Same device fingerprint across different contractors                        │    │
│  │  3. Unusually fast form completion (bot-like behavior)                          │    │
│  │  4. Document upload timestamps too close together                               │    │
│  │                                                                                  │    │
│  │  THRESHOLDS:                                                                      │    │
│  │  - More than 3 applications from same IP in 1 hour                              │    │
│  │  - Form completion time < 2 minutes for full application                        │    │
│  │  - All documents uploaded within 30 seconds                                     │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "RAPID_APPLICATION_PATTERN",                                │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Suspicious rapid application pattern detected",               │    │
│  │    "evidence": {                                                                 │    │
│  │      "pattern": "MULTIPLE_APPLICATIONS_SAME_IP",                                │    │
│  │      "ipAddress": "192.168.1.xxx",                                              │    │
│  │      "applicationCount": 5,                                                      │    │
│  │      "timeWindow": "1 hour",                                                     │    │
│  │      "contractorIds": ["uuid-1", "uuid-2", "uuid-3", "uuid-4", "uuid-5"]        │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "RAPID_APPLICATION_CHECK"                                    │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  5.2 GEOGRAPHIC ANOMALY PATTERN                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Detect geographic inconsistencies                                                 │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectGeographicAnomaly(contractorData: object) → FraudIndicator    │    │
│  │                                                                                  │    │
│  │  PATTERNS TO DETECT:                                                             │    │
│  │  1. IP geolocation doesn't match declared address state                         │    │
│  │  2. Multiple sessions from different countries for same account                 │    │
│  │  3. Document upload location inconsistent with business address                 │    │
│  │  4. VPN/Proxy detection                                                         │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "GEOGRAPHIC_ANOMALY",                                       │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Geographic inconsistency detected",                           │    │
│  │    "evidence": {                                                                 │    │
│  │      "pattern": "IP_ADDRESS_MISMATCH",                                          │    │
│  │      "ipGeolocation": {                                                          │    │
│  │        "country": "IN",                                                          │    │
│  │        "state": "Karnataka"                                                      │    │
│  │      },                                                                           │    │
│  │      "declaredAddress": {                                                         │    │
│  │        "state": "MAHARASHTRA"                                                    │    │
│  │      },                                                                           │    │
│  │      "distanceKm": 850                                                           │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "GEOGRAPHIC_CONSISTENCY_CHECK"                              │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  5.3 DATA SIMILARITY PATTERN                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Detect suspiciously similar data across different contractors                    │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectDataSimilarityPattern(contractorId: string) → FraudIndicator  │    │
│  │                                                                                  │    │
│  │  PATTERNS TO DETECT:                                                             │    │
│  │  1. Similar project descriptions across different contractors                   │    │
│  │  2. Identical financial figures (turnover, etc.)                                │    │
│  │  3. Same contact person details across entities                                 │    │
│  │  4. Similar but slightly modified document content                              │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "DATA_SIMILARITY_PATTERN",                                  │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Suspiciously similar data detected across contractors",       │    │
│  │    "evidence": {                                                                 │    │
│  │      "pattern": "SIMILAR_PROJECT_DESCRIPTIONS",                                 │    │
│  │      "similarityScore": 0.92,                                                    │    │
│  │      "matchingContractors": ["uuid-1", "uuid-2"],                               │    │
│  │      "matchingFields": ["pastProjects[0].projectDescription"],                  │    │
│  │      "sampleText": "Construction of 4-lane highway bridge across..."            │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "DATA_SIMILARITY_CHECK"                                     │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  5.4 BEHAVIORAL ANOMALY PATTERN                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Detect unusual user behavior patterns                                             │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectBehavioralAnomaly(sessionData: object) → FraudIndicator       │    │
│  │                                                                                  │    │
│  │  PATTERNS TO DETECT:                                                             │    │
│  │  1. Copy-paste detection in form fields                                         │    │
│  │  2. Auto-fill patterns suggesting pre-populated data                            │    │
│  │  3. Navigation patterns (skipping review steps)                                 │    │
│  │  4. Multiple failed verification attempts before success                        │    │
│  │  5. Session duration anomalies                                                  │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "BEHAVIORAL_ANOMALY",                                       │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Unusual user behavior detected",                              │    │
│  │    "evidence": {                                                                 │    │
│  │      "pattern": "COPY_PASTE_DETECTED",                                          │    │
│  │      "fields": [                                                                  │    │
│  │        {                                                                          │    │
│  │          "field": "pastProjects[0].projectDescription",                          │    │
│  │          "pasteSource": "external"                                               │    │
│  │        }                                                                          │    │
│  │      ],                                                                           │    │
│  │      "sessionDuration": "45 seconds",                                            │    │
│  │      "expectedDuration": "10-30 minutes"                                         │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "BEHAVIORAL_ANALYSIS_CHECK"                                 │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  5.5 TEMPORAL ANOMALY PATTERN                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  RULE: Detect temporal inconsistencies in submitted data                                │
│                                                                                          │
│  DETECTION LOGIC:                                                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FUNCTION: detectTemporalAnomaly(contractorData: object) → FraudIndicator      │    │
│  │                                                                                  │    │
│  │  PATTERNS TO DETECT:                                                             │    │
│  │  1. Project completion date before start date                                   │    │
│  │  2. GST registration date before incorporation date                             │    │
│  │  3. Turnover certificate date before financial year end                         │    │
│  │  4. Document issue date in future                                               │    │
│  │  5. Backdated documents (issue date before upload date by suspicious margin)    │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  INDICATOR OUTPUT:                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "indicatorType": "TEMPORAL_ANOMALY",                                         │    │
│  │    "detected": true,                                                             │    │
│  │    "explanation": "Temporal inconsistency detected in submitted data",           │    │
│  │    "evidence": {                                                                 │    │
│  │      "pattern": "DATE_SEQUENCE_ANOMALY",                                        │    │
│  │      "anomaly": {                                                                 │    │
│  │        "field1": {                                                                │    │
│  │          "name": "gstRegistrationDate",                                          │    │
│  │          "value": "2015-03-15"                                                   │    │
│  │        },                                                                         │    │
│  │        "field2": {                                                                │    │
│  │          "name": "incorporationDate",                                            │    │
│  │          "value": "2016-05-20"                                                   │    │
│  │        },                                                                         │    │
│  │        "issue": "GST registration before incorporation"                          │    │
│  │      }                                                                            │    │
│  │    },                                                                            │    │
│  │    "ruleTriggered": "TEMPORAL_CONSISTENCY_CHECK"                                │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6️⃣ RISK FLAG ATTACHMENT MECHANISM

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  RISK FLAG ATTACHMENT MECHANISM                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  6.1 RISK FLAG DATA STRUCTURE                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Each fraud indicator that is detected creates a RISK FLAG attached to the contractor   │
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  RISK FLAG OBJECT STRUCTURE:                                                    │    │
│  │                                                                                  │    │
│  │  {                                                                               │    │
│  │    // IDENTIFICATION                                                             │    │
│  │    "flagId": "550e8400-e29b-41d4-a716-446655440010",    // UUID                 │    │
│  │    "contractorId": "550e8400-e29b-41d4-a716-446655440003", // FK to contractor  │    │
│  │                                                                                  │    │
│  │    // FLAG CLASSIFICATION                                                        │    │
│  │    "flagType": "DUPLICATE_PAN_DETECTED",                // Enum                  │    │
│  │    "category": "IDENTITY_FRAUD",                        // Grouping              │    │
│  │    "severity": "CRITICAL",                              // INFO|WARNING|ERROR|CRITICAL │
│  │                                                                                  │    │
│  │    // EXPLANATION (BOOLEAN + REASON)                                             │    │
│  │    "detected": true,                                     // BOOLEAN              │    │
│  │    "explanation": "PAN AAPFU0939K is already registered to another contractor", │    │
│  │                                                                                  │    │
│  │    // EVIDENCE (AUDITABLE)                                                       │    │
│  │    "evidence": {                                                                 │    │
│  │      "panNumber": "AAPFU0939K",                                                 │    │
│  │      "existingContractorId": "uuid-xxx",                                        │    │
│  │      "existingWalletAddress": "0x1234...",                                      │    │
│  │      "detectionQuery": "SELECT * FROM contractors WHERE pan = 'AAPFU0939K'",    │    │
│  │      "queryResult": { ... }                                                      │    │
│  │    },                                                                            │    │
│  │                                                                                  │    │
│  │    // RULE TRIGGERED                                                             │    │
│  │    "ruleTriggered": {                                                            │    │
│  │      "ruleId": "PAN_UNIQUENESS_CONSTRAINT",                                     │    │
│  │      "ruleDescription": "One PAN can only be associated with one contractor",   │    │
│  │      "ruleVersion": "1.0.0"                                                      │    │
│  │    },                                                                            │    │
│  │                                                                                  │    │
│  │    // AUDIT TRAIL                                                                │    │
│  │    "detectionTimestamp": "2024-02-15T10:30:00.000Z",                            │    │
│  │    "detectionSource": "SYSTEM_AUTOMATED",                                       │    │
│  │    "detectionVersion": "fraud-detection-v2.1.0",                                │    │
│  │    "auditTrail": [                                                               │    │
│  │      {                                                                           │    │
│  │        "action": "CHECK_INITIATED",                                             │    │
│  │        "timestamp": "2024-02-15T10:30:00.000Z",                                 │    │
│  │        "actor": "SYSTEM",                                                        │    │
│  │        "details": "PAN uniqueness check started"                                │    │
│  │      },                                                                          │    │
│  │      {                                                                           │    │
│  │        "action": "DUPLICATE_FOUND",                                             │    │
│  │        "timestamp": "2024-02-15T10:30:00.100Z",                                 │    │
│  │        "actor": "SYSTEM",                                                        │    │
│  │        "details": "Match found in contractors table"                            │    │
│  │      },                                                                          │    │
│  │      {                                                                           │    │
│  │        "action": "FLAG_CREATED",                                                │    │
│  │        "timestamp": "2024-02-15T10:30:00.150Z",                                 │    │
│  │        "actor": "SYSTEM",                                                        │    │
│  │        "details": "Risk flag created and attached to contractor"                │    │
│  │      }                                                                           │    │
│  │    ],                                                                            │    │
│  │                                                                                  │    │
│  │    // RESOLUTION STATUS                                                          │    │
│  │    "resolved": false,                                                            │    │
│  │    "resolutionTimestamp": null,                                                 │    │
│  │    "resolvedBy": null,                                                           │    │
│  │    "resolutionType": null,        // APPROVED|REJECTED|ESCALATED|FALSE_POSITIVE │    │
│  │    "resolutionRemarks": null                                                     │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  6.2 FLAG TYPE ENUMERATION                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  FLAG TYPE                           │ CATEGORY           │ DEFAULT SEVERITY    │    │
│  ├─────────────────────────────────────────────────────────────────────────────────┤    │
│  │  DUPLICATE_PAN_DETECTED              │ IDENTITY_FRAUD     │ CRITICAL            │    │
│  │  DUPLICATE_GSTIN_DETECTED            │ IDENTITY_FRAUD     │ CRITICAL            │    │
│  │  DUPLICATE_WALLET_DETECTED           │ IDENTITY_FRAUD     │ CRITICAL            │    │
│  │  DUPLICATE_DOCUMENT_DETECTED         │ DOCUMENT_FRAUD     │ ERROR               │    │
│  │  DIRECTOR_ASSOCIATION_DETECTED       │ IDENTITY_FRAUD     │ WARNING             │    │
│  │  CID_INTEGRITY_MISMATCH              │ DOCUMENT_FRAUD     │ CRITICAL            │    │
│  │  ONCHAIN_OFFCHAIN_CID_MISMATCH       │ DOCUMENT_FRAUD     │ CRITICAL            │    │
│  │  DOCUMENT_ROOT_HASH_MISMATCH         │ DOCUMENT_FRAUD     │ CRITICAL            │    │
│  │  IPFS_CONTENT_UNAVAILABLE            │ DOCUMENT_FRAUD     │ ERROR               │    │
│  │  PAN_GSTIN_MISMATCH                  │ DATA_INCONSISTENCY │ ERROR               │    │
│  │  ENTITY_TYPE_MISMATCH                │ DATA_INCONSISTENCY │ ERROR               │    │
│  │  PAN_GST_NAME_MISMATCH               │ DATA_INCONSISTENCY │ ERROR               │    │
│  │  STATE_CODE_MISMATCH                 │ DATA_INCONSISTENCY │ WARNING             │    │
│  │  PDF_METADATA_ANOMALY                │ DOCUMENT_FRAUD     │ WARNING             │    │
│  │  IMAGE_MANIPULATION_DETECTED         │ DOCUMENT_FRAUD     │ ERROR               │    │
│  │  SECURITY_FEATURE_MISSING            │ DOCUMENT_FRAUD     │ WARNING             │    │
│  │  FONT_CONSISTENCY_ANOMALY            │ DOCUMENT_FRAUD     │ WARNING             │    │
│  │  RAPID_APPLICATION_PATTERN           │ BEHAVIORAL_ANOMALY │ WARNING             │    │
│  │  GEOGRAPHIC_ANOMALY                  │ BEHAVIORAL_ANOMALY │ WARNING             │    │
│  │  DATA_SIMILARITY_PATTERN             │ BEHAVIORAL_ANOMALY │ WARNING             │    │
│  │  BEHAVIORAL_ANOMALY                  │ BEHAVIORAL_ANOMALY │ INFO                │    │
│  │  TEMPORAL_ANOMALY                    │ DATA_INCONSISTENCY │ ERROR               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  6.3 FLAG ATTACHMENT WORKFLOW                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │                                                                                  │    │
│  │  DOCUMENT UPLOADED                                                              │    │
│  │         │                                                                        │    │
│  │         ▼                                                                        │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │    │
│  │  │  RUN ALL FRAUD DETECTION CHECKS                                          │    │    │
│  │  │  ─────────────────────────────────────────────────────────────────────── │    │    │
│  │  │  For each fraud detection function:                                      │    │    │
│  │  │    result = detectFunction(input)                                        │    │    │
│  │  │    if result.detected === true:                                          │    │    │
│  │  │      createRiskFlag(result)                                              │    │    │
│  │  │      attachToContractor(flag)                                            │    │    │
│  │  │      logAuditTrail(flag)                                                 │    │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘    │    │
│  │         │                                                                        │    │
│  │         ▼                                                                        │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │    │
│  │  │  DETERMINE OVERALL RISK LEVEL                                            │    │    │
│  │  │  ─────────────────────────────────────────────────────────────────────── │    │    │
│  │  │  IF any CRITICAL flags: overallRiskLevel = "CRITICAL"                    │    │    │
│  │  │  ELSE IF any ERROR flags: overallRiskLevel = "HIGH"                      │    │    │
│  │  │  ELSE IF any WARNING flags: overallRiskLevel = "MEDIUM"                  │    │    │
│  │  │  ELSE IF any INFO flags: overallRiskLevel = "LOW"                        │    │    │
│  │  │  ELSE: overallRiskLevel = "LOW"                                          │    │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘    │    │
│  │         │                                                                        │    │
│  │         ▼                                                                        │    │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐    │    │
│  │  │  UPDATE CONTRACTOR STATUS                                                │    │    │
│  │  │  ─────────────────────────────────────────────────────────────────────── │    │    │
│  │  │  IF overallRiskLevel === "CRITICAL":                                     │    │    │
│  │  │    status = "FLAGGED_FOR_RISK"                                           │    │    │
│  │  │    notifyGovernmentAdmin()                                               │    │    │
│  │  │    blockFurtherProcessing()                                              │    │    │
│  │  │  ELSE IF overallRiskLevel === "HIGH":                                    │    │    │
│  │  │    status = "FLAGGED_FOR_RISK"                                           │    │    │
│  │  │    notifyGovernmentAdmin()                                               │    │    │
│  │  │    allowManualReview()                                                   │    │    │
│  │  │  ELSE:                                                                    │    │    │
│  │  │    continueProcessing()                                                  │    │    │
│  │  └─────────────────────────────────────────────────────────────────────────┘    │    │
│  │         │                                                                        │    │
│  │         ▼                                                                        │    │
│  │  FLAGS STORED IN DATABASE                                                       │    │
│  │  Table: contractor_risk_flags                                                   │    │
│  │                                                                                  │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  6.4 FLAG RESOLUTION WORKFLOW                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  RESOLUTION CAN ONLY BE DONE BY GOVERNMENT ADMIN                                │    │
│  │                                                                                  │    │
│  │  RESOLUTION TYPES:                                                               │    │
│  │  ─────────────────────────────────────────────────────────────────────────────  │    │
│  │  APPROVED        │ Admin reviewed and determined flag is acceptable             │    │
│  │                   │ (e.g., legitimate director association)                     │    │
│  │                                                                                  │    │
│  │  REJECTED        │ Admin confirmed fraud, application rejected                  │    │
│  │                                                                                  │    │
│  │  ESCALATED       │ Admin escalated to higher authority for investigation        │    │
│  │                                                                                  │    │
│  │  FALSE_POSITIVE  │ Admin determined flag was incorrect, removed                 │    │
│  │                                                                                  │    │
│  │  RESOLUTION PROCESS:                                                             │    │
│  │  ─────────────────────────────────────────────────────────────────────────────  │    │
│  │  1. Admin views flag details and evidence                                       │    │
│  │  2. Admin reviews original documents                                            │    │
│  │  3. Admin may request additional information from contractor                    │    │
│  │  4. Admin makes resolution decision                                             │    │
│  │  5. System updates flag:                                                        │    │
│  │     - resolved = true                                                           │    │
│  │     - resolutionTimestamp = now()                                               │    │
│  │     - resolvedBy = adminId                                                      │    │
│  │     - resolutionType = decision                                                 │    │
│  │     - resolutionRemarks = explanation                                           │    │
│  │  6. Audit trail entry added                                                     │    │
│  │  7. Contractor status updated accordingly                                       │    │
│  │  8. Notifications sent                                                          │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│  RESOLUTION AUDIT ENTRY:                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │  {                                                                               │    │
│  │    "action": "FLAG_RESOLVED",                                                   │    │
│  │    "timestamp": "2024-02-15T14:00:00.000Z",                                     │    │
│  │    "actor": "gov_admin_456",                                                    │    │
│  │    "actorRole": "GOVERNMENT_ADMIN",                                             │    │
│  │    "details": {                                                                  │    │
│  │      "flagId": "550e8400-...",                                                  │    │
│  │      "flagType": "DIRECTOR_ASSOCIATION_DETECTED",                               │    │
│  │      "resolutionType": "APPROVED",                                              │    │
│  │      "resolutionRemarks": "Director is legitimately associated with both        │    │
│  │                           companies as per MCA records. No fraud detected."      │    │
│  │    }                                                                             │    │
│  │  }                                                                               │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## FRAUD DETECTION SUMMARY TABLE

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  FRAUD DETECTION CHECKS SUMMARY                                                                          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                          │
│  CHECK                          │ TRIGGER                    │ SEVERITY  │ AUTO-BLOCK │ MANUAL REVIEW   │
│  ──────────────────────────────┼────────────────────────────┼───────────┼────────────┼─────────────────│
│  Duplicate PAN                  │ PAN already registered     │ CRITICAL  │ YES        │ Required        │
│  Duplicate GSTIN                │ GSTIN already registered   │ CRITICAL  │ YES        │ Required        │
│  Duplicate Wallet               │ Wallet already linked      │ CRITICAL  │ YES        │ Required        │
│  Duplicate Document             │ Same file hash exists      │ ERROR     │ NO         │ Required        │
│  Director Association           │ DIN in another contractor  │ WARNING   │ NO         │ Optional        │
│  CID Integrity Mismatch         │ CID ≠ content hash         │ CRITICAL  │ YES        │ Required        │
│  On-Chain CID Mismatch          │ Blockchain ≠ DB CID        │ CRITICAL  │ YES        │ Required        │
│  Document Root Hash Mismatch    │ Merkle root invalid        │ CRITICAL  │ YES        │ Required        │
│  IPFS Unavailable               │ CID not retrievable        │ ERROR     │ NO         │ Required        │
│  PAN-GSTIN Mismatch             │ PAN not in GSTIN           │ ERROR     │ YES        │ Required        │
│  Entity Type Mismatch           │ PAN type ≠ GSTIN type      │ ERROR     │ YES        │ Required        │
│  PAN-GST Name Mismatch          │ Names don't match          │ ERROR     │ NO         │ Required        │
│  State Code Mismatch            │ GSTIN state ≠ address      │ WARNING   │ NO         │ Optional        │
│  PDF Metadata Anomaly           │ Suspicious PDF metadata    │ WARNING   │ NO         │ Optional        │
│  Image Manipulation             │ Editing detected           │ ERROR     │ NO         │ Required        │
│  Security Feature Missing       │ Expected features absent   │ WARNING   │ NO         │ Optional        │
│  Font Consistency Anomaly       │ Mixed fonts detected       │ WARNING   │ NO         │ Optional        │
│  Rapid Application Pattern      │ Bot-like behavior          │ WARNING   │ NO         │ Optional        │
│  Geographic Anomaly             │ Location inconsistency     │ WARNING   │ NO         │ Optional        │
│  Data Similarity Pattern        │ Similar data across apps   │ WARNING   │ NO         │ Optional        │
│  Behavioral Anomaly             │ Unusual user behavior      │ INFO      │ NO         │ Optional        │
│  Temporal Anomaly               │ Date sequence invalid      │ ERROR     │ NO         │ Required        │
│                                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## PHASE 2D COMPLETE
## READY FOR NEXT PHASE
