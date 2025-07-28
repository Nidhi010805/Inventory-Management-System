import axiosClient from './axiosClient';

// Original product API functions
export const getAllProducts = () => axiosClient.get('/products');
export const getProduct = (id) => axiosClient.get(`/products/${id}`);
export const createProduct = (data) => axiosClient.post('/products', data);
export const updateProduct = (id, data) => axiosClient.put(`/products/${id}`, data);
export const deleteProduct = (id) => axiosClient.delete(`/products/${id}`);

// Alias exports to match component imports
export const addProduct = createProduct;
export const fetchProductById = getProduct;
export const getProductById = getProduct;

// New enhanced functions for low stock management
export const getProducts = () => axiosClient.get('/products');
export const getLowStockProducts = (threshold = 10) => 
  axiosClient.get(`/products?lowStock=true&threshold=${threshold}`);

// Update product stock
export const updateProductStock = (id, stock) => 
  axiosClient.patch(`/products/${id}/stock`, { stock });

// Get stock status for all products
export const getStockStatus = () => axiosClient.get('/products/stock-status');