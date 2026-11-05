import React from 'react';
import { Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { getAccountLogo } from '../../utils/accountLogos';
import styles from './AccountsPage.module.scss';

export const getAccountColumns = ({
  canEdit = true,
  canCreate = true,
  canDelete = true,
  onEdit,
  onDuplicate,
  onDelete,
}) => [
  {
    field: 'accountType',
    headerName: 'Account Type',
    minWidth: 200,
    flex: 1.3,
    valueGetter: (value, row) => {
      const item = row || value?.row || value;
      if (!item) return '';
      return item.accountType === 'Other' && item.customAccountType
        ? item.customAccountType
        : item.accountType || '';
    },
    renderCell: (params) => {
      const row = params?.row || {};
      const label =
        row.accountType === 'Other' && row.customAccountType
          ? row.customAccountType
          : row.accountType || '—';
      const logo = getAccountLogo(label) || getAccountLogo(row.accountType);

      return (
        <div className={styles.accountTypeCell}>
          {logo ? (
            <div className={styles.logoSquare}>
              <img src={logo} alt={label} className={styles.accountLogoImg} />
            </div>
          ) : (
            <span className={styles.fallbackTypeBadge}>{label}</span>
          )}
          {logo && <span className={styles.accountTypeNameText}>{label}</span>}
        </div>
      );
    },
  },
  {
    field: 'fullName',
    headerName: 'Account Name / Full Name',
    minWidth: 180,
    flex: 1.2,
  },
  {
    field: 'mobileNumber',
    headerName: 'Mobile Number',
    minWidth: 150,
    flex: 1,
    renderCell: (params) => params?.row?.mobileNumber || '—',
  },
  {
    field: 'email',
    headerName: 'Email Address',
    minWidth: 200,
    flex: 1.3,
    valueGetter: (value, row) => {
      const item = row || value?.row || value;
      return item?.email || '—';
    },
  },
  {
    field: 'orderCount',
    headerName: 'Number of Orders',
    minWidth: 160,
    flex: 1,
    renderCell: (params) => {
      const count = params?.row?.orderCount ?? 0;
      return (
        <span className={`${styles.orderCountBadge} ${count > 0 ? styles.hasOrders : ''}`}>
          {count}
        </span>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 160,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const row = params?.row;
      return (
        <div className={styles.actionsCell}>
          {canEdit && (
            <Tooltip title="Edit Account" arrow>
              <button
                type="button"
                onClick={() => onEdit && onEdit(row)}
                className={styles.actionBtn}
                aria-label={`Edit ${row?.fullName}`}
              >
                <EditOutlinedIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
          {canCreate && (
            <Tooltip title="Duplicate Account" arrow>
              <button
                type="button"
                onClick={() => onDuplicate && onDuplicate(row)}
                className={`${styles.actionBtn} ${styles.duplicateAction}`}
                aria-label={`Duplicate ${row?.fullName}`}
              >
                <ContentCopyIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete Account" arrow>
              <button
                type="button"
                onClick={() => onDelete && onDelete(row)}
                className={`${styles.actionBtn} ${styles.deleteAction}`}
                aria-label={`Delete ${row?.fullName}`}
              >
                <DeleteOutlinedIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];

export default getAccountColumns;

