import { useState } from "react";
import { Link } from "react-router-dom";
import { useConnectModal, ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useDisconnect } from "wagmi";

const GovernmentLogin = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        employeeId: "",
        department: "",
        position: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const { openConnectModal } = useConnectModal();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    const isFormValid =
        formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.employeeId.trim() !== "" &&
        formData.department !== "" &&
        formData.position.trim() !== "";

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) {
            alert("Please fill in all fields.");
            return;
        }
        if (!isConnected) {
            alert("Please connect your wallet before submitting.");
            return;
        }
        console.log("Government Login Data:", { ...formData, walletAddress: address });
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#0B1220]">

            {/* Background effects */}
            <div className="absolute top-[-200px] left-[-200px] w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[180px] animate-pulse" />
            <div className="absolute bottom-[-200px] right-[-200px] w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[200px] animate-pulse" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Sticky Top Bar */}
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

                    {/* Header */}
                    <div className="text-center mb-10">
                        <p className="text-gray-400 text-lg">
                            Sign in with your official credentials
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="relative">
                        {/* Overlay when wallet not connected */}
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
                            className={`bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl transition-all duration-300 ${!isConnected ? 'opacity-40 pointer-events-none' : ''}`}
                        >

                            {/* Name */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Official Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@gov.in"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                                    required
                                />
                            </div>

                            {/* Employee ID */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Employee ID
                                </label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={formData.employeeId}
                                    onChange={handleChange}
                                    placeholder="e.g. GOV-20240001"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                                    required
                                />
                            </div>

                            {/* Department */}
                            <div className="mb-5">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Department
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
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

                            {/* Position */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Position
                                </label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Procurement Officer"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition"
                                    required
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={!isFormValid || !isConnected}
                                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${isFormValid && isConnected
                                    ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 cursor-pointer"
                                    : "bg-blue-600/40 text-white/50 cursor-not-allowed"
                                    }`}
                            >
                                Login
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
