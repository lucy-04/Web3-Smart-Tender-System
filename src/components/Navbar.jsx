import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'text-white font-bold border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white';
    };

    return (
        <nav className="glass-panel mb-8 sticky top-4 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    <Link to="/">Web3Tender</Link>
                </div>

                <div className="flex gap-6 items-center">
                    <Link to="/" className={isActive('/')}>Home</Link>
                    <Link to="/register" className={isActive('/register')}>Register</Link>
                    <Link to="/admin" className={isActive('/admin')}>Admin</Link>
                    <Link to="/contractor" className={isActive('/contractor')}>Dashboard</Link>
                </div>

                <div>
                    <ConnectButton showBalance={false} />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
