import { useRole } from '../hooks/useRole';
import { useWallet } from '../context/WalletContext';

export default function RoleBadge() {
  const { isConnected, isChainValid } = useWallet();
  const { role, isGov, isContractor, isRegistered, competenceScore, isLoading, error } = useRole();

  // Not connected
  if (!isConnected) {
    return (
      <div className="px-3 py-1 text-xs rounded-full bg-gray-700 text-gray-400">
        Not connected
      </div>
    );
  }

  // Wrong network
  if (!isChainValid) {
    return (
      <div className="px-3 py-1 text-xs rounded-full bg-red-900/50 text-red-400">
        Wrong network
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="px-3 py-1 text-xs rounded-full bg-gray-700 text-gray-400 animate-pulse">
        Detecting role...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="px-3 py-1 text-xs rounded-full bg-red-900/50 text-red-400">
        Error: {error}
      </div>
    );
  }

  // Government official
  if (isGov) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 text-xs rounded-full bg-purple-900/50 text-purple-400 border border-purple-500/30">
          🏛️ Government Official
        </div>
      </div>
    );
  }

  // Registered contractor
  if (isContractor && isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 text-xs rounded-full bg-green-900/50 text-green-400 border border-green-500/30">
          ✅ Registered Contractor
        </div>
        <div className="px-2 py-1 text-xs rounded bg-blue-900/50 text-blue-400">
          Score: {competenceScore}/100
        </div>
      </div>
    );
  }

  // Unregistered contractor
  if (isContractor && !isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 text-xs rounded-full bg-yellow-900/50 text-yellow-400 border border-yellow-500/30">
          ⏳ Pending Registration
        </div>
      </div>
    );
  }

  // Public user
  return (
    <div className="px-3 py-1 text-xs rounded-full bg-gray-700 text-gray-400">
      👤 Public User
    </div>
  );
}
