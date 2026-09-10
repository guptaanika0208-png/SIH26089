import api from './api';

export const getWorkerBookings = async (workerId) => {
  const response = await api.get(`/bookings/worker/${workerId}`);
  return response.data;
};

export const getCustomerBookings = async (customerId) => {
  const response = await api.get(`/bookings/customer/${customerId}`);
  return response.data;
};

export const getCooperativeBookings = async (cooperativeId) => {
  const response = await api.get(`/bookings/cooperative/${cooperativeId}`);
  return response.data;
};