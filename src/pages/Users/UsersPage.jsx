import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  TextField,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import UserCard from '../../components/users/UserCard';
import ViewToggle from '../../components/common/ViewToggle';
import AdvancedFilterPanel from '../../components/common/AdvancedFilterPanel';
import ActiveFilterChips from '../../components/common/ActiveFilterChips';
import CommonEmptyState from '../../components/common/CommonEmptyState';
import { getUserColumns } from './TableColumns';
import { PAGE_SIZE_OPTIONS } from '../../constants';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import { useMobileHeader } from '../../context/MobileHeaderContext';
import styles from './UsersPage.module.scss';

const UsersPage = () => {
  const navigate = useNavigate();
  const { user: currentUser, hasPermission } = useAuth();

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View mode
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('khata_users_view_mode') || 'list';
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('khata_users_view_mode', mode);
  };

  useMobileHeader({
    title: 'User Management',
    action: currentUser?.role === 'admin'
      ? { label: '+ Add User', onClick: () => navigate('/register') }
      : null,
  });

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [filters, setFilters] = useState({
    role: '',
    status: '',
    permission: '',
    startDate: '',
    endDate: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    role: '',
    status: '',
    permission: '',
    startDate: '',
    endDate: '',
  });

  // Pagination and sorting state
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [sortModel, setSortModel] = useState([
    { field: 'createdAt', sort: 'desc' },
  ]);

  // Delete modal state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: null,
    loading: false,
  });

  const canDelete = hasPermission('delete_user');
  const canEdit = hasPermission('edit_user');

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

  // Fetch users from backend API
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sortField = sortModel[0]?.field || 'createdAt';
      const sortOrder = sortModel[0]?.sort || 'desc';

      const params = {
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        sortField,
        sortOrder,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.role) params.role = appliedFilters.role;
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.permission) params.permission = appliedFilters.permission;
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;

      const data = await userService.getUsers(params);

      if (data?.users) {
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch users from server'
      );
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch, sortModel, appliedFilters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      role: '',
      status: '',
      permission: '',
      startDate: '',
      endDate: '',
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

  // Build active chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (appliedFilters.role) {
      chips.push({
        id: 'role',
        key: 'role',
        label: 'Role',
        value: appliedFilters.role,
        displayValue: appliedFilters.role,
        onRemove: () => handleRemoveFilter('role'),
      });
    }
    if (appliedFilters.status) {
      chips.push({
        id: 'status',
        key: 'status',
        label: 'Status',
        value: appliedFilters.status,
        displayValue: appliedFilters.status,
        onRemove: () => handleRemoveFilter('status'),
      });
    }
    if (appliedFilters.permission) {
      chips.push({
        id: 'permission',
        key: 'permission',
        label: 'Permission',
        value: appliedFilters.permission,
        displayValue: appliedFilters.permission,
        onRemove: () => handleRemoveFilter('permission'),
      });
    }
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const displayVal = `${appliedFilters.startDate || 'Start'} to ${appliedFilters.endDate || 'End'}`;
      chips.push({
        id: 'dateRange',
        key: 'dateRange',
        label: 'Date',
        value: displayVal,
        displayValue: displayVal,
        onRemove: () => {
          handleRemoveFilter('startDate');
          handleRemoveFilter('endDate');
        },
      });
    }
    return chips;
  }, [appliedFilters]);

  // Delete modal handlers
  const handleOpenDelete = (user) => {
    setDeleteDialog({
      open: true,
      user,
      loading: false,
    });
  };

  const handleCloseDelete = () => {
    setDeleteDialog({
      open: false,
      user: null,
      loading: false,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.user) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    setError('');

    try {
      await userService.deleteUser(deleteDialog.user._id);
      setSuccessMsg(`User ${deleteDialog.user.name} was successfully removed.`);
      handleCloseDelete();
      fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      setError(
        err.response?.data?.message || 'Failed to delete user. Please try again.'
      );
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // DataGrid Columns extracted to TableColumns.jsx
  const columns = useMemo(
    () =>
      getUserColumns({
        currentUser,
        canEdit,
        canDelete,
        navigate,
        onDelete: handleOpenDelete,
      }),
    [currentUser, canEdit, canDelete, navigate]
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
            <h1 className={styles.pageTitle}>User Management</h1>
          </div>
        </div>

        <div className={styles.headerRight}>
          <ViewToggle
            viewMode={viewMode}
            onChange={handleToggleView}
            ariaLabel="Users view switcher"
          />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          className={styles.errorAlert}
        >
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg('')}
          className={styles.successAlert}
        >
          {successMsg}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <TextField
            placeholder="Search by name, email, or role..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className={styles.searchIcon} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <ClearIcon
                    className={styles.searchIcon}
                    onClick={() => setSearch('')}
                  />
                </InputAdornment>
              ) : null,
            }}
          />

          <AdvancedFilterPanel
            isOpen={filterPanelOpen}
            onToggle={() => setFilterPanelOpen((prev) => !prev)}
            filterCount={activeChips.length}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            title="User Filters"
          >
            <TextField
              select
              label="Role"
              size="small"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className={styles.filterField}
            >
              <MenuItem value="">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </TextField>

            <TextField
              select
              label="Status"
              size="small"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.filterField}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>

            <TextField
              label="Specific Permission"
              size="small"
              value={filters.permission}
              onChange={(e) => handleFilterChange('permission', e.target.value)}
              placeholder="e.g. view_orders, create_product"
              className={styles.filterField}
            />

            <TextField
              label="Joined After"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className={styles.filterField}
            />

            <TextField
              label="Joined Before"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className={styles.filterField}
            />
          </AdvancedFilterPanel>
        </div>

        <div className={styles.filterRight}>
          <div className={styles.mobileViewToggle}>
            <ViewToggle
              viewMode={viewMode}
              onChange={handleToggleView}
              ariaLabel="Users view switcher"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={activeChips}
        onClearAll={handleResetFilters}
      />

      {/* Main Content: List (DataGrid) vs Card View */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <CircularProgress className={styles.spinner} size={48} thickness={4} />
          <span className={styles.loadingText}>Loading users...</span>
        </div>
      ) : users.length > 0 ? (
        viewMode === 'card' ? (
          <div className={styles.usersCardGrid}>
            {users.map((u) => (
              <UserCard
                key={u._id}
                user={u}
                onEdit={() => navigate(`/users/${u._id}`)}
                onDelete={handleOpenDelete}
                canEdit={canEdit}
                canDelete={canDelete && currentUser?._id !== u._id}
              />
            ))}
          </div>
        ) : (
          <div className={styles.tableCard}>
            <DataGrid
              rows={users}
              columns={columns}
              getRowId={(row) => row._id}
              rowHeight={66}
              paginationMode="server"
              rowCount={total}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={setSortModel}
              disableRowSelectionOnClick
            />
          </div>
        )
      ) : (
        <CommonEmptyState
          title={
            search || activeChips.length > 0
              ? 'No users match your criteria'
              : 'No users found'
          }
          description={
            search || activeChips.length > 0
              ? 'Try adjusting your search terms or clearing active filters.'
              : 'Registered users will appear here once accounts are created.'
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDelete}
        classes={{ paper: styles.dialogPaper }}
      >
        <DialogTitle className={styles.dialogTitle}>
          <WarningAmberIcon className={styles.warningIcon} />
          Confirm User Deletion
        </DialogTitle>
        <DialogContent>
          <p className={styles.dialogPrompt}>
            Are you sure you want to permanently delete{' '}
            <strong className={styles.userHighlight}>
              {deleteDialog.user?.name}
            </strong>
            ?
          </p>
          <p className={styles.dialogWarning}>
            This action cannot be undone. All data and permissions linked to
            this account will be removed immediately.
          </p>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={handleCloseDelete}
            className={styles.cancelBtn}
            disabled={deleteDialog.loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            className={styles.deleteBtn}
            disabled={deleteDialog.loading}
            variant="contained"
          >
            {deleteDialog.loading ? (
              <CircularProgress size={20} className={styles.spinner} />
            ) : (
              'Delete User'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UsersPage;
