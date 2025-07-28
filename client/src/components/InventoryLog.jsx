import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Edit3, Trash2, RefreshCw, User, Calendar, Activity } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import EditInventoryModal from './EditInventoryModal';
import { useAuth } from '../context/AuthContext';

export default function InventoryLog() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, log: null });
  const { user } = useAuth();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get('/inventory');
      setLogs(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch inventory logs');
      toast.error('Failed to fetch inventory logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleEdit = (log) => {
    setEditModal({ show: true, log });
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this inventory log?')) {
      return;
    }

    try {
      await axiosClient.delete(`/inventory/${logId}`);
      toast.success('Inventory log deleted successfully');
      fetchLogs(); // Refresh the list
    } catch (err) {
      toast.error('Failed to delete inventory log');
    }
  };

  const closeEditModal = () => {
    setEditModal({ show: false, log: null });
  };

  const handleEditSuccess = () => {
    fetchLogs(); // Refresh the list after successful edit
  };

  const getActionBadge = (action) => {
    const badgeClasses = {
      'ADD': 'bg-green-100 text-green-800',
      'REMOVE': 'bg-red-100 text-red-800',
      'TRANSFER': 'bg-blue-100 text-blue-800',
      'SALE': 'bg-purple-100 text-purple-800',
      'RETURN': 'bg-orange-100 text-orange-800',
      'RESTOCK': 'bg-cyan-100 text-cyan-800',
      'ADJUSTMENT': 'bg-yellow-100 text-yellow-800',
      'EDIT_LOG': 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[action] || 'bg-gray-100 text-gray-800'}`}>
        {action}
      </span>
    );
  };

  const extractQuantityFromTarget = (target) => {
    const match = target.match(/Quantity: (-?\d+)/);
    return match ? match[1] : 'N/A';
  };

  const extractProductIdFromTarget = (target) => {
    const match = target.match(/Product ID: (\d+)/);
    return match ? match[1] : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-2 text-gray-600">Loading inventory logs...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Inventory Movement Logs</h2>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No inventory logs available</p>
            <p className="text-gray-400 text-sm">Logs will appear here when inventory actions are performed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {log.user?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        #{extractProductIdFromTarget(log.target)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        parseInt(extractQuantityFromTarget(log.target)) > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {parseInt(extractQuantityFromTarget(log.target)) > 0 ? '+' : ''}
                        {extractQuantityFromTarget(log.target)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 max-w-xs truncate block">
                        {log.target}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Log"
                        >
                          <Edit3 size={16} />
                        </button>
                        {(user?.role === 'admin' || user?.id === log.userId) && (
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Log"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editModal.show && (
        <EditInventoryModal
          log={editModal.log}
          onClose={closeEditModal}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}