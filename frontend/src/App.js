import React, { useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import getTheme from './theme';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventDetails from './pages/EventDetails';
import AdminDashboard from './pages/AdminDashboard';
import VendorRequests from './pages/VendorRequests';
import CreateEvent from './pages/CreateEvent';
import Messages from './pages/Messages';
import VendorProfile from './pages/VendorProfile';
import PrivateRoute from './components/PrivateRoute';

// Configure router with future flags
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  const { user } = useAuth();
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar mode={mode} setMode={setMode} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/event/:id" element={
          <PrivateRoute>
            <EventDetails />
          </PrivateRoute>
        } />
        
        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />
        
        <Route path="/vendor-requests" element={
          <PrivateRoute roles={['vendor']}>
            <VendorRequests />
          </PrivateRoute>
        } />
        
        <Route path="/create-event" element={
          <PrivateRoute roles={['user']}>
            <CreateEvent />
          </PrivateRoute>
        } />
        
        <Route path="/messages" element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        } />
        
        <Route path="/vendor-profile" element={
          <PrivateRoute roles={['vendor']}>
            <VendorProfile />
          </PrivateRoute>
        } />
      </Routes>
    </ThemeProvider>
  );
}

export default App; 