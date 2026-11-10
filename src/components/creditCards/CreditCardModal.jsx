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
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BadgeIcon from '@mui/icons-material/Badge';
import PinIcon from '@mui/icons-material/Pin';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import creditCardService from '../../services/creditCardService';
import useAuth from '../../hooks/useAuth';
import styles from './CreditCardModal.module.scss';

export const SUPPORTED_BANKS = [
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'RBL Bank',
  'AU Bank',
  'HSBC Bank',
  'State Bank of India (SBI)',
  'Yes Bank',
  'HDFC Bank',
  'Bank of Baroda',
];

const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
};

const CreditCardModal = ({
  open,
  onClose,
  onSubmit,
  onSaved,
  card,
  initialData = null,
  isDuplicate = false,
  loading: externalLoading = false,
}) => {
  const { user } = useAuth();
  const activeData = card || initialData;
  const isDuplicateMode = Boolean(isDuplicate);
  const isEditing = Boolean(!isDuplicateMode && activeData);
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const [formData, setFormData] = useState({
    cardOwner: '',
    bankName: '',
    cardName: '',
    lastFourDigits: '',
    totalLimit: '',
    availableLimit: '',
  });

  const [validationError, setValidationError] = useState('');

  // Populate data when editing or duplicating, reset when adding
  useEffect(() => {
    if (activeData) {
      if (isDuplicateMode) {
        // Safe duplication: copy bank, card name, owner, total limit; never copy sensitive last 4 digits
        setFormData({
          cardOwner: activeData.cardOwner || activeData.userId?.name || user?.name || '',
          bankName: activeData.bankName || '',
          cardName: activeData.cardName || '',
          lastFourDigits: '',
          totalLimit: activeData.totalLimit !== undefined ? String(activeData.totalLimit) : '',
          availableLimit: activeData.totalLimit !== undefined ? String(activeData.totalLimit) : '',
        });
      } else {
        setFormData({
          cardOwner: activeData.cardOwner || activeData.userId?.name || user?.name || '',
          bankName: activeData.bankName || '',
          cardName: activeData.cardName || '',
          lastFourDigits: activeData.lastFourDigits || '',
          totalLimit: activeData.totalLimit !== undefined ? String(activeData.totalLimit) : '',
          availableLimit:
            activeData.availableLimit !== undefined ? String(activeData.availableLimit) : '',
        });
      }
    } else {
      setFormData({
        cardOwner: user?.name || '',
        bankName: '',
        cardName: '',
        lastFourDigits: '',
        totalLimit: '',
        availableLimit: '',
      });
    }
    setValidationError('');
  }, [activeData, open, user, isDuplicateMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Filter last 4 digits to only numbers, max 4
    if (name === 'lastFourDigits') {
      const sanitized = value.replace(/\D/g, '').slice(0, 4);
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Real-time calculations
  const numTotal = Number(formData.totalLimit) || 0;
  const numAvailable = Number(formData.availableLimit) || 0;
  const calculatedUsed = Math.max(0, numTotal - numAvailable);
  const calculatedUtilization =
    numTotal > 0 ? Math.min(100, Math.round((calculatedUsed / numTotal) * 100)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const { cardOwner, bankName, cardName, lastFourDigits, totalLimit, availableLimit } = formData;

    if (!cardOwner || !cardOwner.trim()) {
      setValidationError('Please enter credit card owner name');
      return;
    }

    if (!bankName) {
      setValidationError('Please select a bank');
      return;
    }

    if (!cardName.trim()) {
      setValidationError('Please enter a credit card name');
      return;
    }

    if (!lastFourDigits || lastFourDigits.length !== 4) {
      setValidationError('Last four digits must be exactly 4 numeric digits');
      return;
    }

    const tLimit = Number(totalLimit);
    const aLimit = Number(availableLimit);

    if (isNaN(tLimit) || tLimit <= 0) {
      setValidationError('Total credit limit must be greater than zero');
      return;
    }

    if (isNaN(aLimit) || aLimit < 0) {
      setValidationError('Available credit limit cannot be negative');
      return;
    }

    if (aLimit > tLimit) {
      setValidationError('Available credit limit cannot exceed total credit limit');
      return;
    }

    const payload = {
      cardOwner: cardOwner.trim(),
      bankName,
      cardName: cardName.trim(),
      lastFourDigits,
      totalLimit: tLimit,
      availableLimit: aLimit,
    };

    if (typeof onSubmit === 'function') {
      onSubmit(payload);
      return;
    }

    try {
      setInternalLoading(true);
      if (isEditing && activeData?._id) {
        await creditCardService.updateCreditCard(activeData._id, payload);
        if (typeof onSaved === 'function') {
          onSaved('Credit card updated successfully');
        }
      } else {
        await creditCardService.createCreditCard(payload);
        if (typeof onSaved === 'function') {
          onSaved('Credit card added successfully');
        }
      }
      onClose();
    } catch (err) {
      console.error('Save credit card error:', err);
      setValidationError(err.response?.data?.message || 'Failed to save credit card');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      PaperProps={{
        className: styles.dialogPaper,
      }}
    >
      {/* Header */}
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.titleIconBox}>
          {isDuplicateMode ? (
            <ContentCopyIcon fontSize="inherit" />
          ) : (
            <CreditCardIcon fontSize="inherit" />
          )}
        </div>
        <div>
          <h2 className={styles.modalHeading}>
            {isDuplicateMode
              ? 'Duplicate Credit Card'
              : isEditing
                ? 'Edit Credit Card'
                : 'Add New Credit Card'}
          </h2>
          <p className={styles.modalSubtitle}>
            {isDuplicateMode
              ? 'Duplicating bank and card configuration (safe defaults applied; enter last 4 digits).'
              : isEditing
                ? 'Update your card limits and details. Limits are automatically recalculated.'
                : 'Add a card to your portfolio to track limits and utilization.'}
          </p>
        </div>
      </DialogTitle>

      {/* Form Content */}
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent className={styles.dialogContent}>
          {validationError && (
            <Alert severity="error" className={`${styles.alertBox} ${styles.errorAlert}`}>
              {validationError}
            </Alert>
          )}

          <div className={styles.formGrid}>
            {/* Bank Selection Dropdown */}
            <TextField
              select
              fullWidth
              id="bankName"
              name="bankName"
              label="Select Bank"
              value={formData.bankName}
              onChange={handleChange}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            >
              {SUPPORTED_BANKS.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </TextField>

            {/* Credit Card Name */}
            <TextField
              fullWidth
              id="cardName"
              name="cardName"
              label="Credit Card Name"
              placeholder="e.g. Amazon Pay ICICI, HDFC Millennia"
              value={formData.cardName}
              onChange={handleChange}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Credit Card Owner / Cardholder */}
            <TextField
              fullWidth
              id="cardOwner"
              name="cardOwner"
              label="Credit Card Owner"
              placeholder="e.g. Shobhit Seth"
              value={formData.cardOwner}
              onChange={handleChange}
              disabled={loading}
              required
              helperText="Cardholder name as printed on the credit card"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Last 4 Digits */}
            <TextField
              fullWidth
              id="lastFourDigits"
              name="lastFourDigits"
              label="Last Four Digits"
              placeholder="4582"
              value={formData.lastFourDigits}
              onChange={handleChange}
              disabled={loading}
              required
              helperText="Only the last 4 numeric digits for card identification"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PinIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Limits Row */}
            <div className={styles.rowTwo}>
              {/* Total Credit Limit */}
              <TextField
                fullWidth
                id="totalLimit"
                name="totalLimit"
                label="Total Credit Limit"
                placeholder="100000"
                type="number"
                value={formData.totalLimit}
                onChange={handleChange}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className={styles.rupeeAdornment}>₹</span>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Available Credit Limit */}
              <TextField
                fullWidth
                id="availableLimit"
                name="availableLimit"
                label="Available Credit Limit"
                placeholder="75000"
                type="number"
                value={formData.availableLimit}
                onChange={handleChange}
                disabled={loading}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className={styles.rupeeAdornment}>₹</span>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Live Calculation Preview */}
            <div className={styles.calculationPreview}>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Calculated Used Credit:</span>
                <span className={`${styles.calcValue} ${styles.calcValueHighlight}`}>
                  {formatINR(calculatedUsed)}
                </span>
              </div>
              <div className={styles.calcRow}>
                <span className={styles.calcLabel}>Credit Utilization:</span>
                <span
                  className={`${styles.utilizationBadge} ${calculatedUtilization >= 80
                      ? styles.utilHigh
                      : calculatedUtilization >= 50
                        ? styles.utilMedium
                        : styles.utilLow
                    }`}
                >
                  {calculatedUtilization}%
                </span>
              </div>
              <div className={styles.calcFormula}>
                Used Credit = Total Limit ({formatINR(numTotal)}) - Available Limit ({formatINR(numAvailable)})
              </div>
            </div>
          </div>
        </DialogContent>

        {/* Modal Buttons */}
        <DialogActions className={styles.dialogActions}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className={styles.submitBtn}
            startIcon={
              loading ? <CircularProgress size={18} className={styles.spinner} /> : null
            }
          >
            {loading
              ? 'Saving...'
              : isDuplicateMode
                ? 'Create Duplicate Card'
                : isEditing
                  ? 'Save Changes'
                  : 'Save Credit Card'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreditCardModal;

