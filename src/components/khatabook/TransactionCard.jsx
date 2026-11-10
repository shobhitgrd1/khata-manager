import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PaymentsIcon from '@mui/icons-material/Payments';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import styles from './TransactionCard.module.scss';

const TX_CONFIG = {
  MONEY_GIVEN: {
    label: 'Money Given',
    icon: TrendingUpIcon,
    sign: '+',
    colorClass: 'green',
    subText: "YOU'LL GET",
  },
  MONEY_TAKEN: {
    label: 'Money Taken',
    icon: TrendingDownIcon,
    sign: '-',
    colorClass: 'red',
    subText: "YOU'LL GIVE",
  },
  PAYMENT_RECEIVED: {
    label: 'Payment Received',
    icon: PriceCheckIcon,
    sign: '-',
    colorClass: 'green',
    subText: 'RECEIVED',
  },
  PAYMENT_MADE: {
    label: 'Payment Made',
    icon: PaymentsIcon,
    sign: '+',
    colorClass: 'blue',
    subText: 'PAID',
  },
  OPENING_BALANCE: {
    label: 'Opening Balance',
    icon: PaymentsIcon,
    sign: '',
    colorClass: 'neutral',
    subText: 'OPENING',
  },
  REVERSAL: {
    label: 'Reversal',
    icon: UndoIcon,
    sign: '-',
    colorClass: 'amber',
    subText: 'REVERSED',
  },
};

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

const formatDate = (dateVal) => {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(dateVal);
  }
};

const formatTime = (dateVal) => {
  if (!dateVal) return '08:30 am';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '08:30 am';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).toLowerCase();
  } catch {
    return '08:30 am';
  }
};

const TransactionCard = ({
  transaction,
  onEdit,
  onReverse,
  canEdit = true,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  if (!transaction) return null;

  const {
    _id,
    transactionDate,
    transactionType = 'MONEY_GIVEN',
    description = '',
    referenceType,
    paymentMode = 'Cash',
    amount = 0,
    runningBalance,
    isReversed = false,
  } = transaction;

  const config = TX_CONFIG[transactionType] || {
    label: transactionType.replace(/_/g, ' '),
    icon: TrendingUpIcon,
    sign: '+',
    colorClass: 'green',
    subText: "YOU'LL GET",
  };

  const IconComponent = config.icon;
  const isOrderLinked = referenceType === 'Order';
  const isOpening = transactionType === 'OPENING_BALANCE';

  // Amount sign and display
  let amountDisplay = `${config.sign}${formatINR(amount)}`;
  if (transactionType === 'OPENING_BALANCE') {
    amountDisplay = amount >= 0 ? `+${formatINR(amount)}` : `-${formatINR(amount)}`;
  } else if (transactionType === 'REVERSAL') {
    amountDisplay = `-${formatINR(amount)}`;
  }

  // Running balance styling
  const hasRunningBal = runningBalance !== undefined && runningBalance !== null;
  const isBalPos = hasRunningBal && runningBalance > 0;
  const isBalNeg = hasRunningBal && runningBalance < 0;

  const balText = hasRunningBal
    ? isBalPos
      ? `+${formatINR(runningBalance)}`
      : isBalNeg
      ? `-${formatINR(runningBalance)}`
      : '₹0'
    : null;

  const hasActions = !isReversed && canEdit && (onEdit || onReverse);

  const handleCardClick = (e) => {
    if (!hasActions) return;
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <div
        className={`${styles.compactFigmaCard} ${isReversed ? styles.cardReversed : ''}`}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(e);
          }
        }}
      >
        {/* ─── Column 1: Left Square Icon ──────────────────── */}
        <div className={`${styles.iconSquare} ${styles[config.colorClass]}`}>
          <IconComponent className={styles.typeIcon} />
        </div>

        {/* ─── Column 2: Title & [Order], Date & Time ──────── */}
        <div className={styles.colMiddle}>
          <div className={styles.titleRow}>
            <span className={styles.txTitle}>{config.label}</span>
            {isOrderLinked && (
              <span className={styles.orderBadge} title="Linked to Order">
                <StorefrontIcon className={styles.orderBadgeIcon} />
                <span>Order</span>
              </span>
            )}
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <CalendarMonthIcon className={styles.metaIcon} />
              <span>{formatDate(transactionDate)}</span>
            </span>
            <span className={styles.metaItem}>
              <AccessTimeIcon className={styles.metaIcon} />
              <span>{formatTime(transactionDate)}</span>
            </span>
          </div>
        </div>

        {/* ─── Column 3: Amount, Status Pill, Running Bal ──── */}
        <div className={styles.colRight}>
          <span
            className={`${styles.amountText} ${
              isReversed
                ? styles.amount_amber
                : styles[`amount_${config.colorClass}`] || styles.amount_green
            }`}
          >
            {amountDisplay}
          </span>

          <span
            className={`${styles.statusPill} ${
              isReversed
                ? styles.pill_amber
                : styles[`pill_${config.colorClass}`] || styles.pill_green
            }`}
          >
            {isReversed ? 'REVERSED' : config.subText}
          </span>

          {hasRunningBal && (
            <span
              className={`${styles.runningBal} ${
                isBalPos ? styles.balGreen : isBalNeg ? styles.balRed : styles.balSettled
              }`}
            >
              Bal: {balText}
            </span>
          )}
        </div>

        {/* ─── Far Right: Chevron ──────────────────────────── */}
        <div className={styles.colChevron}>
          <ChevronRightIcon className={styles.chevronIcon} />
        </div>
      </div>

      {/* Context Actions Menu */}
      {hasActions && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            style: {
              background: '#0D1D30',
              border: '1px solid rgba(54, 207, 255, 0.3)',
              borderRadius: '8px',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              minWidth: 160,
            },
          }}
        >
          {!isOrderLinked && onEdit && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleCloseMenu();
                onEdit(transaction);
              }}
              style={{ gap: 10, fontSize: '0.84rem', fontWeight: 600 }}
            >
              <EditOutlinedIcon fontSize="small" style={{ color: '#38BDF8' }} />
              Edit Transaction
            </MenuItem>
          )}
          {!isOpening && onReverse && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleCloseMenu();
                onReverse(transaction);
              }}
              style={{ gap: 10, fontSize: '0.84rem', fontWeight: 600, color: '#FBBF24' }}
            >
              <UndoIcon fontSize="small" />
              Reverse Transaction
            </MenuItem>
          )}
        </Menu>
      )}
    </>
  );
};

TransactionCard.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string,
    transactionDate: PropTypes.string,
    transactionType: PropTypes.string,
    description: PropTypes.string,
    referenceType: PropTypes.string,
    paymentMode: PropTypes.string,
    amount: PropTypes.number,
    runningBalance: PropTypes.number,
    isReversed: PropTypes.bool,
  }).isRequired,
  onEdit: PropTypes.func,
  onReverse: PropTypes.func,
  canEdit: PropTypes.bool,
};

export default TransactionCard;
