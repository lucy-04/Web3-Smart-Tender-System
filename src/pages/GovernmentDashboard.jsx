import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useRole } from '../hooks/useRole';
import { 
    getContractorList, 
    getContractorDetails, 
    approveContractor, 
    createTender,
    getTenderIds,
    getTender
} from '../services/contractService';

export default function GovernmentDashboard() {
    const { isConnected, isChainValid, chainId, address } = useWallet();
    const { isGov, isLoading: roleLoading } = useRole();
    
    // State
    const [contractors, setContractors] = useState([]);
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Form states
    const [approveForm, setApproveForm] = useState({
        contractorAddress: '',
        ipfsHash: '',
        score: 50,
    });
    const [tenderForm, setTenderForm] = useState({
        ipfsHash: '',
        commitDeadline: '',
        revealDeadline: '',
    });
    
    // Transaction states
    const [approving, setApproving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [txError, setTxError] = useState(null);
    const [txSuccess, setTxSuccess] = useState(null);

    // Fetch data
    useEffect(() => {
        async function fetchData() {
            if (!isConnected || !isChainValid || !chainId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Get contractor list
                const contractorAddresses = await getContractorList(chainId);
                
                // Fetch details for each contractor
                const contractorPromises = contractorAddresses.map(async (addr) => {
                    const details = await getContractorDetails(chainId, addr);
                    return { address: addr, ...details };
                });
                
                const contractorData = await Promise.all(contractorPromises);
                setContractors(contractorData);
                
                // Get tenders
                const tenderIds = await getTenderIds(chainId);
                const tenderPromises = tenderIds.map(async (id) => {
                    return await getTender(chainId, id);
                });
                
                const tenderData = await Promise.all(tenderPromises);
                setTenders(tenderData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, [isConnected, isChainValid, chainId]);

    // Handle approve contractor
    const handleApproveContractor = async (e) => {
        e.preventDefault();
        setApproving(true);
        setTxError(null);
        setTxSuccess(null);
        
        try {
            const commitDeadline = Math.floor(Date.now() / 1000) + 86400 * 7; // 7 days
            const revealDeadline = commitDeadline + 86400 * 3; // 3 more days
            
            await approveContractor(
                chainId,
                approveForm.contractorAddress,
                approveForm.ipfsHash,
                approveForm.score
            );
            
            setTxSuccess('Contractor approved successfully!');
            setApproveForm({ contractorAddress: '', ipfsHash: '', score: 50 });
        } catch (err) {
            console.error('Error approving contractor:', err);
            setTxError(err.message || 'Failed to approve contractor');
        } finally {
            setApproving(false);
        }
    };

    // Handle create tender
    const handleCreateTender = async (e) => {
        e.preventDefault();
        setCreating(true);
        setTxError(null);
        setTxSuccess(null);
        
        try {
            const commitDeadline = Math.floor(new Date(tenderForm.commitDeadline).getTime() / 1000);
            const revealDeadline = Math.floor(new Date(tenderForm.revealDeadline).getTime() / 1000);
            
            await createTender(
                chainId,
                tenderForm.ipfsHash,
                commitDeadline,
                revealDeadline
            );
            
            setTxSuccess('Tender created successfully!');
            setTenderForm({ ipfsHash: '', commitDeadline: '', revealDeadline: '' });
        } catch (err) {
            console.error('Error creating tender:', err);
            setTxError(err.message || 'Failed to create tender');
        } finally {
            setCreating(false);
        }
    };

    // Not connected
    if (!isConnected) {
        return (
            <div className="container mx-auto px-24 py-12">
                <h1 className="text-3xl font-bold mb-6">Government Dashboard</h1>
                <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                    <p className="text-gray-400">Please connect your wallet to access the dashboard.</p>
                </div>
            </div>
        );
    }

    // Wrong network
    if (!isChainValid) {
        return (
            <div className="container mx-auto px-24 py-12">
                <h1 className="text-3xl font-bold mb-6">Government Dashboard</h1>
                <div className="bg-red-900/30 rounded-lg p-8 text-center">
                    <p className="text-red-400">Please switch to Sepolia network.</p>
                </div>
            </div>
        );
    }

    // Loading
    if (roleLoading || loading) {
        return (
            <div className="container mx-auto px-24 py-12">
                <h1 className="text-3xl font-bold mb-6">Government Dashboard</h1>
                <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                    <p className="text-gray-400 animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    // Not government
    if (!isGov) {
        return (
            <div className="container mx-auto px-24 py-12">
                <h1 className="text-3xl font-bold mb-6">Government Dashboard</h1>
                <div className="bg-red-900/30 rounded-lg p-8 text-center">
                    <h2 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h2>
                    <p className="text-gray-400">You are not authorized as a government official.</p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="container mx-auto px-24 py-12">
                <h1 className="text-3xl font-bold mb-6">Government Dashboard</h1>
                <div className="bg-red-900/30 rounded-lg p-8 text-center">
                    <p className="text-red-400">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-24 py-12">
            <h1 className="text-3xl font-bold mb-6">Government Dashboard</h1>
            
            {/* Status Messages */}
            {txSuccess && (
                <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-4 mb-6">
                    <p className="text-green-400">{txSuccess}</p>
                </div>
            )}
            {txError && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-red-400">{txError}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Approve Contractor */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Approve Contractor</h2>
                    <div className="bg-gray-800/50 rounded-lg p-6">
                        <form onSubmit={handleApproveContractor} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Contractor Address</label>
                                <input
                                    type="text"
                                    value={approveForm.contractorAddress}
                                    onChange={(e) => setApproveForm({ ...approveForm, contractorAddress: e.target.value })}
                                    placeholder="0x..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">IPFS Profile Hash</label>
                                <input
                                    type="text"
                                    value={approveForm.ipfsHash}
                                    onChange={(e) => setApproveForm({ ...approveForm, ipfsHash: e.target.value })}
                                    placeholder="Qm..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Competence Score (0-100)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={approveForm.score}
                                    onChange={(e) => setApproveForm({ ...approveForm, score: parseInt(e.target.value) })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={approving}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg px-4 py-2 font-semibold transition"
                            >
                                {approving ? 'Approving...' : 'Approve Contractor'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Create Tender */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Create New Tender</h2>
                    <div className="bg-gray-800/50 rounded-lg p-6">
                        <form onSubmit={handleCreateTender} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">IPFS Tender Hash</label>
                                <input
                                    type="text"
                                    value={tenderForm.ipfsHash}
                                    onChange={(e) => setTenderForm({ ...tenderForm, ipfsHash: e.target.value })}
                                    placeholder="Qm..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Commit Deadline</label>
                                <input
                                    type="datetime-local"
                                    value={tenderForm.commitDeadline}
                                    onChange={(e) => setTenderForm({ ...tenderForm, commitDeadline: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Reveal Deadline</label>
                                <input
                                    type="datetime-local"
                                    value={tenderForm.revealDeadline}
                                    onChange={(e) => setTenderForm({ ...tenderForm, revealDeadline: e.target.value })}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-lg px-4 py-2 font-semibold transition"
                            >
                                {creating ? 'Creating...' : 'Create Tender'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Registered Contractors */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">Registered Contractors</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
                {contractors.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No contractors registered yet.</p>
                ) : (
                    <div className="space-y-4">
                        {contractors.map((contractor) => (
                            <div key={contractor.address} className="border border-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-mono text-sm">{contractor.address}</p>
                                        <p className="text-xs text-gray-400">ID: {contractor.contractorId.toString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                                            Score: {contractor.competenceScore.toString()}/100
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Active Tenders */}
            <h2 className="text-2xl font-semibold mt-8 mb-4">Active Tenders</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
                {tenders.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No tenders created yet.</p>
                ) : (
                    <div className="space-y-4">
                        {tenders.map((tender) => (
                            <div key={tender.tenderId} className="border border-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">Tender #{tender.tenderId.toString()}</h3>
                                        <p className="text-sm text-gray-400">IPFS: {tender.ipfsTenderHash.slice(0, 20)}...</p>
                                    </div>
                                    <div className="text-right">
                                        {tender.winnerSelected ? (
                                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                                                Winner: {tender.winner.slice(0, 8)}...
                                            </span>
                                        ) : (
                                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                                Open
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
