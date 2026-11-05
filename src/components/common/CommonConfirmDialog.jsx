import React from 'react';
import PropTypes from 'prop-types';
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
import styles from './CommonConfirmDialog.module.scss';

const CommonConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  itemName = '',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
  error = '',
  icon: Icon = WarningAmberIcon,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      classes={{ paper: styles.dialogPaper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.warningIconBox}>
          <Icon />
        </div>
        <span>{title}</span>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {error && <Alert severity="error">{error}</Alert>}
        {message ? (
          <p className={styles.dialogMessage}>{message}</p>
        ) : (
          <p className={styles.dialogMessage}>
            Are you sure you want to delete{' '}
            {itemName ? (
              <span className={styles.highlightName}>&ldquo;{itemName}&rdquo;</span>
            ) : (
              'this item'
            )}
            ? This action cannot be undone.
          </p>
        )}
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          className={styles.cancelBtn}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          className={
            confirmVariant === 'danger'
              ? styles.confirmDangerBtn
              : styles.confirmPrimaryBtn
          }
        >
          {loading && <CircularProgress size={16} className={styles.btnSpinner} />}
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

CommonConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.node,
  itemName: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmVariant: PropTypes.oneOf(['danger', 'primary', 'warning', 'success']),
  loading: PropTypes.bool,
  error: PropTypes.string,
  icon: PropTypes.elementType,
};

export default CommonConfirmDialog;

