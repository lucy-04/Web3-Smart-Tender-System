import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useConnectModal, ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../config";

const GovernmentLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        employeeId: "",
        department: "",
        position: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();


    const { data: isGovOfficial, isLoading: isCheckingGov } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "governmentOfficials",
        args: address ? [address] : undefined,
        enabled: !!address,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const isFormValid =
        formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.employeeId.trim() !== "" &&
        formData.department !== "" &&
        formData.position.trim() !== "";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setError("Please fill in all fields.");
            return;
        }
        if (!isConnected) {
            setError("Please connect your wallet first.");
            return;
        }

        setLoading(true);
        setError("");


        if (!isGovOfficial) {
            setError("This wallet is not registered as a Government Official on the blockchain. Please contact the contract deployer.");
            setLoading(false);
            return;
        }


        localStorage.setItem("govProfile", JSON.stringify({ ...formData, walletAddress: address }));
        setLoading(false);
        navigate("/admin");
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0B1220]">

            <div className="absolute top-[-200px] left-[-200px] w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[180px] animate-pulse" />
            <div className="absolute bottom-[-200px] right-[-200px] w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[200px] animate-pulse" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 px-12 py-5 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link
                        to="/signup"
                        className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium text-sm transition-all duration-300"
                    >
                        ← Back to Role Selection
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-wide">
                        Government Portal
                    </h1>
                </div>
                <ConnectButton />
            </div>

            <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
                <div className="relative z-10 w-full max-w-lg px-6 py-12">
                    <div className="text-center mb-10">
                        <p className="text-gray-400 text-lg">
                            Sign in with your official credentials
                        </p>
                    </div>

                    <div className="relative">                        {/* Overlay when wallet not connected */}
                        {!isConnected && (
                            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4">
                                <div className="text-4xl">🔒</div>
                                <p className="text-gray-300 font-medium text-center px-8">
                                    Connect your wallet first to access the form
                                </p>
                                <button
                                    type="button"
                                    onClick={openConnectModal}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-600/30"
                                >
                                    🔗 Connect Wallet
                                </button>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className={`bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl transition-all duration-300 ${!isConnected ? "opacity-40 pointer-events-none" : ""}`}
                        >
                           
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                                    required
                                />
                            </div>

           
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Official Email</label>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    placeholder="you@gov.in"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                                    required
                                />
                            </div>

            
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Employee ID</label>
                                <input
                                    type="text" name="employeeId" value={formData.employeeId} onChange={handleChange}
                                    placeholder="e.g. GOV-20240001"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                                    required
                                />
                            </div>

            
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                                <select
                                    name="department" value={formData.department} onChange={handleChange}
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" disabled className="bg-[#0B1220]">Select Department</option>
                                    <option value="public-works" className="bg-[#0B1220]">Public Works</option>
                                    <option value="finance" className="bg-[#0B1220]">Finance</option>
                                    <option value="health" className="bg-[#0B1220]">Health</option>
                                    <option value="education" className="bg-[#0B1220]">Education</option>
                                    <option value="transport" className="bg-[#0B1220]">Transport</option>
                                    <option value="it" className="bg-[#0B1220]">Information Technology</option>
                                    <option value="defense" className="bg-[#0B1220]">Defense</option>
                                    <option value="other" className="bg-[#0B1220]">Other</option>
                                </select>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
                                <input
                                    type="text" name="position" value={formData.position} onChange={handleChange}
                                    placeholder="e.g. Senior Procurement Officer"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                                    required
                                />
                            </div>

      
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            
                            <button
                                type="submit"
                                disabled={!isFormValid || !isConnected || loading || isCheckingGov}
                                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${isFormValid && isConnected && !loading
                                    ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:scale-[1.02] shadow-[0_0_25px_rgba(0,255,255,0.3)] cursor-pointer"
                                    : "bg-gray-700/50 text-white/50 cursor-not-allowed"
                                    }`}
                            >
                                {loading ? "Verifying on Blockchain..." : isCheckingGov ? "Checking wallet..." : "Login"}
                            </button>

                            {!isFormValid && isConnected && (
                                <p className="text-red-400/80 text-xs text-center mt-3">
                                    * All fields are required
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovernmentLogin;
