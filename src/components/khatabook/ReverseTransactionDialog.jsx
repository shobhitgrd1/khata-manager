import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

const ReverseTransactionDialog = ({
  open,
  transaction,
  onConfirm,
  onClose,
  loading = false,
}) => {
  const [reason, setReason] = useState('Transaction entered in error');

  const handleConfirm = () => {
    onConfirm(reason.trim() || 'Transaction reversed by user');
  };

  return (
    <Dialog
      open={Boolean(open)}
      onClose={!loading ? onClose : undefined}
      PaperProps={{
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          color: '#F8FAFC',
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 20px 45px rgba(0,0,0,0.7)',
        },
      }}
    >
      <DialogTitle
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontWeight: 800,
          color: '#F87171',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 24px 16px',
        }}
      >
        <WarningAmberIcon style={{ fontSize: '1.6rem', color: '#F87171' }} />
        Reverse Ledger Transaction
      </DialogTitle>

      <DialogContent style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#E2E8F0', lineHeight: 1.5 }}>
          Are you sure you want to reverse this{' '}
          <strong style={{ color: '#FFFFFF' }}>{transaction?.transactionType?.replace(/_/g, ' ')}</strong>{' '}
          transaction of <strong style={{ color: '#38BDF8' }}>{formatINR(transaction?.amount)}</strong>?
        </p>

        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4 }}>
          This will create an audit reversal entry, cancel the balance impact, and recalculate the running balance.
          Financial history will not be deleted.
        </p>

        <TextField
          label="Reason for Reversal"
          required
          fullWidth
          size="small"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Mistaken entry, Cancelled transaction"
          style={{ marginTop: 6 }}
        />
      </DialogContent>

      <DialogActions
        style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          style={{ color: '#94A3B8', textTransform: 'none', fontWeight: 600 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          style={{
            background: '#EF4444',
            color: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 8,
          }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Reversing...' : 'Confirm Reversal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReverseTransactionDialog;
