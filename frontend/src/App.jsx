import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';
import UserLogin from './UserLogin';
import UserSignup from './UserSignup';
import PaymentsPage from './pages/PaymentsPage';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import SchedulePickup from './pages/Waste-collection/SchedulePickup'; // added route component
import AdminDashboard from './pages/AdminDashboard';
import WasteCollection from './pages/Waste-collection/WasteCollection';
import WasteLevel from './pages/WasteLevel';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import ReportGenerationPage from './pages/ReportGenerationPage';
import ReportVisualizationPage from './pages/ReportVisualizationPage';

import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />

          <Route path="/payments" element={<PaymentsPage />} />

          {/* Protected routes with sidebar layout */}
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/waste-collection" element={
            <Layout>
              <WasteCollection />
            </Layout>
          } />
          <Route path="/waste-level" element={
            <Layout>
              <WasteLevel />
            </Layout>
          } />
          <Route path="/payments" element={
            <Layout>
              <Payments />
            </Layout>
          } />
          <Route path="/profile" element={
            <Layout>
              <Profile />
            </Layout>
          } />
          <Route path="/report-generation" element={
            <AdminLayout>
              <ReportGenerationPage />
            </AdminLayout>
          } />
          <Route path="/report-visualization" element={
            <AdminLayout>
              <ReportVisualizationPage />
            </AdminLayout>
          } />
          <Route path="/admin-dashboard" element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          } />
          <Route path="/schedule" element={
            <Layout>
              <SchedulePickup />
            </Layout>
          } />  {/* added route */}
        </Routes>

      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
