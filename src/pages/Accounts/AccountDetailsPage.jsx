import React, { useState, useEffect, useCallback } from 'react';
import { Button, CircularProgress, Alert } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import AccountModal from '../../components/accounts/AccountModal';
import accountService from '../../services/accountService';
import useAuth from '../../hooks/useAuth';
import styles from './AccountDetailsPage.module.scss';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const AccountDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEditAccount } = useAuth();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await accountService.getAccountById(id);
      if (data?.account) {
        setAccount(data.account);
      }
    } catch (err) {
      console.error('Fetch account error:', err);
      setError(err.response?.data?.message || 'Failed to load account details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const handleEditSubmit = async (payload) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await accountService.updateAccount(id, payload);
      if (data?.account) {
        setAccount(data.account);
      }
      setSuccessMsg('Account updated successfully!');
      setModalOpen(false);
    } catch (err) {
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const displayType =
    account?.accountType === 'Other' && account?.customAccountType
      ? account.customAccountType
      : account?.accountType;

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <CircularProgress className={styles.spinner} size={48} thickness={4} />
        <span className={styles.loadingText}>Loading account details...</span>
      </div>
    );
  }

  if (error && !account) {
    return (
      <div className={styles.errorWrapper}>
        <Alert severity="error" className={styles.errorAlert}>
          {error}
        </Alert>
        <Button
          onClick={() => navigate('/accounts')}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          className={styles.backBtn}
        >
          Back to Accounts
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            onClick={() => navigate('/accounts')}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            size="small"
            className={styles.backBtn}
          >
            Back to Accounts
          </Button>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Account Details</h1>
          </div>
        </div>

        {canEditAccount() && (
          <Button
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setModalOpen(true)}
            className={styles.editBtn}
          >
            Edit Account
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          className={`${styles.alertBox} ${styles.errorAlertBox}`}
        >
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg('')}
          className={`${styles.alertBox} ${styles.successAlertBox}`}
        >
          {successMsg}
        </Alert>
      )}

      {/* Detail Card */}
      {account && (
        <div className={styles.detailCard}>
          <div className={styles.cardHeader}>
            <div className={styles.iconBox}>
              <StorefrontOutlinedIcon fontSize="inherit" />
            </div>
            <div>
              <div className={styles.accountTypeLabel}>{displayType}</div>
              <div className={styles.accountFullName}>{account.fullName}</div>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.fieldsGrid}>
            {/* Full Name */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldIcon}>
                <PersonOutlinedIcon fontSize="inherit" />
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Full Name</span>
                <span className={styles.fieldValue}>{account.fullName}</span>
              </div>
            </div>

            {/* Account Type */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldIcon}>
                <StorefrontOutlinedIcon fontSize="inherit" />
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Account Type</span>
                <span className={styles.fieldValue}>{displayType}</span>
              </div>
            </div>

            {/* Mobile Number */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldIcon}>
                <PhoneOutlinedIcon fontSize="inherit" />
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Mobile Number</span>
                <span className={account.mobileNumber ? styles.fieldValue : styles.fieldValueEmpty}>
                  {account.mobileNumber || 'Not provided'}
                </span>
              </div>
            </div>

            {/* Email */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldIcon}>
                <EmailOutlinedIcon fontSize="inherit" />
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Email Address</span>
                <span className={account.email ? styles.fieldValue : styles.fieldValueEmpty}>
                  {account.email || 'Not provided'}
                </span>
              </div>
            </div>

            {/* Created */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldIcon}>
                <CalendarMonthIcon fontSize="inherit" />
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Created On</span>
                <span className={styles.fieldValue}>{formatDate(account.createdAt)}</span>
              </div>
            </div>

            {/* Updated */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldIcon}>
                <CalendarMonthIcon fontSize="inherit" />
              </div>
              <div className={styles.fieldContent}>
                <span className={styles.fieldLabel}>Last Updated</span>
                <span className={styles.fieldValue}>{formatDate(account.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <AccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={account}
        loading={actionLoading}
      />
    </div>
  );
};

export default AccountDetailsPage;
