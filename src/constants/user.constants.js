/**
 * User module constants
 */
import { USER_STATUS, USER_STATUS_LIST } from './status.constants';

export { USER_STATUS, USER_STATUS_LIST };

export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

export const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
];

