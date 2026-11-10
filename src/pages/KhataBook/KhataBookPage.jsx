import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Snackbar,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

import ViewToggle from '../../components/common/ViewToggle';
import CommonEmptyState from '../../components/common/CommonEmptyState';
import KhataBookCard from '../../components/khatabook/KhataBookCard';
import KhataBookModal from '../../components/khatabook/KhataBookModal';
import { getKhataBookColumns } from './TableColumns';
import { KHATA_BALANCE_FILTERS } from '../../constants/khatabook.constants';
import khatabookService from '../../services/khatabookService';
import useAuth from '../../hooks/useAuth';
import { useMobileHeader } from '../../context/MobileHeaderContext';
import styles from './KhataBookPage.module.scss';

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

const KhataBookPage = () => {
  const navigate = useNavigate();
  const { canCreateKhataBook, canEditKhataBook, canDeleteKhataBook } = useAuth();

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tabs: Dealer vs Other
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('khata_active_tab') || 'Dealer';
  });

  // Top Summary Cards per tab (completely separate calculations)
  const [dealerSummary, setDealerSummary] = useState({
    totalAccounts: 0,
    totalToReceive: 0,
    totalToPay: 0,
    netBalance: 0,
  });

  const [otherSummary, setOtherSummary] = useState({
    totalAccounts: 0,
    totalToReceive: 0,
    totalToPay: 0,
    netBalance: 0,
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('khata_active_tab', tab);
  };

  const currentSummary = activeTab === 'Dealer' ? dealerSummary : otherSummary;

  // View mode
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('khata_view_mode') || 'card';
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('khata_view_mode', mode);
  };

  useMobileHeader(
    canCreateKhataBook()
      ? {
          title: `Khata Book`,
          action: {
            label: `+ Add ${activeTab}`,
            onClick: () => {
              setEditingAccount(null);
              setModalOpen(true);
            },
          },
        }
      : { title: 'Khata Book', action: null }
  );

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('');
  const debounceTimer = useRef(null);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Fetch accounts list and summaries
  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        accountType: activeTab,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (balanceFilter) params.balanceFilter = balanceFilter;

      const data = await khatabookService.getKhataBooks(params);
      if (data?.success) {
        setAccounts(data.accounts || []);
        if (data.dealerSummary) setDealerSummary(data.dealerSummary);
        if (data.otherSummary) setOtherSummary(data.otherSummary);
        if (data.summary) {
          if (activeTab === 'Dealer') {
            setDealerSummary(data.summary);
          } else {
            setOtherSummary(data.summary);
          }
        }
      }
    } catch (err) {
      console.error('Fetch KhataBooks error:', err);
      setError(err.response?.data?.message || 'Failed to load Khata Book accounts.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeTab, balanceFilter]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (acc) => {
    setEditingAccount(acc);
    setModalOpen(true);
  };

  const handleOpenArchive = (acc) => {
    setDeletingAccount(acc);
    setDeleteDialogOpen(true);
  };

  const handleSaveAccount = async (payload) => {
    setActionLoading(true);
    try {
      if (editingAccount) {
        await khatabookService.updateKhataBook(editingAccount._id, payload);
        setSuccessMsg('Account updated successfully.');
      } else {
        await khatabookService.createKhataBook(payload);
        setSuccessMsg('Khata Book account created successfully.');
      }
      setModalOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error('Save account error:', err);
      setError(err.response?.data?.message || 'Failed to save account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!deletingAccount) return;
    setActionLoading(true);
    try {
      await khatabookService.archiveKhataBook(deletingAccount._id);
      setSuccessMsg('Account archived successfully.');
      setDeleteDialogOpen(false);
      setDeletingAccount(null);
      fetchAccounts();
    } catch (err) {
      console.error('Archive account error:', err);
      setError(err.response?.data?.message || 'Failed to archive account.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = useMemo(
    () =>
      getKhataBookColumns({
        canEdit: canEditKhataBook(),
        canDelete: canDeleteKhataBook(),
        onView: (row) => navigate(`/khatabook/${row._id}`),
        onEdit: handleOpenEdit,
        onArchive: handleOpenArchive,
      }),
    [canEditKhataBook, canDeleteKhataBook, navigate]
  );

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            className={styles.backBtn}
          >
            Dashboard
          </Button>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Khata Book</h1>
          </div>
        </div>

        <div className={styles.headerRight}>
          {canCreateKhataBook() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              className={styles.addBtn}
            >
              + Create Khata Book
            </Button>
          )}
        </div>
      </div>

      {/* Khata Book Tabs: Dealer vs Other */}
      <div className={styles.tabsContainer} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'Dealer'}
          onClick={() => handleTabChange('Dealer')}
          className={`${styles.tabBtn} ${activeTab === 'Dealer' ? styles.tabActive : ''}`}
        >
          <StorefrontIcon className={styles.tabIcon} />
          <span className={styles.tabLabel}>Dealer</span>
          <span className={styles.tabCount}>{dealerSummary.totalAccounts || 0}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'Other'}
          onClick={() => handleTabChange('Other')}
          className={`${styles.tabBtn} ${activeTab === 'Other' ? styles.tabActive : ''}`}
        >
          <PersonOutlinedIcon className={styles.tabIcon} />
          <span className={styles.tabLabel}>Other</span>
          <span className={styles.tabCount}>{otherSummary.totalAccounts || 0}</span>
        </button>
      </div>

      {/* 3 Summary Cards (Specific to Khata Book module) */}
      <div className={styles.summarySection}>
        {/* Card 1: Total to Receive */}
        <div className={`${styles.summaryCard} ${styles.receiveCard}`}>
          <div className={styles.summaryIconBoxGreen}>
            <TrendingUpIcon />
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total to Receive</span>
            <span className={styles.summaryValGreen}>+{formatINR(currentSummary.totalToReceive)}</span>
            <span className={styles.summarySub}>Total outstanding owed to you</span>
          </div>
        </div>

        {/* Card 2: Total to Pay */}
        <div className={`${styles.summaryCard} ${styles.payCard}`}>
          <div className={styles.summaryIconBoxRed}>
            <TrendingDownIcon />
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Total to Pay</span>
            <span className={styles.summaryValRed}>-{formatINR(currentSummary.totalToPay)}</span>
            <span className={styles.summarySub}>Total outstanding you owe to others</span>
          </div>
        </div>

        {/* Card 3: Net Balance */}
        <div className={`${styles.summaryCard} ${styles.netCard}`}>
          <div className={styles.summaryIconBoxBlue}>
            <AccountBalanceWalletIcon />
          </div>
          <div className={styles.summaryContent}>
            <span className={styles.summaryLabel}>Net Ledger Balance</span>
            <span
              className={
                currentSummary.netBalance > 0
                  ? styles.summaryValGreen
                  : currentSummary.netBalance < 0
                    ? styles.summaryValRed
                    : styles.summaryValSettled
              }
            >
              {currentSummary.netBalance > 0 && `+${formatINR(currentSummary.netBalance)}`}
              {currentSummary.netBalance < 0 && `-${formatINR(currentSummary.netBalance)}`}
              {currentSummary.netBalance === 0 && '₹0 (Settled)'}
            </span>
            <span className={styles.summarySub}>
              {currentSummary.netBalance > 0
                ? 'Net positive (Receivables exceed Payables)'
                : currentSummary.netBalance < 0
                  ? 'Net negative (Payables exceed Receivables)'
                  : 'All accounts balanced'}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} className={styles.alert}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')} className={styles.alert}>
          {successMsg}
        </Alert>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <TextField
            placeholder="Search by person name or mobile number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className={styles.searchIcon} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <button type="button" onClick={() => setSearch('')} className={styles.clearBtn}>
                    <ClearIcon fontSize="small" />
                  </button>
                </InputAdornment>
              ) : null,
            }}
          />
        </div>

        <div className={styles.filterControls}>
          {/* Balance Filter */}
          <TextField
            select
            size="small"
            value={balanceFilter}
            onChange={(e) => setBalanceFilter(e.target.value)}
            className={styles.dropdownFilter}
            SelectProps={{ displayEmpty: true }}
          >
            {KHATA_BALANCE_FILTERS.map((b) => (
              <MenuItem key={b.value} value={b.value}>
                {b.label}
              </MenuItem>
            ))}
          </TextField>

          <ViewToggle viewMode={viewMode} onChange={handleToggleView} />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <CircularProgress className={styles.spinner} />
          <p className={styles.loadingText}>Loading ledger accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <CommonEmptyState
          icon={activeTab === 'Dealer' ? StorefrontIcon : PersonOutlinedIcon}
          title={`No ${activeTab} Accounts Found`}
          description={
            debouncedSearch || balanceFilter
              ? `No ${activeTab.toLowerCase()} ledger accounts matched your search query or filters.`
              : `You have not created any ${activeTab.toLowerCase()} accounts yet. Create your first ${activeTab.toLowerCase()} account to start tracking dues.`
          }
          actionLabel={canCreateKhataBook() ? `+ Create ${activeTab} Account` : undefined}
          onAction={handleOpenAdd}
          actionIcon={<AddIcon />}
        />
      ) : viewMode === 'card' ? (
        <div className={styles.cardGrid}>
          {accounts.map((acc) => (
            <KhataBookCard
              key={acc._id}
              account={acc}
              onEdit={handleOpenEdit}
              onArchive={handleOpenArchive}
              canEdit={canEditKhataBook()}
              canDelete={canDeleteKhataBook()}
              onCopySuccess={(text) => {
                setToastMessage(`Copied: ${text}`);
                setToastOpen(true);
              }}
              onCopyError={() => setError('Failed to copy to clipboard.')}
            />
          ))}
        </div>
      ) : (
        <div className={styles.tableCard}>
          <DataGrid
            rows={accounts}
            columns={columns}
            getRowId={(row) => row._id}
            autoHeight
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            disableRowSelectionOnClick
            className={styles.dataGrid}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <KhataBookModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveAccount}
        initialData={editingAccount}
        loading={actionLoading}
        defaultAccountType={activeTab}
      />

      {/* Delete / Archive Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmDialog}>
            <h3>Archive Khata Book Account</h3>
            <p>
              Are you sure you want to archive ledger account for{' '}
              <strong>{deletingAccount?.name}</strong>?
            </p>
            <p className={styles.subWarning}>
              Archiving hides this account from active lists. Historical transaction records will be preserved.
            </p>
            <div className={styles.dialogButtons}>
              <Button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingAccount(null);
                }}
                disabled={actionLoading}
                className={styles.cancelBtn}
              >
                Cancel
              </Button>
              <Button
                onClick={handleArchiveConfirm}
                disabled={actionLoading}
                variant="contained"
                className={styles.archiveConfirmBtn}
              >
                {actionLoading ? 'Archiving...' : 'Confirm Archive'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export default KhataBookPage;

