import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

import styles from './KhataBookModal.module.scss';

const MOBILE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

const KhataBookModal = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  defaultAccountType = 'Other',
}) => {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [accountType, setAccountType] = useState(defaultAccountType);
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingDirection, setOpeningDirection] = useState('RECEIVE');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setName(initialData.name || '');
        setMobileNumber(initialData.mobileNumber || '');
        setAccountType(initialData.accountType || defaultAccountType);
        setOpeningBalance('');
        setOpeningDirection('RECEIVE');
      } else {
        setName('');
        setMobileNumber('');
        setAccountType(defaultAccountType || 'Other');
        setOpeningBalance('');
        setOpeningDirection('RECEIVE');
      }
      setError('');
    }
  }, [open, initialData, defaultAccountType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !name.trim()) {
      setError('Account name is required.');
      return;
    }

    if (mobileNumber && mobileNumber.trim()) {
      const cleanMobile = mobileNumber.trim();
      if (!MOBILE_REGEX.test(cleanMobile)) {
        setError('Please enter a valid mobile number (7-20 digits).');
        return;
      }
    }

    const payload = {
      name: name.trim(),
      mobileNumber: mobileNumber.trim(),
      accountType,
    };

    if (!isEditing) {
      const numBal = Number(openingBalance);
      if (openingBalance && (!isNaN(numBal) && numBal > 0)) {
        payload.openingBalance = Math.round(numBal * 100) / 100;
        payload.openingBalanceDirection = openingDirection;
      } else {
        payload.openingBalance = 0;
        payload.openingBalanceDirection = 'NONE';
      }
    }

    onSubmit(payload);
  };

  const parsedOpening = Number(openingBalance) || 0;

  return (
    <Dialog
      open={Boolean(open)}
      onClose={!loading ? onClose : undefined}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle className={styles.dialogTitle}>
          <div className={styles.titleIconBox}>
            <MenuBookIcon className={styles.headerIcon} />
          </div>
          <div>
            <h3>{isEditing ? 'Edit Khata Book Account' : 'Create Khata Book Account'}</h3>
            <p className={styles.subTitle}>
              {isEditing
                ? 'Update account personal and contact information'
                : 'Maintain an independent ledger for receivables and payables'}
            </p>
          </div>
        </DialogTitle>

        <DialogContent className={styles.dialogContent}>
          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          {/* Account Name */}
          <div className={styles.fieldGroup}>
            <TextField
              label="Account / Person Name"
              required
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar, Sharma Traders"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            />
          </div>

          {/* Mobile Number */}
          <div className={styles.fieldGroup}>
            <TextField
              label="Mobile Number (Optional)"
              fullWidth
              size="small"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
              className={styles.textField}
            />
          </div>

          {/* Account Type */}
          <div className={styles.fieldGroup}>
            <label className={styles.sectionLabel}>Account Type</label>
            <div className={styles.typeSelectorRow}>
              <button
                type="button"
                className={`${styles.typeOptionBtn} ${accountType === 'Other' ? styles.typeSelected : ''}`}
                onClick={() => setAccountType('Other')}
              >
                <PersonOutlinedIcon className={styles.typeIcon} />
                <span>Other (Person / Customer)</span>
              </button>

              <button
                type="button"
                className={`${styles.typeOptionBtn} ${accountType === 'Dealer' ? styles.typeSelected : ''}`}
                onClick={() => setAccountType('Dealer')}
              >
                <MenuBookIcon className={styles.typeIcon} />
                <span>Dealer Account</span>
              </button>
            </div>
          </div>

          {/* Opening Balance (Only shown during creation) */}
          {!isEditing && (
            <div className={styles.openingSection}>
              <label className={styles.sectionLabel}>Opening Balance (Optional)</label>
              <TextField
                label="Opening Amount"
                type="number"
                fullWidth
                size="small"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
                inputProps={{ min: 0, step: 'any' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeIcon className={styles.inputIcon} />
                    </InputAdornment>
                  ),
                }}
                className={styles.textField}
              />

              {parsedOpening > 0 && (
                <div className={styles.directionSection}>
                  <label className={styles.directionLabel}>Who owes this amount?</label>
                  <div className={styles.directionCardsRow}>
                    <div
                      className={`${styles.directionCard} ${
                        openingDirection === 'RECEIVE' ? styles.receiveSelected : ''
                      }`}
                      onClick={() => setOpeningDirection('RECEIVE')}
                    >
                      <div className={styles.directionDot} />
                      <div className={styles.directionText}>
                        <strong>I Will Receive (+₹{parsedOpening.toLocaleString('en-IN')})</strong>
                        <p>The other person owes money to you (Green balance)</p>
                      </div>
                    </div>

                    <div
                      className={`${styles.directionCard} ${
                        openingDirection === 'PAY' ? styles.paySelected : ''
                      }`}
                      onClick={() => setOpeningDirection('PAY')}
                    >
                      <div className={styles.directionDotRed} />
                      <div className={styles.directionText}>
                        <strong>I Will Pay (-₹{parsedOpening.toLocaleString('en-IN')})</strong>
                        <p>You owe money to the other person (Red balance)</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>

        <DialogActions className={styles.dialogActions}>
          <Button onClick={onClose} disabled={loading} className={styles.cancelBtn}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            className={styles.submitBtn}
            startIcon={loading ? <CircularProgress size={18} className={styles.spinner} /> : null}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Account' : 'Create Khata Book'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default KhataBookModal;
