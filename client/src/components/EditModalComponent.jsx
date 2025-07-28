import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { X, Save, AlertCircle } from 'lucide-react';

const EditInventoryModal = ({ log, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    action: log?.action || '',
    quantity: extractQuantityFromTarget(log?.target) || '',
    note: extractNoteFromTarget(log?.target) || '',
    productId: extractProductIdFromTarget(log?.target) || ''
  });
  const [loading, setLoading] = useState(false);


  function extractProductIdFromTarget(target) {
    if (!target) return '';
    const match = target.match(/Product ID: (\d+)/);
    return match ? match[1] : '';
  }

  function extractQuantityFromTarget(target) {
    if (!target) return '';
    const match = target.match(/Quantity: (-?\d+)/);
    return match ? match[1] : '';
  }

  function extractNoteFromTarget(target) {
    if (!target) return '';
    const match = target.match(/Note: (.+)$/);
    return match ? match[1].trim() : '';
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quantity || !formData.action || !formData.productId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseInt(formData.quantity) === 0) {
      toast.error('Quantity cannot be zero');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/inventory/${log.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: formData.action,
          quantity: parseInt(formData.quantity),
          note: formData.note,
          productId: parseInt(formData.productId)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update inventory log');
      }

      toast.success(`Log updated successfully! Stock change: ${data.stockChange > 0 ? '+' : ''}${data.stockChange}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Edit Inventory Log</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2 text-blue-800">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">Edit Impact</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Editing this log will automatically adjust the product stock level.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product ID *
            </label>
            <input
              type="number"
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action *
            </label>
            <select
              name="action"
              value={formData.action}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Action</option>
              <option value="ADD">ADD - Increase Stock</option>
              <option value="REMOVE">REMOVE - Decrease Stock</option>
              <option value="TRANSFER">TRANSFER - Stock Movement</option>
              <option value="SALE">SALE - Stock Sale</option>
              <option value="RETURN">RETURN - Stock Return</option>
              <option value="RESTOCK">RESTOCK - Restock Items</option>
              <option value="ADJUSTMENT">ADJUSTMENT - Stock Adjustment</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity (positive for add, negative for remove)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use positive numbers to increase stock, negative to decrease
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional note about this inventory change"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={16} />
                  Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInventoryModal;
