import api from './api';

export const getCustomerSubscriptions = async (customerId) => {
  const response = await api.get(`/subscriptions/customer/${customerId}`);
  return response.data;
};

export const getCooperativeSubscriptions = async (cooperativeId) => {
  const response = await api.get(`/subscriptions/cooperative/${cooperativeId}`);
  return response.data;
};