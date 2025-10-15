import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import UserLogin from './UserLogin';
import UserSignup from './UserSignup';
import BinFullToSchedule from './TestingPurpose/pages/BinFullToSchedule';
import PaymentsPage from './pages/PaymentsPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/signup" element={<UserSignup />} />
        <Route path="/bin-full-to-schedule" element={<BinFullToSchedule />} />
        <Route path="/payments" element={<PaymentsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
