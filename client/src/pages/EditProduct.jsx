import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, updateProduct } from '../api/productApi';
import ProductForm from '../components/ProductForm';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetchProductById(id).then(res => setInitialData(res.data));
  }, [id]);

  const handleSubmit = async (data) => {
    await updateProduct(id, data);
    navigate('/products');
  };

  return initialData ? <ProductForm onSubmit={handleSubmit} initialData={initialData} /> : <p>Loading...</p>;
};

export default EditProduct;
