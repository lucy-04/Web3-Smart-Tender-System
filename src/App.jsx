import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ContractorDashboard from './pages/ContractorDashboard';
import TenderDetails from './pages/TenderDetails';

function App() {
  return (
    <BrowserRouter>
      <div className="pb-12">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/contractor" element={<ContractorDashboard />} />
          <Route path="/tender/:id" element={<TenderDetails />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
