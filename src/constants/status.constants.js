/**
 * Common status constants across modules
 */

export const ORDER_STATUS = {
  IN_PROCESS: 'Order In Process',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export const ORDER_STATUS_LIST = [
  ORDER_STATUS.IN_PROCESS,
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.CANCELLED,
];

export const USER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const USER_STATUS_LIST = [
  USER_STATUS.ACTIVE,
  USER_STATUS.INACTIVE,
];

export const ACCOUNT_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

export const STATUS_COLORS = {
  DELIVERED: '#10B981',
  IN_PROCESS: '#F59E0B',
  CANCELLED: '#EF4444',
  ACTIVE: '#10B981',
  INACTIVE: '#94A8C0',
  PROFIT: '#10B981',
  LOSS: '#EF4444',
};

