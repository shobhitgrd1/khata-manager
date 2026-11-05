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
import accountService from '../../services/accountService';
import styles from './DeleteAccountDialog.module.scss';

const DeleteAccountDialog = ({
  open,
  account,
  onConfirm,
  onCancel,
  onClose,
  onDeleted,
  loading: externalLoading = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const loading = externalLoading || internalLoading;

  const displayType =
    account?.accountType === 'Other' && account?.customAccountType
      ? account.customAccountType
      : account?.accountType;

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
      onConfirm(account);
      return;
    }

    if (!account?._id) {
      handleClose();
      return;
    }

    try {
      setInternalLoading(true);
      await accountService.deleteAccount(account._id);
      if (typeof onDeleted === 'function') {
        onDeleted('Account deleted successfully.');
      }
      handleClose();
    } catch (err) {
      console.error('Delete account error:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{ className: styles.dialogPaper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <WarningAmberIcon className={styles.warningIcon} />
        Confirm Account Deletion
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {errorMsg && (
          <Alert severity="error" className={styles.errorAlert}>
            {errorMsg}
          </Alert>
        )}
        <p className={styles.dialogPrompt}>
          Are you sure you want to delete the account for{' '}
          <strong className={styles.accountHighlight}>{account?.fullName}</strong>
          {displayType && (
            <>
              {' '}
              on <strong className={styles.accountHighlight}>{displayType}</strong>
            </>
          )}
          ?
        </p>
        <p className={styles.dialogWarning}>
          This action will remove the account from your active listings. Existing order history will remain preserved.
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
          startIcon={loading ? <CircularProgress size={18} className={styles.spinner} /> : null}
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteAccountDialog;
