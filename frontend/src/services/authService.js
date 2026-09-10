import api from './api';

export const loginUser = async (role, credentials) => {
  const endpoint = `/${role}s/login`; // workers, customers, cooperatives
  const response = await api.post(endpoint, credentials);
  return response.data;
};

export const registerUser = async (role, data) => {
  const endpoint = `/${role}s/register`;
  const response = await api.post(endpoint, data);
  return response.data;
};