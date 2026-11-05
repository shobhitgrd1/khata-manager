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
import styles from './DeleteProductDialog.module.scss';

const DeleteProductDialog = ({
  open,
  product,
  onConfirm,
  onCancel,
  onClose,
  onDeleted,
  loading = false,
}) => {
  const handleCancelClick = () => {
    if (loading) return;
    if (onCancel) onCancel();
    else if (onClose) onClose();
  };

  const handleConfirmClick = () => {
    if (loading) return;
    if (onConfirm) onConfirm();
    else if (onDeleted) onDeleted();
  };

  const variantCount = Array.isArray(product?.variants) ? product.variants.length : 0;
  const colorCount = Array.isArray(product?.colors) ? product.colors.length : 0;

  return (
    <Dialog
      open={open}
      onClose={!loading ? handleCancelClick : undefined}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <WarningAmberIcon className={styles.warningIcon} />
        Confirm Product Deletion
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <p className={styles.dialogPrompt}>
          Are you sure you want to delete product{' '}
          <strong className={styles.productHighlight}>{product?.productName}</strong>?
        </p>
        <p className={styles.dialogWarning}>
          This action will remove the product from your catalog ({variantCount} {variantCount === 1 ? 'variant' : 'variants'}, {colorCount} {colorCount === 1 ? 'color' : 'colors'}). Any historical orders that referenced this product will remain safe and preserved.
        </p>
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button
          type="button"
          onClick={handleCancelClick}
          disabled={loading}
          className={styles.cancelBtn}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirmClick}
          disabled={loading}
          variant="contained"
          className={styles.deleteBtn}
          startIcon={loading ? <CircularProgress size={18} className={styles.spinner} /> : null}
        >
          {loading ? 'Deleting...' : 'Delete Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProductDialog;
