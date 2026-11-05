import React from 'react';
import { Tooltip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

import styles from './KhataBookPage.module.scss';

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

export const getKhataBookColumns = ({
  canEdit = true,
  canDelete = true,
  onView,
  onEdit,
  onArchive,
}) => [
  {
    field: 'name',
    headerName: 'Person / Account',
    flex: 1.4,
    minWidth: 190,
    renderCell: (params) => {
      const row = params?.row || {};
      const initial = row.name ? row.name.trim().charAt(0).toUpperCase() : 'K';
      return (
        <div className={styles.nameCell}>
          <span className={styles.avatarDot}>{initial}</span>
          <div className={styles.nameWrapper}>
            <span className={styles.nameText}>{row.name}</span>
            {row.dealerId && (
              <span className={styles.subDealerBadge} title="Linked to Dealer Management">
                Dealer Linked
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    field: 'mobileNumber',
    headerName: 'Mobile Number',
    flex: 1,
    minWidth: 140,
    renderCell: (params) => {
      const mobile = params?.value;
      return mobile ? <span className={styles.mobileText}>{mobile}</span> : <span className={styles.mutedText}>—</span>;
    },
  },
  {
    field: 'accountType',
    headerName: 'Type',
    width: 120,
    renderCell: (params) => {
      const type = params?.value || 'Other';
      return (
        <span className={`${styles.typeBadge} ${type === 'Dealer' ? styles.typeDealer : styles.typeOther}`}>
          {type === 'Dealer' ? (
            <>
              <StorefrontIcon fontSize="inherit" /> Dealer
            </>
          ) : (
            <>
              <PersonOutlinedIcon fontSize="inherit" /> Other
            </>
          )}
        </span>
      );
    },
  },
  {
    field: 'toReceive',
    headerName: 'Total to Receive',
    flex: 0.95,
    minWidth: 130,
    renderCell: (params) => {
      const bal = params?.row?.currentBalance || 0;
      return bal > 0 ? (
        <span className={styles.amountGreen}>+{formatINR(bal)}</span>
      ) : (
        <span className={styles.mutedText}>—</span>
      );
    },
  },
  {
    field: 'toPay',
    headerName: 'Total to Pay',
    flex: 0.95,
    minWidth: 130,
    renderCell: (params) => {
      const bal = params?.row?.currentBalance || 0;
      return bal < 0 ? (
        <span className={styles.amountRed}>-{formatINR(bal)}</span>
      ) : (
        <span className={styles.mutedText}>—</span>
      );
    },
  },
  {
    field: 'currentBalance',
    headerName: 'Current Balance',
    flex: 1.2,
    minWidth: 160,
    renderCell: (params) => {
      const bal = params?.value || 0;
      const isPos = bal > 0;
      const isNeg = bal < 0;

      return (
        <div
          className={`${styles.balanceCell} ${
            isPos ? styles.balanceGreen : isNeg ? styles.balanceRed : styles.balanceSettled
          }`}
        >
          <span className={styles.balanceTag}>
            {isPos ? 'To Receive' : isNeg ? 'To Pay' : 'Settled'}
          </span>
          <span className={styles.balanceNum}>
            {isPos && `+${formatINR(bal)}`}
            {isNeg && `-${formatINR(bal)}`}
            {!isPos && !isNeg && '₹0'}
          </span>
        </div>
      );
    },
  },
  {
    field: 'lastTransactionDate',
    headerName: 'Last Activity',
    flex: 1,
    minWidth: 130,
    renderCell: (params) => {
      const date = params?.value;
      return (
        <span className={styles.dateText}>
          {date
            ? new Date(date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—'}
        </span>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 140,
    sortable: false,
    renderCell: (params) => {
      const row = params?.row;
      return (
        <div className={styles.actionsCell}>
          <Tooltip title="View Ledger Details" arrow>
            <button
              type="button"
              onClick={() => onView && onView(row)}
              className={styles.actionBtn}
              aria-label={`View ${row?.name}`}
            >
              <VisibilityOutlinedIcon fontSize="inherit" />
            </button>
          </Tooltip>

          {canEdit && (
            <Tooltip title="Edit Account" arrow>
              <button
                type="button"
                onClick={() => onEdit && onEdit(row)}
                className={styles.actionBtn}
                aria-label={`Edit ${row?.name}`}
              >
                <EditOutlinedIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip title="Archive Account" arrow>
              <button
                type="button"
                onClick={() => onArchive && onArchive(row)}
                className={`${styles.actionBtn} ${styles.deleteAction}`}
                aria-label={`Archive ${row?.name}`}
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

const TX_TYPE_LABELS = {
  MONEY_GIVEN: 'Money Given',
  MONEY_TAKEN: 'Money Taken',
  PAYMENT_RECEIVED: 'Payment Received',
  PAYMENT_MADE: 'Payment Made',
  OPENING_BALANCE: 'Opening Balance',
  REVERSAL: 'Reversal',
};

export const getTransactionColumns = ({
  canEdit = true,
  onEdit,
  onReverse,
}) => [
  {
    field: 'transactionDate',
    headerName: 'Date',
    width: 120,
    renderCell: (params) => {
      const date = params?.value;
      return (
        <span className={styles.dateText}>
          {date
            ? new Date(date).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '-'}
        </span>
      );
    },
  },
  {
    field: 'transactionType',
    headerName: 'Type',
    width: 165,
    minWidth: 160,
    renderCell: (params) => {
      const type = params?.value || '';
      const isReversed = params?.row?.isReversed;
      const label = TX_TYPE_LABELS[type] || type.replace(/_/g, ' ');
      return (
        <div className={styles.txTypeWrapper}>
          <span className={`${styles.txTypeTag} ${styles[type] || ''}`}>
            <span className={styles.typeDot} />
            <span>{label}</span>
          </span>
          {isReversed && <span className={styles.reversedBadge}>Reversed</span>}
        </div>
      );
    },
  },
  {
    field: 'description',
    headerName: 'Description',
    flex: 1.5,
    minWidth: 180,
    renderCell: (params) => {
      const desc = params?.value || '-';
      const refType = params?.row?.referenceType;
      return (
        <div className={styles.descCell}>
          <span title={desc}>{desc}</span>
          {refType === 'Order' && <span className={styles.orderRefBadge}>Order Linked</span>}
        </div>
      );
    },
  },
  {
    field: 'paymentMode',
    headerName: 'Mode',
    width: 110,
    renderCell: (params) => <span className={styles.modeText}>{params?.value || 'Cash'}</span>,
  },
  {
    field: 'moneyGiven',
    headerName: 'Given (+)',
    width: 120,
    renderCell: (params) => {
      const row = params?.row;
      if (row?.transactionType === 'MONEY_GIVEN') {
        return <span className={styles.greenText}>+{formatINR(row.amount)}</span>;
      }
      return <span className={styles.mutedText}>—</span>;
    },
  },
  {
    field: 'moneyTaken',
    headerName: 'Taken (-)',
    width: 120,
    renderCell: (params) => {
      const row = params?.row;
      if (
        row?.transactionType === 'MONEY_TAKEN' ||
        (row?.transactionType === 'REVERSAL' && !row?.isReversed)
      ) {
        return <span className={styles.redText}>-{formatINR(row.amount)}</span>;
      }
      return <span className={styles.mutedText}>—</span>;
    },
  },
  {
    field: 'paymentReceived',
    headerName: 'Received (-)',
    width: 120,
    renderCell: (params) => {
      const row = params?.row;
      if (row?.transactionType === 'PAYMENT_RECEIVED') {
        return <span className={styles.greenText}>-{formatINR(row.amount)}</span>;
      }
      return <span className={styles.mutedText}>—</span>;
    },
  },
  {
    field: 'paymentMade',
    headerName: 'Paid (+)',
    width: 120,
    renderCell: (params) => {
      const row = params?.row;
      if (row?.transactionType === 'PAYMENT_MADE') {
        return <span className={styles.blueText}>+{formatINR(row.amount)}</span>;
      }
      return <span className={styles.mutedText}>—</span>;
    },
  },
  {
    field: 'runningBalance',
    headerName: 'Running Balance',
    width: 140,
    renderCell: (params) => {
      const bal = params?.value || 0;
      const isPos = bal > 0;
      const isNeg = bal < 0;
      return (
        <span
          className={`${styles.runningBalText} ${
            isPos ? styles.greenText : isNeg ? styles.redText : styles.settledText
          }`}
        >
          {isPos ? `+${formatINR(bal)}` : isNeg ? `-${formatINR(bal)}` : '₹0'}
        </span>
      );
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 110,
    sortable: false,
    renderCell: (params) => {
      const row = params?.row;
      const isReversed = row?.isReversed;
      const isOrderLinked = row?.referenceType === 'Order';
      const isOpening = row?.transactionType === 'OPENING_BALANCE';

      return (
        <div className={styles.actionsCell}>
          {!isReversed && !isOrderLinked && canEdit && (
            <Tooltip title="Edit Transaction" arrow>
              <button
                type="button"
                onClick={() => onEdit && onEdit(row)}
                className={styles.actionBtn}
              >
                <EditOutlinedIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}

          {!isReversed && !isOpening && (
            <Tooltip title="Reverse Transaction" arrow>
              <button
                type="button"
                onClick={() => onReverse && onReverse(row)}
                className={`${styles.actionBtn} ${styles.reverseAction}`}
              >
                <UndoIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];
