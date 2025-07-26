import React, { useState, useEffect } from 'react';
import CategoryDropdown from './CategoryDropdown';

const ProductForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    barcode: '',
    stock: '',
    threshold: '',
    expiryDate: '',
    categoryId: ''
  });

  useEffect(() => {
    if (initialData?.id) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        expiryDate: initialData.expiryDate?.split('T')[0] || '',
        categoryId: initialData.categoryId || '',
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convert fields to correct types
    const cleanedData = {
      ...formData,
      stock: Number(formData.stock),
      threshold: Number(formData.threshold),
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null
    };

    console.log("Submitting form data:", cleanedData);
    onSubmit(cleanedData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-3xl mx-auto p-8 bg-[#121c2c] text-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-6">Add New Product</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="SKU"
          required
          className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2"
        />

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          required
          className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2"
        />

        <input
          type="text"
          name="barcode"
          value={formData.barcode}
          onChange={handleChange}
          placeholder="Barcode"
          required
          className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          placeholder="Stock"
          min={0}
          required
          className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2"
        />

        <input
          type="number"
          name="threshold"
          value={formData.threshold}
          onChange={handleChange}
          placeholder="Threshold"
          min={0}
          required
          className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2"
        />

        <input
          type="date"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          required
          className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2"
        />
      </div>

      <CategoryDropdown
        value={formData.categoryId}
        onChange={(id) =>
          setFormData(prev => ({
            ...prev,
            categoryId: id ? Number(id) : ''
          }))
        }
        className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        Submit
      </button>
    </form>
  );
};

export default ProductForm;
