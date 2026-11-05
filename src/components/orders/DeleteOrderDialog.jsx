import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import orderService from '../../services/orderService';
import styles from './DeleteOrderDialog.module.scss';

const DeleteOrderDialog = ({
  open,
  order,
  onConfirm,
  onCancel,
  onClose,
  onDeleted,
  loading: externalLoading = false,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const isBusy = externalLoading || submitting;
  const isDelivered = order?.status === 'Delivered';

  const handleClose = () => {
    if (typeof onCancel === 'function') onCancel();
    if (typeof onClose === 'function') onClose();
  };

  const handleConfirm = async () => {
    if (typeof onConfirm === 'function') {
      await onConfirm();
    } else if (order?._id) {
      try {
        setSubmitting(true);
        await orderService.deleteOrder(order._id);
        if (typeof onDeleted === 'function') onDeleted();
        handleClose();
      } catch (err) {
        console.error('Delete order error:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={!isBusy ? handleClose : undefined}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <WarningAmberIcon className={styles.warningIcon} />
        Confirm Order Deletion
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <p className={styles.dialogPrompt}>
          Are you sure you want to delete order{' '}
          <strong className={styles.orderHighlight}>#{order?.orderId}</strong> for dealer{' '}
          <strong>{order?.dealerNameSnapshot}</strong>?
        </p>
        <p className={styles.dialogWarning}>
          {isDelivered
            ? 'This order has already been marked as Delivered. Deleting it will remove it from your active list and recalculate your overall statistics.'
            : 'This order is currently In Process. Deleting it will permanently cancel this order transaction.'}
        </p>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button onClick={handleClose} disabled={isBusy} className={styles.cancelBtn}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isBusy}
          variant="contained"
          className={styles.deleteBtn}
          startIcon={isBusy ? <CircularProgress size={18} className={styles.spinner} /> : null}
        >
          {isBusy ? 'Deleting...' : 'Delete Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteOrderDialog;

