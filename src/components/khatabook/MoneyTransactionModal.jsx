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
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';
import NotesIcon from '@mui/icons-material/Notes';

import { PAYMENT_MODES } from '../../constants/khatabook.constants';
import styles from './MoneyTransactionModal.module.scss';

const MoneyTransactionModal = ({
  open,
  onClose,
  onSubmit,
  type = 'MONEY_GIVEN', // 'MONEY_GIVEN' or 'MONEY_TAKEN'
  accountName = '',
  loading = false,
}) => {
  const isGiven = type === 'MONEY_GIVEN';

  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setPaymentMode('Cash');
      setDescription('');
      setError('');
    }
  }, [open, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!transactionDate) {
      setError('Please choose a transaction date.');
      return;
    }

    onSubmit({
      transactionType: type,
      amount: Math.round(numericAmount * 100) / 100,
      transactionDate,
      paymentMode,
      description: description.trim(),
    });
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={!loading ? onClose : undefined}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle className={styles.dialogTitle}>
          <div className={`${styles.iconBox} ${isGiven ? styles.iconBoxGreen : styles.iconBoxRed}`}>
            {isGiven ? (
              <TrendingUpIcon className={styles.headerIcon} />
            ) : (
              <TrendingDownIcon className={styles.headerIcon} />
            )}
          </div>
          <div>
            <h3>{isGiven ? 'Add Money Given / Lent' : 'Add Money Taken / Borrowed'}</h3>
            <p className={styles.subTitle}>
              Recording transaction for <strong>{accountName || 'this account'}</strong>
            </p>
          </div>
        </DialogTitle>

        <DialogContent className={styles.dialogContent}>
          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          {/* Educational banner on how this affects balance */}
          <div className={`${styles.explainerBanner} ${isGiven ? styles.bannerGreen : styles.bannerRed}`}>
            <p>
              {isGiven
                ? '💰 You gave money. This increases your receivable balance (money owed to you, shown in green).'
                : '💸 You took or borrowed money. This increases your payable amount (money you owe, shown in red).'}
            </p>
          </div>

          {/* Amount */}
          <div className={styles.fieldGroup}>
            <TextField
              label="Amount"
              type="number"
              required
              fullWidth
              size="small"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              inputProps={{ min: 0.01, step: 'any' }}
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
          </div>

          {/* Date & Payment Mode Grid */}
          <div className={styles.twoColRow}>
            <TextField
              label="Date"
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

          {/* Description */}
          <div className={styles.fieldGroup}>
            <TextField
              label="Description / Purpose (Optional)"
              fullWidth
              size="small"
              multiline
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isGiven
                  ? 'e.g. Sent for phone order, Advance payment'
                  : 'e.g. Borrowed for emergency, Credit received'
              }
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
            className={`${styles.submitBtn} ${isGiven ? styles.btnGreen : styles.btnRed}`}
            startIcon={loading ? <CircularProgress size={18} className={styles.spinner} /> : null}
          >
            {loading ? 'Recording...' : isGiven ? 'Save Money Given' : 'Save Money Taken'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MoneyTransactionModal;

