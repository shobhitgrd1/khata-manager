import React from 'react';
import { Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import styles from './DealersPage.module.scss';

export const getDealerColumns = ({
  canEdit = true,
  canCreate = true,
  canDelete = true,
  handleCopyMobile,
  handleMobileTouchStart,
  handleMobileTouchEnd,
  handleOpenAddressDetails,
  handleOpenAddressOverflow,
  onEdit,
  onDuplicate,
  onDelete,
}) => [
  {
    field: 'dealerName',
    headerName: 'Dealer Name',
    flex: 1.3,
    minWidth: 180,
    renderCell: (params) => {
      const row = params?.row || {};
      const initial = row.dealerName ? row.dealerName.trim().charAt(0).toUpperCase() : 'D';
      return (
        <div className={styles.dealerNameCell}>
          <span className={styles.avatarDot}>{initial}</span>
          <span className={styles.dealerNameText}>{row.dealerName}</span>
        </div>
      );
    },
  },
  {
    field: 'mobileNumber',
    headerName: 'Mobile Number',
    flex: 1.2,
    minWidth: 180,
    renderCell: (params) => {
      const row = params?.row || {};
      const numbers =
        Array.isArray(row.mobileNumbers) && row.mobileNumbers.length > 0
          ? row.mobileNumbers
          : row.mobileNumber
          ? [row.mobileNumber]
          : [];

      if (numbers.length === 0) {
        return <span className={styles.noMobileText}>—</span>;
      }

      return (
        <div className={styles.mobileColumnContainer}>
          {numbers.map((num, idx) => (
            <span key={idx} className={styles.mobileItemWrapper}>
              <Tooltip title={`Click to copy: ${num}`} arrow>
                <button
                  type="button"
                  className={styles.clickableMobileNumber}
                  onClick={(e) => handleCopyMobile && handleCopyMobile(num, e)}
                  onTouchStart={() => handleMobileTouchStart && handleMobileTouchStart(num)}
                  onTouchEnd={handleMobileTouchEnd}
                  onTouchCancel={handleMobileTouchEnd}
                >
                  {num}
                </button>
              </Tooltip>
              {idx < numbers.length - 1 && <span className={styles.mobileSeparator}>,</span>}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    field: 'location',
    headerName: 'Location',
    flex: 1.5,
    minWidth: 220,
    sortable: false,
    renderCell: (params) => {
      const row = params?.row || {};
      const addresses = row.addresses || [];

      if (addresses.length === 0) {
        return <span className={styles.noAddressText}>No Address</span>;
      }

      const firstTwo = addresses.slice(0, 2);
      const remainingCount = addresses.length - 2;

      return (
        <div className={styles.locationBadgesContainer}>
          {firstTwo.map((addr, idx) => (
            <Tooltip
              key={addr._id || idx}
              title={`Click to view address: ${addr.addressTitle}`}
              arrow
            >
              <button
                type="button"
                className={styles.addressTitleBadge}
                onClick={() => handleOpenAddressDetails && handleOpenAddressDetails(addr, row.dealerName)}
              >
                {addr.addressTitle || `Address #${idx + 1}`}
              </button>
            </Tooltip>
          ))}

          {remainingCount > 0 && (
            <Tooltip title={`Click to view +${remainingCount} more addresses`} arrow>
              <button
                type="button"
                className={styles.overflowBadge}
                onClick={() =>
                  handleOpenAddressOverflow &&
                  handleOpenAddressOverflow(addresses.slice(2), row.dealerName)
                }
              >
                +{remainingCount}
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    field: 'profit',
    headerName: 'Profit',
    flex: 1.2,
    minWidth: 160,
    valueGetter: (value, row) => {
      const item = row || value?.row || value;
      return item?.totalProfit || 0;
    },
    renderCell: (params) => {
      const row = params?.row || {};
      const totalProfit = row.totalProfit || 0;
      const profitPercentage = row.profitPercentage || 0;
      const deliveredOrders = row.deliveredOrderCount || 0;

      const isPos = totalProfit > 0;
      const isNeg = totalProfit < 0;

      const formattedAmount = isPos
        ? `+₹${Math.abs(totalProfit).toLocaleString('en-IN')}`
        : isNeg
        ? `-₹${Math.abs(totalProfit).toLocaleString('en-IN')}`
        : `₹0`;

      const formattedPercent = isPos
        ? `(+${profitPercentage}%)`
        : isNeg
        ? `(${profitPercentage}%)`
        : `(0%)`;

      const badgeClass = isPos
        ? styles.profitPositive
        : isNeg
        ? styles.profitNegative
        : styles.profitNeutral;

      return (
        <Tooltip
          title={`${deliveredOrders} delivered order${
            deliveredOrders === 1 ? '' : 's'
          } in selected period`}
          arrow
        >
          <div className={`${styles.profitCell} ${badgeClass}`}>
            <span className={styles.profitAmount}>{formattedAmount}</span>
            <span className={styles.profitPercent}>{formattedPercent}</span>
          </div>
        </Tooltip>
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
            <Tooltip title="Edit Dealer" arrow>
              <button
                type="button"
                onClick={() => onEdit && onEdit(row)}
                className={styles.rowActionBtn}
                aria-label={`Edit ${row?.dealerName}`}
              >
                <EditOutlinedIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
          {canCreate && (
            <Tooltip title="Duplicate Dealer" arrow>
              <button
                type="button"
                onClick={() => onDuplicate && onDuplicate(row)}
                className={`${styles.rowActionBtn} ${styles.duplicateAction}`}
                aria-label={`Duplicate ${row?.dealerName}`}
              >
                <ContentCopyIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete Dealer" arrow>
              <button
                type="button"
                onClick={() => onDelete && onDelete(row)}
                className={`${styles.rowActionBtn} ${styles.deleteAction}`}
                aria-label={`Delete ${row?.dealerName}`}
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

export default getDealerColumns;

