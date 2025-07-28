import axiosClient from './axiosClient';

export const getInventoryLogs = () => axiosClient.get('/inventory');

export const updateInventoryLog = (logId, data) => 
  axiosClient.put(`/inventory/${logId}`, data);

export const deleteInventoryLog = (logId) => 
  axiosClient.delete(`/inventory/${logId}`);

export const getInventoryLogsByProduct = (productId) => 
  axiosClient.get(`/inventory/product/${productId}`);