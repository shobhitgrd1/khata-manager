import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import styles from './DeleteDealerDialog.module.scss';

const DeleteDealerDialog = ({
  open,
  dealer,
  dealerName,
  onConfirm,
  onCancel,
  onClose,
  loading = false,
}) => {
  const handleClose = () => {
    if (loading) return;
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const name = dealer?.dealerName || dealerName || 'this dealer';
  const addressCount = Array.isArray(dealer?.addresses) ? dealer.addresses.length : 0;

  return (
    <Dialog
      open={Boolean(open)}
      onClose={handleClose}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <WarningAmberIcon className={styles.warningIcon} />
        Confirm Dealer Deletion
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <p className={styles.dialogPrompt}>
          Are you sure you want to delete dealer{' '}
          <strong className={styles.dealerHighlight}>{name}</strong>?
        </p>
        <p className={styles.dialogWarning}>
          This action is permanent and cannot be undone. This dealer and all associated{' '}
          <strong>
            {addressCount} {addressCount === 1 ? 'address' : 'addresses'}
          </strong>{' '}
          will be permanently removed.
        </p>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={handleClose} disabled={loading} className={styles.cancelBtn}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          className={styles.deleteBtn}
          startIcon={loading ? <CircularProgress size={18} className={styles.spinner} /> : null}
        >
          {loading ? 'Deleting...' : 'Delete Dealer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDealerDialog;
