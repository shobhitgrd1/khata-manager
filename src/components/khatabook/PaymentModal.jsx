import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PaymentsIcon from '@mui/icons-material/Payments';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';
import NotesIcon from '@mui/icons-material/Notes';

import { PAYMENT_MODES } from '../../constants/khatabook.constants';
import styles from './PaymentModal.module.scss';

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

const PaymentModal = ({
  open,
  onClose,
  onSubmit,
  paymentType = 'PAYMENT_RECEIVED', // 'PAYMENT_RECEIVED' or 'PAYMENT_MADE'
  account = null,
  loading = false,
}) => {
  const isReceive = paymentType === 'PAYMENT_RECEIVED';
  const currentBalance = account?.currentBalance || 0;
  const maxAllowed = isReceive ? Math.max(0, currentBalance) : Math.max(0, Math.abs(currentBalance));

  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('UPI');
      setDescription('');
      setReference('');
      setError('');
    }
  }, [open, paymentType]);

  const handleSetFullSettlement = () => {
    if (maxAllowed > 0) {
      setAmount(String(maxAllowed));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

    if (numericAmount > maxAllowed + 0.01) {
      setError(
        `Payment amount cannot exceed the total outstanding balance of ${formatINR(maxAllowed)}.`
      );
      return;
    }

    if (!transactionDate) {
      setError('Please select a payment date.');
      return;
    }

    onSubmit({
      paymentType,
      amount: Math.round(numericAmount * 100) / 100,
      transactionDate,
      paymentMode,
      description: description.trim(),
      reference: reference.trim(),
    });
  };

  const numericAmount = parseFloat(amount) || 0;
  const remainingAfterPayment = Math.max(0, Math.round((maxAllowed - numericAmount) * 100) / 100);

  return (
    <Dialog
      open={Boolean(open)}
      onClose={!loading ? onClose : undefined}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle className={styles.dialogTitle}>
          <div className={`${styles.iconBox} ${isReceive ? styles.iconBoxGreen : styles.iconBoxBlue}`}>
            {isReceive ? (
              <PriceCheckIcon className={styles.headerIcon} />
            ) : (
              <PaymentsIcon className={styles.headerIcon} />
            )}
          </div>
          <div>
            <h3>{isReceive ? 'Receive Payment (Clear Dues)' : 'Make Payment (Pay Dues)'}</h3>
            <p className={styles.subTitle}>
              Account: <strong>{account?.name || 'this account'}</strong>
            </p>
          </div>
        </DialogTitle>

        <DialogContent className={styles.dialogContent}>
          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          {/* Balance Context Card */}
          <div className={`${styles.balanceContextCard} ${isReceive ? styles.contextGreen : styles.contextRed}`}>
            <div className={styles.contextLeft}>
              <span className={styles.contextLabel}>
                {isReceive ? 'Current Outstanding to Receive' : 'Current Outstanding to Pay'}
              </span>
              <span className={styles.contextVal}>{formatINR(maxAllowed)}</span>
            </div>

            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={handleSetFullSettlement}
              className={styles.fullSettlementBtn}
            >
              Full Settlement
            </Button>
          </div>

          {/* Amount */}
          <div className={styles.fieldGroup}>
            <TextField
              label="Payment Amount"
              type="number"
              required
              fullWidth
              size="small"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              inputProps={{ min: 0.01, max: maxAllowed, step: 'any' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
              autoFocus
            />

            {numericAmount > 0 && (
              <div className={styles.projectedBalanceRow}>
                <span>Balance after this payment:</span>
                <strong className={remainingAfterPayment === 0 ? styles.settledText : styles.pendingText}>
                  {remainingAfterPayment === 0 ? '₹0 (Fully Settled)' : formatINR(remainingAfterPayment)}
                </strong>
              </div>
            )}
          </div>

          {/* Date & Mode */}
          <div className={styles.twoColRow}>
            <TextField
              label="Payment Date"
              type="date"
              required
              fullWidth
              size="small"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonthIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            />

            <TextField
              label="Payment Mode"
              select
              fullWidth
              size="small"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            >
              {PAYMENT_MODES.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {mode}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* Reference / UTR Number */}
          <div className={styles.fieldGroup}>
            <TextField
              label="Transaction / UPI Ref ID (Optional)"
              fullWidth
              size="small"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. UPI-1234567890, Cheque #0045"
              className={styles.textField}
            />
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <TextField
              label="Notes / Remarks (Optional)"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Partial settlement for last week orders"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NotesIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            />
          </div>
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={onClose} disabled={loading} className={styles.cancelBtn}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            className={`${styles.submitBtn} ${isReceive ? styles.btnGreen : styles.btnBlue}`}
            startIcon={loading ? <CircularProgress size={18} className={styles.spinner} /> : null}
          >
            {loading ? 'Processing...' : isReceive ? 'Confirm Payment Received' : 'Confirm Payment Made'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PaymentModal;

