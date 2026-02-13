import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { fetchFromIPFS, uploadToIPFS } from "../ipfs";
import { timestampToDate, getTenderPhase, getPhaseColor, truncateAddress } from "../utils/formatters";

const TenderDetails = () => {
    const { id } = useParams();
    const tenderId = parseInt(id);
    const { address, isConnected } = useAccount();
    const [meta, setMeta] = useState(null);
    const [activeSection, setActiveSection] = useState("overview");


    const { data: tender } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "tenders",
        args: [BigInt(tenderId)],
    });


    const { data: isGov } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "governmentOfficials",
        args: address ? [address] : undefined,
        enabled: !!address,
    });


    const { data: bidders } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getTenderBidders",
        args: [BigInt(tenderId)],
    });


    const { data: milestones, refetch: refetchMilestones } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getMilestones",
        args: [BigInt(tenderId)],
    });


    const { data: winnerData } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getTenderWinner",
        args: [BigInt(tenderId)],
    });


    const { data: tenderFunds } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "tenderFunds",
        args: [BigInt(tenderId)],
    });

    
    useEffect(() => {
        if (tender && tender[1]) {
            fetchFromIPFS(tender[1]).then(m => { if (m) setMeta(m); });
        }
    }, [tender]);

    if (!tender) {
        return (
            <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center">
                <div className="animate-pulse text-gray-400">Loading tender data...</div>
            </div>
        );
    }

   
    const tenderData = {
        tenderId: Number(tender[0]),
        ipfsTenderHash: tender[1],
        commitDeadline: tender[2],
        revealDeadline: tender[3],
        winnerSelected: tender[4],
        winner: tender[5],
        winningBidAmount: tender[6],
    };

    const phase = getTenderPhase(tenderData);

    const sections = [
        { key: "overview", label: "Overview", icon: "📄" },
        { key: "bidders", label: `Bidders (${bidders?.length || 0})`, icon: "👥" },
        { key: "milestones", label: `Milestones (${milestones?.length || 0})`, icon: "🏗" },
        ...(isGov ? [{ key: "manage", label: "Manage", icon: "⚙️" }] : []),
    ];

    return (
        <div className="min-h-screen bg-[#050816] text-white">
         
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 blur-[160px] rounded-full" />
            </div>


            <div className="sticky top-0 z-50 backdrop-blur-xl bg-[#050816]/80 border-b border-white/10 px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <button onClick={() => window.history.back()} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition">
                        ← Back
                    </button>
                    <h1 className="text-xl font-bold">
                        {meta?.title || `Tender #${tenderId}`}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPhaseColor(phase)}`}>
                        {phase} Phase
                    </span>
                </div>
                <ConnectButton />
            </div>

            <div className="max-w-6xl mx-auto px-8 py-8">
  
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        {["Commit", "Reveal", "Evaluation", "Completed"].map((p, i) => (
                            <div key={p} className="flex items-center flex-1">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${phase === p ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30" :
                                    ["Commit", "Reveal", "Evaluation", "Completed"].indexOf(phase) > i ? "bg-green-500/30 text-green-400" : "bg-white/10 text-gray-500"
                                    }`}>
                                    {["Commit", "Reveal", "Evaluation", "Completed"].indexOf(phase) > i ? "✓" : i + 1}
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className={`text-sm font-medium ${phase === p ? "text-cyan-400" : "text-gray-400"}`}>{p}</p>
                                    {i === 0 && <p className="text-xs text-gray-500">Until {timestampToDate(tenderData.commitDeadline)}</p>}
                                    {i === 1 && <p className="text-xs text-gray-500">Until {timestampToDate(tenderData.revealDeadline)}</p>}
                                </div>
                                {i < 3 && <div className={`w-full h-0.5 mx-4 ${["Commit", "Reveal", "Evaluation", "Completed"].indexOf(phase) > i ? "bg-green-500/30" : "bg-white/10"}`} />}
                            </div>
                        ))}
                    </div>
                </div>

           
                <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-xl border border-white/10 w-fit">
                    {sections.map(s => (
                        <button key={s.key} onClick={() => setActiveSection(s.key)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeSection === s.key
                                ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30"
                                : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                            <span className="mr-2">{s.icon}</span>{s.label}
                        </button>
                    ))}
                </div>

     
                {activeSection === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-4">Description</h3>
                                <p className="text-gray-300 leading-relaxed">{meta?.description || "Loading from IPFS..."}</p>
                            </div>

                            {tenderData.winnerSelected && winnerData && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold mb-4 text-green-400">🏆 Winner</h3>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{winnerData[1] || "Unnamed"}</p>
                                            <p className="text-sm text-gray-400 font-mono mt-1">{truncateAddress(winnerData[0])}</p>
                                            <p className="text-sm text-gray-400 mt-1">Score: {Number(winnerData[3])}/100</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-400">Winning Bid</p>
                                            <p className="text-2xl font-bold text-green-400">{Number(tenderData.winningBidAmount)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold mb-4">Details</h3>
                                <div className="space-y-3">
                                    <InfoRow label="Tender ID" value={`#${tenderId}`} />
                                    <InfoRow label="Budget" value={meta?.budget ? `${meta.budget} ETH` : "—"} />
                                    <InfoRow label="Commit Deadline" value={timestampToDate(tenderData.commitDeadline)} />
                                    <InfoRow label="Reveal Deadline" value={timestampToDate(tenderData.revealDeadline)} />
                                    <InfoRow label="Bidders" value={bidders?.length || 0} />
                                    <InfoRow label="Funds" value={tenderFunds ? `${Number(tenderFunds)} wei` : "0"} />
                                    <InfoRow label="IPFS Hash" value={truncateAddress(tenderData.ipfsTenderHash)} mono />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

             
                {activeSection === "bidders" && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4">Bidders</h3>
                        {!bidders || bidders.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No bids submitted yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {bidders.map((addr, i) => (
                                    <BidderRow key={i} bidderAddr={addr} tenderId={tenderId} isWinner={tenderData.winnerSelected && tenderData.winner?.toLowerCase() === addr.toLowerCase()} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

             
                {activeSection === "milestones" && (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4">Milestones</h3>
                        {!milestones || milestones.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No milestones set for this tender.</p>
                        ) : (
                            <div className="space-y-3">
                                {milestones.map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                        <div>
                                            <p className="font-medium">{idx + 1}. {m.description}</p>
                                            <div className="flex gap-3 mt-2">
                                                <span className={`text-xs px-2.5 py-1 rounded-full ${m.approved ? 'bg-green-500/20 text-green-400' : m.ipfsProofHash ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                    {m.approved ? "✓ Approved" : m.ipfsProofHash ? "📤 Proof Submitted" : "⏳ Pending"}
                                                </span>
                                                {m.paid && <span className="text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400">💰 Paid</span>}
                                            </div>
                                        </div>
                                        <span className="text-cyan-400 font-medium">{Number(m.paymentAmount) > 0 ? `${Number(m.paymentAmount)} wei` : ""}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                
                {activeSection === "manage" && isGov && (
                    <div className="space-y-6">
                        <EvaluateWinnerSection tenderId={tenderId} phase={phase} />
                        <FundTenderSection tenderId={tenderId} currentFunds={tenderFunds} />
                        <AddMilestoneSection tenderId={tenderId} refetch={refetchMilestones} />
                        <ApproveMilestoneSection tenderId={tenderId} milestones={milestones} refetch={refetchMilestones} />
                    </div>
                )}
            </div>
        </div>
    );
};


const BidderRow = ({ bidderAddr, tenderId, isWinner }) => {
    const { data: bidData } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "bids",
        args: [BigInt(tenderId), bidderAddr],
    });

    const { data: contractor } = useReadContract({
        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
        functionName: "getContractorDetails",
        args: [bidderAddr],
    });

    return (
        <div className={`flex items-center justify-between p-4 rounded-xl ${isWinner ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'}`}>
            <div>
                <p className="font-medium">{contractor?.[2] || truncateAddress(bidderAddr)}</p>
                <p className="text-xs text-gray-500 font-mono mt-1">{truncateAddress(bidderAddr)}</p>
                {isWinner && <span className="text-xs text-green-400 mt-1">🏆 Winner</span>}
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-400">
                    {bidData?.[2] ? `Revealed: ${Number(bidData[1])}` : "Not revealed yet"}
                </p>
                <p className="text-xs text-gray-500">Score: {contractor ? Number(contractor[4]) : "?"}/100</p>
            </div>
        </div>
    );
};


const EvaluateWinnerSection = ({ tenderId, phase }) => {
    const [status, setStatus] = useState("");
    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) setStatus("✅ Winner evaluated successfully!");
    }, [isSuccess]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">⚖️ Evaluate Winner</h3>
            {phase !== "Evaluation" ? (
                <p className="text-gray-400 text-sm">Winner can only be evaluated during the Evaluation phase (after reveal deadline).</p>
            ) : (
                <>
                    {status && <StatusBox status={status} />}
                    <button onClick={() => {
                        setStatus("🔗 Evaluating winner...");
                        writeContract({
                            address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
                            functionName: "evaluateWinner",
                            args: [BigInt(tenderId)],
                        });
                    }} disabled={isPending}
                        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 transition-all duration-300 shadow-lg shadow-purple-600/20 disabled:opacity-50">
                        {isPending ? "⏳ Processing..." : "Evaluate Winner"}
                    </button>
                </>
            )}
        </div>
    );
};

const FundTenderSection = ({ tenderId, currentFunds }) => {
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState("");
    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) { setStatus("Tender funded!"); setAmount(""); }
    }, [isSuccess]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">💰 Fund Tender</h3>
            <p className="text-sm text-gray-400 mb-4">Current balance: {currentFunds ? `${Number(currentFunds)} wei` : "0"}</p>
            <div className="flex gap-4">
                <input type="number" step="0.001" value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Amount in ETH" className="form-input flex-1" />
                <button onClick={() => {
                    if (!amount) return;
                    setStatus("🔗 Sending funds...");
                    writeContract({
                        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
                        functionName: "fundTender",
                        args: [BigInt(tenderId)],
                        value: parseEther(amount),
                    });
                }} disabled={isPending}
                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50">
                    {isPending ? "⏳..." : "Fund"}
                </button>
            </div>
            {status && <StatusBox status={status} />}
        </div>
    );
};

const AddMilestoneSection = ({ tenderId, refetch }) => {
    const [desc, setDesc] = useState("");
    const [payment, setPayment] = useState("");
    const [status, setStatus] = useState("");
    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) { setStatus("Milestone added!"); setDesc(""); setPayment(""); refetch?.(); }
    }, [isSuccess]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">📌 Add Milestone</h3>
            <div className="space-y-4">
                <input type="text" value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="Milestone description" className="form-input w-full" />
                <input type="number" value={payment} onChange={e => setPayment(e.target.value)}
                    placeholder="Payment amount (in wei)" className="form-input w-full" />
                <button onClick={() => {
                    if (!desc) return;
                    setStatus("🔗 Adding milestone...");
                    writeContract({
                        address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
                        functionName: "addMilestone",
                        args: [BigInt(tenderId), desc, BigInt(payment || 0)],
                    });
                }} disabled={isPending}
                    className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50">
                    {isPending ? "⏳..." : "Add Milestone"}
                </button>
            </div>
            {status && <StatusBox status={status} />}
        </div>
    );
};

const ApproveMilestoneSection = ({ tenderId, milestones, refetch }) => {
    const [status, setStatus] = useState("");
    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    useEffect(() => {
        if (isSuccess) { setStatus("✅ Milestone approved & payment sent!"); refetch?.(); }
    }, [isSuccess]);

    const pendingApproval = milestones?.map((m, i) => ({ ...m, idx: i })).filter(m => m.ipfsProofHash && !m.approved) || [];

    if (pendingApproval.length === 0) {
        return (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">✅ Approve Milestones</h3>
                <p className="text-gray-400 text-sm">No milestones pending approval.</p>
            </div>
        );
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">✅ Approve Milestones</h3>
            {status && <StatusBox status={status} />}
            <div className="space-y-3">
                {pendingApproval.map(m => (
                    <div key={m.idx} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div>
                            <p className="font-medium">{m.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Proof: {truncateAddress(m.ipfsProofHash)}</p>
                        </div>
                        <button onClick={() => {
                            setStatus("🔗 Approving...");
                            writeContract({
                                address: CONTRACT_ADDRESS, abi: CONTRACT_ABI,
                                functionName: "approveMilestone",
                                args: [BigInt(tenderId), BigInt(m.idx)],
                            });
                        }} disabled={isPending}
                            className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium transition disabled:opacity-50">
                            {isPending ? "⏳..." : "Approve & Pay"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const InfoRow = ({ label, value, mono }) => (
    <div className="flex justify-between">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`text-sm font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
);

const StatusBox = ({ status }) => (
    <div className={`mt-3 p-3 rounded-lg text-sm ${status.startsWith("❌") ? "bg-red-500/10 text-red-400 border border-red-500/20" : status.startsWith("✅") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
        {status}
    </div>
);

export default TenderDetails;
