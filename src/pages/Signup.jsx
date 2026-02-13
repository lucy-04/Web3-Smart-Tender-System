import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";
import { truncateAddress } from "../utils/formatters";

const Signup = () => {
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const { openConnectModal } = useConnectModal();
    const [hasAutoRouted, setHasAutoRouted] = useState(false);

    // Check if connected wallet is a government official
    const { data: isGov, isLoading: isCheckingGov } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "governmentOfficials",
        args: address ? [address] : undefined,
        enabled: !!address,
    });

    // Check if connected wallet is a registered contractor
    const { data: contractorData, isLoading: isCheckingContractor } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "getContractorDetails",
        args: address ? [address] : undefined,
        enabled: !!address,
    });

    const isContractor = contractorData?.[1]; // registered boolean
    const isLoading = isCheckingGov || isCheckingContractor;

    // Auto-route based on on-chain role
    useEffect(() => {
        if (!isConnected || isLoading || hasAutoRouted) return;

        if (isGov) {
            setHasAutoRouted(true);
            navigate("/admin");
        } else if (isContractor) {
            setHasAutoRouted(true);
            navigate("/contractor");
        }
    }, [isConnected, isGov, isContractor, isLoading, hasAutoRouted, navigate]);

    return (
        <div className="relative min-h-screen flex items-center px-20 overflow-hidden bg-[#0B1220]">
            <div className="absolute top-[-200px] left-[-200px] w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[180px] animate-pulse" />
            <div className="absolute bottom-[-200px] right-[-200px] w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[200px] animate-pulse" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="w-1/2 pr-16 relative z-10">
                <h1 className="text-5xl font-bold leading-tight mb-6">
                    Secure Access to the
                    <span className="text-blue-400"> Smart Tender Ecosystem</span>
                </h1>

                <p className="text-gray-400 text-lg mb-8 max-w-xl">
                    Connect your wallet to automatically detect your role on the blockchain, or choose your portal below.
                </p>

                {/* Wallet Status */}
                {!isConnected ? (
                    <button
                        onClick={openConnectModal}
                        className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-600/30 hover:scale-105 mb-6"
                    >
                        🔗 Connect Wallet to Auto-Detect Role
                    </button>
                ) : (
                    <div className="mb-6 space-y-3">
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 w-fit">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-sm text-gray-300">Connected: <span className="font-mono text-cyan-400">{truncateAddress(address)}</span></span>
                        </div>

                        {isLoading && (
                            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-3 w-fit">
                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                <span className="text-sm text-blue-300">Checking your role on the blockchain...</span>
                            </div>
                        )}

                        {!isLoading && isGov && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 w-fit">
                                <p className="text-green-400 font-medium">✓ Government Official detected — redirecting to dashboard...</p>
                            </div>
                        )}

                        {!isLoading && isContractor && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3 w-fit">
                                <p className="text-green-400 font-medium">✓ Registered Contractor detected — redirecting to dashboard...</p>
                            </div>
                        )}

                        {!isLoading && !isGov && !isContractor && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3 w-fit">
                                <p className="text-amber-400 text-sm">No role found on-chain for this wallet. Choose a portal below to get started.</p>
                            </div>
                        )}
                    </div>
                )}

                <Link
                    to="/"
                    className="inline-block px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                    ← Back to Home
                </Link>
            </div>

            <div className="w-1/2 flex flex-col gap-8 relative z-10">
                {/* Government Portal Card */}
                {isConnected && isGov ? (
                    <Link
                        to="/admin"
                        className="group relative bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-10 transition-all duration-500 hover:scale-[1.04] hover:shadow-2xl hover:shadow-green-600/30 overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-green-600/10 via-transparent to-green-600/10 blur-2xl" />
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">✓ VERIFIED</span>
                            </div>
                            <h2 className="text-2xl font-semibold mb-3 group-hover:text-green-400 transition">
                                Government Dashboard
                            </h2>
                            <p className="text-gray-400 mb-6">
                                You are registered as a Government Official. Access your dashboard to create tenders, approve contractors, and manage the procurement process.
                            </p>
                            <div className="flex items-center gap-2 text-green-400 font-medium transition-all duration-300 group-hover:translate-x-2">
                                Go to Dashboard →
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link
                        to="/login-government"
                        className="group relative bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-10 transition-all duration-500 hover:scale-[1.04] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-600/30 overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10 blur-2xl" />
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-700" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-semibold mb-3 group-hover:text-blue-400 transition">
                                Government Portal
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Create tenders, evaluate bids and maintain transparent procurement workflows.
                            </p>
                            <div className="flex items-center gap-2 text-blue-400 font-medium transition-all duration-300 group-hover:translate-x-2">
                                Enter Portal →
                            </div>
                        </div>
                    </Link>
                )}

                {/* Contractor Portal Card */}
                {isConnected && isContractor ? (
                    <Link
                        to="/contractor"
                        className="group relative bg-gradient-to-br from-green-500/20 via-green-500/10 to-transparent border border-green-500/30 rounded-2xl p-10 transition-all duration-500 hover:scale-[1.04] hover:shadow-2xl hover:shadow-green-600/30 overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-green-600/10 via-transparent to-green-600/10 blur-2xl" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-700" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">✓ REGISTERED</span>
                            </div>
                            <h2 className="text-2xl font-semibold mb-3 group-hover:text-green-400 transition">
                                Contractor Dashboard
                            </h2>
                            <p className="text-gray-400 mb-6">
                                You are a registered contractor. Access your dashboard to view tenders, submit bids, and manage milestones.
                            </p>
                            <div className="flex items-center gap-2 text-green-400 font-medium transition-all duration-300 group-hover:translate-x-2">
                                Go to Dashboard →
                            </div>
                        </div>
                    </Link>
                ) : (
                    <Link
                        to="/login-tender"
                        className="group relative bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-10 transition-all duration-500 hover:scale-[1.04] hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-600/30 overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-600/10 blur-2xl" />
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition duration-700" />
                        <div className="relative z-10">
                            <h2 className="text-2xl font-semibold mb-3 group-hover:text-blue-400 transition">
                                Contractor Portal
                            </h2>
                            <p className="text-gray-400 mb-6">
                                Submit bids, track tender progress and participate in secure blockchain-based evaluations.
                            </p>
                            <div className="flex items-center gap-2 text-blue-400 font-medium transition-all duration-300 group-hover:translate-x-2">
                                Enter Portal →
                            </div>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Signup;
