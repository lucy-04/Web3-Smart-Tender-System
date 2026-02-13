import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Link, useNavigate } from "react-router-dom";
import { uploadToIPFS } from "../ipfs";

const TenderLogin = () => {
    const navigate = useNavigate();
    const { isConnected, address } = useAccount();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [metricsData, setMetricsData] = useState({});
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e, section) => {
        const { name, value, files } = e.target;

        if (e.target.type === "file") {
            setFormData({ ...formData, [name]: files[0]?.name || "" });
            return;
        }

        if (section === "metrics") {
            setMetricsData({ ...metricsData, [name]: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const requiredStep1 = [
        "name", "email", "pan", "gstin", "cin",
        "past_projects", "ca_certificate", "bank_solvency",
        "litigation_status", "esic", "labour_license",
    ];

    const requiredStep2 = [
        "completion_rate", "avg_delay_days", "cost_overrun_percent", "milestone_adherence",
        "annual_turnover", "profit_margin", "debt_asset_ratio", "cash_flow_stability",
        "active_cases", "penalty_frequency", "blacklist_history", "compliance_violations",
        "total_engineers", "years_experience", "equipment_index", "iso_certifications",
    ];

    const isStep1Valid =
        isConnected &&
        requiredStep1.every((field) => formData[field]?.toString().trim()) &&
        (formData.litigation_status !== "active" || formData.litigation_details?.trim());

    const isStep2Valid = requiredStep2.every((field) => metricsData[field]?.toString().trim());

    const handleSubmit = async () => {
        if (!isStep2Valid) return;
        setUploading(true);
        setError("");

        try {
            // Upload the full profile to IPFS
            const profileData = {
                ...formData,
                metrics: metricsData,
                walletAddress: address,
                submittedAt: new Date().toISOString(),
            };

            const ipfsHash = await uploadToIPFS(profileData, `contractor_${address?.slice(0, 8)}`);

            // Store in localStorage for reference
            localStorage.setItem("contractorProfile", JSON.stringify({
                ipfsHash,
                walletAddress: address,
                name: formData.name,
                email: formData.email,
            }));

            setUploading(false);
            navigate("/contractor");
        } catch (err) {
            setError(`Upload failed: ${err.message}`);
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#050816] text-white">

            <div className="absolute inset-0 -z-30 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-30 blur-[160px] rounded-full animate-aurora" />
                <div className="absolute bottom-0 right-0 w-[700px] h-[400px] bg-gradient-to-r from-purple-500 via-blue-600 to-cyan-400 opacity-20 blur-[150px] rounded-full animate-aurora-slow" />
            </div>
            <div className="absolute inset-0 -z-20 bg-grid opacity-[0.08] pointer-events-none" />

            
            <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 px-12 py-5 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <Link to="/signup" className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium text-sm transition-all duration-300">
                        ← Back to Role Selection
                    </Link>
                    <h1 className="text-2xl font-semibold tracking-wide">Contractor Registration</h1>
                </div>
                <ConnectButton />
            </div>

            <div className="max-w-6xl mx-auto px-12 py-16">
    
                <div className="mb-14">
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-500 ${step === 1 ? "w-1/2" : "w-full"}`} />
                    </div>
                </div>

                {step === 1 && (
                    <Card title="Compliance & Qualification">
                        <Grid>
                            <Input name="name" label="Full Name" onChange={handleChange} />
                            <Input name="email" label="Email Address" onChange={handleChange} />
                            <Input name="pan" label="PAN Number" onChange={handleChange} />
                            <Input name="gstin" label="GSTIN" onChange={handleChange} />
                            <Input name="cin" label="CIN / LLPN" onChange={handleChange} />
                            <FileInput name="past_projects" label="Past Projects (PDF)" onChange={handleChange} />
                            <FileInput name="ca_certificate" label="CA Certificate of Turnover" onChange={handleChange} />
                            <FileInput name="bank_solvency" label="Bank Solvency Certificate" onChange={handleChange} />

                            <div className="md:col-span-2">
                                <label className="block mb-3 text-sm text-gray-300">
                                    Litigation Status <span className="text-cyan-400">*</span>
                                </label>
                                <select name="litigation_status" onChange={handleChange}
                                    className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition">
                                    <option value="">Select Option</option>
                                    <option value="none">No Ongoing Litigation</option>
                                    <option value="active">Active Litigation Present</option>
                                </select>
                            </div>

                            {formData.litigation_status === "active" && (
                                <div className="md:col-span-2">
                                    <label className="block mb-2 text-sm text-gray-300">
                                        Litigation Details <span className="text-cyan-400">*</span>
                                    </label>
                                    <textarea name="litigation_details" rows="4" onChange={handleChange}
                                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition"
                                        placeholder="Provide case type, court name, case number, and brief description" />
                                </div>
                            )}

                            <Input name="esic" label="ESIC Registration" onChange={handleChange} />
                            <FileInput name="labour_license" label="Labour License (Upload Certificate PDF)" onChange={handleChange} />
                            <Input value={address || ""} label="Wallet Address" readOnly />
                        </Grid>

                        <div className="flex justify-end mt-12">
                            <PrimaryButton disabled={!isStep1Valid} onClick={() => setStep(2)}>
                                Continue →
                            </PrimaryButton>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <Card title="AI Performance Metrics">
                        <Section title="Execution Discipline" />
                        <Grid>
                            <MetricInput name="completion_rate" label="Completion Rate (0-1)" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="avg_delay_days" label="Average Delay (Days)" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="cost_overrun_percent" label="Cost Overrun (%)" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="milestone_adherence" label="Milestone Adherence (0-1)" onChange={(e) => handleChange(e, "metrics")} />
                        </Grid>

                        <Section title="Financial Strength" />
                        <Grid>
                            <MetricInput name="annual_turnover" label="Annual Turnover" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="profit_margin" label="Profit Margin (0-1)" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="debt_asset_ratio" label="Debt Asset Ratio" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="cash_flow_stability" label="Cash Flow Stability (0-1)" onChange={(e) => handleChange(e, "metrics")} />
                        </Grid>

                        <Section title="Legal & Ethical Risk" />
                        <Grid>
                            <MetricInput name="active_cases" label="Active Cases" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="penalty_frequency" label="Penalty Frequency" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="blacklist_history" label="Blacklist History (0/1)" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="compliance_violations" label="Compliance Violations" onChange={(e) => handleChange(e, "metrics")} />
                        </Grid>

                        <Section title="Organizational Capacity" />
                        <Grid>
                            <MetricInput name="total_engineers" label="Total Engineers" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="years_experience" label="Years of Experience" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="equipment_index" label="Equipment Index (0-1)" onChange={(e) => handleChange(e, "metrics")} />
                            <MetricInput name="iso_certifications" label="ISO Certifications (0/1)" onChange={(e) => handleChange(e, "metrics")} />
                        </Grid>

                        {error && (
                            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-between mt-14">
                            <SecondaryButton onClick={() => setStep(1)}>← Back</SecondaryButton>
                            <PrimaryButton disabled={!isStep2Valid || uploading} onClick={handleSubmit}>
                                {uploading ? "📤 Uploading to IPFS..." : "Submit Application"}
                            </PrimaryButton>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};

const Card = ({ title, children }) => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-[0_0_40px_rgba(0,255,255,0.08)]">
        <h2 className="text-3xl font-semibold mb-10 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {title}
        </h2>
        {children}
    </div>
);

const Grid = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">{children}</div>
);

const Input = ({ label, name, onChange, value, readOnly }) => (
    <div>
        <label className="block mb-2 text-sm text-gray-300">
            {label} <span className="text-cyan-400">*</span>
        </label>
        <input type="text" name={name} value={value} readOnly={readOnly} onChange={onChange}
            className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition" />
    </div>
);

const FileInput = ({ label, name, onChange }) => (
    <div>
        <label className="block mb-2 text-sm text-gray-300">
            {label} <span className="text-cyan-400">*</span>
        </label>
        <input type="file" name={name} onChange={onChange}
            className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition file:bg-cyan-500 file:border-0 file:px-4 file:py-2 file:rounded-lg file:text-white file:cursor-pointer" />
    </div>
);

const MetricInput = Input;

const Section = ({ title }) => (
    <h3 className="text-xl font-semibold mt-12 mb-6 text-white">{title}</h3>
);

const PrimaryButton = ({ children, disabled, onClick }) => (
    <button disabled={disabled} onClick={onClick}
        className={`px-10 py-3 rounded-xl font-semibold transition ${disabled
            ? "bg-gray-700 opacity-50 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:scale-105 shadow-[0_0_25px_rgba(0,255,255,0.4)]"
            }`}>
        {children}
    </button>
);

const SecondaryButton = ({ children, onClick }) => (
    <button onClick={onClick} className="px-10 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition">
        {children}
    </button>
);

export default TenderLogin;
