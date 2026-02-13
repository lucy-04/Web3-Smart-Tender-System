import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
    const location = useLocation();

    const isHome = location.pathname === "/";
    const isLogin =
        location.pathname === "/login-government" ||
        location.pathname === "/login-tender";

    return (
        <nav className="w-full flex items-center justify-between px-24 py-6 border-b border-white/10 bg-[#0B1220]/90 backdrop-blur-md sticky top-0 z-50">

            <Link to="/" className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-sm font-bold">
                    W3
                </div>
                <span className="text-2xl font-semibold tracking-wide">
                    Web3Tender
                </span>
            </Link>

            <div>
                {isHome && (
                    <Link
                        to="/signup"
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold transition shadow-md shadow-blue-600/30"
                    >
                        Sign Up
                    </Link>
                )}

                {isLogin && (
                    <Link
                        to="/"
                        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition border border-white/10"
                    >
                        ← Home
                    </Link>
                )}
            </div>

        </nav>
    );
};

export default Navbar;
