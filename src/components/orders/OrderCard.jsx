import React from 'react';
import { Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { getAccountLogo } from '../../utils/accountLogos';
import { getBankLogo } from '../../utils/bankLogos';
import styles from './OrderCard.module.scss';

const OrderCard = ({
  order,
  onDeliver,
  onCorrectPrice,
  onEdit,
  onDuplicate,
  onDelete,
  canEdit = true,
  canDelete = true,
  canCreate = true,
}) => {
  const navigate = useNavigate();

  if (!order) return null;

  const {
    _id,
    dealerNameSnapshot = 'Unknown Dealer',
    productNameSnapshot = 'Unknown Product',
    variant = '',
    color = {},
    purchasePrice = 0,
    profit = null,
    status = 'Order In Process',
    orderDate,
    deliveryDate,
  } = order;

  const isDelivered = status === 'Delivered';

  // Profit calculation
  const cbAmount = isDelivered && order?.cashbackApplied && order?.cashbackAmount ? Number(order.cashbackAmount) : 0;
  const effectiveNetProfit = profit !== null
    ? (order?.netProfit !== null && order?.netProfit !== undefined ? Number(order.netProfit) : Number(profit) + cbAmount)
    : null;

  const profitPercentage =
    purchasePrice > 0 && effectiveNetProfit !== null
      ? Math.round(((effectiveNetProfit / purchasePrice) * 100) * 100) / 100
      : null;

  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

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

  // Account details & logo
  const accountType = order.accountTypeSnapshot || order.accountId?.accountType || '';
  const accountName = order.accountNameSnapshot || order.accountId?.fullName || 'Account';
  const mobile = order.accountId?.mobileNumber || order.accountMobileSnapshot || '';
  const email = order.accountId?.email || order.accountEmailSnapshot || '';
  const accountSecondary = mobile || email || accountType;
  const accountLogo = getAccountLogo(accountType || accountName);

  // Payment details & logo
  const method = order.paymentMethod || 'Credit Card';
  const ccObj = order.creditCardId || order.creditCardSnapshot || {};
  const pDetails = order.paymentDetails || {};
  const bankName = ccObj.bankName || pDetails.bankName || (method === 'Credit Card' ? 'Credit Card' : method);
  const cardName = ccObj.cardName || pDetails.cardName || method;
  const lastFour = ccObj.lastFourDigits || pDetails.lastFourDigits || '••••';
  const bankLogo = getBankLogo(bankName);

  const colorName = color?.colorName || '';

  const handleCardClick = () => {
    navigate(`/orders/${_id}`);
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
      {/* ─── Card Main: 3 Columns (Figma 2nd Design) ────────── */}
      <div className={styles.cardMain}>
        {/* ─── Column 1: Account Info ─────────────────────────── */}
        <div className={styles.colAccount}>
          <div className={styles.accountLogoSquare}>
            {accountLogo ? (
              <img src={accountLogo} alt={accountName} className={styles.accountLogoImg} />
            ) : (
              <span className={styles.accountFallbackLetter}>
                {(accountName || 'A').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className={styles.accountTextGroup}>
            <span className={styles.accountName} title={accountName}>
              {accountName}
            </span>
            {accountSecondary && (
              <span className={styles.accountSub} title={accountSecondary}>
                {accountSecondary}
              </span>
            )}
          </div>
        </div>

        {/* ─── Column 2: Dealer, Product & Payment Details ─────── */}
        <div className={styles.colDetails}>
          {/* Dealer name */}
          <div className={styles.dealerLine}>
            <span className={styles.dealerName} title={dealerNameSnapshot}>
              {dealerNameSnapshot}
            </span>
          </div>

          {/* Product with location icon & variant */}
          <div className={styles.productLine}>
            <span className={styles.productText} title={`${productNameSnapshot} ${variant ? `(${variant})` : ''}`}>
              {productNameSnapshot} {variant ? `(${variant})` : ''} {colorName ? `• ${colorName}` : ''}
            </span>
          </div>
          {/* Subtle horizontal separator */}
          <div className={styles.cardDivider} />

          {/* Payment line */}
          <div className={styles.paymentLine}>
            <div className={styles.paymentLogoBox}>
              {bankLogo ? (
                <img src={bankLogo} alt={bankName} className={styles.paymentLogoImg} />
              ) : (
                <CreditCardIcon className={styles.paymentIconFallback} />
              )}
            </div>
            <div className={styles.paymentTextGroup}>
              <span className={styles.paymentBankLast4}>
                {bankName} • {lastFour}
              </span>
              <span className={styles.paymentCardSubtitle} title={cardName}>
                {cardName}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Column 3: Price, Status & Profit ────────────────── */}
        <div className={styles.colStatusFinancial}>
          <span className={styles.purchasePrice}>{formatINR(purchasePrice)}</span>

          <div className={styles.statusRow}>
            <span className={isDelivered ? styles.badgeDelivered : styles.badgeInProcess}>
              {isDelivered ? 'Delivered' : 'Order In Process'}
            </span>
          </div>

          <div className={styles.profitRow}>
            {isDelivered ? (
              <span className={effectiveNetProfit >= 0 ? styles.profitGreen : styles.profitRed}>
                {effectiveNetProfit >= 0 ? `+${formatINR(effectiveNetProfit)}` : `-${formatINR(Math.abs(effectiveNetProfit))}`}
                {profitPercentage !== null && ` (${effectiveNetProfit >= 0 ? `+${profitPercentage}%` : `${profitPercentage}%`})`}
              </span>
            ) : (
              <div className={styles.pendingProfitBlock}>
                <span className={styles.pendingDash}>--</span>
                <span className={styles.pendingProfitLabel}>Profit: --</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Footer Divider ─────────────────────────────────── */}
      <div className={styles.footerDivider} />

      {/* ─── Card Actions Footer: Dates on Left, Only Icons on Right ─── */}
      <div className={styles.cardFooter} onClick={(e) => e.stopPropagation()}>
        {/* Left: Order Date & Delivery Date */}
        <div className={styles.footerDates}>
          <div className={styles.dateLine}>
            <span className={styles.dateLabel}>Ord:</span>
            <span className={styles.dateVal}>{formatDate(orderDate)}</span>
          </div>
          <div className={styles.dateLine}>
            <span className={styles.dateLabel}>Del:</span>
            <span className={deliveryDate ? styles.dateValDelivered : styles.dateValPending}>
              {deliveryDate ? formatDate(deliveryDate) : isDelivered ? 'Delivered' : 'Pending'}
            </span>
          </div>
        </div>

        {/* Right: Only Action Icons in One Line */}
        <div className={styles.actionIconRow}>
          {/* View Details */}
          <Tooltip title="View Details" arrow>
            <button
              type="button"
              onClick={() => navigate(`/orders/${_id}`)}
              className={`${styles.actionBtn} ${styles.viewBtn}`}
              aria-label="View Details"
            >
              <VisibilityOutlinedIcon className={styles.actionIcon} />
            </button>
          </Tooltip>

          {/* Deliver action if in process */}
          {!isDelivered && canEdit && onDeliver && (
            <Tooltip title="Mark Delivered" arrow>
              <button
                type="button"
                onClick={() => onDeliver(order)}
                className={`${styles.actionBtn} ${styles.deliverBtn}`}
                aria-label="Deliver Order"
              >
                <LocalShippingOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {/* Adjust Price if delivered */}
          {isDelivered && canEdit && onCorrectPrice && (
            <Tooltip title="Adjust Price" arrow>
              <button
                type="button"
                onClick={() => onCorrectPrice(order)}
                className={`${styles.actionBtn} ${styles.correctPriceBtn}`}
                aria-label="Adjust Price"
              >
                <CurrencyRupeeIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {/* Edit */}
          {canEdit && onEdit && (
            <Tooltip title="Edit Order" arrow>
              <button
                type="button"
                onClick={() => onEdit(order)}
                className={`${styles.actionBtn} ${styles.editBtn}`}
                aria-label="Edit Order"
              >
                <EditOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {/* Duplicate */}
          {canCreate && onDuplicate && (
            <Tooltip title="Duplicate Order" arrow>
              <button
                type="button"
                onClick={() => onDuplicate(order)}
                className={`${styles.actionBtn} ${styles.duplicateBtn}`}
                aria-label="Duplicate Order"
              >
                <ContentCopyIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {/* Delete */}
          {canDelete && onDelete && (
            <Tooltip title="Delete Order" arrow>
              <button
                type="button"
                onClick={() => onDelete(order)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label="Delete Order"
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

export default OrderCard;
