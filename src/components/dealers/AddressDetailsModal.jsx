import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';

import { formatAddressForCopy } from './DealerAddressCard';
import styles from './AddressDetailsModal.module.scss';

const AddressDetailsModal = ({ open, onClose, address, dealerName, onCopySuccess, onCopyError }) => {
  const [copied, setCopied] = useState(false);

  if (!address) return null;

  const {
    addressTitle = 'Address',
    completeAddress = '',
    city = '',
    state = '',
    pinCode = '',
    country = 'India',
  } = address;

  const handleCopy = async () => {
    const formatted = formatAddressForCopy(address);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(formatted);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formatted;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (onCopySuccess) onCopySuccess(addressTitle);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Copy address failed:', err);
      if (onCopyError) onCopyError();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ className: styles.dialogPaper }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.titleLeft}>
          <div className={styles.titleIconBox}>
            <LocationOnOutlinedIcon className={styles.titleIcon} />
          </div>
          <div>
            <h3 className={styles.modalHeading}>Address Details</h3>
            {dealerName && <p className={styles.modalSubtitle}>{dealerName}</p>}
          </div>
        </div>
        <IconButton onClick={onClose} className={styles.closeBtn} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <div className={styles.addressCard}>
          <div className={styles.cardHeader}>
            <span className={styles.titleBadge}>{addressTitle}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.fieldLabel}>Complete Address</span>
            <p className={styles.addressBody}>{completeAddress || '—'}</p>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>City</span>
              <p className={styles.fieldVal}>{city || '—'}</p>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>State</span>
              <p className={styles.fieldVal}>{state || '—'}</p>
            </div>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>PIN Code</span>
              <p className={styles.fieldVal}>{pinCode || '—'}</p>
            </div>
            <div className={styles.gridItem}>
              <span className={styles.fieldLabel}>Country</span>
              <p className={styles.fieldVal}>{country || 'India'}</p>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.cancelBtn}>
          Close
        </Button>
        <Button
          onClick={handleCopy}
          className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
          startIcon={copied ? <CheckIcon /> : <ContentCopyOutlinedIcon />}
        >
          {copied ? 'Address Copied!' : 'Copy Address'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressDetailsModal;

