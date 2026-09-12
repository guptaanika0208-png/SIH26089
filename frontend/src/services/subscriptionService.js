import api from './api';

export const getCustomerSubscriptions = async (customerId) => {
  const response = await api.get(`/subscriptions/customer/${customerId}`);
  return response.data;
};

export const getCooperativeSubscriptions = async (cooperativeId) => {
  const response = await api.get(`/subscriptions/cooperative/${cooperativeId}`);
  return response.data;
};

export const updateSubscriptionStatus = async (subscriptionId, status) => {
  const response = await api.patch(`/subscriptions/${subscriptionId}/status`, { status });
  return response.data;
};

export const assignWorkerToSubscription = async (subscriptionId, workerId) => {
  const response = await api.patch(`/subscriptions/${subscriptionId}/assign-worker`, { workerId });
  return response.data;
};