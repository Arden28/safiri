import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} setUser={setUser} />
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/rider" element={<RiderDashboard user={user} />} />
            <Route path="/driver" element={<DriverDashboard user={user} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;