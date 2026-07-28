import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './config/supabaseClient';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attend from './pages/Attend';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial login session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Prevents flashing during auth check

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Attendance Form */}
        <Route path="/attend/:id" element={<Attend />} />

        {/* Login Page */}
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* PROTECTED DASHBOARD: Only loads if session exists */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/login" replace />} 
        />

        {/* Default fallback: redirects home to /login or /dashboard */}
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}