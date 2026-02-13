import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { keccak256, encodePacked, toHex, pad } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { uploadToIPFS, fetchFromIPFS } from "../ipfs";
import { timestampToDate, getTenderPhase, getPhaseColor, truncateAddress } from "../utils/formatters";

const ContractorDashboard = () => {
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState("tenders");
    const [tenderMeta, setTenderMeta] = useState({});


    const { data: contractorData } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getContractorDetails",
        args: address ? [address] : undefined,
        enabled: !!address,
    });


    const { data: allTenders, refetch: refetchTenders } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getAllTenders",
    });


    useEffect(() => {
        if (!allTenders) return;
        allTenders.forEach(async (t) => {
            const id = Number(t.tenderId);
            if (id === 0 || tenderMeta[id]) return;
            const meta = await fetchFromIPFS(t.ipfsTenderHash);
            if (meta) setTenderMeta(prev => ({ ...prev, [id]: meta }));
        });
    }, [allTenders]);

    const isRegistered = contractorData?.[1];
    const companyName = contractorData?.[2] || "";
    const score = contractorData ? Number(contractorData[4]) : 0;
    const contractorId = contractorData ? Number(contractorData[0]) : 0;

    const tabs = [
        { key: "tenders", label: "Available Tenders", icon: "📋" },
        { key: "bid", label: "Submit Bid", icon: "🔐" },
        { key: "reveal", label: "Reveal Bid", icon: "👁" },
        { key: "milestones", label: "My Milestones", icon: "🏗" },
    ];

    return (
        <div className="min-h-screen bg-[#050816] text-white">
            {/* Background */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 blur-[160px] rounded-full" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#050816]/80 border-b border-white/10 px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link to="/signup" className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition">
                        ← Switch Role
                    </Link>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        Contractor Dashboard
                    </h1>
                </div>
                <ConnectButton />
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Profile Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">{companyName || `Contractor #${contractorId}`}</h2>
                            <p className="text-sm text-gray-500 font-mono mt-1">{truncateAddress(address)}</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${isRegistered ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {isRegistered ? "✓ Verified on Chain" : "⏳ Pending Approval"}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Competence Score</p>
                            <p className="text-4xl font-bold text-cyan-400">{score}<span className="text-lg text-gray-500">/100</span></p>
                        </div>
                    </div>
                </div>

                {!isRegistered && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 text-amber-400 text-sm">
                        ⚠️ Your wallet has not been approved by a Government Official yet. You can browse tenders but cannot submit bids until approved.
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-xl border border-white/10 w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === tab.key
                                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>{tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "tenders" && <AvailableTendersTab tenders={allTenders} meta={tenderMeta} />}
                {activeTab === "bid" && <SubmitBidTab tenders={allTenders} meta={tenderMeta} refetch={refetchTenders} />}
                {activeTab === "reveal" && <RevealBidTab tenders={allTenders} meta={tenderMeta} />}
                {activeTab === "milestones" && <MyMilestonesTab tenders={allTenders} meta={tenderMeta} address={address} />}
            </div>
        </div>
    );
};


const AvailableTendersTab = ({ tenders, meta }) => {
    if (!tenders || tenders.length === 0) {
        return <EmptyState icon="📋" message="No tenders available" />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenders.map((t, i) => {
                const id = Number(t.tenderId);
                if (id === 0) return null;
                const phase = getTenderPhase(t);
                const info = meta[id] || {};
                return (
                    <Link
                        key={i}
                        to={`/tender/${id}`}
                        className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs text-gray-500 font-mono">#{id}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPhaseColor(phase)}`}>
                                {phase}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-cyan-400 transition">
                            {info.title || `Tender #${id}`}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {info.description || "Loading from IPFS..."}
                        </p>
                        {info.budget && <p className="text-sm text-blue-400 mb-3">Budget: {info.budget} ETH</p>}
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Commit: {timestampToDate(t.commitDeadline)}</p>
                            <p>Reveal: {timestampToDate(t.revealDeadline)}</p>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
};


const SubmitBidTab = ({ tenders, meta }) => {
    const [form, setForm] = useState({ tenderId: "", amount: "", secret: "" });
    const [status, setStatus] = useState("");
    const [hashPreview, setHashPreview] = useState("");

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) {
            setStatus("✅ Bid committed successfully! Remember your secret for the reveal phase.");
            setForm({ tenderId: "", amount: "", secret: "" });
            setHashPreview("");
        }
    }, [isSuccess]);

    
    useEffect(() => {
        if (form.amount && form.secret) {
            try {
                const secretBytes32 = pad(toHex(BigInt(form.secret)), { size: 32 });
                const hash = keccak256(encodePacked(
                    ["uint256", "bytes32"],
                    [BigInt(form.amount), secretBytes32]
                ));
                setHashPreview(hash);
            } catch {
                setHashPreview("Invalid input");
            }
        } else {
            setHashPreview("");
        }
    }, [form.amount, form.secret]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus("");

        try {
            const secretBytes32 = pad(toHex(BigInt(form.secret)), { size: 32 });
            const hash = keccak256(encodePacked(
                ["uint256", "bytes32"],
                [BigInt(form.amount), secretBytes32]
            ));

            setStatus("🔗 Sending commit transaction...");
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "submitBid",
                args: [BigInt(form.tenderId), hash],
            });
        } catch (err) {
            setStatus(` ${err.message}`);
        }
    };


    const commitTenders = tenders?.filter(t => Number(t.tenderId) > 0 && getTenderPhase(t) === "Commit") || [];

    return (
        <div className="max-w-2xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span>🔐</span> Submit Encrypted Bid
                </h2>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 text-sm text-blue-300">
                    💡 Your bid is encrypted on-chain. Enter a bid amount and a secret number.
                    You'll need both to reveal your bid later. <strong>Keep your secret safe!</strong>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField label="Select Tender">
                        <select
                            value={form.tenderId} required
                            onChange={e => setForm({ ...form, tenderId: e.target.value })}
                            className="form-input"
                        >
                            <option value="">Choose a tender...</option>
                            {commitTenders.map(t => {
                                const id = Number(t.tenderId);
                                const info = meta[id] || {};
                                return <option key={id} value={id}>{info.title || `Tender #${id}`}</option>;
                            })}
                        </select>
                    </FormField>

                    <FormField label="Bid Amount (in standard units, e.g. 5000)">
                        <input
                            type="number" value={form.amount} required
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                            placeholder="e.g. 5000"
                            className="form-input"
                        />
                    </FormField>

                    <FormField label="Secret Number (use as your password to reveal later)">
                        <input
                            type="number" value={form.secret} required
                            onChange={e => setForm({ ...form, secret: e.target.value })}
                            placeholder="e.g. 123456789"
                            className="form-input"
                        />
                    </FormField>

                    {hashPreview && hashPreview !== "Invalid input" && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                            <p className="text-xs text-gray-400 mb-1">Commit Hash Preview:</p>
                            <p className="text-xs font-mono text-cyan-400 break-all">{hashPreview}</p>
                        </div>
                    )}

                    {status && (
                        <div className={`p-3 rounded-lg text-sm ${status.startsWith("❌") ? "bg-red-500/10 text-red-400 border border-red-500/20" : status.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                            {status}
                        </div>
                    )}

                    <button type="submit" disabled={isPending || !commitTenders.length}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isPending ? "⏳ Committing Bid..." : "Submit Encrypted Bid"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const RevealBidTab = ({ tenders, meta }) => {
    const [form, setForm] = useState({ tenderId: "", amount: "", secret: "" });
    const [status, setStatus] = useState("");

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) {
            setStatus("✅ Bid revealed successfully!");
            setForm({ tenderId: "", amount: "", secret: "" });
        }
    }, [isSuccess]);

    const handleReveal = (e) => {
        e.preventDefault();
        setStatus("");

        try {
            const secretBytes32 = pad(toHex(BigInt(form.secret)), { size: 32 });

            setStatus("🔗 Sending reveal transaction...");
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "revealBid",
                args: [BigInt(form.tenderId), BigInt(form.amount), secretBytes32],
            });
        } catch (err) {
            setStatus(`❌ ${err.message}`);
        }
    };

    const revealTenders = tenders?.filter(t => Number(t.tenderId) > 0 && getTenderPhase(t) === "Reveal") || [];

    return (
        <div className="max-w-2xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span>👁</span> Reveal Your Bid
                </h2>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 text-sm text-amber-300">
                    ⚠️ Enter the <strong>exact same amount and secret</strong> you used during the commit phase.
                    If they don't match, the reveal will fail.
                </div>

                <form onSubmit={handleReveal} className="space-y-5">
                    <FormField label="Select Tender">
                        <select
                            value={form.tenderId} required
                            onChange={e => setForm({ ...form, tenderId: e.target.value })}
                            className="form-input"
                        >
                            <option value="">Choose a tender...</option>
                            {revealTenders.map(t => {
                                const id = Number(t.tenderId);
                                const info = meta[id] || {};
                                return <option key={id} value={id}>{info.title || `Tender #${id}`}</option>;
                            })}
                        </select>
                    </FormField>

                    <FormField label="Bid Amount (same as commit)">
                        <input type="number" value={form.amount} required
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                            placeholder="e.g. 5000" className="form-input" />
                    </FormField>

                    <FormField label="Secret Number (same as commit)">
                        <input type="number" value={form.secret} required
                            onChange={e => setForm({ ...form, secret: e.target.value })}
                            placeholder="e.g. 123456789" className="form-input" />
                    </FormField>

                    {status && (
                        <div className={`p-3 rounded-lg text-sm ${status.startsWith("❌") ? "bg-red-500/10 text-red-400 border border-red-500/20" : status.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                            {status}
                        </div>
                    )}

                    <button type="submit" disabled={isPending || !revealTenders.length}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition-all duration-300 shadow-lg shadow-amber-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isPending ? "⏳ Revealing..." : "Reveal Bid"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const MyMilestonesTab = ({ tenders, meta, address }) => {
    // Find tenders where this address is the winner
    const wonTenders = tenders?.filter(t => Number(t.tenderId) > 0 && t.winnerSelected && t.winner?.toLowerCase() === address?.toLowerCase()) || [];

    if (wonTenders.length === 0) {
        return <EmptyState icon="🏗" message="You have not won any tenders yet" />;
    }

    return (
        <div className="space-y-6">
            {wonTenders.map(t => {
                const id = Number(t.tenderId);
                const info = meta[id] || {};
                return <MilestoneTenderCard key={id} tenderId={id} tenderInfo={info} />;
            })}
        </div>
    );
};

const MilestoneTenderCard = ({ tenderId, tenderInfo }) => {
    const { data: milestones } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getMilestones",
        args: [BigInt(tenderId)],
    });

    const [uploadingIdx, setUploadingIdx] = useState(null);
    const [proofStatus, setProofStatus] = useState("");

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) {
            setProofStatus("✅ Proof uploaded!");
            setUploadingIdx(null);
        }
    }, [isSuccess]);

    const handleUploadProof = async (milestoneId) => {
        setUploadingIdx(milestoneId);
        setProofStatus("");
        try {
            const proofData = {
                tenderId, milestoneId,
                submittedAt: new Date().toISOString(),
                status: "completed",
            };
            const hash = await uploadToIPFS(proofData, `proof_${tenderId}_${milestoneId}`);
            setProofStatus("🔗 Submitting proof on-chain...");

            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "uploadMilestoneProof",
                args: [BigInt(tenderId), BigInt(milestoneId), hash],
            });
        } catch (err) {
            setProofStatus(`❌ ${err.message}`);
            setUploadingIdx(null);
        }
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">{tenderInfo.title || `Tender #${tenderId}`}</h3>

            {proofStatus && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${proofStatus.startsWith("❌") ? "bg-red-500/10 text-red-400" : proofStatus.startsWith("✅") ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"}`}>
                    {proofStatus}
                </div>
            )}

            {!milestones || milestones.length === 0 ? (
                <p className="text-gray-400 text-sm">No milestones set for this tender.</p>
            ) : (
                <div className="space-y-3">
                    {milestones.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                            <div>
                                <p className="font-medium">{m.description}</p>
                                <div className="flex gap-3 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${m.approved ? 'bg-green-500/20 text-green-400' : m.ipfsProofHash ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                        {m.approved ? "✓ Approved" : m.ipfsProofHash ? "📤 Proof Submitted" : "Pending"}
                                    </span>
                                    {m.paid && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">💰 Paid</span>}
                                </div>
                            </div>
                            <div className="text-right flex items-center gap-4">
                                <span className="text-cyan-400 font-medium">{Number(m.paymentAmount) > 0 ? `${Number(m.paymentAmount)} wei` : ""}</span>
                                {!m.ipfsProofHash && !m.approved && (
                                    <button
                                        onClick={() => handleUploadProof(idx)}
                                        disabled={uploadingIdx === idx || isPending}
                                        className="px-4 py-2 text-sm rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition disabled:opacity-50"
                                    >
                                        {uploadingIdx === idx ? "📤..." : "Upload Proof"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const FormField = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        {children}
    </div>
);

const EmptyState = ({ icon, message }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <p className="text-gray-400 text-lg">{message}</p>
    </div>
);

export default ContractorDashboard;
