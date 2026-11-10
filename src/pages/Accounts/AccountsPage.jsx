import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import AccountCard from '../../components/accounts/AccountCard';
import AccountModal from '../../components/accounts/AccountModal';
import DeleteAccountDialog from '../../components/accounts/DeleteAccountDialog';
import ViewToggle from '../../components/common/ViewToggle';
import AdvancedFilterPanel, { FilterTriggerButton } from '../../components/common/AdvancedFilterPanel';
import ActiveFilterChips from '../../components/common/ActiveFilterChips';
import CommonEmptyState from '../../components/common/CommonEmptyState';
import { getAccountColumns } from './TableColumns';
import { ACCOUNT_TYPES, PAGE_SIZE_OPTIONS } from '../../constants';
import accountService from '../../services/accountService';
import { getAccountLogo } from '../../utils/accountLogos';
import useAuth from '../../hooks/useAuth';
import { useMobileHeader } from '../../context/MobileHeaderContext';
import styles from './AccountsPage.module.scss';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const AccountsPage = () => {
  const navigate = useNavigate();
  const { canCreateAccount, canEditAccount, canDeleteAccount } = useAuth();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View mode
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('khata_accounts_view_mode') || 'list';
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('khata_accounts_view_mode', mode);
  };

  useMobileHeader(
    canCreateAccount()
      ? {
          title: 'Accounts',
          action: {
            label: '+ Add Account',
            onClick: () => {
              setEditingAccount(null);
              setModalOpen(true);
            },
          },
        }
      : { title: 'Accounts', action: null }
  );

  // Summary
  const [summary, setSummary] = useState({ totalAccounts: 0, distinctAccountTypes: 0 });

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [filters, setFilters] = useState({
    accountType: '',
    mobileNumber: '',
    email: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    accountType: '',
    mobileNumber: '',
    email: '',
  });

  // Pagination & sort
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [sortModel, setSortModel] = useState([{ field: 'createdAt', sort: 'desc' }]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicatingAccount, setDuplicatingAccount] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(null);

  const debounceTimer = useRef(null);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await accountService.getAccountSummary();
      if (data?.summary) setSummary(data.summary);
    } catch (err) {
      console.error('Failed to load account summary:', err);
    }
  }, []);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sortField = sortModel[0]?.field || 'createdAt';
      const sortDir = sortModel[0]?.sort === 'asc' ? '' : '-';
      const params = {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        sort: `${sortDir}${sortField}`,
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.accountType) params.accountType = appliedFilters.accountType;
      if (appliedFilters.mobileNumber) params.mobileNumber = appliedFilters.mobileNumber;
      if (appliedFilters.email) params.email = appliedFilters.email;

      const data = await accountService.getAccounts(params);
      if (data?.accounts) {
        setRows(data.accounts);
        setTotal(data.total || data.accounts.length);
      }
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setError(err.response?.data?.message || 'Failed to retrieve accounts from server.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, appliedFilters, paginationModel, sortModel]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Filter actions
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setFilterPanelOpen(false);
  };

  const handleResetFilters = () => {
    const empty = {
      accountType: '',
      mobileNumber: '',
      email: '',
    };
    setFilters(empty);
    setAppliedFilters(empty);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleRemoveFilter = (key) => {
    const updated = { ...appliedFilters, [key]: '' };
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setAppliedFilters(updated);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  // Build active chips (Platform, Mobile, Email)
  const activeChips = useMemo(() => {
    const chips = [];
    if (appliedFilters.accountType) {
      chips.push({
        id: 'accountType',
        key: 'accountType',
        label: 'Platform',
        value: appliedFilters.accountType,
        displayValue: appliedFilters.accountType,
        onRemove: () => handleRemoveFilter('accountType'),
      });
    }
    if (appliedFilters.mobileNumber) {
      chips.push({
        id: 'mobileNumber',
        key: 'mobileNumber',
        label: 'Mobile',
        value: appliedFilters.mobileNumber,
        displayValue: appliedFilters.mobileNumber,
        onRemove: () => handleRemoveFilter('mobileNumber'),
      });
    }
    if (appliedFilters.email) {
      chips.push({
        id: 'email',
        key: 'email',
        label: 'Email',
        value: appliedFilters.email,
        displayValue: appliedFilters.email,
        onRemove: () => handleRemoveFilter('email'),
      });
    }
    return chips;
  }, [appliedFilters]);

  // Modal handlers
  const handleOpenAdd = () => {
    setEditingAccount(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (account) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const handleOpenDuplicate = (account) => {
    setDuplicatingAccount(account);
    setDuplicateModalOpen(true);
  };

  const handleOpenDelete = (account) => {
    setDeletingAccount(account);
    setDeleteDialogOpen(true);
  };

  const handleSaved = (msg) => {
    setSuccessMsg(msg || 'Account saved successfully.');
    fetchAccounts();
    fetchSummary();
  };

  const handleDeleted = (msg) => {
    setSuccessMsg(msg || 'Account deleted successfully.');
    fetchAccounts();
    fetchSummary();
  };

  const handleAccountSubmit = async (payload) => {
    try {
      setActionLoading(true);
      if (editingAccount) {
        await accountService.updateAccount(editingAccount._id, payload);
        handleSaved('Account updated successfully.');
      } else {
        await accountService.createAccount(payload);
        handleSaved('Account created successfully.');
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Save account error:', err);
      setError(err?.response?.data?.message || 'Failed to save account.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccount?._id) return;
    try {
      setActionLoading(true);
      await accountService.deleteAccount(deletingAccount._id);
      handleDeleted('Account deleted successfully.');
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Delete account error:', err);
      setError(err?.response?.data?.message || 'Failed to delete account.');
    } finally {
      setActionLoading(false);
    }
  };

  // DataGrid Columns:
  // DataGrid Columns extracted to TableColumns.jsx
  const columns = useMemo(
    () =>
      getAccountColumns({
        canEdit: canEditAccount(),
        canCreate: canCreateAccount(),
        canDelete: canDeleteAccount(),
        onEdit: handleOpenEdit,
        onDuplicate: handleOpenDuplicate,
        onDelete: handleOpenDelete,
      }),
    [canEditAccount, canDeleteAccount, canCreateAccount]
  );

  return (
    <div className={styles.container}>
      {/* Header */}
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
            <h1 className={styles.pageTitle}>My Accounts</h1>
          </div>
        </div>

        <div className={styles.headerActions}>
          <ViewToggle
            viewMode={viewMode}
            onChange={handleToggleView}
            ariaLabel="Accounts view switcher"
          />

          {canCreateAccount() && (
            <Button
              variant="contained"
              startIcon={<AddIcon className={styles.btnIcon} />}
              onClick={handleOpenAdd}
              className={styles.addBtn}
            >
              Add Account
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <ManageAccountsIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Total Accounts</span>
            <span className={styles.statValue}>{summary.totalAccounts}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <AccountTreeOutlinedIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Distinct Types</span>
            <span className={styles.statValue}>{summary.distinctAccountTypes}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          className={`${styles.alertBox} ${styles.errorAlert}`}
        >
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg('')}
          className={`${styles.alertBox} ${styles.successAlert}`}
        >
          {successMsg}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <TextField
            placeholder="Search by name, mobile, email, or platform..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className={styles.inputIcon} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <ClearIcon
                    className={styles.inputIcon}
                    onClick={() => setSearch('')}
                  />
                </InputAdornment>
              ) : null,
            }}
          />

          <FilterTriggerButton
            isOpen={filterPanelOpen}
            onToggle={() => setFilterPanelOpen((prev) => !prev)}
            filterCount={activeChips.length}
            label="Filters"
          />
        </div>

        <div className={styles.filterRight}>
          <div className={styles.mobileViewToggle}>
            <ViewToggle
              viewMode={viewMode}
              onChange={handleToggleView}
              ariaLabel="Accounts view switcher"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filter Panel Drawer */}
      <AdvancedFilterPanel
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen((prev) => !prev)}
        filterCount={activeChips.length}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        title="Account Filters"
        hideTrigger={true}
      >
        <TextField
          select
          label="Account Platform"
          size="small"
          value={filters.accountType}
          onChange={(e) => handleFilterChange('accountType', e.target.value)}
          className={styles.filterField}
        >
          <MenuItem value="">All Platforms</MenuItem>
          {ACCOUNT_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Mobile Number"
          size="small"
          value={filters.mobileNumber}
          onChange={(e) => handleFilterChange('mobileNumber', e.target.value)}
          placeholder="e.g. 9876543210"
          className={styles.filterField}
        />

        <TextField
          label="Email Address"
          size="small"
          value={filters.email}
          onChange={(e) => handleFilterChange('email', e.target.value)}
          placeholder="e.g. user@gmail.com"
          className={styles.filterField}
        />
      </AdvancedFilterPanel>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={activeChips}
        onClearAll={handleResetFilters}
      />

      {/* Main Content: List (DataGrid) vs Card View */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <CircularProgress className={styles.spinner} size={48} thickness={4} />
          <span className={styles.loadingText}>Loading accounts...</span>
        </div>
      ) : rows.length > 0 ? (
        viewMode === 'card' ? (
          <div className={styles.accountsCardGrid}>
            {rows.map((acc) => (
              <AccountCard
                key={acc._id}
                account={acc}
                onEdit={handleOpenEdit}
                onDuplicate={handleOpenDuplicate}
                onDelete={handleOpenDelete}
                canEdit={canEditAccount()}
                canDelete={canDeleteAccount()}
                canCreate={canCreateAccount()}
              />
            ))}
          </div>
        ) : (
          <div className={styles.dataGridWrapper}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row._id}
              paginationMode="server"
              rowCount={total}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              autoHeight
              rowHeight={66}
              disableRowSelectionOnClick
            />
          </div>
        )
      ) : (
        <CommonEmptyState
          icon={ManageAccountsIcon}
          title={
            search || activeChips.length > 0
              ? 'No matching accounts found'
              : 'No accounts registered yet'
          }
          description={
            search || activeChips.length > 0
              ? 'Try modifying your search or clearing active filters.'
              : 'Save your shopping and platform accounts here for quick access across your workflows.'
          }
          actionLabel={!search && activeChips.length === 0 && canCreateAccount() ? 'Add First Account' : undefined}
          onAction={handleOpenAdd}
          actionIcon={<AddIcon className={styles.btnIcon} />}
        />
      )}

      {/* Modals */}
      <AccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAccountSubmit}
        onSaved={handleSaved}
        account={editingAccount}
        initialData={editingAccount}
        loading={actionLoading}
      />

      {/* Duplicate Account Modal */}
      <AccountModal
        open={duplicateModalOpen}
        onClose={() => {
          setDuplicateModalOpen(false);
          setDuplicatingAccount(null);
        }}
        onSubmit={async (payload) => {
          try {
            setActionLoading(true);
            await accountService.createAccount(payload);
            handleSaved('Account duplicated successfully.');
            setDuplicateModalOpen(false);
            setDuplicatingAccount(null);
          } catch (err) {
            console.error('Duplicate account error:', err);
            setError(err?.response?.data?.message || 'Failed to duplicate account.');
          } finally {
            setActionLoading(false);
          }
        }}
        onSaved={handleSaved}
        account={duplicatingAccount}
        initialData={duplicatingAccount}
        isDuplicate={true}
        loading={actionLoading}
      />

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        onDeleted={handleDeleted}
        account={deletingAccount}
        loading={actionLoading}
      />
    </div>
  );
};

export default AccountsPage;
