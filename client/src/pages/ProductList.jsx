import React, { useEffect, useState } from "react";
import { getAllProducts, deleteProduct } from "../api/productApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await getAllProducts();
      setProducts(res.data);
    } catch (err) {
      toast.error("Failed to load products.");
    }
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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📦 Products</h2>
        <Link
          to="/admin/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Product
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow-md">
        <table className="min-w-full text-sm text-left border border-gray-200 text-gray-800">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 border-b">SKU</th>
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Stock</th>
              <th className="px-4 py-3 border-b">Threshold</th>
              <th className="px-4 py-3 border-b">Expiry</th>
              <th className="px-4 py-3 border-b">Category</th>
              <th className="px-4 py-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-gray-50 ${
                    p.stock < p.threshold
                      ? "bg-red-100 text-red-900 font-semibold"
                      : "bg-white"
                  }`}
                >
                  <td className="px-4 py-2 border-b">{p.sku}</td>
                  <td className="px-4 py-2 border-b">{p.name}</td>
                  <td className="px-4 py-2 border-b">{p.stock}</td>
                  <td className="px-4 py-2 border-b">{p.threshold}</td>
                  <td className="px-4 py-2 border-b">
                    {new Date(p.expiryDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border-b">{p.category?.name || "—"}</td>
                  <td className="px-4 py-2 border-b text-center space-x-2">
                    <Link
                      to={`/edit-product/${p.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
