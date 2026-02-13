import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import GovernmentLogin from "./pages/GovernmentLogin";
import TenderLogin from "./pages/TenderLogin";

import GovernmentDashboard from "./pages/GovernmentDashboard";
import ContractorDashboard from "./pages/ContractorDashboard";
import TenderDetails from "./pages/TenderDetails";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-[#0B1220] text-white relative overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login-government" element={<GovernmentLogin />} />
          <Route path="/login-tender" element={<TenderLogin />} />

          {/* Dashboard Routes */}
          <Route path="/gov" element={<GovernmentDashboard />} />
          <Route path="/contractor" element={<ContractorDashboard />} />
          
          {/* Tender Details */}
          <Route path="/tender/:id" element={<TenderDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
