import axios from "./axiosClient";

export const getAllProducts = () => axios.get("/products");
export const getProduct = (id) => axios.get(`/products/${id}`);
export const createProduct = (data) => axios.post("/products", data);
export const updateProduct = (id, data) => axios.put(`/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`/products/${id}`);

// Alias exports to match component imports
export const addProduct = createProduct;
export const fetchProductById = getProduct;
export const getProductById = getProduct;
