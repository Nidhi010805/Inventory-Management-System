import React, { useState, useEffect } from 'react';
import { ShoppingCart, RotateCcw, Package, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const StockUpdate = ({ productId, productName, currentStock, onUpdate, onClose }) => {
  const [operation, setOperation] = useState('sale');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const operations = [
    { id: 'sale', label: 'Sale', icon: ShoppingCart, color: 'bg-blue-500', description: 'Record a sale (decreases stock)' },
    { id: 'return', label: 'Return', icon: RotateCcw, color: 'bg-green-500', description: 'Process a return (increases stock)' },
    { id: 'restock', label: 'Restock', icon: Package, color: 'bg-purple-500', description: 'Add new inventory (increases stock)' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity greater than 0';
    }
    
    if (operation === 'sale' && parseInt(quantity) > currentStock) {
      newErrors.quantity = 'Cannot sell more than current stock';
    }

    if (notes && notes.length > 500) {
      newErrors.notes = 'Notes must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNewStock = () => {
    const qty = parseInt(quantity) || 0;
    switch (operation) {
      case 'sale':
        return currentStock - qty;
      case 'return':
      case 'restock':
        return currentStock + qty;
      default:
        return currentStock;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`/api/inventory/${operation}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: parseInt(productId),
          quantity: parseInt(quantity),
          notes: notes.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Operation failed');
      }

      toast.success(`${operation.charAt(0).toUpperCase() + operation.slice(1)} processed successfully!`);
      
      // Call the parent update function
      if (onUpdate) {
        onUpdate(data.newStock);
      }
      
      // Reset form
      setQuantity('');
      setNotes('');
      
      // Close modal if provided
      if (onClose) {
        onClose();
      }

    } catch (error) {
      console.error('Error processing stock operation:', error);
      toast.error(error.message || 'Failed to process operation');
    } finally {
      setLoading(false);
    }
  };

  const getOperationDetails = () => {
    return operations.find(op => op.id === operation);
  };

  return (
    <div className="bg-[#1e293b] rounded-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Update Stock</h2>
      
      {/* Product Info */}
      <div className="bg-[#334155] p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-white">{productName}</h3>
        <p className="text-gray-300">Current Stock: <span className="font-bold">{currentStock}</span></p>
      </div>

      {/* Operation Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Operation Type</label>
        <div className="grid grid-cols-1 gap-3">
          {operations.map((op) => {
            const Icon = op.icon;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => setOperation(op.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  operation === op.id
                    ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-white'
                    : 'border-gray-600 bg-[#334155] text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className={`p-2 rounded-lg ${op.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{op.label}</div>
                  <div className="text-sm opacity-75">{op.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Quantity
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={`w-full px-3 py-2 bg-[#334155] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.quantity ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter quantity"
          />
          {errors.quantity && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.quantity}
            </p>
          )}
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            rows={3}
            className={`w-full px-3 py-2 bg-[#334155] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.notes ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Add any relevant notes..."
          />
          {errors.notes && (
            <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.notes}
            </p>
          )}
          <p className="text-gray-400 text-xs mt-1">{notes.length}/500 characters</p>
        </div>

        {/* Stock Preview */}
        {quantity && !errors.quantity && (
          <div className="bg-[#334155] p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Stock Preview</h4>
            <div className="flex justify-between items-center">
              <span className="text-white">Current Stock:</span>
              <span className="font-bold text-white">{currentStock}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-white">After {operation}:</span>
              <span className={`font-bold ${calculateNewStock() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {calculateNewStock()}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !quantity || Object.keys(errors).length > 0}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              loading || !quantity || Object.keys(errors).length > 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : `${getOperationDetails()?.color} text-white hover:opacity-90`
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirm {getOperationDetails()?.label}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockUpdate;