import React from 'react';
import { Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { getBankLogo } from '../../utils/bankLogos';
import styles from './CreditCardItem.module.scss';

const getBankAbbr = (bankName) => {
  if (!bankName) return 'CC';
  if (bankName.includes('ICICI')) return 'ICICI';
  if (bankName.includes('HDFC')) return 'HDFC';
  if (bankName.includes('SBI')) return 'SBI';
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
  } = card || {};

  const displayOwner =
    (cardOwner && cardOwner.trim()) ||
    (userId && typeof userId === 'object' && userId.name) ||
    'CARDHOLDER';

  const usedAmount = Math.max(0, totalLimit - availableLimit);
  const utilization =
    totalLimit > 0 ? Math.min(100, Math.round((usedAmount / totalLimit) * 100)) : 0;
  const bankLogo = getBankLogo(bankName);

  return (
    <div
      className={styles.compactFigmaCard}
      onClick={() => canEdit && onEdit && onEdit(card)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (canEdit && onEdit) onEdit(card);
        }
      }}
    >
      {/* ─── Column 1: Bank Logo & Name ─────────────────────── */}
      <div className={styles.colBank}>
        <div className={styles.bankLogoSquare}>
          {bankLogo ? (
            <img src={bankLogo} alt={bankName} className={styles.bankLogoImg} />
          ) : (
            <span className={styles.bankAbbrText}>{getBankAbbr(bankName)}</span>
          )}
        </div>
        <div className={styles.bankTextGroup}>
          <span className={styles.bankName} title={bankName}>
            {bankName}
          </span>
          <span className={styles.cardDigits} title={`${cardName} •••• ${lastFourDigits}`}>
            {cardName}
          </span>
          <span className={styles.cardDigits} title={`${lastFourDigits}`}>
            •••• {lastFourDigits}
          </span>
        </div>
      </div>

      {/* ─── Column 2: Owner & Limits ───────────────────────── */}
      <div className={styles.colDetails}>
        <div className={styles.ownerLine}>
          <span className={styles.cardOwnerText} title={displayOwner}>
            {displayOwner}
          </span>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.limitsLine}>
          <span className={styles.limitDetailText}>
            Total:  {formatINR(totalLimit)}
          </span>
          <span className={styles.limitDetailText}>
            Avail: <strong className={styles.availText}>{formatINR(availableLimit)}</strong>
          </span>
          <span
            className={`${styles.utilBadge} ${utilization >= 80 ? styles.utilHigh : utilization >= 50 ? styles.utilMedium : styles.utilLow
              }`}
          >
            {utilization}%
          </span>
        </div>
      </div>

      {/* ─── Column 3: Total Limit & Actions ────────────────── */}
      <div className={styles.colActions}>
        <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
          {canEdit && onEdit && (
            <Tooltip title="Edit" arrow>
              <button
                type="button"
                onClick={() => onEdit(card)}
                className={styles.actionBtn}
                aria-label={`Edit ${cardName}`}
              >
                <EditIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canCreate && onDuplicate && (
            <Tooltip title="Duplicate" arrow>
              <button
                type="button"
                onClick={() => onDuplicate(card)}
                className={`${styles.actionBtn} ${styles.duplicateBtn}`}
                aria-label={`Duplicate ${cardName}`}
              >
                <ContentCopyIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canDelete && onDelete && (
            <Tooltip title="Delete" arrow>
              <button
                type="button"
                onClick={() => onDelete(card)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label={`Delete ${cardName}`}
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

export default CreditCardItem;
