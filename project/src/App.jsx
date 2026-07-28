import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './config/supabaseClient';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SessionDetail from './pages/SessionDetail';
import Attend from './pages/Attend';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Attendance Form */}
        <Route path="/attend/:id" element={<Attend />} />

        {/* Login Page */}
        <Route path="/login" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />

        {/* PROTECTED DASHBOARD */}
        <Route 
          path="/dashboard" 
          element={session ? <Dashboard /> : <Navigate to="/login" replace />} 
        />

        {/* PROTECTED SESSION DETAIL */}
        <Route 
          path="/session/:id" 
          element={session ? <SessionDetail /> : <Navigate to="/login" replace />} 
        />

        {/* Default Fallback */}
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}