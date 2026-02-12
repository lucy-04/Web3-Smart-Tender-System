import React from 'react';

const ContractorDashboard = () => {
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Contractor Dashboard</h1>
            <div className="glass-panel mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Acme Corp</h2>
                        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">Verified</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">Competence Score</div>
                        <div className="text-3xl font-bold text-indigo-400">85/100</div>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">My Bids</h2>
            <div className="glass-panel">
                <p className="text-gray-400 text-center py-8">No active bids found.</p>
            </div>
        </div>
    );
};

export default ContractorDashboard;
