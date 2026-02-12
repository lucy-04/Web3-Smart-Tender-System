import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-6">Government Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Pending Approvals</h2>
                    <div className="glass-panel">
                        <p className="text-gray-400 text-center py-8">No pending contractor requests.</p>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Create New Tender</h2>
                    <div className="glass-panel">
                        <form>
                            <input type="text" placeholder="Tender Title" className="mb-3" />
                            <textarea placeholder="Description" rows="3" className="mb-3"></textarea>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Budget (ETH)" />
                                <input type="date" placeholder="Deadline" />
                            </div>
                            <button className="btn-primary w-full mt-2">Publish Tender</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
