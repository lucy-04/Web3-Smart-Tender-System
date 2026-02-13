import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
    const location = useLocation();
    const path = location.pathname;

    const isHome = path === "/";
    const isSignup = path === "/signup";
    const isLogin = path === "/login-government" || path === "/login-tender";
    const isAdmin = path === "/admin";
    const isContractor = path === "/contractor";
    const isTenderDetail = path.startsWith("/tender/");
    const showConnect = isAdmin || isContractor || isTenderDetail;

    return (
        <nav className="w-full flex items-center justify-between px-8 md:px-24 py-5 border-b border-white/10 bg-[#0B1220]/90 backdrop-blur-md sticky top-0 z-50">
            <Link to="/" className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-600/30">
                    W3
                </div>
                <span className="text-xl font-semibold tracking-wide">
                    Web3Tender
                </span>
            </Link>

            <div className="flex items-center gap-4">
                {isAdmin && (
                    <Link
                        to="/signup"
                        className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all duration-300"
                    >
                        ← Switch Role
                    </Link>
                )}

                {isContractor && (
                    <Link
                        to="/signup"
                        className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all duration-300"
                    >
                        ← Switch Role
                    </Link>
                )}

                {isTenderDetail && (
                    <button
                        onClick={() => window.history.back()}
                        className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all duration-300"
                    >
                        ← Back
                    </button>
                )}

                {isHome && (
                    <Link
                        to="/signup"
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-sm font-semibold transition-all duration-300 shadow-md shadow-blue-600/30"
                    >
                        Get Started
                    </Link>
                )}

                {isLogin && (
                    <Link
                        to="/signup"
                        className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-medium transition-all duration-300"
                    >
                        ← Back
                    </Link>
                )}

                {showConnect && <ConnectButton />}
            </div>
        </nav>
    );
};

export default Navbar;
