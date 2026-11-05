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
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';

import { formatAddressForCopy } from './DealerAddressCard';
import styles from './AddressOverflowModal.module.scss';

const AddressOverflowModal = ({
  open,
  onClose,
  addresses = [],
  dealerName = '',
  onCopySuccess,
  onCopyError,
}) => {
  const [copiedMap, setCopiedMap] = useState({});

  if (!addresses || addresses.length === 0) return null;

  const handleCopy = async (address, index) => {
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
      setCopiedMap((prev) => ({ ...prev, [index]: true }));
      if (onCopySuccess) onCopySuccess(address.addressTitle);
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [index]: false }));
      }, 2200);
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
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.titleLeft}>
          <div className={styles.titleIconBox}>
            <LocationCityOutlinedIcon className={styles.titleIcon} />
          </div>
          <div>
            <h3 className={styles.modalHeading}>
              All Additional Addresses ({addresses.length})
            </h3>
            {dealerName && <p className={styles.modalSubtitle}>{dealerName}</p>}
          </div>
        </div>
        <IconButton onClick={onClose} className={styles.closeBtn} size="small" aria-label="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <div className={styles.addressGrid}>
          {addresses.map((addr, idx) => {
            const isCopied = Boolean(copiedMap[idx]);
            const cityState = [addr.city, addr.state, addr.pinCode].filter(Boolean).join(', ');

            return (
              <div key={addr._id || idx} className={styles.addressCard}>
                <div className={styles.cardTop}>
                  <span className={styles.titleBadge}>{addr.addressTitle || `Address #${idx + 1}`}</span>
                  <Button
                    onClick={() => handleCopy(addr, idx)}
                    className={`${styles.copyBtn} ${isCopied ? styles.copied : ''}`}
                    size="small"
                    startIcon={isCopied ? <CheckIcon /> : <ContentCopyOutlinedIcon />}
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </Button>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.fullAddress}>{addr.completeAddress}</p>
                  {cityState && <p className={styles.cityState}>{cityState}</p>}
                  {addr.country && <p className={styles.country}>{addr.country}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={onClose} className={styles.closeModalBtn}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressOverflowModal;

