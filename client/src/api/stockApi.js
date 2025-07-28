import axios from './axiosClient';

export const stockSale = (data) => axios.post('/stock/sale', data);
export const stockReturn = (data) => axios.post('/stock/return', data);
export const stockRestock = (data) => axios.post('/stock/restock', data);
export const getStockHistory = (productId) => axios.get(`/stock/history/${productId}`);
export const bulkStockUpdate = (data) => axios.post('/stock/bulk-update', data);