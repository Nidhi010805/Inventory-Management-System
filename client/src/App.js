import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import { useAuth, AuthProvider } from './context/AuthContext';

import DashboardBase from './pages/DashboardBase';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import Alerts from './components/Alerts';
import Logs from './components/Logs';

// ✅ Product pages
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';
import Settings from './pages/Settings';


function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();

  // Hide Navbar & Footer on dashboard pages
  const isDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff');

  return (
    <>
      {!isDashboard && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <PrivateRoute role="admin">
              <DashboardBase role="admin" />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="settings" element={<Settings />} />
        <Route path="settings" element={<Settings />} />

          <Route path="alerts" element={<Alerts />} />
          <Route path="logs" element={<Logs />} />
        </Route>

        {/* Staff Routes */}
        <Route
          path="/staff/*"
          element={
            <PrivateRoute role="staff">
              <DashboardBase role="staff" />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Routes>

      {!isDashboard && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
