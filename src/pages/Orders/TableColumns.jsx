import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import AccountInfoDisplay from '../../components/orders/AccountInfoDisplay';
import PaymentInfoDisplay from '../../components/orders/PaymentInfoDisplay';
import styles from './OrdersPage.module.scss';

export const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const DealerCell = ({ item, onOpenAddress }) => {
  const address = item.dealerAddressSnapshot;
  const badgeTitle = address?.addressTitle || 'Shop';

  return (
    <div className={styles.dealerCell}>
      <span className={styles.dealerNameText}>{item.dealerNameSnapshot || 'Unknown Dealer'}</span>
      {address && (
        <button
          type="button"
          className={styles.addressBadgeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onOpenAddress && onOpenAddress(item);
          }}
          title="Click to view full address"
        >
          <PlaceOutlinedIcon className={styles.pinIcon} />
          <span>{badgeTitle}</span>
        </button>
      )}
    </div>
  );
};

export const ProductCell = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const prodName = item.productNameSnapshot || 'Product';
  const variant = item.variant || '';
  const colorName = item.color?.colorName || '';
  const fullText = `${prodName}${variant ? ` (${variant})` : ''}${colorName ? ` • ${colorName}` : ''}`;
  const isLong = fullText.length > 28;

  return (
    <div className={styles.productCellWrapper}>
      <div className={styles.productCellHeader}>
        <span className={styles.productCellName} title={fullText}>
          {expanded ? fullText : isLong ? `${fullText.substring(0, 26)}…` : fullText}
        </span>
        {item.color?.colorCode && (
          <span
            className={styles.colorDotIndicator}
            style={{ backgroundColor: item.color.colorCode }}
            title={colorName || item.color.colorCode}
          />
        )}
      </div>

      {variant && !expanded && (
        <span className={styles.productCellVariantBadge}>{variant}</span>
      )}

      {isLong && (
        <button
          type="button"
          className={styles.productExpandBtn}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? (
            <>
              Less <KeyboardArrowUpIcon fontSize="inherit" />
            </>
          ) : (
            <>
              More <KeyboardArrowDownIcon fontSize="inherit" />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export const getOrderColumns = ({
  navigate,
  setAddressModalOrder,
  canEdit = true,
  canCreate = true,
  canDelete = true,
  onDeliver,
  onEdit,
  onDuplicate,
  onDelete,
}) => [
  {
    field: 'accountNameSnapshot',
    headerName: 'Account',
    flex: 1.2,
    minWidth: 195,
    renderCell: (params) => {
      const item = params.row || params;
      return (
        <AccountInfoDisplay
          order={item}
          clickable
          onClick={() => navigate(`/orders/${item._id}`)}
        />
      );
    },
  },
  {
    field: 'dealerNameSnapshot',
    headerName: 'Dealer / Location',
    flex: 1.2,
    minWidth: 180,
    renderCell: (params) => {
      const item = params.row || params;
      return (
        <DealerCell
          item={item}
          onOpenAddress={(ord) => setAddressModalOrder && setAddressModalOrder(ord)}
        />
      );
    },
  },
  {
    field: 'productNameSnapshot',
    headerName: 'Product',
    flex: 1.4,
    minWidth: 220,
    renderCell: (params) => {
      const item = params.row || params;
      return <ProductCell item={item} />;
    },
  },
  {
    field: 'paymentMethod',
    headerName: 'Payment',
    flex: 1.2,
    minWidth: 195,
    renderCell: (params) => {
      const item = params.row || params;
      return <PaymentInfoDisplay order={item} />;
    },
  },
  {
    field: 'purchasePrice',
    headerName: 'Purchase Price',
    width: 140,
    valueGetter: (value, row) => {
      const item = row || value?.row || value;
      return item?.purchasePrice ?? 0;
    },
    renderCell: (params) => {
      const item = params.row || params;
      return formatINR(item.purchasePrice);
    },
  },
  {
    field: 'deliveryPrice',
    headerName: 'Delivery Price',
    width: 140,
    renderCell: (params) => {
      const item = params.row || params;
      if (
        item.status === 'Order In Process' ||
        item.deliveryPrice === null ||
        item.deliveryPrice === undefined
      ) {
        return <span className={styles.pendingBadge}>Pending</span>;
      }
      return formatINR(item.deliveryPrice);
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 145,
    renderCell: (params) => {
      const item = params.row || params;
      return item.status === 'Delivered' ? (
        <span className={styles.statusChipDeliveredTable}>Delivered</span>
      ) : (
        <span className={styles.statusChipInProcessTable}>Order In Process</span>
      );
    },
  },
  {
    field: 'profit',
    headerName: 'Profit / Loss',
    width: 175,
    renderCell: (params) => {
      const item = params.row || params;
      if (
        item.status === 'Order In Process' ||
        item.profit === null ||
        item.profit === undefined
      ) {
        return <span className={styles.pendingBadge}>Pending</span>;
      }

      const cbAmount = item.cashbackApplied && item.cashbackAmount ? Number(item.cashbackAmount) : 0;
      const effectiveNetProfit = item.netProfit !== null && item.netProfit !== undefined
        ? Number(item.netProfit)
        : Number(item.profit) + cbAmount;

      const pct = item.purchasePrice > 0
        ? Math.round(((effectiveNetProfit / item.purchasePrice) * 100) * 100) / 100
        : null;

      return (
        <div className={styles.profitCellWrapper}>
          {effectiveNetProfit >= 0 ? (
            <span className={styles.profitTextGreen}>
              +{formatINR(effectiveNetProfit)}
              {pct !== null && <span className={styles.pctSubTag}> (+{pct}%)</span>}
            </span>
          ) : (
            <span className={styles.profitTextRed}>
              -{formatINR(Math.abs(effectiveNetProfit))}
              {pct !== null && <span className={styles.pctSubTag}> ({pct}%)</span>}
            </span>
          )}
          {item.cashbackApplied && item.cashbackAmount > 0 && (
            <span
              className={styles.cashbackTag}
              title={`Gross Profit: ${formatINR(item.profit)} | Profit Cashback: +${formatINR(item.cashbackAmount)} | Net Profit: +${formatINR(effectiveNetProfit)}`}
            >
              +CB: {formatINR(item.cashbackAmount)}
            </span>
          )}
        </div>
      );
    },
  },
  {
    field: 'cashbackProfit',
    headerName: 'Cashback Profit',
    width: 155,
    valueGetter: (value, row) => {
      const item = row || value?.row || value;
      if (item?.status !== 'Delivered') return -1;
      if (!item?.cashbackApplied) return 0;
      return item?.cashbackAmount ?? 0;
    },
    renderCell: (params) => {
      const item = params.row || params;
      if (item.status === 'Order In Process') {
        return <span className={styles.pendingBadge}>Pending</span>;
      }
      if (!item.cashbackApplied || !item.cashbackAmount) {
        return <span className={styles.cashbackNotAppliedBadge}>Not Applied</span>;
      }
      return (
        <span
          className={styles.cashbackProfitCell}
          title={`Profit Cashback: +${formatINR(item.cashbackAmount)} | Gross: ${formatINR(item.profit)} | Net Profit: ${formatINR(
            item.netProfit !== null && item.netProfit !== undefined
              ? item.netProfit
              : Number(item.profit) + Number(item.cashbackAmount)
          )}`}
        >
          {formatINR(item.cashbackAmount)}
        </span>
      );
    },
  },
  {
    field: 'orderDate',
    headerName: 'Order Date',
    width: 135,
    valueGetter: (value, row) => {
      const item = row || value?.row || value;
      return item?.orderDate || '';
    },
    renderCell: (params) => {
      const item = params.row || params;
      return formatDate(item.orderDate);
    },
  },
  {
    field: 'deliveryDate',
    headerName: 'Delivery Date',
    width: 135,
    renderCell: (params) => {
      const item = params.row || params;
      if (item.status === 'Order In Process' || !item.deliveryDate) {
        return <span className={styles.pendingBadge}>Pending</span>;
      }
      return formatDate(item.deliveryDate);
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 175,
    sortable: false,
    renderCell: (params) => {
      const item = params.row || params;
      const isDelivered = item.status === 'Delivered';

      return (
        <div className={styles.tableActions}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/orders/${item._id}`)}
              className={styles.actionBtnPrimary}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {!isDelivered && canEdit && (
            <Tooltip title="Mark Delivered">
              <IconButton
                size="small"
                onClick={() => onDeliver && onDeliver(item)}
                className={styles.actionBtnSuccess}
              >
                <LocalShippingOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canEdit && (
            <Tooltip title="Edit Order">
              <IconButton
                size="small"
                onClick={() => onEdit && onEdit(item)}
                className={styles.actionBtnPrimary}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canCreate && (
            <Tooltip title="Duplicate Order">
              <IconButton
                size="small"
                onClick={() => onDuplicate && onDuplicate(item)}
                className={styles.actionBtnSecondary}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip title="Delete Order">
              <IconButton
                size="small"
                onClick={() => onDelete && onDelete(item)}
                className={styles.actionBtnDanger}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];

export default getOrderColumns;

