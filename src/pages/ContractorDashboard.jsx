import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useRole } from '../hooks/useRole';
import { getTenderIds, getTender, getBid } from '../services/contractService';

export default function ContractorDashboard() {
    const { isConnected, isChainValid, chainId, address } = useWallet();
    const { isRegistered, competenceScore, isLoading: roleLoading } = useRole();
    
    const [tenders, setTenders] = useState([]);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch tenders and user's bids
    useEffect(() => {
        async function fetchData() {
            if (!isConnected || !isChainValid || !chainId || !address) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Get all tender IDs
                const tenderIds = await getTenderIds(chainId);
                
                // Fetch each tender and check for user bids
                const tenderPromises = tenderIds.map(async (id) => {
                    const tender = await getTender(chainId, id);
                    const bid = await getBid(chainId, id, address);
                    return { ...tender, bid };
                });
                
                const tenderData = await Promise.all(tenderPromises);
                setTenders(tenderData);
                
                // Filter tenders where user has bid
                const userBids = tenderData.filter(t => t.bid && t.bid.commitHash !== '0x0000000000000000000000000000000000000000000000000000000000000000');
                setBids(userBids);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        }
        
        fetchData();
    }, [isConnected, isChainValid, chainId, address]);

    // Not connected
    if (!isConnected) {
        return (
            <div className="container mx-auto px-24 py-12">
                <h1 className="text-3xl font-bold mb-6">Contractor Dashboard</h1>
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
                <h1 className="text-3xl font-bold mb-6">Contractor Dashboard</h1>
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
                <h1 className="text-3xl font-bold mb-6">Contractor Dashboard</h1>
                <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                    <p className="text-gray-400 animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    // Not registered
    if (!isRegistered) {
        return (
            <div className="container mx-auto px-24 py-12">
                <h1 className="text-3xl font-bold mb-6">Contractor Dashboard</h1>
                <div className="bg-yellow-900/30 rounded-lg p-8 text-center">
                    <h2 className="text-xl font-semibold text-yellow-400 mb-2">Not Registered</h2>
                    <p className="text-gray-400">You are not registered as a contractor. Please wait for government approval.</p>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="container mx-auto px-24 py-12">
                <h1 className="text-3xl font-bold mb-6">Contractor Dashboard</h1>
                <div className="bg-red-900/30 rounded-lg p-8 text-center">
                    <p className="text-red-400">Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-24 py-12">
            <h1 className="text-3xl font-bold mb-6">Contractor Dashboard</h1>
            
            {/* Status Card */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Contractor Status</h2>
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                            ✅ Registered
                        </span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Competence Score</div>
                        <div className="text-3xl font-bold text-blue-400">{competenceScore}/100</div>
                    </div>
                </div>
            </div>

            {/* Available Tenders */}
            <h2 className="text-2xl font-semibold mb-4">Available Tenders</h2>
            <div className="bg-gray-800/50 rounded-lg p-6 mb-8">
                {tenders.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No tenders available.</p>
                ) : (
                    <div className="space-y-4">
                        {tenders.map((tender) => (
                            <div key={tender.tenderId} className="border border-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">Tender #{tender.tenderId.toString()}</h3>
                                        <p className="text-sm text-gray-400">IPFS: {tender.ipfsTenderHash.slice(0, 20)}...</p>
                                    </div>
                                    <div className="text-right">
                                        {tender.winnerSelected ? (
                                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                                                Winner Selected
                                            </span>
                                        ) : (
                                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                                Open
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {tender.bid && tender.bid.commitHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                                    <div className="mt-2 text-sm text-green-400">
                                        ✓ You have submitted a bid
                                        {tender.bid.revealed && ` (Revealed: ${tender.bid.revealedAmount.toString()})`}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* My Bids */}
            <h2 className="text-2xl font-semibold mb-4">My Bids</h2>
            <div className="bg-gray-800/50 rounded-lg p-6">
                {bids.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No active bids found.</p>
                ) : (
                    <div className="space-y-4">
                        {bids.map((tender) => (
                            <div key={tender.tenderId} className="border border-gray-700 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold">Tender #{tender.tenderId.toString()}</h3>
                                        <p className="text-sm text-gray-400">
                                            Status: {tender.bid.revealed ? 'Revealed' : 'Committed'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {tender.bid.revealed && (
                                            <span className="text-lg font-bold text-blue-400">
                                                {tender.bid.revealedAmount.toString()} wei
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
