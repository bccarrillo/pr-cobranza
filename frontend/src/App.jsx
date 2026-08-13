import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Debtors from './pages/Debtors';
import Tenants from './pages/Tenants';
import Users from './pages/Users';
import AIIntegration from './pages/AIIntegration';
import Payments from './pages/Payments';
import Campaigns from './pages/Campaigns';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="debtors" element={<Debtors />} />
          <Route path="payments" element={<Payments />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="tenants" element={<Tenants />} />
          <Route path="users" element={<Users />} />
          <Route path="ai-integration" element={<AIIntegration />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
