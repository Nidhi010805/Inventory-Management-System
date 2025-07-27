import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';

import { useAuth, AuthProvider } from './context/AuthContext';

import DashboardBase from './pages/DashboardBase'; // shared layout
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import Logs from './components/Logs';
import InventoryLog from './components/InventoryLog';
import NotificationSettings from './components/NotificationSettings';

// ✅ Import product pages
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import EditProduct from './pages/EditProduct';
import ProductDetail from './pages/ProductDetail';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;
  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Unified Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Inventory Management Routes */}
          <Route
            path="/inventory/logs"
            element={
              <PrivateRoute>
                <InventoryLog />
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications/settings"
            element={
              <PrivateRoute>
                <NotificationSettings />
              </PrivateRoute>
            }
          />

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
            
            {/* ✅ Product Routes */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/:id/edit" element={<EditProduct />} />
            <Route path="products/:id" element={<ProductDetail />} />

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
            
            {/* ✅ Product Routes for Staff */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/:id" element={<ProductDetail />} />

            <Route path="logs" element={<Logs />} />
          </Route>
        </Routes>

        {/* Toast Notifications Container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          style={{
            fontSize: '14px'
          }}
        />
      </div>
    </AuthProvider>
  );
}
