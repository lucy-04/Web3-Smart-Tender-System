import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../context/WalletContext';
import { checkUserRole, getContractorDetails } from '../services/contractService';

/**
 * Hook to detect and manage user role
 * @returns {object} Role state and actions
 */
export function useRole() {
  const { address, isConnected, isChainValid, chainId } = useWallet();
  
  const [roleData, setRoleData] = useState({
    role: null,           // 'government' | 'contractor' | 'public' | null
    isGov: false,
    isContractor: false,
    isRegistered: false,
    competenceScore: 0,
    ipfsProfileHash: '',
    isLoading: false,
    error: null,
  });

  // Fetch role data when wallet connects/changes
  const fetchRole = useCallback(async () => {
    if (!isConnected || !address || !isChainValid || !chainId) {
      setRoleData(prev => ({
        ...prev,
        role: null,
        isGov: false,
        isContractor: false,
        isRegistered: false,
        isLoading: false,
        error: null,
      }));
      return;
    }

    setRoleData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await checkUserRole(chainId, address);
      setRoleData({
        role: result.role,
        isGov: result.isGov,
        isContractor: result.isContractor,
        isRegistered: result.isRegistered,
        competenceScore: Number(result.competenceScore),
        ipfsProfileHash: result.ipfsProfileHash,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      console.error('Error fetching role:', err);
      setRoleData(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch role',
      }));
    }
  }, [isConnected, address, isChainValid, chainId]);

  // Auto-fetch on wallet changes
  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  // Refresh role data manually
  const refreshRole = useCallback(() => {
    fetchRole();
  }, [fetchRole]);

  // Get full contractor details
  const fetchContractorDetails = useCallback(async () => {
    if (!isConnected || !address || !isChainValid || !chainId) {
      return null;
    }

    try {
      const details = await getContractorDetails(chainId, address);
      return {
        contractorId: Number(details.contractorId),
        registered: details.registered,
        companyName: details.companyName,
        ipfsProfileHash: details.ipfsProfileHash,
        competenceScore: Number(details.competenceScore),
      };
    } catch (err) {
      console.error('Error fetching contractor details:', err);
      return null;
    }
  }, [isConnected, address, isChainValid, chainId]);

  return {
    ...roleData,
    refreshRole,
    fetchContractorDetails,
  };
}

export default useRole;
