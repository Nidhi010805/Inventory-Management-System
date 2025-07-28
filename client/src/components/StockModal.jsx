import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { stockSale, stockReturn, stockRestock } from '../api/stockApi';
import { X } from 'lucide-react';

const StockModal = ({ product, operation, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: '',
    orderId: '',
    returnReason: '',
    supplierInfo: '',
    batchNumber: '',
    expiryDate: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (operation === 'sale' && parseInt(formData.quantity) > product.stock) {
      toast.error(`Insufficient stock. Available: ${product.stock}, Requested: ${formData.quantity}`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        productId: product.id,
        quantity: parseInt(formData.quantity),
      };

      if (operation === 'sale' && formData.orderId) {
        payload.orderId = formData.orderId;
      }
      if (operation === 'return') {
        if (formData.returnReason) payload.returnReason = formData.returnReason;
        if (formData.orderId) payload.orderId = formData.orderId;
      }
      if (operation === 'restock') {
        if (formData.supplierInfo) payload.supplierInfo = formData.supplierInfo;
        if (formData.batchNumber) payload.batchNumber = formData.batchNumber;
        if (formData.expiryDate) payload.expiryDate = formData.expiryDate;
      }

      let response;
      switch (operation) {
        case 'sale':
          response = await stockSale(payload);
          break;
        case 'return':
          response = await stockReturn(payload);
          break;
        case 'restock':
          response = await stockRestock(payload);
          break;
        default:
          throw new Error('Invalid operation');
      }

      if (response.data.success) {
        toast.success(response.data.message);
        onSuccess(); 
        onClose(); 
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error('Stock operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModalConfig = () => {
    switch (operation) {
      case 'sale':
        return {
          title: '🛒 Stock Sale',
          color: 'red',
          buttonText: 'Process Sale',
          bgColor: 'bg-red-500',
          hoverColor: 'hover:bg-red-600'
        };
      case 'return':
        return {
          title: '↩️ Stock Return',
          color: 'blue',
          buttonText: 'Process Return',
          bgColor: 'bg-blue-500',
          hoverColor: 'hover:bg-blue-600'
        };
      case 'restock':
        return {
          title: '📦 Restock Items',
          color: 'green',
          buttonText: 'Add to Stock',
          bgColor: 'bg-green-500',
          hoverColor: 'hover:bg-green-600'
        };
      default:
        return {};
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{config.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 rounded p-3 mb-4">
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
          <p className="text-sm text-gray-600">
            Current Stock: <span className="font-bold">{product.stock}</span>
            {product.stock <= product.threshold && (
              <span className="text-red-600 ml-2">⚠️ Low Stock</span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
              placeholder="Enter quantity"
              min="1"
              required
            />
          </div>

          {(operation === 'sale' || operation === 'return') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order ID {operation === 'sale' ? '(Optional)' : ''}
              </label>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ORD-2025-001"
              />
            </div>
          )}

          {operation === 'return' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Return Reason
              </label>
              <input
                type="text"
                name="returnReason"
                value={formData.returnReason}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Defective product"
              />
            </div>
          )}

          {operation === 'restock' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Info
                </label>
                <input
                  type="text"
                  name="supplierInfo"
                  value={formData.supplierInfo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ABC Suppliers Ltd"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., BATCH-2025-001"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.quantity}
              className={`flex-1 px-4 py-2 text-white rounded-md ${config.bgColor} ${config.hoverColor} disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {loading ? 'Processing...' : config.buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockModal;
