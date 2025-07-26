import React from 'react';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosClient.get('/auth/logout');
      alert('Logged out');
      navigate('/login');
    } catch {
      alert('Logout failed');
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
