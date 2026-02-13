import { Link } from "react-router-dom";

const Signup = () => {
    return (
        <div className="relative min-h-screen flex items-center px-20 overflow-hidden bg-[#0B1220]">

            <div className="absolute top-[-200px] left-[-200px] w-[700px] h-[700px] bg-blue-600/20 rounded-full blur-[180px] animate-pulse" />


            <div className="absolute bottom-[-200px] right-[-200px] w-[700px] h-[700px] bg-indigo-500/10 rounded-full blur-[200px] animate-pulse" />


            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="w-1/2 pr-16">

                <h1 className="text-5xl font-bold leading-tight mb-6">
                    Secure Access to the
                    <span className="text-blue-400"> Smart Tender Ecosystem</span>
                </h1>

                <p className="text-gray-400 text-lg mb-10 max-w-xl">
                    Choose your role to enter a fully auditable, transparent and blockchain-powered procurement infrastructure.
                </p>

                <Link
                    to="/"
                    className="inline-block px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                >
                    ← Back to Home
                </Link>

            </div>


            <div className="w-1/2 flex flex-col gap-8">

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


            </div>

        </div>
    );
};

export default Signup;
