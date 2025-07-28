import React, { useEffect, useState } from "react";
import { getAllProducts, deleteProduct } from "../api/productApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import StockModal from "../components/StockModal";
import { ShoppingCart, RotateCcw, Package } from "lucide-react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockModal, setStockModal] = useState({ show: false, product: null, operation: '' });
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products.");
    }
  };

  const exportToExcel = () => {
    const data = filteredProducts.map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Stock: p.stock,
      Threshold: p.threshold,
      Expiry: new Date(p.expiryDate).toLocaleDateString(),
      Category: p.category?.name || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "products.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["SKU", "Name", "Stock", "Threshold", "Expiry", "Category"];
    const tableRows = filteredProducts.map((p) => [
      p.sku,
      p.name,
      p.stock,
      p.threshold,
      new Date(p.expiryDate).toLocaleDateString(),
      p.category?.name || "—",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save("products.pdf");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // 🚀 NEW: Stock operation handlers
  const handleStockOperation = (product, operation) => {
    setStockModal({ show: true, product, operation });
  };

  const closeStockModal = () => {
    setStockModal({ show: false, product: null, operation: '' });
  };

  const handleStockSuccess = () => {
    fetchProducts(); // Refresh the product list
    closeStockModal();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filtered product list based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🚀 NEW: Quick Stock Actions Component
  const QuickStockActions = ({ product }) => {
    return (
      <div className="flex gap-1">
        <button
          onClick={() => handleStockOperation(product, 'sale')}
          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition flex items-center gap-1"
          title="Quick Sale"
          disabled={product.stock === 0}
        >
          <ShoppingCart size={12} />
          Sale
        </button>
        <button
          onClick={() => handleStockOperation(product, 'return')}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center gap-1"
          title="Process Return"
        >
          <RotateCcw size={12} />
          Return
        </button>
        <button
          onClick={() => handleStockOperation(product, 'restock')}
          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition flex items-center gap-1"
          title="Restock Items"
        >
          <Package size={12} />
          Restock
        </button>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📦 Products</h2>
        <div className="flex gap-3">
          {/* Export buttons */}
          <button
            onClick={exportToExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            📊 Export Excel
          </button>
          <button
            onClick={exportToPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            📄 Export PDF
          </button>
          {role === "admin" && (
            <Link
              to="/admin/products/add"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              + Add Product
            </Link>
          )}
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="🔍 Search products, barcodes, or categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Products Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expiry</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">🚀 Stock Actions</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.barcode}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        product.stock === 0 ? 'text-red-600' :
                        product.stock <= product.threshold ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {product.stock}
                      </span>
                      {product.stock <= product.threshold && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Low
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                          Out
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Threshold: {product.threshold}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.category?.name || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(product.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <QuickStockActions product={product} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/${role}/products/${product.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </Link>
                      {role === "admin" && (
                        <>
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🚀 NEW: Stock Modal */}
      {stockModal.show && (
        <StockModal
          product={stockModal.product}
          operation={stockModal.operation}
          onClose={closeStockModal}
          onSuccess={handleStockSuccess}
        />
      )}
    </div>
  );
};

export default ProductList;