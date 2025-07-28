import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { 
  Edit3, 
  Trash2, 
  RefreshCw, 
  User, 
  Calendar, 
  Activity, 
  Filter,
  Search,
  AlertTriangle,
  TrendingDown,
  X
} from 'lucide-react';
import axiosClient from '../api/axiosClient';
import EditInventoryModal from './EditInventoryModal';
import { useAuth } from '../context/AuthContext';

export default function InventoryLog() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState({ show: false, log: null });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    user: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const { user } = useAuth();

  // Fetch logs and products
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [logsRes, productsRes] = await Promise.all([
        axiosClient.get('/inventory'),
        axiosClient.get('/products')
      ]);
      setLogs(logsRes.data);
      setFilteredLogs(logsRes.data);
      setProducts(productsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs based on criteria
  useEffect(() => {
    let filtered = [...logs];

    // Action filter
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }

    // User filter
    if (filters.user) {
      filtered = filtered.filter(log => 
        log.user?.name?.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(log =>
        log.target?.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.action?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filters]);

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
      fetchLogs(); 
    } catch (err) {
      toast.error('Failed to delete inventory log');
    }
  };

  const closeEditModal = () => {
    setEditModal({ show: false, log: null });
  };

  const handleEditSuccess = () => {
    fetchLogs(); 
  };

  const clearFilters = () => {
    setFilters({
      action: '',
      user: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
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

  const getStockStatusBadge = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return null;

    const stockLevel = product.stock;
    const threshold = product.threshold || 10; // Default threshold

    if (stockLevel === 0) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
          <AlertTriangle size={12} />
          Out of Stock
        </div>
      );
    } else if (stockLevel <= threshold) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
          <TrendingDown size={12} />
          Low Stock ({stockLevel})
        </div>
      );
    } else if (stockLevel <= threshold * 2) {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          Normal ({stockLevel})
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
          In Stock ({stockLevel})
        </div>
      );
    }
  };

  const extractQuantityFromTarget = (target) => {
    const match = target.match(/Quantity: (-?\d+)/);
    return match ? match[1] : 'N/A';
  };

  const extractProductIdFromTarget = (target) => {
    const match = target.match(/Product ID: (\d+)/);
    return match ? match[1] : 'N/A';
  };

  const getUniqueActions = () => {
    return [...new Set(logs.map(log => log.action))].sort();
  };

  const getUniqueUsers = () => {
    return [...new Set(logs.map(log => log.user?.name).filter(Boolean))].sort();
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Inventory Movement Logs</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {filteredLogs.length} records
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Actions</option>
                  {getUniqueActions().map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select
                  value={filters.user}
                  onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Users</option>
                  {getUniqueUsers().map(userName => (
                    <option key={userName} value={userName}>{userName}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors w-full justify-center"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {logs.length === 0 ? 'No inventory logs available' : 'No logs match your filters'}
            </p>
            <p className="text-gray-400 text-sm">
              {logs.length === 0 ? 'Logs will appear here when inventory actions are performed' : 'Try adjusting your filter criteria'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Product ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Stock Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Details</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
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
                      {getStockStatusBadge(extractProductIdFromTarget(log.target))}
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