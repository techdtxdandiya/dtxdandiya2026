import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import TeamPortalLogin from './TeamPortalLogin';
import JudgesDashboard from './JudgesDashboard';
import RepsDashboard from './RepsDashboard';

export default function TeamPortalRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    const team = sessionStorage.getItem("team");
    if (!team && !window.location.pathname.includes('login')) {
      navigate("/team-portal/login");
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/login" element={<TeamPortalLogin />} />
      <Route path="/judges" element={<JudgesDashboard />} />
      <Route path="/reps" element={<RepsDashboard />} />
    </Routes>
  );
} 