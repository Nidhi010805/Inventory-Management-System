import React, { useState, useEffect } from 'react';
import ProductForm from '../components/ProductForm';
import { createProduct } from '../api/productApi';  
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosClient';



const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/categories').then(res => setCategories(res.data));
  }, []);

  const handleSubmit = async (data) => {
  try {
    await createProduct(data);
    navigate('/admin/products');
  } catch (err) {
  console.error("Failed to add product:", err);
  console.log("Error response data:", err.response?.data); // <--- add this line

  const errorData = err.response?.data;

  const message =
    errorData?.error ||
    errorData?.message ||
    (typeof errorData === 'string' ? errorData : null) ||
    '⚠️ Failed to create product';

  setErrorMessage(message);
}

};

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>
      <ProductForm
  onSubmit={handleSubmit}
  categories={categories}
  errorMessage={errorMessage}
/>

    </div>
  );
};

export default AddProduct;
