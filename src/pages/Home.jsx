import React from 'react';

const Home = () => {
    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-6">Open Tenders</h1>
            <div className="glass-panel p-8 text-center">
                <p className="text-xl text-gray-300">Welcome to the transparent and auditable government tender system.</p>
                <p className="mt-4 text-gray-400">Connect your wallet to get started or view active tenders below.</p>
            </div>

            {/* Tender list will go here */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="glass-panel hover:bg-white/5 transition-colors cursor-pointer">
                        <h3 className="text-xl font-bold mb-2">Road Construction Project #{item}</h3>
                        <p className="text-gray-400 mb-4">Infrastructure development for city center.</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Budget: 50 ETH</span>
                            <span>Ends in: 3 days</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
