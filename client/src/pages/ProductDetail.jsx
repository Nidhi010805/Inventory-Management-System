// /src/pages/ProductDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, deleteProduct } from "../api/productApi";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getProductById(id);
      setProduct(res.data);
    } catch (e) {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isLowStock = useMemo(
    () => product && product.stock < product.threshold,
    [product]
  );

  const isExpired = useMemo(() => {
    if (!product) return false;
    return new Date(product.expiryDate) < new Date();
  }, [product]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(product.id);
      toast.success("Product deleted");
      navigate("/products");
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6">Product not found.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-2xl font-bold">
          {product.name}{" "}
          <span className="text-gray-500 text-base">({product.sku})</span>
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit-product/${product.id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
          Delete
          </button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 mb-4">
        {isLowStock && (
          <span className="px-2 py-1 text-sm rounded bg-red-100 text-red-700">
            Low stock
          </span>
        )}
        {isExpired && (
          <span className="px-2 py-1 text-sm rounded bg-yellow-100 text-yellow-700">
            Expired
          </span>
        )}
      </div>

      <div className="bg-white border rounded p-4 space-y-3">
        <Row label="Name" value={product.name} />
        <Row label="SKU" value={product.sku} />
        <Row label="Barcode" value={product.barcode} />
        <Row
          label="Stock / Threshold"
          value={`${product.stock} / ${product.threshold}`}
          highlight={isLowStock}
        />
        <Row
          label="Expiry Date"
          value={new Date(product.expiryDate).toLocaleDateString()}
          highlight={isExpired}
        />
        <Row label="Category" value={product.category?.name || "—"} />
        <Row
          label="Created By"
          value={product.createdBy ? `${product.createdBy.name} (#${product.createdBy.id})` : "—"}
        />
        <Row
          label="Created At"
          value={new Date(product.createdAt).toLocaleString()}
        />
        <Row
          label="Updated At"
          value={new Date(product.updatedAt).toLocaleString()}
        />
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 text-blue-600 hover:underline"
      >
        ← Back
      </button>
    </div>
  );
};

const Row = ({ label, value, highlight = false }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className={highlight ? "text-red-600 font-semibold" : ""}>{value}</span>
  </div>
);

export default ProductDetail;
