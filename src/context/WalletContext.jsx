import { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useChainId, useDisconnect, useSwitchChain } from 'wagmi';
import { SUPPORTED_CHAINS } from '../contract/config';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { address, isConnected, isConnecting } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  
  const [error, setError] = useState(null);

  // Check if current chain is supported
  const isChainValid = SUPPORTED_CHAINS.includes(chainId);

  // Clear error when connection changes
  useEffect(() => {
    if (isConnected && !isChainValid) {
      setError(`Wrong network. Please switch to Sepolia (chainId: ${SUPPORTED_CHAINS[0]})`);
    } else {
      setError(null);
    }
  }, [chainId, isConnected, isChainValid]);

  // Switch to supported chain
  const switchToSupportedChain = async () => {
    try {
      setError(null);
      switchChain({ chainId: SUPPORTED_CHAINS[0] });
    } catch (err) {
      setError(err.message || 'Failed to switch network');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    disconnect();
    setError(null);
  };

  // Truncate address for display
  const truncatedAddress = address 
    ? `${address.slice(0, 6)}...${address.slice(-4)}` 
    : null;

  const value = {
    // Connection state
    address,
    truncatedAddress,
    isConnected,
    isConnecting,
    
    // Chain state
    chainId,
    isChainValid,
    supportedChainId: SUPPORTED_CHAINS[0],
    
    // Error state
    error,
    setError,
    
    // Actions
    switchToSupportedChain,
    disconnectWallet,
    isSwitchingChain,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

export default WalletContext;
