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
  Tooltip,
  IconButton,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AddLocationAltOutlinedIcon from '@mui/icons-material/AddLocationAltOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';

import { formatAddressForCopy } from './DealerAddressCard';
import styles from './DealerModal.module.scss';

const MOBILE_REGEX = /^[+]?[\d\s\-().]{7,20}$/;

const createEmptyAddress = (title = '') => ({
  addressTitle: title,
  completeAddress: '',
  city: '',
  state: '',
  pinCode: '',
  country: 'India',
});

const DealerModal = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isDuplicate = false,
  loading = false,
  onCopySuccess,
  onCopyError,
}) => {
  const isDuplicateMode = Boolean(isDuplicate);
  const isEditing = Boolean(!isDuplicateMode && initialData);

  const [dealerName, setDealerName] = useState('');
  const [mobileNumbers, setMobileNumbers] = useState(['']);
  const [addresses, setAddresses] = useState([createEmptyAddress('Main Shop')]);
  const [addToKhataBook, setAddToKhataBook] = useState(true);
  const [validationError, setValidationError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Populate data when editing or reset when adding
  useEffect(() => {
    if (open) {
      if (initialData) {
        setDealerName(initialData.dealerName || '');

        // Populate multiple mobile numbers
        if (Array.isArray(initialData.mobileNumbers) && initialData.mobileNumbers.length > 0) {
          setMobileNumbers(initialData.mobileNumbers);
        } else if (initialData.mobileNumber) {
          setMobileNumbers([initialData.mobileNumber]);
        } else {
          setMobileNumbers(['']);
        }

        // Populate addresses
        if (Array.isArray(initialData.addresses) && initialData.addresses.length > 0) {
          setAddresses(
            initialData.addresses.map((a) => ({
              _id: a._id,
              addressTitle: a.addressTitle || '',
              completeAddress: a.completeAddress || '',
              city: a.city || '',
              state: a.state || '',
              pinCode: a.pinCode || '',
              country: a.country || 'India',
            }))
          );
        } else {
          setAddresses([createEmptyAddress('Main Shop')]);
        }
        setAddToKhataBook(isDuplicateMode ? true : false);
      } else {
        setDealerName('');
        setMobileNumbers(['']);
        setAddresses([createEmptyAddress('Main Shop')]);
        setAddToKhataBook(true);
      }
      setValidationError('');
      setCopiedIndex(null);
    }
  }, [open, initialData, isDuplicateMode]);

  // Mobile number handlers
  const handleMobileChange = (index, value) => {
    setMobileNumbers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setValidationError('');
  };

  const handleAddMobile = () => {
    setMobileNumbers((prev) => [...prev, '']);
  };

  const handleRemoveMobile = (index) => {
    if (mobileNumbers.length <= 1) return;
    setMobileNumbers((prev) => prev.filter((_, i) => i !== index));
    setValidationError('');
  };

  // Handle address field change
  const handleAddressChange = (index, field, value) => {
    setAddresses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setValidationError('');
  };

  // Add another address
  const handleAddAddress = () => {
    const titles = ['Branch Office', 'Warehouse', 'Head Office', 'Factory', 'Shop'];
    const nextTitle =
      titles[(addresses.length - 1) % titles.length] || `Address #${addresses.length + 1}`;
    setAddresses((prev) => [...prev, createEmptyAddress(nextTitle)]);
  };

  // Remove address
  const handleRemoveAddress = (index) => {
    if (addresses.length <= 1) return;
    setAddresses((prev) => prev.filter((_, i) => i !== index));
  };

  // Copy individual address from modal
  const handleCopyAddress = async (index) => {
    const addr = addresses[index];
    const formatted = formatAddressForCopy(addr);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(formatted);
      }
      setCopiedIndex(index);
      if (onCopySuccess) onCopySuccess(addr.addressTitle);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Copy address failed:', err);
      if (onCopyError) onCopyError();
    }
  };

  // Form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!dealerName.trim()) {
      setValidationError('Dealer name is required.');
      return;
    }

    // Validate mobile numbers
    const validMobiles = [];
    const seenMobiles = new Set();

    for (let i = 0; i < mobileNumbers.length; i++) {
      const raw = mobileNumbers[i];
      const trimmed = (raw || '').trim();

      if (i === 0 && !trimmed) {
        setValidationError('Primary mobile number is required.');
        return;
      }

      if (trimmed) {
        if (!MOBILE_REGEX.test(trimmed)) {
          setValidationError(
            `Mobile number #${i + 1} ("${trimmed}") is invalid. Please enter 7-20 digits with optional country code.`
          );
          return;
        }

        const normalized = trimmed.replace(/\s+/g, '');
        if (seenMobiles.has(normalized)) {
          setValidationError(`Duplicate mobile number "${trimmed}" entered. Please remove duplicates.`);
          return;
        }

        seenMobiles.add(normalized);
        validMobiles.push(trimmed);
      }
    }

    if (validMobiles.length === 0) {
      setValidationError('At least one valid mobile number is required.');
      return;
    }

    // Validate addresses
    if (!Array.isArray(addresses) || addresses.length === 0) {
      setValidationError('Please add at least one address for this dealer.');
      return;
    }

    for (let i = 0; i < addresses.length; i++) {
      const a = addresses[i];
      if (!a.addressTitle || !a.addressTitle.trim()) {
        setValidationError(`Address #${i + 1}: Address title is required (e.g. Shop, Warehouse).`);
        return;
      }
      if (!a.completeAddress || !a.completeAddress.trim()) {
        setValidationError(`Address #${i + 1}: Complete address is required.`);
        return;
      }
    }

    onSubmit({
      dealerName: dealerName.trim(),
      mobileNumber: validMobiles[0],
      mobileNumbers: validMobiles,
      addToKhataBook: !isEditing && addToKhataBook,
      addresses: addresses.map((a) => ({
        addressTitle: a.addressTitle.trim(),
        completeAddress: a.completeAddress.trim(),
        city: a.city ? a.city.trim() : '',
        state: a.state ? a.state.trim() : '',
        pinCode: a.pinCode ? a.pinCode.trim() : '',
        country: a.country ? a.country.trim() : 'India',
      })),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={!loading ? onClose : undefined}
      PaperProps={{ className: styles.dialogPaper }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.titleIconBox}>
          {isDuplicateMode ? (
            <ContentCopyOutlinedIcon fontSize="inherit" />
          ) : (
            <StorefrontOutlinedIcon fontSize="inherit" />
          )}
        </div>
        <div>
          <h2 className={styles.modalHeading}>
            {isDuplicateMode
              ? 'Duplicate Dealer'
              : isEditing
              ? 'Edit Dealer'
              : 'Add New Dealer'}
          </h2>
          <p className={styles.modalSubtitle}>
            {isDuplicateMode
              ? `Creating a duplicate copy of "${initialData?.dealerName || 'dealer'}" contact details and addresses.`
              : isEditing
              ? 'Update dealer information, contact numbers, and business addresses.'
              : 'Register a dealer with their contact details and multiple business addresses.'}
          </p>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit} noValidate>
        <DialogContent className={styles.dialogContent}>
          {validationError && (
            <Alert severity="error" className={`${styles.alertBox} ${styles.errorAlert}`}>
              {validationError}
            </Alert>
          )}

          {/* Dealer Core Details */}
          <div className={styles.nameFieldRow}>
            <TextField
              fullWidth
              id="dealerName"
              name="dealerName"
              label="Dealer Name"
              placeholder="e.g. Sharma Traders"
              value={dealerName}
              onChange={(e) => {
                setDealerName(e.target.value);
                setValidationError('');
              }}
              disabled={loading}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <StorefrontOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          {/* Multiple Mobile Numbers Section */}
          <div className={styles.mobileSectionContainer}>
            <div className={styles.mobileSectionHeader}>
              <div>
                <h3 className={styles.sectionHeading}>Mobile Numbers</h3>
                <p className={styles.sectionDesc}>
                  Add one or more contact numbers for this dealer.
                </p>
              </div>

              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={handleAddMobile}
                startIcon={<AddIcon />}
                disabled={loading}
                className={styles.addMobileBtn}
              >
                + Add Another Number
              </Button>
            </div>

            <div className={styles.mobileList}>
              {mobileNumbers.map((num, idx) => (
                <div key={idx} className={styles.mobileRow}>
                  <TextField
                    fullWidth
                    size="small"
                    id={`mobileNumber_${idx}`}
                    label={idx === 0 ? 'Primary Mobile Number' : `Mobile Number #${idx + 1}`}
                    placeholder="+91 98765 43210"
                    value={num}
                    onChange={(e) => handleMobileChange(idx, e.target.value)}
                    disabled={loading}
                    required={idx === 0}
                    helperText={idx === 0 ? 'Primary contact for orders & notifications' : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlinedIcon className={styles.inputIcon} />
                        </InputAdornment>
                      ),
                      endAdornment: idx === 0 ? (
                        <InputAdornment position="end">
                          <span className={styles.primaryBadge}>Primary</span>
                        </InputAdornment>
                      ) : null,
                    }}
                  />

                  {mobileNumbers.length > 1 && (
                    <Tooltip title="Remove this mobile number">
                      <IconButton
                        type="button"
                        onClick={() => handleRemoveMobile(idx)}
                        className={styles.removeMobileBtn}
                        size="small"
                        aria-label="Remove mobile number"
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Address Management Section */}
          <div className={styles.addressSectionContainer}>
            <div className={styles.addressSectionHeader}>
              <div>
                <h3 className={styles.sectionHeading}>Business Addresses</h3>
                <p className={styles.sectionDesc}>
                  Add one or more physical business locations (Shop, Warehouse, Branch, Office).
                </p>
              </div>

              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={handleAddAddress}
                startIcon={<AddLocationAltOutlinedIcon />}
                disabled={loading}
                className={styles.addAddressBtn}
              >
                + Add Another Address
              </Button>
            </div>

            <div className={styles.addressCardList}>
              {addresses.map((addr, index) => {
                const isCopied = copiedIndex === index;
                const canCopy = Boolean(addr.completeAddress || addr.city);

                return (
                  <div key={index} className={styles.addressItemCard}>
                    <div className={styles.addressCardTop}>
                      <span className={styles.addressCardBadge}>
                        Address #{index + 1}
                      </span>

                      <div className={styles.addressCardActions}>
                        {canCopy && (
                          <Tooltip title={isCopied ? 'Copied!' : 'Copy this address'}>
                            <button
                              type="button"
                              onClick={() => handleCopyAddress(index)}
                              className={`${styles.copyAddressSmallBtn} ${
                                isCopied ? styles.copySuccess : ''
                              }`}
                            >
                              {isCopied ? (
                                <>
                                  <CheckIcon fontSize="inherit" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <ContentCopyOutlinedIcon fontSize="inherit" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </Tooltip>
                        )}

                        {addresses.length > 1 && (
                          <Tooltip title="Remove this address">
                            <button
                              type="button"
                              onClick={() => handleRemoveAddress(index)}
                              className={styles.removeAddressBtn}
                            >
                              <DeleteOutlinedIcon fontSize="inherit" />
                              <span>Remove</span>
                            </button>
                          </Tooltip>
                        )}
                      </div>
                    </div>

                    <div className={styles.addressFormFields}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Address Title"
                        placeholder="e.g. Main Shop, Warehouse, Branch Office"
                        value={addr.addressTitle}
                        onChange={(e) => handleAddressChange(index, 'addressTitle', e.target.value)}
                        disabled={loading}
                        required
                      />

                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        label="Complete Address"
                        placeholder="Building, Street, Locality, Area"
                        value={addr.completeAddress}
                        onChange={(e) =>
                          handleAddressChange(index, 'completeAddress', e.target.value)
                        }
                        disabled={loading}
                        required
                      />

                      <div className={styles.rowTwo}>
                        <TextField
                          fullWidth
                          size="small"
                          label="City"
                          placeholder="e.g. Ranchi"
                          value={addr.city}
                          onChange={(e) => handleAddressChange(index, 'city', e.target.value)}
                          disabled={loading}
                        />

                        <TextField
                          fullWidth
                          size="small"
                          label="State"
                          placeholder="e.g. Jharkhand"
                          value={addr.state}
                          onChange={(e) => handleAddressChange(index, 'state', e.target.value)}
                          disabled={loading}
                        />
                      </div>

                      <div className={styles.rowTwo}>
                        <TextField
                          fullWidth
                          size="small"
                          label="PIN Code"
                          placeholder="e.g. 834001"
                          value={addr.pinCode}
                          onChange={(e) => handleAddressChange(index, 'pinCode', e.target.value)}
                          disabled={loading}
                        />

                        <TextField
                          fullWidth
                          size="small"
                          label="Country"
                          placeholder="e.g. India"
                          value={addr.country}
                          onChange={(e) => handleAddressChange(index, 'country', e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add to Khata Book Checkbox (Only when adding a new dealer) */}
          {!isEditing && (
            <div className={styles.khataIntegrationRow}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={addToKhataBook}
                    onChange={(e) => setAddToKhataBook(e.target.checked)}
                    color="primary"
                    disabled={loading}
                  />
                }
                label={
                  <div className={styles.khataLabelBox}>
                    <strong>Add this Dealer to Khata Book</strong>
                    <span>Automatically creates a linked Khata Book account to track dues & settlements</span>
                  </div>
                }
              />
            </div>
          )}
        </DialogContent>

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
              ? 'Create Duplicate Dealer'
              : isEditing
              ? 'Save Changes'
              : 'Save Dealer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DealerModal;
