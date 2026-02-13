import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '../context/WalletContext';

export default function ConnectButton() {
  const { 
    isConnected, 
    isChainValid, 
    error, 
    switchToSupportedChain, 
    isSwitchingChain 
  } = useWallet();

  return (
    <div className="flex flex-col items-end gap-2">
      <RainbowConnectButton />
      
      {/* Network mismatch error */}
      {isConnected && !isChainValid && (
        <div className="flex items-center gap-2">
          <span className="text-red-400 text-xs">
            Wrong network
          </span>
          <button
            onClick={switchToSupportedChain}
            disabled={isSwitchingChain}
            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded-md transition disabled:opacity-50"
          >
            {isSwitchingChain ? 'Switching...' : 'Switch to Sepolia'}
          </button>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <span className="text-red-400 text-xs">
          {error}
        </span>
      )}
    </div>
  );
}
