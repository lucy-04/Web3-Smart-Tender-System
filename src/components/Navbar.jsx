import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import ConnectButton from "./ConnectButton";
import RoleBadge from "./RoleBadge";

const Navbar = () => {
    const location = useLocation();
    const { address, truncatedAddress, isConnected, isChainValid } = useWallet();

    const isHome = location.pathname === "/";
    const isSignup = location.pathname === "/signup";
    const isLogin =
        location.pathname === "/login-government" ||
        location.pathname === "/login-tender";

    return (
        <nav className="w-full flex items-center justify-between px-24 py-6 border-b border-white/10 bg-[#0B1220]/90 backdrop-blur-md sticky top-0 z-50">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-sm font-bold">
                    W3
                </div>
                <span className="text-2xl font-semibold tracking-wide">
                    Web3Tender
                </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
                {/* Role Badge - Show when connected */}
                {isConnected && isChainValid && <RoleBadge />}

                {/* Wallet Connection Status */}
                {isConnected && (
                    <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${isChainValid ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-gray-400">
                            {truncatedAddress}
                        </span>
                    </div>
                )}

                {/* Connect Button */}
                <ConnectButton />

                {/* Sign Up button (only on home when not connected) */}
                {isHome && !isConnected && (
                    <Link
                        to="/signup"
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition shadow-md shadow-blue-600/30"
                    >
                        Sign Up
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
