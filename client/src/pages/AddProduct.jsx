// /src/pages/AddProduct.jsx
import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import { createProduct } from '../api/productApi';  // ✅ correct

import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosClient';

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/categories').then(res => setCategories(res.data));
    
  }, []);
  

  const handleSubmit = async (data) => {
  try {
    await createProduct(data);       // Product create hota hai
    navigate('/admin/products');     // ✅ Sahi jagah redirect hota hai
  } catch (err) {
    console.error("Failed to add product:", err);
  }
};



  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>
      <ProductForm onSubmit={handleSubmit} categories={categories} />
    </div>
  );
};

export default AddProduct;
