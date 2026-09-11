import api from './api';

export const getCooperativeWorkers = async (cooperativeId) => {
  const response = await api.get(`/cooperatives/${cooperativeId}/workers`);
  return response.data;
};

export const getWorkerById = async (workerId) => {
  const response = await api.get(`/cooperatives/worker/${workerId}`);
  return response.data;
};

export const listCooperatives = async () => {
  const response = await api.get('/cooperatives/list');
  return response.data;
};

export const verifyWorker = async (workerId) => {
  const response = await api.patch(`/cooperatives/worker/${workerId}/verify`);
  return response.data;
};