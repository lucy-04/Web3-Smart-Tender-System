import React from 'react';
import { useParams } from 'react-router-dom';

const TenderDetails = () => {
    const { id } = useParams();

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-2">Road Construction Project #{id}</h1>
            <div className="flex gap-4 mb-6">
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">Open</span>
                <span className="text-gray-400 py-1">Expires in 3 days</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="glass-panel mb-6">
                        <h3 className="text-xl font-bold mb-4">Description</h3>
                        <p className="text-gray-300 leading-relaxed">
                            This project involves the reconstruction of the main highway connecting the city center to the industrial district.
                            Requirements include asphalt layering, drainage system improvements, and street lighting installation.
                        </p>
                    </div>

                    <div className="glass-panel">
                        <h3 className="text-xl font-bold mb-4">Milestones</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-lg flex justify-between">
                                <span>1. Initial Survey & Planning</span>
                                <span className="text-indigo-400">10 ETH</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg flex justify-between">
                                <span>2. Foundation Work</span>
                                <span className="text-indigo-400">20 ETH</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-lg flex justify-between">
                                <span>3. Final Paving & Finishing</span>
                                <span className="text-indigo-400">20 ETH</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="glass-panel sticky top-24">
                        <h3 className="text-xl font-bold mb-4">Place a Bid</h3>
                        <form>
                            <div className="mb-4">
                                <label className="block text-sm mb-2">Bid Amount (ETH)</label>
                                <input type="number" step="0.01" className="w-full" placeholder="0.00" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm mb-2">Time to Complete (Days)</label>
                                <input type="number" className="w-full" placeholder="30" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm mb-2">Proposal Document URL</label>
                                <input type="url" className="w-full" placeholder="https://..." />
                            </div>
                            <button className="btn-primary w-full">Submit Encrypted Bid</button>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                                Your bid will be encrypted and only revealed after the deadline.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TenderDetails;
