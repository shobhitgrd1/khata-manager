import React from 'react';
import { Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { getBankLogo } from '../../utils/bankLogos';
import styles from './CreditCardsPage.module.scss';

export const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
};

export const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getCreditCardColumns = ({
  canEdit = true,
  canCreate = true,
  canDelete = true,
  onEdit,
  onDuplicate,
  onDelete,
}) => [
  {
    field: 'cardName',
    headerName: 'Card & Bank',
    flex: 1.8,
    minWidth: 280,
    renderCell: (params) => {
      const row = params?.row || {};
      const logoSrc = getBankLogo(row.bankName);
      return (
        <div className={styles.cardAndBankRow}>
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={row.bankName || 'Bank'}
              className={styles.bankLogoSquare}
            />
          ) : (
            <div className={styles.bankLogoFallback}>
              {row.bankName ? row.bankName.slice(0, 2).toUpperCase() : 'CC'}
            </div>
          )}
          <div className={styles.nameInlineBlock}>
            <span className={styles.cardNameText}>{row.cardName}</span>
          </div>
        </div>
      );
    },
  },
  {
    field: 'cardOwner',
    headerName: 'Cardholder',
    flex: 1,
    minWidth: 140,
    renderCell: (params) => (
      <span className={styles.primaryText}>
        {params?.row?.cardOwner || '—'}
      </span>
    ),
  },
  {
    field: 'lastFourDigits',
    headerName: 'Card Number',
    width: 150,
    renderCell: (params) => (
      <span className={styles.cardNumberText}>
        •••• •••• {params?.row?.lastFourDigits || '••••'}
      </span>
    ),
  },
  {
    field: 'totalLimit',
    headerName: 'Total Limit',
    width: 140,
    renderCell: (params) => (
      <span className={styles.amountText}>
        {formatINR(params?.row?.totalLimit)}
      </span>
    ),
  },
  {
    field: 'availableLimit',
    headerName: 'Available Limit',
    width: 140,
    renderCell: (params) => (
      <span className={styles.availableText}>
        {formatINR(params?.row?.availableLimit)}
      </span>
    ),
  },
  {
    field: 'usedLimit',
    headerName: 'Used Amount',
    width: 140,
    valueGetter: (value, row) => {
      const item = row || value?.row || value || {};
      return (item.totalLimit || 0) - (item.availableLimit || 0);
    },
    renderCell: (params) => {
      const row = params?.row || {};
      const used = Math.max(
        0,
        (row.totalLimit || 0) - (row.availableLimit || 0),
      );
      return <span className={styles.usedText}>{formatINR(used)}</span>;
    },
  },
  {
    field: 'utilization',
    headerName: 'Utilization',
    width: 130,
    valueGetter: (value, row) => {
      const item = row || value?.row || value || {};
      if (!item.totalLimit || item.totalLimit === 0) return 0;
      const used = Math.max(
        0,
        item.totalLimit - (item.availableLimit || 0),
      );
      return Math.round((used / item.totalLimit) * 100);
    },
    renderCell: (params) => {
      const row = params?.row || {};
      const total = row.totalLimit || 0;
      const available = row.availableLimit || 0;
      const used = Math.max(0, total - available);
      const pct = total > 0 ? Math.round((used / total) * 100) : 0;
      let tierClass = styles.utilLow;
      if (pct >= 80) tierClass = styles.utilHigh;
      else if (pct >= 50) tierClass = styles.utilMedium;

      return (
        <span className={`${styles.utilizationBadge} ${tierClass}`}>
          {pct}%
        </span>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Added On',
    width: 120,
    renderCell: (params) => (
      <span className={styles.subText}>
        {formatDate(params?.row?.createdAt)}
      </span>
    ),
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
            <Tooltip title="Edit Card" arrow>
              <button
                type="button"
                onClick={() => onEdit && onEdit(row)}
                className={styles.rowActionBtn}
                aria-label={`Edit ${row?.cardName}`}
              >
                <EditOutlinedIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
          {canCreate && (
            <Tooltip title="Duplicate Card" arrow>
              <button
                type="button"
                onClick={() => onDuplicate && onDuplicate(row)}
                className={`${styles.rowActionBtn} ${styles.duplicateAction}`}
                aria-label={`Duplicate ${row?.cardName}`}
              >
                <ContentCopyIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete Card" arrow>
              <button
                type="button"
                onClick={() => onDelete && onDelete(row)}
                className={`${styles.rowActionBtn} ${styles.deleteAction}`}
                aria-label={`Delete ${row?.cardName}`}
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

export default getCreditCardColumns;

