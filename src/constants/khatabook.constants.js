// Central constants for Khata Book module
export const KHATA_ACCOUNT_TYPES = [
  { value: 'Other', label: 'Other Person / Customer' },
  { value: 'Dealer', label: 'Dealer' },
];

export const KHATA_BALANCE_FILTERS = [
  { value: '', label: 'All Balances' },
  { value: 'toReceive', label: 'Amount to Receive (Positive)' },
  { value: 'toPay', label: 'Amount to Pay (Negative)' },
  { value: 'settled', label: 'Settled Accounts (₹0)' },
];

export const KHATA_TRANSACTION_TYPES = [
  { value: 'MONEY_GIVEN', label: 'Money Given (Lent)' },
  { value: 'MONEY_TAKEN', label: 'Money Taken (Borrowed)' },
  { value: 'PAYMENT_RECEIVED', label: 'Payment Received' },
  { value: 'PAYMENT_MADE', label: 'Payment Made' },
  { value: 'OPENING_BALANCE', label: 'Opening Balance' },
  { value: 'REVERSAL', label: 'Reversal Entry' },
];

export const PAYMENT_MODES = [
  'Cash',
  'UPI',
  'Bank Transfer',
  'Cheque',
  'Online Order',
  'Other',
];

