import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import StorefrontIcon from '@mui/icons-material/Storefront';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import DealerCard from '../../components/dealers/DealerCard';
import DealerModal from '../../components/dealers/DealerModal';
import DeleteDealerDialog from '../../components/dealers/DeleteDealerDialog';
import AddressDetailsModal from '../../components/dealers/AddressDetailsModal';
import AddressOverflowModal from '../../components/dealers/AddressOverflowModal';
import ViewToggle from '../../components/common/ViewToggle';
import AdvancedFilterPanel, { FilterTriggerButton } from '../../components/common/AdvancedFilterPanel';
import ActiveFilterChips from '../../components/common/ActiveFilterChips';
import CommonEmptyState from '../../components/common/CommonEmptyState';
import { getDealerColumns } from './TableColumns';
import { PROFIT_PERIOD_OPTIONS, PAGE_SIZE_OPTIONS } from '../../constants';
import dealerService from '../../services/dealerService';
import useAuth from '../../hooks/useAuth';
import styles from './DealersPage.module.scss';

const DealersPage = () => {
  const navigate = useNavigate();
  const { canCreateDealer, canEditDealer, canDeleteDealer } = useAuth();

  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Summary counts
  const [summary, setSummary] = useState({ totalDealers: 0, totalAddresses: 0 });

  // View mode
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('khata_dealers_view_mode') || 'list';
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('khata_dealers_view_mode', mode);
  };

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Profit Date Range filter (Default: currentMonth)
  const [profitPeriod, setProfitPeriod] = useState('currentMonth');

  const [filters, setFilters] = useState({
    city: '',
    state: '',
    minAddresses: '',
    profitPeriod: 'currentMonth',
    profitStartDate: '',
    profitEndDate: '',
    profitMin: '',
    profitMax: '',
    profitPercentageMin: '',
    profitPercentageMax: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    city: '',
    state: '',
    minAddresses: '',
    profitPeriod: 'currentMonth',
    profitStartDate: '',
    profitEndDate: '',
    profitMin: '',
    profitMax: '',
    profitPercentageMin: '',
    profitPercentageMax: '',
  });

  const debounceTimer = useRef(null);
  const touchTimerRef = useRef(null);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicatingDealer, setDuplicatingDealer] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDealer, setDeletingDealer] = useState(null);

  // Address Modals
  const [addressDetailsOpen, setAddressDetailsOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedDealerName, setSelectedDealerName] = useState('');

  const [addressOverflowOpen, setAddressOverflowOpen] = useState(false);
  const [overflowAddresses, setOverflowAddresses] = useState([]);
  const [overflowDealerName, setOverflowDealerName] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Fetch summary counts
  const fetchSummary = useCallback(async () => {
    try {
      const data = await dealerService.getDealerSummary();
      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load dealer summary:', err);
    }
  }, []);

  // Fetch dealers list with dynamic profit calculation
  const fetchDealers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        profitPeriod: appliedFilters.profitPeriod || 'currentMonth',
      };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.city) params.city = appliedFilters.city;
      if (appliedFilters.state) params.state = appliedFilters.state;
      if (appliedFilters.minAddresses) params.minAddresses = appliedFilters.minAddresses;
      if (appliedFilters.profitPeriod === 'custom') {
        if (appliedFilters.profitStartDate) params.profitStartDate = appliedFilters.profitStartDate;
        if (appliedFilters.profitEndDate) params.profitEndDate = appliedFilters.profitEndDate;
      }
      if (appliedFilters.profitMin) params.profitMin = appliedFilters.profitMin;
      if (appliedFilters.profitMax) params.profitMax = appliedFilters.profitMax;
      if (appliedFilters.profitPercentageMin) params.profitPercentageMin = appliedFilters.profitPercentageMin;
      if (appliedFilters.profitPercentageMax) params.profitPercentageMax = appliedFilters.profitPercentageMax;

      const data = await dealerService.getDealers(params);
      if (data?.dealers) {
        setDealers(data.dealers);
      }
    } catch (err) {
      console.error('Fetch dealers error:', err);
      setError(err.response?.data?.message || 'Failed to load dealers from server.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, appliedFilters]);

  useEffect(() => {
    fetchDealers();
  }, [fetchDealers]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Quick Profit Period change from toolbar
  const handleQuickPeriodChange = (newPeriod) => {
    setProfitPeriod(newPeriod);
    setFilters((prev) => ({ ...prev, profitPeriod: newPeriod }));
    setAppliedFilters((prev) => ({ ...prev, profitPeriod: newPeriod }));
  };

  // Filter actions
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setProfitPeriod(filters.profitPeriod || 'currentMonth');
    setFilterPanelOpen(false);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      city: '',
      state: '',
      minAddresses: '',
      profitPeriod: 'currentMonth',
      profitStartDate: '',
      profitEndDate: '',
      profitMin: '',
      profitMax: '',
      profitPercentageMin: '',
      profitPercentageMax: '',
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setProfitPeriod('currentMonth');
  };

  const handleRemoveFilter = (key) => {
    const updated = { ...appliedFilters, [key]: key === 'profitPeriod' ? 'currentMonth' : '' };
    setFilters((prev) => ({ ...prev, [key]: key === 'profitPeriod' ? 'currentMonth' : '' }));
    setAppliedFilters(updated);
    if (key === 'profitPeriod') setProfitPeriod('currentMonth');
  };

  // Build active chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (appliedFilters.profitPeriod && appliedFilters.profitPeriod !== 'currentMonth') {
      const opt = PROFIT_PERIOD_OPTIONS.find((o) => o.value === appliedFilters.profitPeriod);
      const label = opt ? opt.label : appliedFilters.profitPeriod;
      chips.push({
        id: 'profitPeriod',
        key: 'profitPeriod',
        label: 'Profit Period',
        value: appliedFilters.profitPeriod,
        displayValue: label,
        onRemove: () => handleRemoveFilter('profitPeriod'),
      });
    }
    if (appliedFilters.city) {
      chips.push({
        id: 'city',
        key: 'city',
        label: 'City',
        value: appliedFilters.city,
        displayValue: appliedFilters.city,
        onRemove: () => handleRemoveFilter('city'),
      });
    }
    if (appliedFilters.state) {
      chips.push({
        id: 'state',
        key: 'state',
        label: 'State',
        value: appliedFilters.state,
        displayValue: appliedFilters.state,
        onRemove: () => handleRemoveFilter('state'),
      });
    }
    if (appliedFilters.minAddresses) {
      chips.push({
        id: 'minAddresses',
        key: 'minAddresses',
        label: 'Min Addresses',
        value: appliedFilters.minAddresses,
        displayValue: `≥ ${appliedFilters.minAddresses}`,
        onRemove: () => handleRemoveFilter('minAddresses'),
      });
    }
    if (appliedFilters.profitMin || appliedFilters.profitMax) {
      const displayVal = `₹${appliedFilters.profitMin || '0'} - ₹${appliedFilters.profitMax || '∞'}`;
      chips.push({
        id: 'profitRange',
        key: 'profitRange',
        label: 'Profit',
        value: displayVal,
        displayValue: displayVal,
        onRemove: () => {
          handleRemoveFilter('profitMin');
          handleRemoveFilter('profitMax');
        },
      });
    }
    if (appliedFilters.profitPercentageMin || appliedFilters.profitPercentageMax) {
      const displayVal = `${appliedFilters.profitPercentageMin || '0'}% - ${appliedFilters.profitPercentageMax || '∞'}%`;
      chips.push({
        id: 'profitPercentRange',
        key: 'profitPercentRange',
        label: 'Profit %',
        value: displayVal,
        displayValue: displayVal,
        onRemove: () => {
          handleRemoveFilter('profitPercentageMin');
          handleRemoveFilter('profitPercentageMax');
        },
      });
    }
    return chips;
  }, [appliedFilters]);

  // Handlers for Add, Edit, Delete
  const handleOpenAdd = () => {
    setEditingDealer(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dealer) => {
    setEditingDealer(dealer);
    setModalOpen(true);
  };

  const handleOpenDuplicate = (dealer) => {
    setDuplicatingDealer(dealer);
    setDuplicateModalOpen(true);
  };

  const handleOpenDelete = (dealer) => {
    setDeletingDealer(dealer);
    setDeleteDialogOpen(true);
  };

  const handleSaveDealer = async (dealerData) => {
    setActionLoading(true);
    try {
      if (editingDealer) {
        await dealerService.updateDealer(editingDealer._id, dealerData);
        setSuccessMsg('Dealer updated successfully.');
      } else {
        await dealerService.createDealer(dealerData);
        setSuccessMsg('Dealer added successfully.');
      }
      setModalOpen(false);
      fetchDealers();
      fetchSummary();
    } catch (err) {
      console.error('Save dealer error:', err);
      setError(err.response?.data?.message || 'Failed to save dealer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDealer = async () => {
    if (!deletingDealer) return;
    setActionLoading(true);
    try {
      await dealerService.deleteDealer(deletingDealer._id);
      setSuccessMsg('Dealer deleted successfully.');
      setDeleteDialogOpen(false);
      setDeletingDealer(null);
      fetchDealers();
      fetchSummary();
    } catch (err) {
      console.error('Delete dealer error:', err);
      setError(err.response?.data?.message || 'Failed to delete dealer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Copy individual mobile number
  const handleCopyMobile = async (num, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(num);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = num;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setToastMessage(`Mobile number copied: ${num}`);
      setToastOpen(true);
    } catch (err) {
      console.error('Failed to copy mobile:', err);
      setError('Failed to copy mobile number.');
    }
  };

  const handleMobileTouchStart = (num) => {
    touchTimerRef.current = setTimeout(() => {
      handleCopyMobile(num);
    }, 500);
  };

  const handleMobileTouchEnd = () => {
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  };

  // Open Address Modals
  const handleOpenAddressDetails = (address, dealerName) => {
    setSelectedAddress(address);
    setSelectedDealerName(dealerName);
    setAddressDetailsOpen(true);
  };

  const handleOpenAddressOverflow = (remainingAddresses, dealerName) => {
    setOverflowAddresses(remainingAddresses);
    setOverflowDealerName(dealerName);
    setAddressOverflowOpen(true);
  };

  // DataGrid Columns extracted to TableColumns.jsx
  const columns = useMemo(
    () =>
      getDealerColumns({
        canEdit: canEditDealer(),
        canCreate: canCreateDealer(),
        canDelete: canDeleteDealer(),
        handleCopyMobile,
        handleMobileTouchStart,
        handleMobileTouchEnd,
        handleOpenAddressDetails,
        handleOpenAddressOverflow,
        onEdit: handleOpenEdit,
        onDuplicate: handleOpenDuplicate,
        onDelete: handleOpenDelete,
      }),
    [canEditDealer, canDeleteDealer, canCreateDealer]
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
            <h1 className={styles.pageTitle}>My Dealers</h1>
            <p className={styles.pageSubtitle}>
              Manage dealer contact records, multi-location delivery addresses, and realized profit.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <ViewToggle
            viewMode={viewMode}
            onChange={handleToggleView}
            ariaLabel="Dealers view switcher"
          />

          {canCreateDealer() && (
            <Button
              variant="contained"
              startIcon={<AddIcon className={styles.btnIcon} />}
              onClick={handleOpenAdd}
              className={styles.addBtn}
            >
              Add Dealer
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <StorefrontIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Total Dealers</span>
            <span className={styles.statValue}>{summary.totalDealers}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <LocationOnIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Total Addresses</span>
            <span className={styles.statValue}>{summary.totalAddresses}</span>
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
            placeholder="Search by dealer name, mobile, address, city, or PIN..."
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

          {/* Quick Profit Date Range Dropdown */}
          <div className={styles.quickPeriodContainer}>
            <CalendarMonthIcon className={styles.periodIcon} />
            <select
              value={profitPeriod}
              onChange={(e) => handleQuickPeriodChange(e.target.value)}
              className={styles.quickPeriodSelect}
              title="Profit Calculation Date Range"
            >
              {PROFIT_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.filterRight}>
          <Tooltip title="Refresh dealers list">
            <Button
              variant="outlined"
              onClick={() => {
                fetchDealers();
                fetchSummary();
              }}
              className={styles.refreshBtn}
            >
              <RefreshIcon fontSize="inherit" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Advanced Filter Drawer / Panel */}
      <AdvancedFilterPanel
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen((prev) => !prev)}
        filterCount={activeChips.length}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        title="Dealer & Profit Filters"
      >
        <div className={styles.filterGroup}>
          <TextField
            select
            fullWidth
            label="Profit Date Range"
            size="small"
            value={filters.profitPeriod}
            onChange={(e) => handleFilterChange('profitPeriod', e.target.value)}
            className={styles.filterField}
          >
            {PROFIT_PERIOD_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          {filters.profitPeriod === 'custom' && (
            <div className={styles.customDateRow}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.profitStartDate}
                onChange={(e) => handleFilterChange('profitStartDate', e.target.value)}
                className={styles.filterField}
              />
              <TextField
                label="End Date"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={filters.profitEndDate}
                onChange={(e) => handleFilterChange('profitEndDate', e.target.value)}
                className={styles.filterField}
              />
            </div>
          )}
        </div>

        <div className={styles.filterGroup}>
          <TextField
            label="City"
            size="small"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="e.g. Mumbai"
            className={styles.filterField}
          />

          <TextField
            label="State"
            size="small"
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            placeholder="e.g. Maharashtra"
            className={styles.filterField}
          />

          <TextField
            label="Minimum Addresses"
            type="number"
            size="small"
            value={filters.minAddresses}
            onChange={(e) => handleFilterChange('minAddresses', e.target.value)}
            placeholder="e.g. 2"
            className={styles.filterField}
          />
        </div>

        <div className={styles.filterGroup}>
          <TextField
            label="Min Profit (₹)"
            type="number"
            size="small"
            value={filters.profitMin}
            onChange={(e) => handleFilterChange('profitMin', e.target.value)}
            placeholder="e.g. 1000"
            className={styles.filterField}
          />

          <TextField
            label="Max Profit (₹)"
            type="number"
            size="small"
            value={filters.profitMax}
            onChange={(e) => handleFilterChange('profitMax', e.target.value)}
            placeholder="e.g. 50000"
            className={styles.filterField}
          />
        </div>
      </AdvancedFilterPanel>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        chips={activeChips}
        onClearAll={handleResetFilters}
        className={styles.chipsContainer}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <CircularProgress className={styles.spinner} />
          <p className={styles.loadingText}>Loading dealers...</p>
        </div>
      ) : dealers.length === 0 ? (
        <CommonEmptyState
          icon={StorefrontIcon}
          title="No Dealers Found"
          description={
            debouncedSearch || activeChips.length > 0
              ? 'No dealer records matched your search query or filters.'
              : 'You have not added any dealers yet. Add your first dealer to track orders and deliveries.'
          }
          actionLabel={canCreateDealer() ? 'Add Dealer' : undefined}
          onAction={handleOpenAdd}
          actionIcon={<AddIcon />}
        />
      ) : viewMode === 'card' ? (
        <div className={styles.cardGrid}>
          {dealers.map((dealer) => (
            <DealerCard
              key={dealer._id}
              dealer={dealer}
              onEdit={handleOpenEdit}
              onDuplicate={handleOpenDuplicate}
              onDelete={handleOpenDelete}
              canEdit={canEditDealer()}
              canDelete={canDeleteDealer()}
              canCreate={canCreateDealer()}
              onCopySuccess={(text) => {
                setToastMessage(`Copied: ${text}`);
                setToastOpen(true);
              }}
              onCopyError={() => setError('Failed to copy to clipboard.')}
            />
          ))}
        </div>
      ) : (
        <div className={styles.dataGridContainer}>
          <DataGrid
            rows={dealers}
            columns={columns}
            getRowId={(row) => row._id}
            autoHeight
            rowHeight={66}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            disableRowSelectionOnClick
          />
        </div>
      )}

      {/* Add / Edit Dealer Modal */}
      <DealerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveDealer}
        initialData={editingDealer}
        loading={actionLoading}
        onCopySuccess={(text) => {
          setToastMessage(`Copied: ${text}`);
          setToastOpen(true);
        }}
        onCopyError={() => setError('Failed to copy to clipboard.')}
      />

      {/* Duplicate Dealer Modal */}
      <DealerModal
        open={duplicateModalOpen}
        onClose={() => {
          setDuplicateModalOpen(false);
          setDuplicatingDealer(null);
        }}
        onSubmit={async (data) => {
          setActionLoading(true);
          try {
            await dealerService.createDealer(data);
            setSuccessMsg('Dealer duplicated successfully!');
            setDuplicateModalOpen(false);
            setDuplicatingDealer(null);
            fetchDealers();
            fetchSummary();
          } catch (err) {
            console.error('Duplicate dealer error:', err);
            setError(err.response?.data?.message || 'Failed to duplicate dealer.');
          } finally {
            setActionLoading(false);
          }
        }}
        initialData={duplicatingDealer}
        isDuplicate={true}
        loading={actionLoading}
        onCopySuccess={(text) => {
          setToastMessage(`Copied: ${text}`);
          setToastOpen(true);
        }}
        onCopyError={() => setError('Failed to copy to clipboard.')}
      />

      {/* Delete Dealer Dialog */}
      <DeleteDealerDialog
        open={deleteDialogOpen}
        dealer={deletingDealer}
        dealerName={deletingDealer?.dealerName || ''}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingDealer(null);
        }}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingDealer(null);
        }}
        onConfirm={handleDeleteDealer}
        loading={actionLoading}
      />

      {/* Address Details Modal */}
      <AddressDetailsModal
        open={addressDetailsOpen}
        onClose={() => setAddressDetailsOpen(false)}
        address={selectedAddress}
        dealerName={selectedDealerName}
        onCopySuccess={(title) => {
          setToastMessage(`Address "${title}" copied to clipboard!`);
          setToastOpen(true);
        }}
        onCopyError={() => setError('Failed to copy address.')}
      />

      {/* Address Overflow Modal */}
      <AddressOverflowModal
        open={addressOverflowOpen}
        onClose={() => setAddressOverflowOpen(false)}
        addresses={overflowAddresses}
        dealerName={overflowDealerName}
        onCopySuccess={(title) => {
          setToastMessage(`Address "${title}" copied to clipboard!`);
          setToastOpen(true);
        }}
        onCopyError={() => setError('Failed to copy address.')}
      />

      {/* Copy Toast Feedback */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={3000}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export default DealersPage;
