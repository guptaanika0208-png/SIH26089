import api from './api';

export const getCooperativeWorkers = async (cooperativeId) => {
  const response = await api.get(`/cooperatives/${cooperativeId}/workers`);
  return response.data;
};