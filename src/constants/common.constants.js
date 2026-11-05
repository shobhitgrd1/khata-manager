/**
 * Common application constants
 */

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_PAGINATION_MODEL = {
  page: 0,
  pageSize: 10,
};

export const CURRENCY_SYMBOL = '₹';

export const VIEW_MODES = {
  LIST: 'list',
  CARD: 'card',
};

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  MOBILE_INDIA: /^[6-9]\d{9}$/,
  HEX_COLOR: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
  NUMBER_ONLY: /^\d+$/,
};

export const DATE_FORMATS = {
  DISPLAY_DATE: {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
  DISPLAY_DATE_TIME: {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
};

