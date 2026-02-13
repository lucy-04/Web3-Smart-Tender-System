import contractAbi from '../abi.json';

// Contract deployed addresses per chain
export const CONTRACT_ADDRESSES = {
  // Sepolia testnet (chainId: 11155111)
  11155111: '0x0000000000000000000000000000000000000000', // TODO: Replace with deployed address
  // Mainnet (chainId: 1)
  1: '0x0000000000000000000000000000000000000000', // TODO: Replace with deployed address
};

// Export the contract ABI
export const contractABI = contractAbi;

/**
 * Get contract address for a given chain ID
 * @param {number} chainId - The chain ID
 * @returns {string} The contract address for the chain
 */
export function getContractAddress(chainId) {
  const address = CONTRACT_ADDRESSES[chainId];
  if (!address || address === '0x0000000000000000000000000000000000000000') {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }
  return address;
}

/**
 * Get contract configuration for a given chain ID
 * @param {number} chainId - The chain ID
 * @returns {{ address: string, abi: array }} Contract config for wagmi/viem
 */
export function getContractConfig(chainId) {
  return {
    address: getContractAddress(chainId),
    abi: contractABI,
  };
}

// Supported chain IDs
export const SUPPORTED_CHAINS = [11155111]; // Sepolia for now

// Check if chain is supported
export function isChainSupported(chainId) {
  return SUPPORTED_CHAINS.includes(chainId);
}
