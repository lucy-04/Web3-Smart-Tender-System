import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { uploadToIPFS, fetchFromIPFS } from "../ipfs";
import { dateToTimestamp, timestampToDate, getTenderPhase, getPhaseColor, truncateAddress } from "../utils/formatters";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const [activeTab, setActiveTab] = useState("tenders");
    const [tenderMeta, setTenderMeta] = useState({});

    // Verify gov status
    const { data: isGov } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "governmentOfficials",
        args: address ? [address] : undefined,
        enabled: !!address,
    });

    // Redirect if not gov
    useEffect(() => {
        if (isConnected && isGov === false) navigate("/login-government");
    }, [isConnected, isGov, navigate]);

    // Fetch all tenders
    const { data: allTenders, refetch: refetchTenders } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getAllTenders",
    });

    // Fetch contractor list
    const { data: contractorList } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getContractorList",
    });

    // Fetch IPFS metadata for tenders
    useEffect(() => {
        if (!allTenders) return;
        allTenders.forEach(async (t) => {
            const id = Number(t.tenderId);
            if (id === 0 || tenderMeta[id]) return;
            const meta = await fetchFromIPFS(t.ipfsTenderHash);
            if (meta) setTenderMeta(prev => ({ ...prev, [id]: meta }));
        });
    }, [allTenders]);

    const tabs = [
        { key: "tenders", label: "All Tenders", icon: "📋" },
        { key: "create", label: "Create Tender", icon: "✨" },
        { key: "contractors", label: "Contractors", icon: "👷" },
        { key: "approve", label: "Approve Contractor", icon: "✅" },
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
                        Government Dashboard
                    </h1>
                </div>
                <ConnectButton />
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
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

                {/* Tab Content */}
                {activeTab === "tenders" && <AllTendersTab tenders={allTenders} meta={tenderMeta} />}
                {activeTab === "create" && <CreateTenderTab refetch={refetchTenders} />}
                {activeTab === "contractors" && <ContractorsTab contractorList={contractorList} />}
                {activeTab === "approve" && <ApproveContractorTab refetch={refetchTenders} />}
            </div>
        </div>
    );
};

// ============================================================
// ALL TENDERS TAB
// ============================================================
const AllTendersTab = ({ tenders, meta }) => {
    if (!tenders || tenders.length === 0) {
        return <EmptyState icon="📋" message="No tenders created yet" />;
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
                        {info.budget && (
                            <p className="text-sm text-blue-400 mb-3">Budget: {info.budget} ETH</p>
                        )}
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Commit: {timestampToDate(t.commitDeadline)}</p>
                            <p>Reveal: {timestampToDate(t.revealDeadline)}</p>
                        </div>
                        {t.winnerSelected && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                                <p className="text-xs text-green-400">
                                    Winner: {truncateAddress(t.winner)}
                                </p>
                            </div>
                        )}
                    </Link>
                );
            })}
        </div>
    );
};

// ============================================================
// CREATE TENDER TAB
// ============================================================
const CreateTenderTab = ({ refetch }) => {
    const [form, setForm] = useState({ title: "", description: "", budget: "", commitDeadline: "", revealDeadline: "" });
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState("");

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) {
            setStatus("✅ Tender created successfully!");
            setForm({ title: "", description: "", budget: "", commitDeadline: "", revealDeadline: "" });
            refetch?.();
        }
    }, [isSuccess]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("");

        if (!form.commitDeadline || !form.revealDeadline) {
            setStatus("❌ Please set both deadlines");
            return;
        }

        const commitTs = dateToTimestamp(form.commitDeadline);
        const revealTs = dateToTimestamp(form.revealDeadline);
        const now = Math.floor(Date.now() / 1000);

        if (commitTs <= now) {
            setStatus("❌ Commit deadline must be in the future");
            return;
        }
        if (revealTs <= commitTs) {
            setStatus("❌ Reveal deadline must be after commit deadline");
            return;
        }

        try {
            setUploading(true);
            setStatus("📤 Uploading tender details to IPFS...");
            const ipfsHash = await uploadToIPFS({
                title: form.title,
                description: form.description,
                budget: form.budget,
                createdAt: new Date().toISOString(),
            }, `tender_${Date.now()}`);

            setStatus("🔗 Sending transaction to blockchain...");
            setUploading(false);

            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "createTender",
                args: [ipfsHash, BigInt(commitTs), BigInt(revealTs)],
            });
        } catch (err) {
            setStatus(`❌ Error: ${err.message}`);
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span>✨</span> Create New Tender
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField label="Tender Title">
                        <input
                            type="text" value={form.title} required
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Highway Construction Phase II"
                            className="form-input"
                        />
                    </FormField>

                    <FormField label="Description">
                        <textarea
                            value={form.description} required rows={4}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Detailed description of the tender requirements..."
                            className="form-input resize-none"
                        />
                    </FormField>

                    <FormField label="Estimated Budget (ETH)">
                        <input
                            type="number" step="0.01" value={form.budget} required
                            onChange={e => setForm({ ...form, budget: e.target.value })}
                            placeholder="e.g. 50"
                            className="form-input"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Commit Deadline">
                            <input
                                type="datetime-local" value={form.commitDeadline} required
                                onChange={e => setForm({ ...form, commitDeadline: e.target.value })}
                                className="form-input"
                            />
                        </FormField>
                        <FormField label="Reveal Deadline">
                            <input
                                type="datetime-local" value={form.revealDeadline} required
                                onChange={e => setForm({ ...form, revealDeadline: e.target.value })}
                                className="form-input"
                            />
                        </FormField>
                    </div>

                    {status && (
                        <div className={`p-3 rounded-lg text-sm ${status.startsWith("❌") ? "bg-red-500/10 text-red-400 border border-red-500/20" : status.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                            {status}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending || uploading}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "⏳ Confirming Transaction..." : uploading ? "📤 Uploading to IPFS..." : "Publish Tender"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ============================================================
// CONTRACTORS TAB
// ============================================================
const ContractorsTab = ({ contractorList }) => {
    if (!contractorList || contractorList.length === 0) {
        return <EmptyState icon="👷" message="No contractors registered yet" />;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Registered Contractors ({contractorList.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contractorList.map((addr, i) => (
                    <ContractorCard key={i} address={addr} />
                ))}
            </div>
        </div>
    );
};

const ContractorCard = ({ address: contractorAddr }) => {
    const { data } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getContractorDetails",
        args: [contractorAddr],
    });

    if (!data) return null;
    const [id, registered, companyName, ipfsHash, score] = data;

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <p className="font-semibold">{companyName || `Contractor #${Number(id)}`}</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{truncateAddress(contractorAddr)}</p>
                </div>
                <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${registered ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {registered ? "Verified" : "Pending"}
                    </span>
                </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <span className="text-sm text-gray-400">Competence Score</span>
                <span className="text-lg font-bold text-cyan-400">{Number(score)}/100</span>
            </div>
        </div>
    );
};

// ============================================================
// APPROVE CONTRACTOR TAB
// ============================================================
const ApproveContractorTab = () => {
    const [form, setForm] = useState({ address: "", score: "", ipfsHash: "" });
    const [status, setStatus] = useState("");

    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) {
            setStatus("✅ Contractor approved successfully!");
            setForm({ address: "", score: "", ipfsHash: "" });
        }
    }, [isSuccess]);

    const handleApprove = (e) => {
        e.preventDefault();
        setStatus("");

        const score = parseInt(form.score);
        if (isNaN(score) || score < 0 || score > 100) {
            setStatus("❌ Score must be between 0 and 100");
            return;
        }

        try {
            setStatus("🔗 Sending approval transaction...");
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: "approveContractor",
                args: [form.address, form.ipfsHash || "", BigInt(score)],
            });
        } catch (err) {
            setStatus(`❌ ${err.message}`);
        }
    };

    return (
        <div className="max-w-2xl">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span>✅</span> Approve Contractor
                </h2>
                <form onSubmit={handleApprove} className="space-y-5">
                    <FormField label="Contractor Wallet Address">
                        <input
                            type="text" value={form.address} required
                            onChange={e => setForm({ ...form, address: e.target.value })}
                            placeholder="0x..."
                            className="form-input font-mono"
                        />
                    </FormField>

                    <FormField label="IPFS Profile Hash (from contractor application)">
                        <input
                            type="text" value={form.ipfsHash}
                            onChange={e => setForm({ ...form, ipfsHash: e.target.value })}
                            placeholder="Qm..."
                            className="form-input font-mono"
                        />
                    </FormField>

                    <FormField label="AI Competence Score (0-100)">
                        <input
                            type="number" min="0" max="100" value={form.score} required
                            onChange={e => setForm({ ...form, score: e.target.value })}
                            placeholder="e.g. 85"
                            className="form-input"
                        />
                    </FormField>

                    {status && (
                        <div className={`p-3 rounded-lg text-sm ${status.startsWith("❌") ? "bg-red-500/10 text-red-400 border border-red-500/20" : status.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                            {status}
                        </div>
                    )}

                    <button
                        type="submit" disabled={isPending}
                        className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? "⏳ Processing..." : "Approve Contractor"}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ============================================================
// SHARED COMPONENTS
// ============================================================
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

export default AdminDashboard;
