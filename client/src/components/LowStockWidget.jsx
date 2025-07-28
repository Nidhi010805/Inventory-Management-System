import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, Package, RefreshCw } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

export default function LowStockWidget() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/products');
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchProducts, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLowStockProducts = () => {
    return products.filter(product => {
      const threshold = product.threshold || 10;
      return product.stock <= threshold;
    });
  };

  const getOutOfStockProducts = () => {
    return products.filter(product => product.stock === 0);
  };

  const getCriticalStockProducts = () => {
    return products.filter(product => {
      const threshold = product.threshold || 10;
      return product.stock > 0 && product.stock <= threshold;
    });
  };

  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();
  const criticalStockProducts = getCriticalStockProducts();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading stock status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Stock Alerts</h2>
          </div>
          <button
            onClick={fetchProducts}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Out of Stock</span>
            </div>
            <div className="text-2xl font-bold text-red-900 mt-2">
              {outOfStockProducts.length}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Low Stock</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 mt-2">
              {criticalStockProducts.length}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800">Total Alerts</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-2">
              {lowStockProducts.length}
            </div>
          </div>
        </div>

        {/* Product List */}
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">All products are well stocked!</p>
            <p className="text-gray-400 text-sm">No low stock alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((product) => {
              const isOutOfStock = product.stock === 0;
              const threshold = product.threshold || 10;
              
              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    isOutOfStock 
                      ? 'bg-red-50 border-red-500' 
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <span className="text-sm text-gray-500">#{product.sku}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Current Stock: {product.stock}
                        </span>
                        <span className="text-sm text-gray-600">
                          Threshold: {threshold}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOutOfStock ? (
                        <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          <AlertTriangle size={14} />
                          Out of Stock
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          <TrendingDown size={14} />
                          Low Stock
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Stock Level Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Stock Level</span>
                      <span>{product.stock} / {threshold * 2}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isOutOfStock 
                            ? 'bg-red-500' 
                            : product.stock <= threshold 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((product.stock / (threshold * 2)) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}