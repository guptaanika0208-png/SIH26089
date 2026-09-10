import api from './api';

export const getWorkerBookings = async (workerId) => {
  const response = await api.get(`/bookings/worker/${workerId}`);
  return response.data;
};