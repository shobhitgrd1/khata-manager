import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import AccountInfoDisplay from './AccountInfoDisplay';
import PaymentInfoDisplay from './PaymentInfoDisplay';
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

  const {
    _id,
    dealerNameSnapshot = 'Unknown Dealer',
    productNameSnapshot = 'Unknown Product',
    variant = '',
    color = {},
    purchasePrice = 0,
    deliveryPrice = null,
    profit = null,
    status = 'Order In Process',
    orderDate,
  } = order || {};

  const isDelivered = status === 'Delivered';

  const cbAmount = isDelivered && order?.cashbackApplied && order?.cashbackAmount ? Number(order.cashbackAmount) : 0;
  const effectiveNetProfit = profit !== null
    ? (order?.netProfit !== null && order?.netProfit !== undefined ? Number(order.netProfit) : Number(profit) + cbAmount)
    : null;

  const profitPercentage =
    purchasePrice > 0 && effectiveNetProfit !== null
      ? Math.round(((effectiveNetProfit / purchasePrice) * 100) * 100) / 100
      : null;

  const formattedDate = orderDate
    ? new Date(orderDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className={styles.orderCard}>
      <div className={styles.ambientGlare} />

      {/* Top Header Row */}
      <div className={styles.topRow}>
        <div className={styles.orderHeader}>
          <div className={styles.avatarBox}>
            <ReceiptLongOutlinedIcon className={styles.orderIcon} />
          </div>

          <div className={styles.idAndDate}>
            <span className={styles.orderDate}>
              <CalendarMonthIcon className={styles.calendarIcon} />
              {formattedDate ? `Ordered ${formattedDate}` : 'Recent Order'}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {isDelivered ? (
          <div className={styles.statusChipDelivered}>
            <CheckCircleOutlinedIcon className={styles.statusIcon} />
            <span>Delivered</span>
          </div>
        ) : (
          <div className={styles.statusChipInProcess}>
            <HourglassEmptyIcon className={styles.statusIcon} />
            <span>In Process</span>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className={styles.detailsGrid}>
        {/* Dealer */}
        <div className={styles.detailCol}>
          <span className={styles.detailLabel}>Dealer</span>
          <span className={styles.detailValue} title={dealerNameSnapshot}>
            {dealerNameSnapshot}
          </span>
        </div>

        {/* Product & Variant */}
        <div className={styles.detailCol}>
          <span className={styles.detailLabel}>Product & Variant</span>
          <div className={styles.productVariantLine}>
            <span className={styles.detailValue} title={`${productNameSnapshot} (${variant})`}>
              {productNameSnapshot} • {variant}
            </span>
            {color?.colorName && (
              <svg width="12" height="12" viewBox="0 0 12 12" className={styles.colorSwatchDot}>
                <circle
                  cx="6"
                  cy="6"
                  r="5"
                  fill={color.colorCode || '#36CFFF'}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Account Info Display (Shared Component) */}
        <div className={styles.detailCol}>
          <span className={styles.detailLabel}>Account</span>
          <AccountInfoDisplay
            order={order}
            clickable
            onClick={() => navigate(`/orders/${_id}`)}
          />
        </div>

        {/* Payment Info Display (Shared Component) */}
        <div className={styles.detailCol}>
          <span className={styles.detailLabel}>Payment</span>
          <PaymentInfoDisplay order={order} />
        </div>
      </div>

      {/* Financials Strip */}
      <div className={styles.financialStrip}>
        <div className={styles.financialCol}>
          <span className={styles.financialLabel}>Purchase</span>
          <span className={styles.financialVal}>{formatINR(purchasePrice)}</span>
        </div>

        <div className={styles.financialDivider} />

        <div className={styles.financialCol}>
          <span className={styles.financialLabel}>Delivery</span>
          <span className={styles.financialVal}>
            {deliveryPrice !== null && deliveryPrice !== undefined
              ? formatINR(deliveryPrice)
              : 'Pending'}
          </span>
        </div>

        <div className={styles.financialDivider} />

        <div className={styles.financialCol}>
          <span
            className={
              effectiveNetProfit !== null
                ? effectiveNetProfit >= 0
                  ? styles.financialLabelGreen
                  : styles.financialLabelRed
                : styles.financialLabel
            }
          >
            {effectiveNetProfit !== null ? (effectiveNetProfit >= 0 ? 'Profit' : 'Loss') : 'Profit/Loss'}
          </span>
          <span
            className={
              effectiveNetProfit !== null
                ? effectiveNetProfit >= 0
                  ? styles.financialValGreen
                  : styles.financialValRed
                : styles.financialValMuted
            }
          >
            {effectiveNetProfit !== null ? (
              <span className={styles.profitValWithPercent}>
                <span>
                  {effectiveNetProfit >= 0 ? `+${formatINR(effectiveNetProfit)}` : `-${formatINR(Math.abs(effectiveNetProfit))}`}
                </span>
                {profitPercentage !== null && (
                  <span
                    className={
                      effectiveNetProfit >= 0 ? styles.profitPercentSubGreen : styles.profitPercentSubRed
                    }
                  >
                    ({effectiveNetProfit >= 0 ? `+${profitPercentage}%` : `${profitPercentage}%`})
                  </span>
                )}
              </span>
            ) : (
              'Pending'
            )}
          </span>
          {isDelivered && (
            order?.cashbackApplied && order?.cashbackAmount > 0 ? (
              <div className={styles.cashbackCardBlock}>
                <span
                  className={styles.cashbackBadge}
                  title={`Profit Cashback: +${formatINR(order.cashbackAmount)} (Added to Gross)`}
                >
                  +CB: {formatINR(order.cashbackAmount)}
                </span>
                <span
                  className={styles.grossProfitSubBadge}
                  title={`Gross Profit: ${formatINR(profit)} | Profit Cashback: +${formatINR(order.cashbackAmount)} | Net: ${formatINR(effectiveNetProfit)}`}
                >
                  Gross: {profit >= 0 ? `+${formatINR(profit)}` : `-${formatINR(Math.abs(profit))}`}
                </span>
              </div>
            ) : (
              <span className={styles.cashbackNotAppliedBadge}>CB: Not Applied</span>
            )
          )}
        </div>
      </div>

      {/* Card Actions Footer - 2 Balanced Rows */}
      <div className={styles.cardFooter}>
        <div className={styles.primaryActionRow}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/orders/${_id}`)}
            className={styles.viewBtn}
            startIcon={<VisibilityOutlinedIcon />}
          >
            View Details
          </Button>

          {/* Deliver action if in process */}
          {!isDelivered && canEdit && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onDeliver && onDeliver(order)}
              className={styles.deliverBtn}
              startIcon={<LocalShippingOutlinedIcon className={styles.btnIcon} />}
            >
              Deliver
            </Button>
          )}

          {/* If Delivered, show Adjust Price */}
          {isDelivered && canEdit && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onCorrectPrice && onCorrectPrice(order)}
              className={styles.correctPriceBtn}
              startIcon={<CurrencyRupeeIcon className={styles.btnIcon} />}
            >
              Adjust Price
            </Button>
          )}
        </div>

        <div className={styles.managementActionRow}>
          {/* Edit */}
          {canEdit && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onEdit && onEdit(order)}
              className={styles.editBtn}
              startIcon={<EditOutlinedIcon className={styles.btnIcon} />}
            >
              Edit
            </Button>
          )}

          {/* Duplicate */}
          {canCreate && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onDuplicate && onDuplicate(order)}
              className={styles.duplicateBtn}
              startIcon={<ContentCopyIcon className={styles.btnIcon} />}
            >
              Duplicate
            </Button>
          )}

          {/* Delete action */}
          {canDelete && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onDelete && onDelete(order)}
              className={styles.deleteBtn}
              startIcon={<DeleteOutlinedIcon className={styles.btnIcon} />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
