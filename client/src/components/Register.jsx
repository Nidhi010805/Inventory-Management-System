import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('STAFF');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const response = await axiosClient.post('/auth/register', {
        name,
        email,
        password,
        role,
      });

      console.log('Registration success:', response.data);
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8e5e0]">
      <div className="bg-white p-10 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-green-500 text-white rounded-full px-6 py-2 text-xl font-bold">RePack</div>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-1">Welcome!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Sign up to create your RePack account</p>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            pattern=".{6,}"
            title="Password must be at least 6 characters"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-300"
            required
          >
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <span
            className="text-green-600 hover:underline cursor-pointer"
            onClick={() => navigate('/login')}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
