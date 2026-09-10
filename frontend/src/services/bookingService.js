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

export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings/create', bookingData);
  return response.data;
};

export const autoAssignBooking = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/auto-assign`);
  return response.data;
};