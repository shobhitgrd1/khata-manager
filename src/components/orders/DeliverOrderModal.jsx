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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import orderService from '../../services/orderService';
import khatabookService from '../../services/khatabookService';
import styles from './DeliverOrderModal.module.scss';

const DeliverOrderModal = ({
  open,
  onClose,
  onSubmit,
  onDelivered,
  order,
  loading: externalLoading = false,
}) => {
  const [deliveryPrice, setDeliveryPrice] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [applyCashback, setApplyCashback] = useState(false);
  const [cashbackAmount, setCashbackAmount] = useState('');
  const [isCashbackManuallyEdited, setIsCashbackManuallyEdited] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [hasLinkedKhataBook, setHasLinkedKhataBook] = useState(false);
  const [addToKhataBook, setAddToKhataBook] = useState(true);

  const purchasePrice = order?.purchasePrice || 0;
  const isBusy = externalLoading || submitting;

  // Calculate default 5% of Purchase Price
  const default5PctCashback = Math.round(((purchasePrice * 5) / 100) * 100) / 100;

  useEffect(() => {
    if (open) {
      setDeliveryPrice('');
      setDeliveryDate(new Date().toISOString().split('T')[0]);
      setValidationError('');
      setAddToKhataBook(true);

      if (order?.dealerId) {
        khatabookService
          .getKhataBookByDealerId(order.dealerId)
          .then((res) => {
            const exists = Boolean(res?.exists);
            setHasLinkedKhataBook(exists);
            if (exists) {
              setAddToKhataBook(true);
            }
          })
          .catch(() => setHasLinkedKhataBook(false));
      } else {
        setHasLinkedKhataBook(false);
      }

      const hasSavedCb = Boolean(order?.cashbackApplied);
      setApplyCashback(hasSavedCb);

      if (hasSavedCb && order?.cashbackAmount !== undefined && order?.cashbackAmount !== null) {
        setCashbackAmount(String(order.cashbackAmount));
        setIsCashbackManuallyEdited(true);
      } else {
        setCashbackAmount(String(default5PctCashback));
        setIsCashbackManuallyEdited(false);
      }
    }
  }, [open, order, default5PctCashback]);

  // Handle Cashback Checkbox toggle
  const handleCashbackToggle = (e) => {
    const isChecked = e.target.checked;
    setApplyCashback(isChecked);
    if (isChecked && !isCashbackManuallyEdited) {
      setCashbackAmount(String(default5PctCashback));
    }
  };

  // Handle manual editing of Cashback Amount
  const handleCashbackAmountChange = (e) => {
    setCashbackAmount(e.target.value);
    setIsCashbackManuallyEdited(true);
  };

  // Live Gross Profit calculation
  const numericDeliveryPrice = parseFloat(deliveryPrice);
  const hasValidDeliveryPrice = !isNaN(numericDeliveryPrice) && numericDeliveryPrice > 0;
  const calculatedGrossProfit = hasValidDeliveryPrice ? numericDeliveryPrice - purchasePrice : null;

  // Live Net Profit calculation (Cashback is added as extra profit)
  const numericCashback = parseFloat(cashbackAmount);
  const validCashbackAmount = applyCashback && !isNaN(numericCashback) && numericCashback >= 0
    ? numericCashback
    : 0;
  const calculatedNetProfit = calculatedGrossProfit !== null
    ? Math.round((calculatedGrossProfit + validCashbackAmount) * 100) / 100
    : null;

  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!deliveryPrice || isNaN(numericDeliveryPrice) || numericDeliveryPrice <= 0) {
      setValidationError('Please enter a valid positive delivery price.');
      return;
    }

    if (!deliveryDate) {
      setValidationError('Please select a valid delivery date.');
      return;
    }

    if (applyCashback && (cashbackAmount === '' || isNaN(numericCashback) || numericCashback < 0)) {
      setValidationError('Please enter a valid non-negative cashback amount.');
      return;
    }

    const payload = {
      deliveryPrice: numericDeliveryPrice,
      deliveryDate: new Date(deliveryDate).toISOString(),
      cashbackApplied: Boolean(applyCashback),
      cashbackAmount: applyCashback ? validCashbackAmount : 0,
      addToKhataBook: Boolean(hasLinkedKhataBook && addToKhataBook),
    };

    try {
      setSubmitting(true);
      if (typeof onSubmit === 'function') {
        await onSubmit(payload);
      } else {
        await orderService.deliverOrder(order._id, payload);
      }

      if (typeof onDelivered === 'function') {
        onDelivered();
      }

      onClose();
    } catch (err) {
      console.error('Deliver order error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to confirm delivery.';
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
            <LocalShippingOutlinedIcon className={styles.headerIcon} />
          </div>
          <div>
            <h2 className={styles.dialogTitle}>Mark as Delivered</h2>
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

          {/* Quick Order Info Summary */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Dealer:</span>
              <span className={styles.summaryValue}>{order?.dealerNameSnapshot || '—'}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Product:</span>
              <span className={styles.summaryValue}>
                {order?.productNameSnapshot} {order?.variant ? `(${order?.variant})` : ''}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Purchase Price:</span>
              <span className={styles.summaryValue}>{formatINR(purchasePrice)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Resulting Status:</span>
              <span className={styles.statusDeliveredBadge}>Delivered</span>
            </div>
          </div>

          {/* Delivery Price Input */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="deliveryPriceInput">
              Delivery Price / Selling Price <span className={styles.requiredStar}>*</span>
            </label>
            <TextField
              id="deliveryPriceInput"
              fullWidth
              size="small"
              type="number"
              placeholder="e.g. 15000"
              value={deliveryPrice}
              onChange={(e) => setDeliveryPrice(e.target.value)}
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

          {/* Delivery Date Input */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="deliverModalDateInput">
              Delivery Date <span className={styles.requiredStar}>*</span>
            </label>
            <TextField
              id="deliverModalDateInput"
              fullWidth
              size="small"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              disabled={isBusy}
              className={styles.customInput}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Live Gross Profit or Loss Preview */}
          <div
            className={`${styles.profitCard} ${
              calculatedGrossProfit !== null
                ? calculatedGrossProfit >= 0
                  ? styles.profitCardGreen
                  : styles.profitCardRed
                : styles.profitCardNeutral
            }`}
          >
            <div className={styles.profitLabelGroup}>
              <span className={styles.profitTitle}>
                {calculatedGrossProfit !== null
                  ? calculatedGrossProfit >= 0
                    ? 'Gross Profit'
                    : 'Gross Loss'
                  : 'Realized Margin'}
              </span>
              <span className={styles.profitFormula}>
                Delivery ({hasValidDeliveryPrice ? formatINR(numericDeliveryPrice) : '₹0'}) - Purchase ({formatINR(purchasePrice)})
              </span>
            </div>

            {calculatedGrossProfit !== null ? (
              calculatedGrossProfit >= 0 ? (
                <span className={styles.profitAmountGreen}>+{formatINR(calculatedGrossProfit)}</span>
              ) : (
                <span className={styles.profitAmountRed}>-{formatINR(Math.abs(calculatedGrossProfit))}</span>
              )
            ) : (
              <span className={styles.profitAmountNeutral}>Pending Price</span>
            )}
          </div>

          {/* Simplified Profit Cashback Section */}
          <div className={styles.cashbackSection}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={applyCashback}
                  onChange={handleCashbackToggle}
                  disabled={isBusy}
                  className={styles.cashbackCheckbox}
                  color="primary"
                />
              }
              label={
                <span className={styles.cashbackLabelText}>Apply Profit Cashback</span>
              }
              className={styles.cashbackFormControl}
            />

            {applyCashback && (
              <div className={styles.cashbackCard}>
                {/* Editable Cashback Amount Field */}
                <div className={styles.cashbackInputRow}>
                  <label className={styles.fieldLabel} htmlFor="cashbackAmountInput">
                    Cashback Amount <span className={styles.requiredStar}>*</span>
                  </label>
                  <TextField
                    id="cashbackAmountInput"
                    fullWidth
                    size="small"
                    type="number"
                    placeholder={`Default: ₹${default5PctCashback}`}
                    value={cashbackAmount}
                    onChange={handleCashbackAmountChange}
                    disabled={isBusy}
                    className={styles.customInput}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CurrencyRupeeIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    helperText={`Default: 5% of purchase price (${formatINR(default5PctCashback)}). You can manually edit this amount.`}
                  />
                </div>

                {/* Calculation Summary */}
                <div className={styles.cashbackTable}>
                  <div className={styles.cashbackRow}>
                    <span className={styles.cashbackKey}>Gross Profit</span>
                    <span className={styles.cashbackVal}>
                      {calculatedGrossProfit !== null
                        ? (calculatedGrossProfit >= 0 ? `+${formatINR(calculatedGrossProfit)}` : `-${formatINR(Math.abs(calculatedGrossProfit))}`)
                        : '—'}
                    </span>
                  </div>
                  <div className={styles.cashbackRow}>
                    <span className={styles.cashbackKey}>Profit Cashback (Added)</span>
                    <span className={styles.cashbackValAddition}>
                      + {formatINR(validCashbackAmount)}
                    </span>
                  </div>
                  <div className={styles.cashbackDivider} />
                  <div className={styles.cashbackRowHighlight}>
                    <span className={styles.cashbackKeyNet}>Net Profit</span>
                    <span
                      className={
                        calculatedNetProfit !== null && calculatedNetProfit < 0
                          ? styles.cashbackValLoss
                          : styles.cashbackValNet
                      }
                    >
                      {calculatedNetProfit !== null
                        ? (calculatedNetProfit >= 0 ? `+${formatINR(calculatedNetProfit)}` : `-${formatINR(Math.abs(calculatedNetProfit))}`)
                        : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Automatic Dealer Transaction in Khata Book */}
          {hasLinkedKhataBook && (
            <div className={styles.khataDeliverySection}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={addToKhataBook}
                    onChange={(e) => setAddToKhataBook(e.target.checked)}
                    disabled={isBusy}
                    className={styles.cashbackCheckbox}
                    color="primary"
                  />
                }
                label={
                  <div className={styles.khataLabelGroup}>
                    <span className={styles.khataLabelTitle}>
                      Add Delivery Price to Dealer's Khata Book
                    </span>
                    <span className={styles.khataLabelSub}>
                      Credits {hasValidDeliveryPrice ? formatINR(numericDeliveryPrice) : 'delivery price'} to dealer's ledger as receivable
                    </span>
                  </div>
                }
                className={styles.cashbackFormControl}
              />
            </div>
          )}
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
            Confirm Delivery
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export { DeliverOrderModal };
export default DeliverOrderModal;
