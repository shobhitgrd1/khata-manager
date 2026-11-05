import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import creditCardService from '../../services/creditCardService';
import styles from './DeleteCardModal.module.scss';

const DeleteCardModal = ({
  open,
  card,
  onConfirm,
  onCancel,
  onClose,
  onDeleted,
  loading: externalLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const loading = externalLoading || internalLoading;

  const handleClose = () => {
    if (loading) return;
    setErrorMsg('');
    if (typeof onCancel === 'function') {
      onCancel();
    } else if (typeof onClose === 'function') {
      onClose();
    }
  };

  const handleDelete = async () => {
    setErrorMsg('');

    if (typeof onConfirm === 'function') {
      onConfirm(card);
      return;
    }

    if (!card?._id) {
      handleClose();
      return;
    }

    try {
      setInternalLoading(true);
      await creditCardService.deleteCreditCard(card._id);
      if (typeof onDeleted === 'function') {
        onDeleted('Credit card deleted successfully');
      }
      handleClose();
    } catch (err) {
      console.error('Delete card error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to delete credit card');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        className: styles.dialogPaper,
      }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <WarningAmberIcon className={styles.warningIcon} />
        Confirm Card Deletion
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {errorMsg && (
          <Alert severity="error" className={styles.errorAlert}>
            {errorMsg}
          </Alert>
        )}
        <p className={styles.dialogPrompt}>
          Are you sure you want to remove{' '}
          <strong className={styles.cardHighlight}>
            {card?.cardName} (•••• {card?.lastFourDigits})
          </strong>{' '}
          issued by {card?.bankName}?
        </p>
        <p className={styles.dialogWarning}>
          This action will permanently remove this credit card and recalculate your overall credit limit and available balance.
        </p>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button
          type="button"
          onClick={handleClose}
          disabled={loading}
          className={styles.cancelBtn}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          variant="contained"
          className={styles.deleteBtn}
          startIcon={
            loading ? <CircularProgress size={18} className={styles.spinner} /> : null
          }
        >
          {loading ? 'Deleting...' : 'Delete Card'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCardModal;
