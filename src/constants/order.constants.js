/**
 * Order module constants
 */
import { ORDER_STATUS, ORDER_STATUS_LIST } from './status.constants';

export { ORDER_STATUS, ORDER_STATUS_LIST };

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  OTHER: 'Other',
};

export const OTHER_PAYMENT_TYPES = [
  'Debit Card',
  'UPI',
  'Net Banking',
  'Cash',
  'Cheque',
];

export const CASHBACK_PERCENTAGE_PRESETS = [4, 5, 10, 15];

export const DEFAULT_CASHBACK_PERCENTAGE = 5;

export const ORDER_FILTER_DEFAULTS = {
  status: '',
  dealerId: '',
  productId: '',
  accountId: '',
  creditCardId: '',
  startDate: null,
  endDate: null,
};

