import React from 'react';
import { Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StorefrontIcon from '@mui/icons-material/Storefront';
import styles from './DealerCard.module.scss';

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '₹0';
  const num = Number(val);
  if (isNaN(num)) return '₹0';
  const prefix = num > 0 ? '+₹' : num < 0 ? '-₹' : '₹';
  return `${prefix}${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

const DealerCard = ({
  dealer,
  onEdit,
  onDuplicate,
  onDelete,
  canEdit = true,
  canDelete = true,
  canCreate = true,
}) => {
  const {
    dealerName = 'Unknown Dealer',
    mobileNumber = '',
    mobileNumbers = [],
    addresses = [],
    deliveredOrderCount = 0,
  } = dealer || {};

  const cashProfit =
    dealer?.totalProfit !== undefined && dealer?.totalProfit !== null
      ? Number(dealer.totalProfit)
      : Number(dealer?.profitStats?.totalProfit || 0);

  const cashbackProfit =
    dealer?.totalCashbackAmount !== undefined && dealer?.totalCashbackAmount !== null
      ? Number(dealer.totalCashbackAmount)
      : Number(dealer?.profitStats?.totalCashbackAmount || 0);

  const netProfit =
    dealer?.totalNetProfit !== undefined && dealer?.totalNetProfit !== null
      ? Number(dealer.totalNetProfit)
      : dealer?.profitStats?.totalNetProfit !== undefined && dealer?.profitStats?.totalNetProfit !== null
        ? Number(dealer.profitStats.totalNetProfit)
        : Math.round((cashProfit + cashbackProfit) * 100) / 100;

  const numbersList =
    Array.isArray(mobileNumbers) && mobileNumbers.length > 0
      ? mobileNumbers
      : mobileNumber
        ? [mobileNumber]
        : [];

  const initial = dealerName ? dealerName.trim().charAt(0).toUpperCase() : 'D';
  const primaryAddr = addresses && addresses.length > 0 ? addresses[0] : null;

  return (
    <div
      className={styles.compactFigmaCard}
      onClick={() => canEdit && onEdit && onEdit(dealer)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (canEdit && onEdit) onEdit(dealer);
        }
      }}
    >
      {/* ─── Column 1: Dealer Info ──────────────────────────── */}
      <div className={styles.colDealer}>
        <div className={styles.dealerAvatarSquare}>
          <span className={styles.avatarLetter}>{initial}</span>
        </div>
        <div className={styles.dealerTextGroup}>
          <span className={styles.dealerName} title={dealerName}>
            {dealerName}
          </span>
          <span className={styles.dealerSub} title={numbersList[0] || ''}>
            {numbersList[0] || 'No number'}
          </span>
        </div>
      </div>

      {/* ─── Column 2: Address & Order Stats ────────────────── */}
      <div className={styles.colDetails}>
        <div className={styles.addressLine}>
          <LocationOnIcon className={styles.locationPinIcon} />
          <span
            className={styles.addressText}
            title={primaryAddr ? `${primaryAddr.shopName || ''} - ${primaryAddr.city || ''}` : 'No address'}
          >
            {primaryAddr ? `${primaryAddr.shopName || 'Store'} • ${primaryAddr.city || 'Location'}` : 'No address'}
          </span>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.statsLine}>
          <StorefrontIcon className={styles.storeIcon} />
          <span className={styles.statsText}>
            {deliveredOrderCount} Delivered • {addresses.length} {addresses.length === 1 ? 'Store' : 'Stores'}
          </span>
        </div>
      </div>

      {/* ─── Column 3: Net Profit & Actions ─────────────────── */}
      <div className={styles.colFinancialActions}>
        <span className={netProfit >= 0 ? styles.profitGreen : styles.profitRed}>
          {formatCurrency(netProfit)}
        </span>

        <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
          {canEdit && onEdit && (
            <Tooltip title="Edit" arrow>
              <button
                type="button"
                onClick={() => onEdit(dealer)}
                className={styles.actionBtn}
                aria-label={`Edit ${dealerName}`}
              >
                <EditOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canCreate && onDuplicate && (
            <Tooltip title="Duplicate" arrow>
              <button
                type="button"
                onClick={() => onDuplicate(dealer)}
                className={`${styles.actionBtn} ${styles.duplicateBtn}`}
                aria-label={`Duplicate ${dealerName}`}
              >
                <ContentCopyIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canDelete && onDelete && (
            <Tooltip title="Delete" arrow>
              <button
                type="button"
                onClick={() => onDelete(dealer)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label={`Delete ${dealerName}`}
              >
                <DeleteOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

        </div>
      </div>
    </div>
  );
};

export default DealerCard;
