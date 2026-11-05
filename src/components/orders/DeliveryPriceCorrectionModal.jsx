import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EditNoteIcon from '@mui/icons-material/EditNote';
import orderService from '../../services/orderService';
import styles from './DeliveryPriceCorrectionModal.module.scss';

const DeliveryPriceCorrectionModal = ({
  open,
  onClose,
  onSubmit,
  onCorrected,
  order,
  loading: externalLoading = false,
}) => {
  const [newPrice, setNewPrice] = useState('');
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isBusy = externalLoading || submitting;
  const purchasePrice = order?.purchasePrice || 0;
  const currentDeliveryPrice = order?.deliveryPrice || 0;

  useEffect(() => {
    if (open) {
      setNewPrice(currentDeliveryPrice ? String(currentDeliveryPrice) : '');
      setReason('');
      setValidationError('');
    }
  }, [open, currentDeliveryPrice]);

  const numericNewPrice = parseFloat(newPrice);
  const hasValidPrice = !isNaN(numericNewPrice) && numericNewPrice > 0;
  const recalculatedProfit = hasValidPrice ? numericNewPrice - purchasePrice : null;
  const savedCashbackAmount = order?.cashbackApplied ? (order?.cashbackAmount || 0) : 0;
  const recalculatedNetProfit = recalculatedProfit !== null
    ? Math.round((recalculatedProfit + savedCashbackAmount) * 100) / 100
    : null;

  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!newPrice || isNaN(numericNewPrice) || numericNewPrice <= 0) {
      setValidationError('Please enter a valid positive delivery price.');
      return;
    }

    const payload = {
      newDeliveryPrice: numericNewPrice,
      reason: reason.trim() || 'Price adjustment',
    };

    try {
      setSubmitting(true);
      if (typeof onSubmit === 'function') {
        await onSubmit(payload);
      } else if (order?._id) {
        await orderService.correctDeliveryPrice(order._id, payload);
      }

      if (typeof onCorrected === 'function') {
        onCorrected();
      }

      if (typeof onClose === 'function') {
        onClose();
      }
    } catch (err) {
      console.error('Delivery price correction error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to correct delivery price.';
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isBusy ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        className: styles.dialogPaper,
      }}
    >
      {/* Header */}
      <div className={styles.dialogHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.headerIconBox}>
            <EditNoteIcon className={styles.headerIcon} />
          </div>
          <div>
            <h2 className={styles.dialogTitle}>Adjust Delivery Price</h2>
            <p className={styles.dialogSubtitle}>
              Order #{order?.orderId}
            </p>
          </div>
        </div>

        <IconButton
          onClick={onClose}
          disabled={isBusy}
          className={styles.closeButton}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <DialogContent className={styles.dialogContent}>
          {validationError && (
            <Alert severity="error" className={styles.alertBox}>
              {validationError}
            </Alert>
          )}

          {/* Current Info */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Purchase Price:</span>
              <span className={styles.summaryValue}>{formatINR(purchasePrice)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Current Delivery Price:</span>
              <span className={styles.summaryValue}>{formatINR(currentDeliveryPrice)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Current Profit/Loss:</span>
              <span className={styles.summaryValue}>
                {order?.profit !== null
                  ? `${order?.profit >= 0 ? '+' : ''}${formatINR(order?.profit)}`
                  : 'N/A'}
              </span>
            </div>
          </div>

          {/* New Delivery Price */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="newDeliveryPriceInput">
              New Delivery Price <span className={styles.requiredStar}>*</span>
            </label>
            <TextField
              id="newDeliveryPriceInput"
              fullWidth
              size="small"
              type="number"
              placeholder="e.g. 16500"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              disabled={isBusy}
              className={styles.customInput}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Reason */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="correctionReasonInput">
              Reason for Adjustment
            </label>
            <TextField
              id="correctionReasonInput"
              fullWidth
              size="small"
              placeholder="e.g. Dealer agreed on revised rate"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isBusy}
              className={styles.customInput}
            />
          </div>

          {/* Real-time Recalculated Profit */}
          <div
            className={`${styles.profitCard} ${
              recalculatedProfit !== null
                ? recalculatedProfit >= 0
                  ? styles.profitCardGreen
                  : styles.profitCardRed
                : styles.profitCardNeutral
            }`}
          >
            <div className={styles.profitLabelGroup}>
              <span className={styles.profitTitle}>
                {recalculatedProfit !== null && recalculatedProfit >= 0
                  ? 'Recalculated Profit'
                  : 'Recalculated Loss'}
              </span>
              <span className={styles.profitFormula}>
                New Price ({hasValidPrice ? formatINR(numericNewPrice) : '₹0'}) - Purchase Price ({formatINR(purchasePrice)})
              </span>
              {order?.cashbackApplied && hasValidPrice && (
                <span className={styles.profitFormulaCashback}>
                  Profit Cashback: +{formatINR(savedCashbackAmount)} | Net Profit: {recalculatedNetProfit >= 0 ? `+${formatINR(recalculatedNetProfit)}` : `-${formatINR(Math.abs(recalculatedNetProfit))}`}
                </span>
              )}
            </div>

            {recalculatedProfit !== null && (
              recalculatedProfit >= 0 ? (
                <span className={styles.profitAmountGreen}>+{formatINR(recalculatedProfit)}</span>
              ) : (
                <span className={styles.profitAmountRed}>-{formatINR(Math.abs(recalculatedProfit))}</span>
              )
            )}
          </div>
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions className={styles.dialogActions}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isBusy}
            className={styles.submitBtn}
          >
            {isBusy && <CircularProgress size={16} className={styles.spinner} color="inherit" />}
            Save Correction
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export { DeliveryPriceCorrectionModal };
export default DeliveryPriceCorrectionModal;

