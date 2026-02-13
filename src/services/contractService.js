import { readContract, writeContract, simulateContract } from '@wagmi/core';
import { config } from '../wagmi';
import { contractABI, getContractAddress, getContractConfig } from '../contract/config';

/**
 * Contract Service Layer
 * All contract interactions should go through this service
 */

// ======================================================
// READ FUNCTIONS
// ======================================================

/**
 * Get the total number of tenders
 * @param {number} chainId - The chain ID
 * @returns {Promise<bigint>} The tender count
 */
export async function getTenderCount(chainId) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'tenderCount',
  });
  return result;
}

/**
 * Get tender details by ID
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @returns {Promise<object>} Tender details
 */
export async function getTender(chainId, tenderId) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'tenders',
    args: [tenderId],
  });
  return {
    tenderId: result[0],
    ipfsTenderHash: result[1],
    commitDeadline: result[2],
    revealDeadline: result[3],
    winnerSelected: result[4],
    winner: result[5],
    winningBidAmount: result[6],
  };
}

/**
 * Get all tenders
 * @param {number} chainId - The chain ID
 * @returns {Promise<array>} Array of all tenders
 */
export async function getAllTenders(chainId) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'getAllTenders',
  });
  return result.map(t => ({
    tenderId: t.tenderId,
    ipfsTenderHash: t.ipfsTenderHash,
    commitDeadline: t.commitDeadline,
    revealDeadline: t.revealDeadline,
    winnerSelected: t.winnerSelected,
    winner: t.winner,
    winningBidAmount: t.winningBidAmount,
  }));
}

/**
 * Get contractor details by address
 * @param {number} chainId - The chain ID
 * @param {string} contractorAddress - The contractor's address
 * @returns {Promise<object>} Contractor details
 */
export async function getContractor(chainId, contractorAddress) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'contractors',
    args: [contractorAddress],
  });
  return {
    registered: result[0],
    ipfsProfileHash: result[1],
    competenceScore: result[2],
  };
}

/**
 * Get full contractor details
 * @param {number} chainId - The chain ID
 * @param {string} contractorAddress - The contractor's address
 * @returns {Promise<object>} Full contractor details
 */
export async function getContractorDetails(chainId, contractorAddress) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'getContractorDetails',
    args: [contractorAddress],
  });
  return {
    contractorId: result[0],
    registered: result[1],
    companyName: result[2],
    ipfsProfileHash: result[3],
    competenceScore: result[4],
  };
}

/**
 * Get all contractor addresses
 * @param {number} chainId - The chain ID
 * @returns {Promise<array>} Array of contractor addresses
 */
export async function getContractorList(chainId) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'getContractorList',
  });
  return result;
}

/**
 * Check if address is a government official
 * @param {number} chainId - The chain ID
 * @param {string} address - The address to check
 * @returns {Promise<boolean>} True if government official
 */
export async function isGovernmentOfficial(chainId, address) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'governmentOfficials',
    args: [address],
  });
  return result;
}

/**
 * Get milestones for a tender
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @returns {Promise<array>} Array of milestones
 */
export async function getMilestones(chainId, tenderId) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'getMilestones',
    args: [tenderId],
  });
  return result.map(m => ({
    description: m.description,
    ipfsProofHash: m.ipfsProofHash,
    approved: m.approved,
  }));
}

/**
 * Get bid details for a tender and bidder
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @param {string} bidderAddress - The bidder's address
 * @returns {Promise<object>} Bid details
 */
export async function getBid(chainId, tenderId, bidderAddress) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'bids',
    args: [tenderId, bidderAddress],
  });
  return {
    commitHash: result[0],
    revealedAmount: result[1],
    revealed: result[2],
  };
}

/**
 * Get all bidders for a tender
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @returns {Promise<array>} Array of bidder addresses
 */
export async function getTenderBidders(chainId, tenderId) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'getTenderBidders',
    args: [tenderId],
  });
  return result;
}

/**
 * Get tender winner details
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @returns {Promise<object>} Winner details
 */
export async function getTenderWinner(chainId, tenderId) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'getTenderWinner',
    args: [tenderId],
  });
  return {
    winnerAddress: result[0],
    companyName: result[1],
    ipfsProfileHash: result[2],
    competenceScore: result[3],
    winningBidAmount: result[4],
    winnerSelected: result[5],
  };
}

/**
 * Get all tender IDs
 * @param {number} chainId - The chain ID
 * @returns {Promise<array>} Array of tender IDs
 */
export async function getTenderIds(chainId) {
  const result = await readContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'getTenderIds',
  });
  return result;
}

// ======================================================
// WRITE FUNCTIONS
// ======================================================

/**
 * Approve a contractor (Government only)
 * @param {number} chainId - The chain ID
 * @param {string} contractorAddress - The contractor's address
 * @param {string} ipfsHash - IPFS hash of contractor profile
 * @param {bigint|number} aiScore - AI-generated competence score (0-100)
 * @returns {Promise<object>} Transaction result
 */
export async function approveContractor(chainId, contractorAddress, ipfsHash, aiScore) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'approveContractor',
    args: [contractorAddress, ipfsHash, aiScore],
  });
  return writeContract(config, request);
}

/**
 * Create a new tender (Government only)
 * @param {number} chainId - The chain ID
 * @param {string} ipfsHash - IPFS hash of tender details
 * @param {bigint|number} commitDeadline - Commit phase deadline (timestamp)
 * @param {bigint|number} revealDeadline - Reveal phase deadline (timestamp)
 * @returns {Promise<object>} Transaction result
 */
export async function createTender(chainId, ipfsHash, commitDeadline, revealDeadline) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'createTender',
    args: [ipfsHash, commitDeadline, revealDeadline],
  });
  return writeContract(config, request);
}

/**
 * Submit a sealed bid (Contractor only)
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @param {string} commitHash - Keccak256 hash of (amount, secret)
 * @returns {Promise<object>} Transaction result
 */
export async function submitBid(chainId, tenderId, commitHash) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'submitBid',
    args: [tenderId, commitHash],
  });
  return writeContract(config, request);
}

/**
 * Reveal a bid (Contractor only)
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @param {bigint|number} amount - The bid amount
 * @param {string} secret - The secret used in commit hash (bytes32)
 * @returns {Promise<object>} Transaction result
 */
export async function revealBid(chainId, tenderId, amount, secret) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'revealBid',
    args: [tenderId, amount, secret],
  });
  return writeContract(config, request);
}

/**
 * Evaluate and select winner (Government only)
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @returns {Promise<object>} Transaction result
 */
export async function evaluateWinner(chainId, tenderId) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'evaluateWinner',
    args: [tenderId],
  });
  return writeContract(config, request);
}

/**
 * Add a milestone to a tender (Government only)
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @param {string} description - Milestone description
 * @returns {Promise<object>} Transaction result
 */
export async function addMilestone(chainId, tenderId, description) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'addMilestone',
    args: [tenderId, description],
  });
  return writeContract(config, request);
}

/**
 * Upload milestone proof (Winner only)
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @param {bigint|number} milestoneId - The milestone ID
 * @param {string} proofHash - IPFS hash of proof document
 * @returns {Promise<object>} Transaction result
 */
export async function uploadMilestoneProof(chainId, tenderId, milestoneId, proofHash) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'uploadMilestoneProof',
    args: [tenderId, milestoneId, proofHash],
  });
  return writeContract(config, request);
}

/**
 * Approve a milestone (Government only)
 * @param {number} chainId - The chain ID
 * @param {bigint|number} tenderId - The tender ID
 * @param {bigint|number} milestoneId - The milestone ID
 * @returns {Promise<object>} Transaction result
 */
export async function approveMilestone(chainId, tenderId, milestoneId) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'approveMilestone',
    args: [tenderId, milestoneId],
  });
  return writeContract(config, request);
}

/**
 * Add a government official (Government only)
 * @param {number} chainId - The chain ID
 * @param {string} newOfficial - Address of the new official
 * @returns {Promise<object>} Transaction result
 */
export async function addGovernmentOfficial(chainId, newOfficial) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'addGovernmentOfficial',
    args: [newOfficial],
  });
  return writeContract(config, request);
}

/**
 * Set competence score for a contractor (Government only)
 * @param {number} chainId - The chain ID
 * @param {string} contractorAddress - The contractor's address
 * @param {bigint|number} score - The competence score
 * @returns {Promise<object>} Transaction result
 */
export async function setCompetenceScore(chainId, contractorAddress, score) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'setCompetenceScore',
    args: [contractorAddress, score],
  });
  return writeContract(config, request);
}

/**
 * Register as a contractor
 * @param {number} chainId - The chain ID
 * @param {string} ipfsHash - IPFS hash of contractor profile
 * @returns {Promise<object>} Transaction result
 */
export async function registerContractor(chainId, ipfsHash) {
  const { request } = await simulateContract(config, {
    address: getContractAddress(chainId),
    abi: contractABI,
    functionName: 'registerContractor',
    args: [ipfsHash],
  });
  return writeContract(config, request);
}

// ======================================================
// HELPER FUNCTIONS
// ======================================================

/**
 * Generate commit hash for sealed bidding
 * @param {bigint|number} amount - The bid amount
 * @param {string} secret - The secret (will be converted to bytes32)
 * @returns {string} The keccak256 hash
 */
export function generateCommitHash(amount, secret) {
  // Convert secret string to bytes32
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  
  // Use ethers/viem for hashing (we'll use viem's keccak256)
  // For now, return the parameters needed for hashing
  return {
    amount,
    secret,
    // Hash should be computed as: keccak256(abi.encodePacked(amount, secret))
    // This will be done on-chain or with viem's keccak256
  };
}

/**
 * Check user role based on address
 * @param {number} chainId - The chain ID
 * @param {string} address - The user's address
 * @returns {Promise<{role: string, isGov: boolean, isContractor: boolean, isRegistered: boolean}>}
 */
export async function checkUserRole(chainId, address) {
  const [isGov, contractorData] = await Promise.all([
    isGovernmentOfficial(chainId, address),
    getContractor(chainId, address),
  ]);

  const isContractor = contractorData.registered;

  let role = 'public';
  if (isGov) {
    role = 'government';
  } else if (isContractor) {
    role = 'contractor';
  }

  return {
    role,
    isGov,
    isContractor,
    isRegistered: contractorData.registered,
    competenceScore: contractorData.competenceScore,
    ipfsProfileHash: contractorData.ipfsProfileHash,
  };
}
