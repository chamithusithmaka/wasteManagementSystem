import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';
import UserLogin from './UserLogin';
import UserSignup from './UserSignup';
import PaymentsPage from './pages/PaymentsPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WasteCollection from './pages/Waste-collection/WasteCollection';
import WasteLevel from './pages/WasteLevel';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import SchedulePickup from './pages/Waste-collection/SchedulePickup'; // added route component

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
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
