import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import OrderCard from '../../components/orders/OrderCard';
import OrderModal from '../../components/orders/OrderModal';
import DeliverOrderModal from '../../components/orders/DeliverOrderModal';
import DeliveryPriceCorrectionModal from '../../components/orders/DeliveryPriceCorrectionModal';
import DeleteOrderDialog from '../../components/orders/DeleteOrderDialog';
import AddressDetailsModal from '../../components/dealers/AddressDetailsModal';
import AccountInfoDisplay from '../../components/orders/AccountInfoDisplay';
import PaymentInfoDisplay from '../../components/orders/PaymentInfoDisplay';
import ViewToggle from '../../components/common/ViewToggle';
import AdvancedFilterPanel from '../../components/common/AdvancedFilterPanel';
import ActiveFilterChips from '../../components/common/ActiveFilterChips';
import CommonEmptyState from '../../components/common/CommonEmptyState';
import { getOrderColumns } from './TableColumns';
import { PAGE_SIZE_OPTIONS } from '../../constants';

import orderService from '../../services/orderService';
import dealerService from '../../services/dealerService';
import productService from '../../services/productService';
import accountService from '../../services/accountService';
import { getAccountLogo } from '../../utils/accountLogos';
import useAuth from '../../hooks/useAuth';
import styles from './OrdersPage.module.scss';

const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
};

const formatDate = (dateVal) => {
  if (!dateVal) return '—';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatPayment = (item) => {
  if (!item) return '—';
  const method = item.paymentMethod || 'Credit Card';
  const details = item.paymentDetails || {};
  const ccSnapshot = item.creditCardSnapshot || {};

  if (method === 'Credit Card') {
    const last4 = ccSnapshot.lastFourDigits || details.lastFourDigits || '••••';
    const bank = ccSnapshot.bankName || details.bankName || 'Credit Card';
    const owner = ccSnapshot.cardOwner || ccSnapshot.cardName || details.cardHolderName || '';
    return [last4, bank, owner].filter(Boolean).join(' | ');
  }

  if (method === 'Debit Card') {
    const last4 = details.lastFourDigits || '••••';
    const holder = details.cardHolderName || '';
    return [last4, 'Debit Card', holder].filter(Boolean).join(' | ');
  }

  if (method === 'UPI') {
    const upi = details.upiId || '';
    const owner = details.upiOwnerName || '';
    return [upi, 'UPI', owner].filter(Boolean).join(' | ');
  }

  const name = details.otherMethodName || method || 'Other';
  const ref = details.referenceNote || '';
  return [name, ref].filter(Boolean).join(' | ');
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { canCreateOrder, canEditOrder, canDeleteOrder } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown reference data
  const [dealersList, setDealersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [accountsList, setAccountsList] = useState([]);

  // View mode toggle (list vs card), stored in localStorage
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('khata_orders_view_mode') || 'card';
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('khata_orders_view_mode', mode);
  };

  // Summary counts
  const [summary, setSummary] = useState({
    totalOrders: 0,
    inProcessOrders: 0,
    deliveredOrders: 0,
    totalProfit: 0,
    netProfit: 0,
    totalCashbackAmount: 0,
    netProfitAfterCashback: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: 'ALL',
    paymentMethod: 'ALL',
    dealerId: '',
    productId: '',
    accountId: '',
    profitType: 'ALL',
    minPurchasePrice: '',
    maxPurchasePrice: '',
    minDeliveryPrice: '',
    maxDeliveryPrice: '',
    startDate: '',
    endDate: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    status: 'ALL',
    paymentMethod: 'ALL',
    dealerId: '',
    productId: '',
    accountId: '',
    profitType: 'ALL',
    minPurchasePrice: '',
    maxPurchasePrice: '',
    minDeliveryPrice: '',
    maxDeliveryPrice: '',
    startDate: '',
    endDate: '',
  });

  const debounceTimer = useRef(null);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicatingOrder, setDuplicatingOrder] = useState(null);
  const [deliverModalOpen, setDeliverModalOpen] = useState(false);
  const [deliveringOrder, setDeliveringOrder] = useState(null);
  const [correctPriceModalOpen, setCorrectPriceModalOpen] = useState(false);
  const [correctingOrder, setCorrectingOrder] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [addressModalOrder, setAddressModalOrder] = useState(null);

  // Debounce search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Load reference options (dealers, products, accounts)
  useEffect(() => {
    const loadRefData = async () => {
      try {
        const [dealersRes, productsRes, accountsRes] = await Promise.all([
          dealerService.getDealers({ limit: 100 }),
          productService.getProducts({ limit: 100 }),
          accountService.getAccounts({ limit: 100 }),
        ]);
        if (dealersRes?.dealers) setDealersList(dealersRes.dealers);
        if (productsRes?.products) setProductsList(productsRes.products);
        if (accountsRes?.accounts) setAccountsList(accountsRes.accounts);
      } catch (err) {
        console.error('Failed to load filter dropdown reference data:', err);
      }
    };
    loadRefData();
  }, []);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const data = await orderService.getOrderSummary();
      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load order summary:', err);
    }
  }, []);

  // Fetch orders list
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.status && appliedFilters.status !== 'ALL') params.status = appliedFilters.status;
      if (appliedFilters.paymentMethod && appliedFilters.paymentMethod !== 'ALL') params.paymentMethod = appliedFilters.paymentMethod;
      if (appliedFilters.dealerId) params.dealerId = appliedFilters.dealerId;
      if (appliedFilters.productId) params.productId = appliedFilters.productId;
      if (appliedFilters.accountId) params.accountId = appliedFilters.accountId;
      if (appliedFilters.profitType && appliedFilters.profitType !== 'ALL') params.profitType = appliedFilters.profitType;
      if (appliedFilters.minPurchasePrice) params.minPurchasePrice = appliedFilters.minPurchasePrice;
      if (appliedFilters.maxPurchasePrice) params.maxPurchasePrice = appliedFilters.maxPurchasePrice;
      if (appliedFilters.minDeliveryPrice) params.minDeliveryPrice = appliedFilters.minDeliveryPrice;
      if (appliedFilters.maxDeliveryPrice) params.maxDeliveryPrice = appliedFilters.maxDeliveryPrice;
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;

      const data = await orderService.getOrders(params);
      if (data?.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, appliedFilters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Filter actions
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setFilterPanelOpen(false);
  };

  const handleResetFilters = () => {
    const empty = {
      status: 'ALL',
      paymentMethod: 'ALL',
      dealerId: '',
      productId: '',
      accountId: '',
      profitType: 'ALL',
      minPurchasePrice: '',
      maxPurchasePrice: '',
      minDeliveryPrice: '',
      maxDeliveryPrice: '',
      startDate: '',
      endDate: '',
    };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const handleRemoveFilter = (key) => {
    const defaultValue = ['status', 'paymentMethod', 'profitType'].includes(key) ? 'ALL' : '';
    const updated = { ...appliedFilters, [key]: defaultValue };
    setFilters((prev) => ({ ...prev, [key]: defaultValue }));
    setAppliedFilters(updated);
  };

  // Build active chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (appliedFilters.status && appliedFilters.status !== 'ALL') {
      chips.push({
        id: 'status',
        key: 'status',
        label: 'Status',
        value: appliedFilters.status,
        displayValue: appliedFilters.status,
        onRemove: () => handleRemoveFilter('status'),
      });
    }
    if (appliedFilters.paymentMethod && appliedFilters.paymentMethod !== 'ALL') {
      chips.push({
        id: 'paymentMethod',
        key: 'paymentMethod',
        label: 'Payment',
        value: appliedFilters.paymentMethod,
        displayValue: appliedFilters.paymentMethod,
        onRemove: () => handleRemoveFilter('paymentMethod'),
      });
    }
    if (appliedFilters.dealerId) {
      const match = dealersList.find((d) => d._id === appliedFilters.dealerId);
      chips.push({
        id: 'dealerId',
        key: 'dealerId',
        label: 'Dealer',
        value: appliedFilters.dealerId,
        displayValue: match?.dealerName || 'Selected Dealer',
        onRemove: () => handleRemoveFilter('dealerId'),
      });
    }
    if (appliedFilters.productId) {
      const match = productsList.find((p) => p._id === appliedFilters.productId);
      chips.push({
        id: 'productId',
        key: 'productId',
        label: 'Product',
        value: appliedFilters.productId,
        displayValue: match?.productName || 'Selected Product',
        onRemove: () => handleRemoveFilter('productId'),
      });
    }
    if (appliedFilters.accountId) {
      const match = accountsList.find((a) => a._id === appliedFilters.accountId);
      chips.push({
        id: 'accountId',
        key: 'accountId',
        label: 'Account',
        value: appliedFilters.accountId,
        displayValue: match?.fullName || 'Selected Account',
        onRemove: () => handleRemoveFilter('accountId'),
      });
    }
    if (appliedFilters.profitType && appliedFilters.profitType !== 'ALL') {
      chips.push({
        id: 'profitType',
        key: 'profitType',
        label: 'Margin',
        value: appliedFilters.profitType,
        displayValue:
          appliedFilters.profitType === 'profit'
            ? 'Profitable (+)'
            : appliedFilters.profitType === 'loss'
              ? 'Loss (-)'
              : 'Break Even (0)',
        onRemove: () => handleRemoveFilter('profitType'),
      });
    }
    if (appliedFilters.minPurchasePrice || appliedFilters.maxPurchasePrice) {
      const displayVal = `${appliedFilters.minPurchasePrice ? '₹' + appliedFilters.minPurchasePrice : '₹0'} - ${appliedFilters.maxPurchasePrice ? '₹' + appliedFilters.maxPurchasePrice : 'Any'}`;
      chips.push({
        id: 'purchasePriceRange',
        key: 'purchasePriceRange',
        label: 'Purchase Price',
        value: displayVal,
        displayValue: displayVal,
        onRemove: () => {
          handleRemoveFilter('minPurchasePrice');
          handleRemoveFilter('maxPurchasePrice');
        },
      });
    }
    if (appliedFilters.minDeliveryPrice || appliedFilters.maxDeliveryPrice) {
      const displayVal = `${appliedFilters.minDeliveryPrice ? '₹' + appliedFilters.minDeliveryPrice : '₹0'} - ${appliedFilters.maxDeliveryPrice ? '₹' + appliedFilters.maxDeliveryPrice : 'Any'}`;
      chips.push({
        id: 'deliveryPriceRange',
        key: 'deliveryPriceRange',
        label: 'Delivery Price',
        value: displayVal,
        displayValue: displayVal,
        onRemove: () => {
          handleRemoveFilter('minDeliveryPrice');
          handleRemoveFilter('maxDeliveryPrice');
        },
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
  }, [appliedFilters, dealersList, productsList, accountsList]);

  // Refresh
  const handleRefresh = () => {
    fetchOrders();
    fetchSummary();
  };

  // Deliver order handler
  const handleOpenDeliver = (order) => {
    setDeliveringOrder(order);
    setDeliverModalOpen(true);
  };

  // Correct price handler
  const handleOpenCorrectPrice = (order) => {
    setCorrectingOrder(order);
    setCorrectPriceModalOpen(true);
  };

  // Duplicate order handler
  const handleOpenDuplicate = (order) => {
    setDuplicatingOrder(order);
    setDuplicateModalOpen(true);
  };

  // Delete order handler
  const handleOpenDelete = (order) => {
    setDeletingOrder(order);
    setDeleteDialogOpen(true);
  };

  // Callback when order created or updated
  const handleOrderSaved = () => {
    setModalOpen(false);
    setEditingOrder(null);
    setDuplicateModalOpen(false);
    setDuplicatingOrder(null);
    fetchOrders();
    fetchSummary();
    setSuccessMsg('Order saved successfully.');
  };

  // Callback after delivery
  const handleOrderDelivered = () => {
    fetchOrders();
    fetchSummary();
    setSuccessMsg('Order marked as delivered successfully.');
  };

  // Callback after price correction
  const handlePriceCorrected = () => {
    fetchOrders();
    fetchSummary();
    setSuccessMsg('Delivery price corrected successfully.');
  };

  // Callback after delete
  const handleOrderDeleted = () => {
    fetchOrders();
    fetchSummary();
    setSuccessMsg('Order deleted successfully.');
  };

  // DataGrid Columns definition
  const columns = useMemo(
    () =>
      getOrderColumns({
        navigate,
        setAddressModalOrder,
        canEdit: canEditOrder(),
        canCreate: canCreateOrder(),
        canDelete: canDeleteOrder(),
        onDeliver: handleOpenDeliver,
        onEdit: (item) => {
          setEditingOrder(item);
          setModalOpen(true);
        },
        onDuplicate: handleOpenDuplicate,
        onDelete: handleOpenDelete,
      }),
    [canEditOrder, canCreateOrder, canDeleteOrder, navigate]
  );

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
            className={styles.backBtn}
            startIcon={<ArrowBackIcon />}
          >
            Dashboard
          </Button>
          <div className={styles.titleInfo}>
            <h1 className={styles.pageTitle}>Order Management</h1>
          </div>
        </div>

        <div className={styles.headerActionsRight}>
          <ViewToggle
            viewMode={viewMode}
            onChange={handleToggleView}
            ariaLabel="Orders view switcher"
          />

          {canCreateOrder() && (
            <Button
              variant="contained"
              onClick={() => {
                setEditingOrder(null);
                setModalOpen(true);
              }}
              className={styles.addBtn}
              startIcon={<AddIcon className={styles.btnIcon} />}
            >
              Add Order
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <ReceiptLongOutlinedIcon className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Orders</span>
            <span className={styles.statValue}>{summary.totalOrders}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBoxPending}>
            <HourglassEmptyIcon className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>In Process</span>
            <span className={styles.statValue}>{summary.inProcessOrders}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBoxDelivered}>
            <CheckCircleOutlinedIcon className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Delivered</span>
            <span className={styles.statValue}>{summary.deliveredOrders}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBoxProfit}>
            <TrendingUpIcon className={styles.statIcon} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Profit</span>
            <span className={styles.statValueGreen}>{formatINR(summary.totalProfit)}</span>
            {summary.totalCashbackAmount > 0 && (
              <span className={styles.statSubValue}>
                Net: {formatINR(summary.netProfitAfterCashback)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Refresh */}
      <div className={styles.controlsBar}>
        <div className={styles.filterGroupLeft}>
          <TextField
            size="small"
            placeholder="Search orders by ID, dealer, product, account..."
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
                    className={styles.clearSearchBtn}
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
            title="Order Filters"
          >
            <TextField
              select
              label="Order Status"
              size="small"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.filterField}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="Order In Process">Order In Process</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
            </TextField>

            <TextField
              select
              label="Payment Method"
              size="small"
              value={filters.paymentMethod}
              onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              className={styles.filterField}
            >
              <MenuItem value="ALL">All Methods</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="Debit Card">Debit Card</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              select
              label="Dealer"
              size="small"
              value={filters.dealerId}
              onChange={(e) => handleFilterChange('dealerId', e.target.value)}
              className={styles.filterField}
            >
              <MenuItem value="">All Dealers</MenuItem>
              {dealersList.map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.dealerName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Product"
              size="small"
              value={filters.productId}
              onChange={(e) => handleFilterChange('productId', e.target.value)}
              className={styles.filterField}
            >
              <MenuItem value="">All Products</MenuItem>
              {productsList.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.productName}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Account"
              size="small"
              value={filters.accountId}
              onChange={(e) => handleFilterChange('accountId', e.target.value)}
              className={styles.filterField}
            >
              <MenuItem value="">All Accounts</MenuItem>
              {accountsList.map((a) => (
                <MenuItem key={a._id} value={a._id}>
                  {a.fullName} ({a.accountType})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Margin / Profit"
              size="small"
              value={filters.profitType}
              onChange={(e) => handleFilterChange('profitType', e.target.value)}
              className={styles.filterField}
            >
              <MenuItem value="ALL">All Margins</MenuItem>
              <MenuItem value="profit">Profitable (+)</MenuItem>
              <MenuItem value="loss">Loss (-)</MenuItem>
              <MenuItem value="break_even">Break Even (0)</MenuItem>
            </TextField>

            <TextField
              label="Min Purchase Price (₹)"
              type="number"
              size="small"
              value={filters.minPurchasePrice}
              onChange={(e) => handleFilterChange('minPurchasePrice', e.target.value)}
              className={styles.filterField}
            />

            <TextField
              label="Max Purchase Price (₹)"
              type="number"
              size="small"
              value={filters.maxPurchasePrice}
              onChange={(e) => handleFilterChange('maxPurchasePrice', e.target.value)}
              className={styles.filterField}
            />

            <TextField
              label="Min Delivery Price (₹)"
              type="number"
              size="small"
              value={filters.minDeliveryPrice}
              onChange={(e) => handleFilterChange('minDeliveryPrice', e.target.value)}
              className={styles.filterField}
            />

            <TextField
              label="Max Delivery Price (₹)"
              type="number"
              size="small"
              value={filters.maxDeliveryPrice}
              onChange={(e) => handleFilterChange('maxDeliveryPrice', e.target.value)}
              className={styles.filterField}
            />

            <TextField
              label="Order Date From"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className={styles.filterField}
            />

            <TextField
              label="Order Date To"
              type="date"
              size="small"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className={styles.filterField}
            />
          </AdvancedFilterPanel>
        </div>

        <div className={styles.filterGroupRight}>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            className={styles.refreshBtn}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={activeChips}
        onClearAll={handleResetFilters}
      />

      {/* Error alert */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} className={styles.alertBox}>
          {error}
        </Alert>
      )}

      {/* Main Content: Card View vs List View */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <CircularProgress size={44} className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <CommonEmptyState
          icon={ReceiptLongOutlinedIcon}
          title={
            search || activeChips.length > 0
              ? 'No orders match your filter criteria'
              : 'No orders created yet'
          }
          description={
            search || activeChips.length > 0
              ? 'Try adjusting your search terms or clearing active filters.'
              : 'Create your first order to track product deliveries, payment methods, and dealer profit margins.'
          }
          actionLabel={!search && activeChips.length === 0 && canCreateOrder() ? 'Add First Order' : undefined}
          onAction={() => {
            setEditingOrder(null);
            setModalOpen(true);
          }}
          actionIcon={<AddIcon className={styles.btnIcon} />}
        />
      ) : viewMode === 'card' ? (
        <div className={styles.ordersCardGrid}>
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onDeliver={handleOpenDeliver}
              onCorrectPrice={handleOpenCorrectPrice}
              onEdit={(ord) => {
                setEditingOrder(ord);
                setModalOpen(true);
              }}
              onDuplicate={handleOpenDuplicate}
              onDelete={handleOpenDelete}
              canEdit={canEditOrder()}
              canDelete={canDeleteOrder()}
              canCreate={canCreateOrder()}
            />
          ))}
        </div>
      ) : (
        <div className={styles.dataGridContainer}>
          <DataGrid
            rows={orders}
            columns={columns}
            getRowId={(row) => row._id}
            getRowHeight={() => 'auto'}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            disableRowSelectionOnClick
            autoHeight
          />
        </div>
      )}

      {/* Add / Edit Order Modal */}
      <OrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleOrderSaved}
        order={editingOrder}
      />

      {/* Duplicate Order Modal */}
      <OrderModal
        open={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        onSaved={handleOrderSaved}
        order={duplicatingOrder}
        isDuplicate={true}
      />

      {/* Deliver Order Modal */}
      <DeliverOrderModal
        open={deliverModalOpen}
        onClose={() => setDeliverModalOpen(false)}
        onDelivered={handleOrderDelivered}
        order={deliveringOrder}
        loading={actionLoading}
      />

      {/* Delivery Price Correction Modal */}
      <DeliveryPriceCorrectionModal
        open={correctPriceModalOpen}
        onClose={() => setCorrectPriceModalOpen(false)}
        onCorrected={handlePriceCorrected}
        order={correctingOrder}
        loading={actionLoading}
      />

      {/* Delete Order Confirmation Dialog */}
      <DeleteOrderDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleted={handleOrderDeleted}
        order={deletingOrder}
        loading={actionLoading}
      />

      {/* Dealer Address Snapshot Modal */}
      <AddressDetailsModal
        open={Boolean(addressModalOrder)}
        onClose={() => setAddressModalOrder(null)}
        address={addressModalOrder?.dealerAddressSnapshot}
        dealerName={addressModalOrder?.dealerNameSnapshot}
        onCopySuccess={() => setSuccessMsg('Address copied to clipboard!')}
      />

      {/* Success notification */}
      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg('')}
        message={successMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export default OrdersPage;
