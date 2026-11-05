import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import accountService from '../../services/accountService';
import styles from './AccountModal.module.scss';

export const ACCOUNT_TYPES = [
  'Flipkart',
  'Amazon',
  'Meesho',
  'Myntra',
  'OnePlus Store',
  'Oppo Store',
  'Realme Store',
  'Samsung Store',
  'Vivo Store',
  'Instamart',
  'Blinkit',
  'Zepto',
  'Croma',
  'Croma Store',
  'Nio',
  'Other',
];

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const MOBILE_REGEX = /^[+]?[\d\s\-().]{7,15}$/;

const defaultForm = {
  accountType: '',
  customAccountType: '',
  fullName: '',
  mobileNumber: '',
  email: '',
};

const AccountModal = ({
  open,
  onClose,
  onSubmit,
  onSaved,
  account,
  initialData = null,
  isDuplicate = false,
  loading: externalLoading = false,
}) => {
  const activeData = account || initialData;
  const isDuplicateMode = Boolean(isDuplicate);
  const isEdit = Boolean(!isDuplicateMode && activeData);

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  // Pre-fill values when editing
  useEffect(() => {
    if (open) {
      if (activeData) {
        setForm({
          accountType: activeData.accountType || '',
          customAccountType: activeData.customAccountType || '',
          fullName: activeData.fullName || '',
          mobileNumber: activeData.mobileNumber || '',
          email: activeData.email || '',
        });
      } else {
        setForm(defaultForm);
      }
      setErrors({});
      setSubmitError('');
    }
  }, [open, activeData]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!form.accountType) {
      newErrors.accountType = 'Account type is required.';
    }

    if (form.accountType === 'Other' && !form.customAccountType.trim()) {
      newErrors.customAccountType = 'Custom account name is required when "Other" is selected.';
    }

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!form.mobileNumber.trim() && !form.email.trim()) {
      newErrors.mobileNumber = 'Please enter at least a mobile number or an email address.';
      newErrors.email = 'Please enter at least a mobile number or an email address.';
    }

    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (form.mobileNumber.trim() && !MOBILE_REGEX.test(form.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid mobile number (7-15 digits).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      accountType: form.accountType,
      customAccountType: form.accountType === 'Other' ? form.customAccountType.trim() : null,
      fullName: form.fullName.trim(),
      mobileNumber: form.mobileNumber.trim() || null,
      email: form.email.trim() || null,
    };

    if (typeof onSubmit === 'function') {
      try {
        await onSubmit(payload);
      } catch (err) {
        setSubmitError(err?.response?.data?.message || 'An error occurred. Please try again.');
      }
      return;
    }

    try {
      setInternalLoading(true);
      setSubmitError('');
      if (isEdit && activeData?._id) {
        await accountService.updateAccount(activeData._id, payload);
        if (typeof onSaved === 'function') {
          onSaved('Account updated successfully.');
        }
      } else {
        await accountService.createAccount(payload);
        if (typeof onSaved === 'function') {
          onSaved('Account created successfully.');
        }
      }
      onClose();
    } catch (err) {
      console.error('Account save error:', err);
      setSubmitError(err?.response?.data?.message || 'An error occurred while saving.');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      PaperProps={{ className: styles.dialogPaper }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.titleIconBox}>
          {isDuplicateMode ? (
            <ContentCopyIcon fontSize="small" />
          ) : (
            <StorefrontOutlinedIcon fontSize="small" />
          )}
        </div>
        <div>
          <div className={styles.modalHeading}>
            {isDuplicateMode ? 'Duplicate Account' : isEdit ? 'Edit Account' : 'Add New Account'}
          </div>
          <div className={styles.modalSubtitle}>
            {isDuplicateMode
              ? 'Creating a new account from existing account details.'
              : isEdit
              ? 'Update the details for this account.'
              : 'Enter the details for the new account.'}
          </div>
        </div>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {submitError && (
          <Alert severity="error" className={`${styles.alertBox} ${styles.errorAlert}`}>
            {submitError}
          </Alert>
        )}

        <div className={styles.formGrid}>
          {/* Account Type */}
          <TextField
            select
            label="Account Type"
            value={form.accountType}
            onChange={handleChange('accountType')}
            size="small"
            fullWidth
            error={!!errors.accountType}
            helperText={errors.accountType}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <StorefrontOutlinedIcon className={styles.inputIcon} />
                </InputAdornment>
              ),
            }}
          >
            {ACCOUNT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          {/* Custom Account Name (shown only when Other is selected) */}
          {form.accountType === 'Other' && (
            <TextField
              label="Custom Account Name"
              value={form.customAccountType}
              onChange={handleChange('customAccountType')}
              size="small"
              fullWidth
              error={!!errors.customAccountType}
              helperText={errors.customAccountType}
              placeholder="e.g. Myntra, Nykaa, AJIO..."
              inputProps={{ maxLength: 80 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EditNoteOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Full Name */}
          <TextField
            label="Full Name"
            value={form.fullName}
            onChange={handleChange('fullName')}
            size="small"
            fullWidth
            error={!!errors.fullName}
            helperText={errors.fullName}
            placeholder="Account holder's full name"
            inputProps={{ maxLength: 100 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlinedIcon className={styles.inputIcon} />
                </InputAdornment>
              ),
            }}
          />

          {/* Mobile and Email row */}
          <div className={styles.rowTwo}>
            <TextField
              label="Mobile Number"
              value={form.mobileNumber}
              onChange={handleChange('mobileNumber')}
              size="small"
              fullWidth
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              placeholder="+91 9876543210"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email Address"
              value={form.email}
              onChange={handleChange('email')}
              size="small"
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              placeholder="user@example.com"
              type="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </div>
        </div>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button
          onClick={onClose}
          disabled={loading}
          className={styles.cancelBtn}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          className={styles.submitBtn}
          startIcon={loading ? <CircularProgress size={16} className={styles.spinner} /> : null}
        >
          {loading
            ? (isDuplicateMode ? 'Duplicating...' : isEdit ? 'Saving...' : 'Adding...')
            : (isDuplicateMode ? 'Create Duplicate Account' : isEdit ? 'Save Changes' : 'Add Account')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountModal;
