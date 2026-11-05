import React from 'react';
import { Button, LinearProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContactlessIcon from '@mui/icons-material/Contactless';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getBankLogo } from '../../utils/bankLogos';
import styles from './CreditCardItem.module.scss';

// Bank badge helper
const getBankAbbr = (bankName) => {
  if (!bankName) return 'CC';
  if (bankName.includes('ICICI')) return 'ICICI';
  if (bankName.includes('HDFC')) return 'HDFC';
  if (bankName.includes('State Bank') || bankName.includes('SBI')) return 'SBI';
  if (bankName.includes('Axis')) return 'AXIS';
  if (bankName.includes('Kotak')) return 'KOTAK';
  if (bankName.includes('RBL')) return 'RBL';
  if (bankName.includes('AU')) return 'AU';
  if (bankName.includes('HSBC')) return 'HSBC';
  if (bankName.includes('Yes')) return 'YES';
  if (bankName.includes('Baroda')) return 'BOB';
  return bankName.substring(0, 3).toUpperCase();
};

const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
};

const CreditCardItem = ({
  card,
  onEdit,
  onDuplicate,
  onDelete,
  canEdit = true,
  canDelete = true,
  canCreate = true,
}) => {
  const {
    bankName,
    cardName,
    lastFourDigits,
    totalLimit = 0,
    availableLimit = 0,
    cardOwner,
    userId,
  } = card;

  const displayOwner =
    (cardOwner && cardOwner.trim()) ||
    (userId && typeof userId === 'object' && userId.name) ||
    'CARDHOLDER';

  // Used credit = Total - Available
  const usedAmount = Math.max(0, totalLimit - availableLimit);
  const utilization =
    totalLimit > 0 ? Math.min(100, Math.round((usedAmount / totalLimit) * 100)) : 0;

  const fillClass =
    utilization > 75
      ? styles.fillDanger
      : utilization > 45
      ? styles.fillWarning
      : styles.fillNormal;

  return (
    <div className={styles.cardWrapper}>
      {/* Ambient glass glare */}
      <div className={styles.ambientGlare} />

      {/* Top Row: Bank Badge & Chip / Wireless icon */}
      <div className={styles.topRow}>
        <div className={styles.bankBadge}>
          {getBankLogo(bankName) ? (
            <img
              src={getBankLogo(bankName)}
              alt={bankName}
              className={styles.bankLogoSquare}
            />
          ) : (
            <div className={styles.bankIconBox}>
              {getBankAbbr(bankName)}
            </div>
          )}
          <div className={styles.bankDetails}>
            <h3 className={styles.bankName}>{bankName}</h3>
            <p className={styles.cardName}>{cardName}</p>
          </div>
        </div>

        <div className={styles.chipAndWifi}>
          <div className={styles.emvChip} />
          <ContactlessIcon className={styles.contactlessIcon} />
        </div>
      </div>

      {/* Masked Card Number */}
      <div className={styles.cardNumberRow}>
        <span className={styles.maskedNumber}>
          •••• •••• •••• {lastFourDigits}
        </span>
        <span className={styles.cardCategory}>Credit</span>
      </div>

      {/* Card Owner / Cardholder Row */}
      <div className={styles.cardOwnerRow}>
        <div className={styles.cardOwnerBox}>
          <span className={styles.cardOwnerLabel}>CARD OWNER</span>
          <span className={styles.cardOwnerName}>
            {displayOwner.toUpperCase()}
          </span>
        </div>
        {userId && typeof userId === 'object' && userId.username && (
          <span className={styles.ownerUserBadge}>
            @{userId.username}
          </span>
        )}
      </div>

      {/* Credit Limits Grid */}
      <div className={styles.limitsGrid}>
        <div className={styles.limitBox}>
          <span className={styles.limitLabel}>Total Limit</span>
          <span className={styles.limitValue}>{formatINR(totalLimit)}</span>
        </div>
        <div className={styles.limitBox}>
          <span className={styles.limitLabel}>Available</span>
          <span className={`${styles.limitValue} ${styles.limitValueAvailable}`}>
            {formatINR(availableLimit)}
          </span>
        </div>
        <div className={styles.limitBox}>
          <span className={styles.limitLabel}>Used Credit</span>
          <span className={`${styles.limitValue} ${styles.limitValueUsed}`}>
            {formatINR(usedAmount)}
          </span>
        </div>
      </div>

      {/* Credit Utilization Bar */}
      <div className={styles.utilizationRow}>
        <div className={styles.utilizationHeader}>
          <span className={styles.utilizationLabel}>Utilization</span>
          <span
            className={`${styles.utilizationBadge} ${
              utilization >= 80
                ? styles.utilHigh
                : utilization >= 50
                ? styles.utilMedium
                : styles.utilLow
            }`}
          >
            {utilization}% used
          </span>
        </div>
        <LinearProgress
          variant="determinate"
          value={utilization}
          className={`${styles.progressBar} ${fillClass}`}
        />
      </div>

      {/* Bottom Actions: Edit, Duplicate & Delete */}
      <div className={styles.bottomActions}>
        {canEdit && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon className={styles.btnIcon} />}
            onClick={() => onEdit(card)}
            className={styles.actionBtnEdit}
          >
            Edit
          </Button>
        )}
        {canCreate && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyIcon className={styles.btnIcon} />}
            onClick={() => onDuplicate && onDuplicate(card)}
            className={styles.actionBtnDuplicate}
          >
            Duplicate
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DeleteOutlinedIcon className={styles.btnIcon} />}
            onClick={() => onDelete(card)}
            className={styles.actionBtnDelete}
          >
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreditCardItem;
