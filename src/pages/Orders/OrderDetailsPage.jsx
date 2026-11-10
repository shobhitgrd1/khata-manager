import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import OrderModal from '../../components/orders/OrderModal';
import DeliverOrderModal from '../../components/orders/DeliverOrderModal';
import DeliveryPriceCorrectionModal from '../../components/orders/DeliveryPriceCorrectionModal';
import DeleteOrderDialog from '../../components/orders/DeleteOrderDialog';
import orderService from '../../services/orderService';
import useAuth from '../../hooks/useAuth';
import styles from './OrderDetailsPage.module.scss';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEditOrder, canDeleteOrder, canCreateOrder } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [correctPriceModalOpen, setCorrectPriceModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderService.getOrderById(id);
      if (data?.order) {
        setOrder(data.order);
      }
    } catch (err) {
      console.error('Fetch order details error:', err);
      setError(err.response?.data?.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  // Edit submit
  const handleEditSubmit = async (formData) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await orderService.updateOrder(id, formData);
      if (res?.order) {
        setOrder(res.order);
      }
      setSuccessMsg('Order updated successfully.');
      setEditModalOpen(false);
    } catch (err) {
      console.error('Update order error:', err);
      setError(err.response?.data?.message || 'Failed to update order.');
    } finally {
      setActionLoading(false);
    }
  };

  // Deliver submit
  const handleDeliverSubmit = async (data) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await orderService.deliverOrder(id, data);
      if (res?.order) {
        setOrder(res.order);
      }
      setSuccessMsg('Order marked as Delivered!');
      setDeliverModalOpen(false);
    } catch (err) {
      console.error('Deliver order error:', err);
      setError(err.response?.data?.message || 'Failed to complete delivery.');
    } finally {
      setActionLoading(false);
    }
  };

  // Correct price submit
  const handleCorrectPriceSubmit = async (data) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await orderService.correctDeliveryPrice(id, data);
      if (res?.order) {
        setOrder(res.order);
      }
      setSuccessMsg('Delivery price corrected and profit recalculated.');
      setCorrectPriceModalOpen(false);
    } catch (err) {
      console.error('Price correction error:', err);
      setError(err.response?.data?.message || 'Failed to correct price.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete submit
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setError('');
    try {
      await orderService.deleteOrder(id);
      navigate('/orders');
    } catch (err) {
      console.error('Delete order error:', err);
      setError(err.response?.data?.message || 'Failed to delete order.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress size={44} className={styles.loadingSpinner} />
        <span className={styles.loadingText}>Loading order details...</span>
      </div>
    );
  }

  const {
    _id,
    orderId = 'N/A',
    originalOrderId = '',
    dealerNameSnapshot = 'Unknown Dealer',
    dealerMobileSnapshot = '',
    dealerAddressSnapshot = {},
    productNameSnapshot = 'Unknown Product',
    variant = '',
    color = {},
    accountNameSnapshot = '',
    accountTypeSnapshot = '',
    paymentMethod = '',
    paymentDetails = {},
    purchasePrice = 0,
    deliveryPrice = null,
    profit = null,
    cashbackApplied = false,
    cashbackPercentage = 0,
    cashbackAmount = 0,
    netProfit = null,
    status = 'Order In Process',
    orderDate,
    deliveryDate,
    deliveryPriceHistory = [],
  } = order || {};

  const isDelivered = status === 'Delivered';

  const formattedOrderDate = orderDate
    ? new Date(orderDate).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    : 'N/A';

  const formattedDeliveryDate = deliveryDate
    ? new Date(deliveryDate).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
    : 'N/A';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/orders')}
            className={styles.backBtn}
            startIcon={<ArrowBackIcon />}
          >
            Back to Orders
          </Button>

          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Order Details</h1>
          </div>
        </div>

        <div className={styles.headerActionsRight}>
          {!isDelivered && canEditOrder() && (
            <Button
              variant="contained"
              onClick={() => setDeliverModalOpen(true)}
              className={styles.deliverBtn}
              startIcon={<LocalShippingOutlinedIcon />}
            >
              Mark as Delivered
            </Button>
          )}

          {isDelivered && canEditOrder() && (
            <Button
              variant="outlined"
              onClick={() => setCorrectPriceModalOpen(true)}
              className={styles.correctPriceBtn}
              startIcon={<CurrencyRupeeIcon />}
            >
              Adjust Price
            </Button>
          )}

          {/* Edit Order (both in-process and delivered) */}
          {canEditOrder() && (
            <Button
              variant="outlined"
              onClick={() => setEditModalOpen(true)}
              className={styles.editBtn}
              startIcon={<EditOutlinedIcon />}
            >
              Edit Order
            </Button>
          )}

          {/* Duplicate Order */}
          {canCreateOrder() && (
            <Button
              variant="outlined"
              onClick={() => setDuplicateModalOpen(true)}
              className={styles.duplicateBtn}
              startIcon={<ContentCopyIcon />}
            >
              Duplicate
            </Button>
          )}

          {canDeleteOrder() && (
            <Button
              variant="outlined"
              onClick={() => setDeleteDialogOpen(true)}
              className={styles.deleteBtn}
              startIcon={<DeleteOutlinedIcon />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} className={styles.alertBox}>
          {error}
        </Alert>
      )}

      {/* Hero Overview Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroTopRow}>
          <div className={styles.heroLeftInfo}>
            <div className={styles.heroIconBox}>
              <ReceiptLongOutlinedIcon className={styles.heroIcon} />
            </div>
            <div className={styles.heroDetails}>
              <h2 className={styles.heroOrderId}>{orderId}</h2>
              {originalOrderId && (
                <div style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: 500, marginTop: '2px', marginBottom: '2px' }}>
                  Original Order ID: <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{originalOrderId}</strong>
                </div>
              )}
              <span className={styles.heroDateText}>Created: {formattedOrderDate}</span>
            </div>
          </div>

          <div>
            {isDelivered ? (
              <div className={styles.statusChipDelivered}>
                <CheckCircleOutlinedIcon fontSize="small" />
                <span>Delivered on {formattedDeliveryDate}</span>
              </div>
            ) : (
              <div className={styles.statusChipInProcess}>
                <HourglassEmptyIcon fontSize="small" />
                <span>Order In Process</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Highlights */}
        <div className={styles.financialGrid}>
          <div className={styles.financialCard}>
            <span className={styles.financialLabel}>Purchase Price</span>
            <span className={styles.financialValue}>{formatINR(purchasePrice)}</span>
          </div>

          <div className={styles.financialCard}>
            <span className={styles.financialLabel}>Final Delivery Price</span>
            <span className={styles.financialValue}>
              {deliveryPrice !== null ? formatINR(deliveryPrice) : 'Pending Delivery'}
            </span>
          </div>

          <div className={styles.financialCard}>
            <span className={styles.financialLabel}>
              {profit !== null ? (profit >= 0 ? 'Gross Realized Profit' : 'Gross Realized Loss') : 'Profit Margin'}
            </span>
            {profit !== null ? (
              profit >= 0 ? (
                <span className={styles.financialValueGreen}>+{formatINR(profit)}</span>
              ) : (
                <span className={styles.financialValueRed}>-{formatINR(Math.abs(profit))}</span>
              )
            ) : (
              <span className={styles.financialValuePending}>Pending Delivery</span>
            )}
          </div>

          <div className={styles.financialCard}>
            <span className={styles.financialLabel}>Profit Cashback</span>
            {cashbackApplied && cashbackAmount > 0 ? (
              <span className={styles.financialValueGreen}>+{formatINR(cashbackAmount)}</span>
            ) : (
              <span className={styles.financialValueMuted}>
                {isDelivered ? 'Not Applied' : 'Pending Delivery'}
              </span>
            )}
          </div>

          <div className={styles.financialCard}>
            <span className={styles.financialLabel}>Net Profit</span>
            {profit !== null ? (
              (netProfit !== null ? netProfit : (profit + (cashbackApplied ? cashbackAmount : 0))) >= 0 ? (
                <span className={styles.financialValueGreen}>
                  +{formatINR(netProfit !== null ? netProfit : (profit + (cashbackApplied ? cashbackAmount : 0)))}
                </span>
              ) : (
                <span className={styles.financialValueRed}>
                  -{formatINR(Math.abs(netProfit !== null ? netProfit : (profit + (cashbackApplied ? cashbackAmount : 0))))}
                </span>
              )
            ) : (
              <span className={styles.financialValuePending}>Pending Delivery</span>
            )}
          </div>
        </div>
      </div>

      {/* Organized Sections Grid */}
      <div className={styles.sectionsGrid}>
        {/* Dealer Details */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <StorefrontIcon className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Dealer Details</h3>
          </div>
          <div className={styles.detailRows}>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Dealer Name</span>
              <span className={styles.detailVal}>{dealerNameSnapshot}</span>
            </div>
            {dealerMobileSnapshot && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Mobile Number</span>
                <span className={styles.detailVal}>{dealerMobileSnapshot}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Address Title</span>
              <span className={styles.detailVal}>
                {dealerAddressSnapshot?.addressTitle || 'N/A'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Complete Address</span>
              <span className={styles.detailVal}>
                {dealerAddressSnapshot?.completeAddress}
                {dealerAddressSnapshot?.city ? `, ${dealerAddressSnapshot.city}` : ''}
                {dealerAddressSnapshot?.state ? `, ${dealerAddressSnapshot.state}` : ''}
                {dealerAddressSnapshot?.pinCode ? ` - ${dealerAddressSnapshot.pinCode}` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <Inventory2OutlinedIcon className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Product Specifications</h3>
          </div>
          <div className={styles.detailRows}>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Product Name</span>
              <span className={styles.detailVal}>{productNameSnapshot}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Variant</span>
              <span className={styles.detailVal}>{variant}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Color</span>
              <div className={styles.colorSwatchWrapper}>
                <svg width="14" height="14" viewBox="0 0 14 14" className={styles.colorSwatchCircle}>
                  <circle
                    cx="7"
                    cy="7"
                    r="6"
                    fill={color?.colorCode || '#36CFFF'}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                  />
                </svg>
                <span className={styles.detailVal}>{color?.colorName || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <ManageAccountsIcon className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Account Details</h3>
          </div>
          <div className={styles.detailRows}>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Account Name</span>
              <span className={styles.detailVal}>{accountNameSnapshot}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Account Type</span>
              <span className={styles.detailVal}>{accountTypeSnapshot || 'Standard'}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <CreditCardIcon className={styles.sectionIcon} />
            <h3 className={styles.sectionTitle}>Payment Details</h3>
          </div>
          <div className={styles.detailRows}>
            <div className={styles.detailRow}>
              <span className={styles.detailKey}>Payment Method</span>
              <span className={styles.detailVal}>{paymentMethod}</span>
            </div>
            {paymentDetails?.bankName && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Bank Name</span>
                <span className={styles.detailVal}>{paymentDetails.bankName}</span>
              </div>
            )}
            {paymentDetails?.cardName && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Card Name</span>
                <span className={styles.detailVal}>{paymentDetails.cardName}</span>
              </div>
            )}
            {paymentDetails?.lastFourDigits && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Last 4 Digits</span>
                <span className={styles.detailVal}>•••• {paymentDetails.lastFourDigits}</span>
              </div>
            )}
            {paymentDetails?.cardHolderName && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Cardholder Name</span>
                <span className={styles.detailVal}>{paymentDetails.cardHolderName}</span>
              </div>
            )}
            {paymentDetails?.upiId && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>UPI ID</span>
                <span className={styles.detailVal}>{paymentDetails.upiId}</span>
              </div>
            )}
            {paymentDetails?.upiOwnerName && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>UPI Owner</span>
                <span className={styles.detailVal}>{paymentDetails.upiOwnerName}</span>
              </div>
            )}
            {paymentDetails?.otherMethodName && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Method Name</span>
                <span className={styles.detailVal}>{paymentDetails.otherMethodName}</span>
              </div>
            )}
            {paymentDetails?.referenceNote && (
              <div className={styles.detailRow}>
                <span className={styles.detailKey}>Reference Note</span>
                <span className={styles.detailVal}>{paymentDetails.referenceNote}</span>
              </div>
            )}
          </div>
        </div>

        {/* Audit History (if any) */}
        {deliveryPriceHistory && deliveryPriceHistory.length > 0 && (
          <div className={styles.sectionCardFull}>
            <div className={styles.sectionHeader}>
              <HistoryIcon className={styles.sectionIcon} />
              <h3 className={styles.sectionTitle}>Delivery Price Correction Audit Log</h3>
            </div>
            <div className={styles.auditList}>
              {deliveryPriceHistory.map((item, idx) => (
                <div key={idx} className={styles.auditItem}>
                  <div>
                    <strong>Price changed from {formatINR(item.previousPrice)} to {formatINR(item.newPrice)}</strong>
                    <div className={styles.auditTime}>
                      {new Date(item.changedAt).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className={styles.auditReason}>
                    Reason: {item.reason || 'Price adjustment'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <OrderModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={order}
        loading={actionLoading}
      />

      {/* Duplicate Order Modal */}
      <OrderModal
        open={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onSaved={() => {
          setSuccessMsg('Order duplicated successfully!');
          navigate('/orders');
        }}
        order={order}
        isDuplicate={true}
      />

      {/* Mark As Delivered Modal */}
      <DeliverOrderModal
        open={deliverModalOpen}
        onClose={() => setDeliverModalOpen(false)}
        onSubmit={handleDeliverSubmit}
        order={order}
        loading={actionLoading}
      />

      {/* Delivery Price Correction Modal */}
      <DeliveryPriceCorrectionModal
        open={correctPriceModalOpen}
        onClose={() => setCorrectPriceModalOpen(false)}
        onSubmit={handleCorrectPriceSubmit}
        order={order}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteOrderDialog
        open={deleteDialogOpen}
        order={order}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={actionLoading}
      />

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg('')}
        message={successMsg}
      />
    </div>
  );
};

export default OrderDetailsPage;
