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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';
import NotesIcon from '@mui/icons-material/Notes';

import { PAYMENT_MODES } from '../../constants/khatabook.constants';
import styles from './MoneyTransactionModal.module.scss';

const EditTransactionModal = ({
  open,
  onClose,
  onSubmit,
  transaction = null,
  loading = false,
}) => {
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('Amount / details corrected');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && transaction) {
      setAmount(String(transaction.amount || ''));
      setTransactionDate(
        transaction.transactionDate
          ? new Date(transaction.transactionDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setPaymentMode(transaction.paymentMode || 'Cash');
      setDescription(transaction.description || '');
      setReason('Amount / details corrected');
      setError('');
    }
  }, [open, transaction]);

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

    if (!reason || !reason.trim()) {
      setError('Please provide a reason for editing this financial record for audit purposes.');
      return;
    }

    onSubmit({
      amount: Math.round(numericAmount * 100) / 100,
      transactionDate,
      paymentMode,
      description: description.trim(),
      reason: reason.trim(),
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
          <div className={`${styles.iconBox} ${styles.iconBoxBlue}`}>
            <EditOutlinedIcon className={styles.headerIcon} />
          </div>
          <div>
            <h3>Edit Transaction</h3>
            <p className={styles.subTitle}>
              Type: <strong>{transaction?.transactionType?.replace(/_/g, ' ')}</strong>
            </p>
          </div>
        </DialogTitle>

        <DialogContent className={styles.dialogContent}>
          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          <div className={styles.fieldGroup}>
            <TextField
              label="Amount"
              type="number"
              required
              fullWidth
              size="small"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 0.01, step: 'any' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CurrencyRupeeIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            />
          </div>

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

          <div className={styles.fieldGroup}>
            <TextField
              label="Description (Optional)"
              fullWidth
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <div className={styles.fieldGroup}>
            <TextField
              label="Reason for Modification (Audit)"
              required
              fullWidth
              size="small"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Corrected mistaken amount"
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
            className={`${styles.submitBtn} ${styles.btnBlue}`}
            startIcon={loading ? <CircularProgress size={18} className={styles.spinner} /> : null}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditTransactionModal;

