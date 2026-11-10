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
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
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
import { useMobileHeader } from '../../context/MobileHeaderContext';
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

  useMobileHeader(
    canCreateOrder()
      ? {
          title: 'Order Management',
          action: {
            label: '+ Add Order',
            onClick: () => {
              setEditingOrder(null);
              setModalOpen(true);
            },
          },
        }
      : { title: 'Order Management', action: null }
  );

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
  });

  const [appliedFilters, setAppliedFilters] = useState({
    status: 'ALL',
    paymentMethod: 'ALL',
    dealerId: '',
    productId: '',
    accountId: '',
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

  // Active Tab state: 'In Process' | 'Delivered' | 'All'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('khata_orders_active_tab') || 'In Process';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('khata_orders_active_tab', tab);
  };

  // Fetch orders list
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { limit: 500 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.status && appliedFilters.status !== 'ALL') params.status = appliedFilters.status;
      if (appliedFilters.paymentMethod && appliedFilters.paymentMethod !== 'ALL') params.paymentMethod = appliedFilters.paymentMethod;
      if (appliedFilters.dealerId) params.dealerId = appliedFilters.dealerId;
      if (appliedFilters.productId) params.productId = appliedFilters.productId;
      if (appliedFilters.accountId) params.accountId = appliedFilters.accountId;

      const data = await orderService.getOrders(params);
      if (data?.orders) {
        // Default sorting: In Process orders appear first, Delivered orders after, then newest orderDate
        const sorted = [...data.orders].sort((a, b) => {
          const aInProc = a.status === 'Order In Process' ? 0 : 1;
          const bInProc = b.status === 'Order In Process' ? 0 : 1;
          if (aInProc !== bInProc) return aInProc - bInProc;
          const dateA = new Date(a.orderDate || a.createdAt || 0).getTime();
          const dateB = new Date(b.orderDate || b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setOrders(sorted);
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
    };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const handleRemoveFilter = (key) => {
    const defaultValue = ['status', 'paymentMethod'].includes(key) ? 'ALL' : '';
    const updated = { ...appliedFilters, [key]: defaultValue };
    setFilters((prev) => ({ ...prev, [key]: defaultValue }));
    setAppliedFilters(updated);
  };

  // Build active chips (Status, Payment Method, Dealer, Product, Account)
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
    return chips;
  }, [appliedFilters, dealersList, productsList, accountsList]);

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

  // Status segmentation
  const inProcessOrders = useMemo(
    () => orders.filter((o) => o.status === 'Order In Process'),
    [orders]
  );

  const deliveredOrders = useMemo(
    () => orders.filter((o) => o.status === 'Delivered'),
    [orders]
  );

  // Tab-filtered orders for display
  const displayedOrders = useMemo(() => {
    if (activeTab === 'In Process') {
      return inProcessOrders;
    }
    if (activeTab === 'Delivered') {
      return deliveredOrders;
    }
    return orders;
  }, [activeTab, inProcessOrders, deliveredOrders, orders]);

  // Tab 1: In Process Summary Calculations
  // - Total In Process Orders
  // - Total Profit
  // - Total Amount Spent
  const inProcessStats = useMemo(() => {
    const totalCount = inProcessOrders.length;
    const totalProfit = inProcessOrders.reduce((sum, o) => sum + (Number(o.profit) || 0), 0);
    const totalSpent = inProcessOrders.reduce((sum, o) => sum + (Number(o.purchasePrice) || 0), 0);
    return {
      totalCount,
      totalProfit,
      totalSpent,
    };
  }, [inProcessOrders]);

  // Tab 2: Delivered Summary Calculations
  // - Total Orders
  // - Total Transactions (delivery price total)
  // - Total Profit (net profit + cashback or profit)
  // - Total Cashback
  const deliveredStats = useMemo(() => {
    const totalCount = deliveredOrders.length;
    const totalTransactions = deliveredOrders.reduce(
      (sum, o) => sum + (Number(o.deliveryPrice) || 0),
      0
    );
    const totalProfit = deliveredOrders.reduce((sum, o) => {
      const p =
        o.netProfit !== null && o.netProfit !== undefined
          ? Number(o.netProfit)
          : Number(o.profit || o.grossProfit || 0) +
            (o.cashbackApplied ? Number(o.cashbackAmount || 0) : 0);
      return sum + p;
    }, 0);
    const totalCashback = deliveredOrders.reduce(
      (sum, o) => sum + (o.cashbackApplied ? Number(o.cashbackAmount || 0) : 0),
      0
    );

    return {
      totalCount,
      totalTransactions,
      totalProfit,
      totalCashback,
    };
  }, [deliveredOrders]);

  // Tab 3: All Summary Calculations
  // - Total Orders
  // - In Process Orders
  // - Delivered Orders
  // - Total Profit
  // - Total Amount Spent
  const allStats = useMemo(() => {
    const totalCount = orders.length;
    const totalInProcess = inProcessOrders.length;
    const totalDelivered = deliveredOrders.length;
    const totalProfit = deliveredStats.totalProfit + inProcessStats.totalProfit;
    const totalSpent = orders.reduce((sum, o) => sum + (Number(o.purchasePrice) || 0), 0);
    return {
      totalCount,
      totalInProcess,
      totalDelivered,
      totalProfit,
      totalSpent,
    };
  }, [orders, inProcessOrders, deliveredOrders, deliveredStats, inProcessStats]);

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

      {/* 3 Order Tabs: In Process | Delivered | All */}
      <div className={styles.tabsContainer} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'In Process'}
          onClick={() => handleTabChange('In Process')}
          className={`${styles.tabBtn} ${activeTab === 'In Process' ? styles.tabActive : ''}`}
        >
          <HourglassEmptyIcon className={styles.tabIcon} />
          <span className={styles.tabLabel}>In Process</span>
          <span className={styles.tabCount}>{inProcessOrders.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'Delivered'}
          onClick={() => handleTabChange('Delivered')}
          className={`${styles.tabBtn} ${activeTab === 'Delivered' ? styles.tabActive : ''}`}
        >
          <CheckCircleOutlinedIcon className={styles.tabIcon} />
          <span className={styles.tabLabel}>Delivered</span>
          <span className={styles.tabCount}>{deliveredOrders.length}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'All'}
          onClick={() => handleTabChange('All')}
          className={`${styles.tabBtn} ${activeTab === 'All' ? styles.tabActive : ''}`}
        >
          <ReceiptLongOutlinedIcon className={styles.tabIcon} />
          <span className={styles.tabLabel}>All</span>
          <span className={styles.tabCount}>{orders.length}</span>
        </button>
      </div>

      {/* Dynamic Summary Cards based on active tab */}
      {activeTab === 'In Process' && (
        <div className={styles.statsGrid3}>
          <div className={styles.statCard}>
            <div className={styles.statIconBoxPending}>
              <HourglassEmptyIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total In Process Orders</span>
              <span className={styles.statValue}>{inProcessStats.totalCount}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBoxProfit}>
              <TrendingUpIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Profit</span>
              <span className={styles.statValueGreen}>{formatINR(inProcessStats.totalProfit)}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBoxSpent}>
              <AccountBalanceWalletOutlinedIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Amount Spent</span>
              <span className={styles.statValue}>{formatINR(inProcessStats.totalSpent)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Delivered' && (
        <div className={styles.statsGrid4}>
          <div className={styles.statCard}>
            <div className={styles.statIconBoxDelivered}>
              <CheckCircleOutlinedIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Orders</span>
              <span className={styles.statValue}>{deliveredStats.totalCount}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBox}>
              <PaymentsOutlinedIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Transactions</span>
              <span className={styles.statValue}>{formatINR(deliveredStats.totalTransactions)}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBoxProfit}>
              <TrendingUpIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Profit</span>
              <span className={styles.statValueGreen}>{formatINR(deliveredStats.totalProfit)}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBoxCashback}>
              <PriceCheckIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Cashback</span>
              <span className={styles.statValuePurple}>{formatINR(deliveredStats.totalCashback)}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'All' && (
        <div className={styles.statsGrid5}>
          <div className={styles.statCard}>
            <div className={styles.statIconBox}>
              <ReceiptLongOutlinedIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Orders</span>
              <span className={styles.statValue}>{allStats.totalCount}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBoxPending}>
              <HourglassEmptyIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>In Process</span>
              <span className={styles.statValue}>{allStats.totalInProcess}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBoxDelivered}>
              <CheckCircleOutlinedIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Delivered</span>
              <span className={styles.statValue}>{allStats.totalDelivered}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBoxProfit}>
              <TrendingUpIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Profit</span>
              <span className={styles.statValueGreen}>{formatINR(allStats.totalProfit)}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconBoxSpent}>
              <AccountBalanceWalletOutlinedIcon className={styles.statIcon} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Amount Spent</span>
              <span className={styles.statValue}>{formatINR(allStats.totalSpent)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar: Search, Filters */}
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
          </AdvancedFilterPanel>
        </div>

        <div className={styles.filterGroupRight}>
          <div className={styles.mobileViewToggle}>
            <ViewToggle
              viewMode={viewMode}
              onChange={handleToggleView}
              ariaLabel="Orders view switcher"
            />
          </div>
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
      ) : displayedOrders.length === 0 ? (
        <CommonEmptyState
          icon={ReceiptLongOutlinedIcon}
          title={
            search || activeChips.length > 0
              ? 'No orders match your filter criteria'
              : activeTab === 'In Process'
              ? 'No In Process Orders'
              : activeTab === 'Delivered'
              ? 'No Delivered Orders'
              : 'No orders created yet'
          }
          description={
            search || activeChips.length > 0
              ? 'Try adjusting your search terms or clearing active filters.'
              : activeTab === 'In Process'
              ? 'All orders have been delivered or none are currently in process.'
              : activeTab === 'Delivered'
              ? 'Delivered orders will appear here once marked as delivered.'
              : 'Create your first order to track product deliveries, payment methods, and dealer profit margins.'
          }
          actionLabel={!search && activeChips.length === 0 && canCreateOrder() && activeTab !== 'Delivered' ? 'Add Order' : undefined}
          onAction={() => {
            setEditingOrder(null);
            setModalOpen(true);
          }}
          actionIcon={<AddIcon className={styles.btnIcon} />}
        />
      ) : viewMode === 'card' ? (
        <div className={styles.ordersCardGrid}>
          {displayedOrders.map((order) => (
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
            rows={displayedOrders}
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
