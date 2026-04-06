import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home'; // ЖАҢА: Басты бетті импорттау
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        
        {/* Барлық парақшалар осы жерде ашылады */}
        <div>
          <Routes>
            {/* Енді жүйеге кіргенде бірінші Home ашылады */}
            <Route path="/" element={<Home />} /> 
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;