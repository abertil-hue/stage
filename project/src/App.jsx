import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Exact imports from your src/pages folder
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SessionDetail from './pages/SessionDetail';
import Attend from './pages/Attend';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES (No login required - Open for students) */}
        <Route path="/login" element={<Login />} />
        
        {/* Student attendance form - maps both /presence/:id and /attend/:id */}
        <Route path="/presence/:id" element={<Attend />} />
        <Route path="/attend/:id" element={<Attend />} />

        {/* ADMIN / TRAINER PORTAL ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/session/:id" element={<SessionDetail />} />

        {/* Default redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}