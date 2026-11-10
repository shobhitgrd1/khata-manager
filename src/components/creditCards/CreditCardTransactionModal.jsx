import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import styles from './CreditCardTransactionModal.module.scss';

const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
};

const PAY_MODES = ['UPI', 'Net Banking', 'Debit Card', 'Cash', 'Cheque', 'Other'];
const USE_MODES = ['Card Swipe / POS', 'Online Payment', 'ATM Cash Advance', 'Tap & Pay', 'Other'];

const CreditCardTransactionModal = ({
  open,
  onClose,
  type = 'PAY_CARD', // 'PAY_CARD' | 'USE_CARD'
  card,
  onSubmit,
  loading = false,
}) => {
  const isPay = type === 'PAY_CARD';

  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState(isPay ? 'UPI' : 'Card Swipe / POS');
  const [orderId, setOrderId] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setPaymentMode(isPay ? 'UPI' : 'Card Swipe / POS');
      setOrderId('');
      setDescription(isPay ? 'Credit card bill payment' : '');
      setValidationError('');
    }
  }, [open, isPay]);

  const currentUsed = card?.usedLimit !== undefined
    ? Number(card.usedLimit)
    : Math.max(0, (card?.totalLimit || 0) - (card?.availableLimit || 0));
  const totalLimit = Number(card?.totalLimit || 0);

  const numAmount = parseFloat(amount) || 0;
  const projectedUsed = isPay
    ? Math.max(0, currentUsed - numAmount)
    : currentUsed + numAmount;
  const projectedRemaining = Math.max(0, totalLimit - projectedUsed);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid amount greater than zero.');
      return;
    }

    if (!transactionDate) {
      setValidationError('Please select a valid transaction date.');
      return;
    }

    onSubmit({
      transactionType: type,
      amount: numAmount,
      transactionDate: new Date(transactionDate).toISOString(),
      paymentMode,
      description: description.trim() || (isPay ? 'Credit card payment' : 'Credit card usage'),
      orderId: orderId.trim() || undefined,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      PaperProps={{
        className: styles.dialogPaper,
      }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={`${styles.titleIconBox} ${isPay ? styles.payIcon : styles.useIcon}`}>
          {isPay ? <PaymentsIcon fontSize="inherit" /> : <CreditCardIcon fontSize="inherit" />}
        </div>
        <div>
          <h2 className={styles.modalHeading}>
            {isPay ? 'Pay Credit Card' : 'Use Credit Card'}
          </h2>
          <p className={styles.modalSubtitle}>
            {isPay
              ? 'Pay an amount to reduce the Used Credit Limit on this card.'
              : 'Record money spent or borrowed to increase Used Credit Limit.'}
          </p>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent className={styles.dialogContent}>
          {validationError && (
            <Alert severity="error" onClose={() => setValidationError('')}>
              {validationError}
            </Alert>
          )}

          <div className={styles.formGrid}>
            <div className={styles.rowTwo}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className={styles.rupeeAdornment}>₹</span>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Date"
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon className={styles.inputIcon} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <TextField
              select
              fullWidth
              label={isPay ? 'Payment Mode' : 'Usage / Spend Mode'}
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              disabled={loading}
            >
              {(isPay ? PAY_MODES : USE_MODES).map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Order ID (Optional)"
              placeholder="e.g. ORD-20261110-1234"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ReceiptLongIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Description / Reference Note"
              placeholder={isPay ? 'e.g. Full bill payment via HDFC net banking' : 'e.g. Office laptop purchase'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Impact Preview */}
            <div className={styles.calculationPreview}>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Current Used Limit:</span>
                <span className={styles.calcValue}>{formatINR(currentUsed)}</span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>
                  {isPay ? 'Repayment Amount:' : 'Spend Amount:'}
                </span>
                <span
                  className={`${styles.calcValue} ${
                    isPay ? styles.highlightGreen : styles.highlightOrange
                  }`}
                >
                  {isPay ? `— ${formatINR(numAmount)}` : `+ ${formatINR(numAmount)}`}
                </span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>New Projected Used Limit:</span>
                <span className={`${styles.calcValue} ${isPay ? styles.highlightGreen : styles.highlightOrange}`}>
                  {formatINR(projectedUsed)}
                </span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Projected Remaining Limit:</span>
                <span className={styles.calcValue}>{formatINR(projectedRemaining)}</span>
              </div>
            </div>
          </div>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={onClose} disabled={loading} className={styles.cancelBtn}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={isPay ? styles.submitBtnPay : styles.submitBtnUse}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Saving...' : isPay ? 'Confirm Payment' : 'Record Usage'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreditCardTransactionModal;

