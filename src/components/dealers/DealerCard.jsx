import React, { useState, useRef } from 'react';
import { Button, Tooltip } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

import DealerAddressCard from './DealerAddressCard';
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
  onCopySuccess,
  onCopyError,
}) => {
  const [expanded, setExpanded] = useState(false);
  const touchTimerRef = useRef(null);

  const {
    dealerName = 'Unknown Dealer',
    mobileNumber = '',
    mobileNumbers = [],
    addresses = [],
    deliveredOrderCount = 0,
  } = dealer || {};

  // Financial metrics (support both flat properties and profitStats object)
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

  const profitPercentage =
    dealer?.profitPercentage !== undefined && dealer?.profitPercentage !== null
      ? Number(dealer.profitPercentage)
      : dealer?.profitStats?.profitPercentage !== undefined && dealer?.profitStats?.profitPercentage !== null
      ? Number(dealer.profitStats.profitPercentage)
      : dealer?.totalPurchaseAmount > 0
      ? Math.round((cashProfit / dealer.totalPurchaseAmount) * 10000) / 100
      : 0;

  const numbersList =
    Array.isArray(mobileNumbers) && mobileNumbers.length > 0
      ? mobileNumbers
      : mobileNumber
      ? [mobileNumber]
      : [];

  // Address logic: show ONLY the primary address (first address) by default
  const totalAddresses = Array.isArray(addresses) ? addresses.length : 0;
  const primaryAddress = totalAddresses > 0 ? [addresses[0]] : [];
  const visibleAddresses = expanded ? addresses : primaryAddress;
  const hasMultipleAddresses = totalAddresses > 1;

  // Avatar initial letter
  const initial = dealerName ? dealerName.trim().charAt(0).toUpperCase() : 'D';

  // Copy mobile number
  const handleCopyMobile = async (num, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(num);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = num;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      if (onCopySuccess) onCopySuccess(`Mobile number ${num}`);
    } catch (err) {
      console.error('Failed to copy mobile:', err);
      if (onCopyError) onCopyError();
    }
  };

  const handleTouchStart = (num) => {
    touchTimerRef.current = setTimeout(() => {
      handleCopyMobile(num);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  return (
    <div className={styles.dealerCard}>
      <div className={styles.ambientGlare} />

      {/* Top Header Row */}
      <div className={styles.topRow}>
        <div className={styles.dealerInfo}>
          <div className={styles.avatarBox}>
            <span className={styles.avatarLetter}>{initial}</span>
          </div>

          <div className={styles.nameAndMobile}>
            <h3 className={styles.dealerName}>{dealerName}</h3>

            <div className={styles.mobileListRow}>
              <PhoneIcon className={styles.phoneIcon} />
              <div className={styles.numbersWrapper}>
                {numbersList.length > 0 ? (
                  numbersList.map((num, idx) => (
                    <span key={idx} className={styles.numberItemWrapper}>
                      <Tooltip title={`Click to copy: ${num}`} arrow>
                        <button
                          type="button"
                          className={styles.clickableNumber}
                          onClick={(e) => handleCopyMobile(num, e)}
                          onTouchStart={() => handleTouchStart(num)}
                          onTouchEnd={handleTouchEnd}
                          onTouchCancel={handleTouchEnd}
                        >
                          {num}
                        </button>
                      </Tooltip>
                      {idx < numbersList.length - 1 && <span className={styles.comma}>,</span>}
                    </span>
                  ))
                ) : (
                  <span className={styles.noNumber}>No mobile number</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order count pill */}
        <div
          className={styles.orderCountBadge}
          title={`${deliveredOrderCount} delivered order${deliveredOrderCount === 1 ? '' : 's'} in selected period`}
        >
          <LocalShippingOutlinedIcon className={styles.badgeIcon} />
          <span>{deliveredOrderCount} Delivered</span>
        </div>
      </div>

      {/* 3 Profit Sections Breakdown Strip */}
      <div className={styles.profitStrip}>
        {/* A. Cash Profit */}
        <div className={styles.profitCol}>
          <span className={styles.profitColLabel}>Cash Profit</span>
          <span
            className={`${styles.profitColVal} ${
              cashProfit > 0
                ? styles.valGreen
                : cashProfit < 0
                ? styles.valRed
                : styles.valNeutral
            }`}
          >
            {formatCurrency(cashProfit)}
          </span>
          <span
            className={`${styles.profitColSub} ${
              profitPercentage > 0
                ? styles.subGreen
                : profitPercentage < 0
                ? styles.subRed
                : styles.subNeutral
            }`}
            title="Cash Profit Percentage = (Cash Profit / Total Purchase Price) × 100"
          >
            {profitPercentage > 0 ? `+${profitPercentage}%` : `${profitPercentage}%`}
          </span>
        </div>

        <div className={styles.profitDivider} />

        {/* B. Cashback Profit */}
        <div className={styles.profitCol}>
          <span className={styles.profitColLabel}>Cashback</span>
          <span
            className={`${styles.profitColVal} ${
              cashbackProfit > 0 ? styles.valCyan : styles.valNeutral
            }`}
          >
            {cashbackProfit > 0 ? `+₹${Math.round(cashbackProfit).toLocaleString('en-IN')}` : '₹0'}
          </span>
          <span className={styles.profitColSubMuted}>
            {cashbackProfit > 0 ? 'Extra Profit' : 'No Cashback'}
          </span>
        </div>

        <div className={styles.profitDivider} />

        {/* C. Net Total Profit */}
        <div className={styles.profitCol}>
          <span className={styles.profitColLabel}>Net Total</span>
          <span
            className={`${styles.profitColVal} ${styles.netProfitVal} ${
              netProfit > 0
                ? styles.valGreen
                : netProfit < 0
                ? styles.valRed
                : styles.valNeutral
            }`}
          >
            {formatCurrency(netProfit)}
          </span>
          <span
            className={`${styles.profitColSub} ${
              netProfit >= 0 ? styles.subGreen : styles.subRed
            }`}
          >
            {netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
          </span>
        </div>
      </div>

      {/* Addresses Section (Pinned below profit strip, expands downwards) */}
      <div className={styles.addressSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            {totalAddresses > 1
              ? `Addresses (${totalAddresses})`
              : totalAddresses === 1
              ? 'Address'
              : 'Saved Addresses'}
          </span>
        </div>

        <div className={styles.addressList}>
          {visibleAddresses.length > 0 ? (
            visibleAddresses.map((addr, idx) => (
              <DealerAddressCard
                key={addr._id || `${addr.addressTitle}-${idx}`}
                address={addr}
                onCopySuccess={onCopySuccess}
                onCopyError={onCopyError}
              />
            ))
          ) : (
            <div className={styles.emptyAddress}>No addresses saved</div>
          )}
        </div>

        {hasMultipleAddresses && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={styles.expandBtn}
          >
            {expanded ? (
              <>
                <ExpandLessIcon className={styles.expandIcon} />
                <span>Show Less</span>
              </>
            ) : (
              <>
                <ExpandMoreIcon className={styles.expandIcon} />
                <span>Show All Addresses ({totalAddresses})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Card Actions Footer - Compact Single Row */}
      <div className={styles.cardActions}>
        {canEdit && (
          <Tooltip title="Edit Dealer" arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon className={styles.btnIcon} />}
              onClick={() => onEdit(dealer)}
              className={styles.editBtn}
            >
              Edit
            </Button>
          </Tooltip>
        )}

        {canCreate && (
          <Tooltip title="Duplicate Dealer" arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon className={styles.btnIcon} />}
              onClick={() => onDuplicate && onDuplicate(dealer)}
              className={styles.duplicateBtn}
            >
              Duplicate
            </Button>
          </Tooltip>
        )}

        {canDelete && (
          <Tooltip title="Delete Dealer" arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteOutlinedIcon className={styles.btnIcon} />}
              onClick={() => onDelete(dealer)}
              className={styles.deleteBtn}
            >
              Delete
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default DealerCard;
