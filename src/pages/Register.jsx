import React, { useState } from 'react';

const Register = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        registrationNumber: '',
        documentUrl: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registering:', formData);
        // Add logic to calculate AI score and submit to blockchain
    };

    return (
        <div className="container mx-auto max-w-2xl">
            <h1 className="text-3xl font-bold mb-6">Contractor Registration</h1>
            <div className="glass-panel">
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Company Name</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="Enter your company name"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Registration Number</label>
                        <input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleChange}
                            placeholder="e.g. REG-123456"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Document</label>
                        <input
                            type="file"
                            name="Document"
                            value={formData.documentUrl}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary w-full py-3">
                        Submit for Verification
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
