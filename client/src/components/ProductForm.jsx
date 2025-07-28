import React, { useState, useEffect, useRef } from 'react';
import CategoryDropdown from './CategoryDropdown';

const ProductForm = ({ onSubmit, categories = [], initialData = {}, errorMessage }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    barcode: '',
    stock: '',
    threshold: '',
    expiryDate: '',
    categoryId: '',
  });

  const [skuError, setSkuError] = useState('');
  const [barcodeError, setBarcodeError] = useState('');

  const skuTimeoutRef = useRef(null);
  const barcodeTimeoutRef = useRef(null);

  useEffect(() => {
    if (initialData?.id) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        expiryDate: initialData.expiryDate?.split('T')[0] || '',
        categoryId: initialData.category?.id || '',
      }));
    }
  }, [initialData]);

  const checkUnique = async ({ sku, barcode }) => {
    const params = new URLSearchParams();
    if (sku) params.append('sku', sku);
    if (barcode) params.append('barcode', barcode);
    if (initialData?.id) params.append('excludeId', initialData.id);

    try {
      const res = await fetch(`/api/products/check-unique?${params.toString()}`);
      const data = await res.json();
      return data;
    } catch {
      return { exists: false };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'sku') setSkuError('');
    if (name === 'barcode') setBarcodeError('');

    const trimmed = value.trim();
    if (trimmed === '') return;

    if (name === 'sku') {
      if (skuTimeoutRef.current) clearTimeout(skuTimeoutRef.current);

      checkUnique({ sku: trimmed }).then(res => {
        if (res.exists && res.field === 'sku') setSkuError(`SKU "${trimmed}" already exists.`);
        else setSkuError('');
      });

      skuTimeoutRef.current = setTimeout(async () => {
        const res = await checkUnique({ sku: trimmed });
        if (res.exists && res.field === 'sku') setSkuError(`SKU "${trimmed}" already exists.`);
        else setSkuError('');
      }, 500);
    }

    if (name === 'barcode') {
      if (barcodeTimeoutRef.current) clearTimeout(barcodeTimeoutRef.current);

      checkUnique({ barcode: trimmed }).then(res => {
        if (res.exists && res.field === 'barcode') setBarcodeError(`Barcode "${trimmed}" already exists.`);
        else setBarcodeError('');
      });

      barcodeTimeoutRef.current = setTimeout(async () => {
        const res = await checkUnique({ barcode: trimmed });
        if (res.exists && res.field === 'barcode') setBarcodeError(`Barcode "${trimmed}" already exists.`);
        else setBarcodeError('');
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSkuError('');
    setBarcodeError('');

    const res = await checkUnique({ sku: formData.sku.trim(), barcode: formData.barcode.trim() });

    if (res.exists) {
      if (res.field === 'sku') setSkuError(`SKU "${formData.sku.trim()}" already exists.`);
      if (res.field === 'barcode') setBarcodeError(`Barcode "${formData.barcode.trim()}" already exists.`);
      alert('Please fix duplicate SKU or Barcode before submitting.');
      return;
    }

    if (skuError || barcodeError) return;

    const cleanedData = {
      sku: formData.sku,
      name: formData.name,
      barcode: formData.barcode,
      stock: Number(formData.stock),
      threshold: Number(formData.threshold),
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
      categoryId: formData.categoryId ? Number(formData.categoryId) : null,
    };

    console.log("📦 Final Product Payload Being Sent:", cleanedData);
    onSubmit(cleanedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto p-8 bg-[#121c2c] text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-2">Add New Product</h2>

      {errorMessage && (
        <div className="mb-4 p-2 rounded text-sm text-red-400 bg-red-100 border border-red-400">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="SKU"
            required
            className={`bg-[#1a253c] text-white border rounded px-4 py-2 w-full ${
              skuError ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {skuError && <p className="text-red-400 text-sm font-medium mt-1">⚠️ {skuError}</p>}
        </div>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Product Name"
          required
          className="bg-[#1a253c] text-white border border-gray-600 rounded px-4 py-2"
        />
        <div>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="Barcode"
            required
            className={`bg-[#1a253c] text-white border rounded px-4 py-2 w-full ${
              barcodeError ? 'border-red-500' : 'border-gray-600'
            }`}
          />
          {barcodeError && <p className="text-red-400 text-sm font-medium mt-1">⚠️ {barcodeError}</p>}
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <CategoryDropdown
          categories={categories}
          value={formData.categoryId}
          onChange={(val) => setFormData(prev => ({ ...prev, categoryId: val }))}
        />
      </div>

      {errorMessage && <p className="text-red-400 text-sm font-medium mt-2">⚠️ {errorMessage}</p>}

      <button
        type="submit"
        disabled={!!skuError || !!barcodeError}
        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          skuError || barcodeError
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Submit
      </button>
    </form>
  );
};

export default ProductForm;
