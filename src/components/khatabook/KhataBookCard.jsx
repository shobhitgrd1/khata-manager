import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import styles from './KhataBookCard.module.scss';

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

const KhataBookCard = ({
  account,
  onEdit,
  onArchive,
  canEdit = true,
  canDelete = true,
}) => {
  const navigate = useNavigate();

  const {
    _id,
    name = 'Unknown Account',
    mobileNumber = '',
    accountType = 'Other',
    currentBalance = 0,
    lastTransactionDate,
  } = account || {};

  const isPositive = currentBalance > 0;
  const isNegative = currentBalance < 0;
  const isSettled = currentBalance === 0;

  const initial = name ? name.trim().charAt(0).toUpperCase() : 'K';

  const formattedDate = lastTransactionDate
    ? new Date(lastTransactionDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    : null;

  const handleCardClick = () => {
    if (_id) navigate(`/khatabook/${_id}`);
  };

  return (
    <div
      className={styles.compactFigmaCard}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* ─── Column 1: Account Info ─────────────────────────── */}
      <div className={styles.colAccount}>
        <div className={styles.khataAvatarSquare}>
          <span className={styles.avatarLetter}>{initial}</span>
        </div>
        <div className={styles.accountTextGroup}>
          <span className={styles.accountName} title={name}>
            {name}
          </span>
          <span className={styles.accountSub} title={mobileNumber || accountType}>
            {mobileNumber || accountType}
          </span>
        </div>
      </div>

      {/* ─── Column 2: Status & Last Activity ───────────────── */}
      <div className={styles.colDetails}>
        <div className={styles.typeLine}>
          <span className={styles.typeBadge}>{accountType}</span>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.dateLine}>
          <CalendarMonthIcon className={styles.calendarIcon} />
          <span className={styles.dateText}>
            {formattedDate ? `Last: ${formattedDate}` : 'No recent transactions'}
          </span>
        </div>
      </div>

      {/* ─── Column 3: Balance & Actions ────────────────────── */}
      <div className={styles.colFinancialActions}>
        <span
          className={
            isPositive
              ? styles.balanceGreen
              : isNegative
                ? styles.balanceRed
                : styles.balanceNeutral
          }
        >
          {formatINR(currentBalance)}
        </span>

        <span
          className={
            isPositive
              ? styles.balanceLabelGreen
              : isNegative
                ? styles.balanceLabelRed
                : styles.balanceLabelNeutral
          }
        >
          {isPositive ? "You'll Get" : isNegative ? "You'll Give" : 'Settled'}
        </span>

        <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
          {canEdit && onEdit && (
            <Tooltip title="Edit" arrow>
              <button
                type="button"
                onClick={() => onEdit(account)}
                className={styles.actionBtn}
                aria-label={`Edit ${name}`}
              >
                <EditOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canDelete && onArchive && (
            <Tooltip title="Archive / Delete" arrow>
              <button
                type="button"
                onClick={() => onArchive(account)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label={`Archive ${name}`}
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

export default KhataBookCard;
