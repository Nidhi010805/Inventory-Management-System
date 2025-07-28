import React, { useEffect, useState } from "react";
import { getAllProducts, deleteProduct } from "../api/productApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 New state
  const { user } = useAuth();
  const role = user?.role?.toLowerCase(); // ✅ Normalize role to lowercase

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

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔍 Filtered product list based on search term
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">📦 Products</h2>
        {role === "admin" && (
          <Link
            to="/admin/products/add"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Add Product
          </Link>
        )}
      </div>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search by name, barcode or category"
       className="mb-4 p-2 border border-gray-300 rounded w-full text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="flex gap-4 mb-4">
  <button
    onClick={exportToExcel}
    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
  >
    Export to Excel
  </button>
  <button
    onClick={exportToPDF}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
  >
    Export to PDF
  </button>
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
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
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
                  <td className="px-4 py-2 border-b">
                    {p.category?.name || "—"}
                  </td>
                  <td className="px-4 py-2 border-b text-center space-x-2">
                    {role === "admin" ? (
                      <>
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
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
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
