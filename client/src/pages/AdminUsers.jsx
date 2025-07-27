// src/pages/AdminUsers.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

 const fetchUsers = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/users/all', {
      withCredentials: true,
    });
    setUsers(res.data);
  } catch (err) {
    console.error('Error fetching users:', err);
    alert('Failed to load users.');
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Could not delete user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Users</h2>
      <table className="w-full table-auto border-collapse rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-3 text-left">#</th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Created</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.id} className="border-b hover:bg-gray-100">
              <td className="p-3">{i + 1}</td>
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">{u.role}</td>
              <td className="p-3">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="p-3">
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => handleDelete(u.id)}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
