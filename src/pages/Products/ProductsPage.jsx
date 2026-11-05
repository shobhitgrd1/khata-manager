import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useNavigate, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import ProductCard from '../../components/products/ProductCard';
import ProductModal from '../../components/products/ProductModal';
import DeleteProductDialog from '../../components/products/DeleteProductDialog';
import ViewToggle from '../../components/common/ViewToggle';
import AdvancedFilterPanel, { FilterTriggerButton } from '../../components/common/AdvancedFilterPanel';
import ActiveFilterChips from '../../components/common/ActiveFilterChips';
import CommonEmptyState from '../../components/common/CommonEmptyState';
import { getProductColumns } from './TableColumns';
import { PAGE_SIZE_OPTIONS } from '../../constants';
import productService from '../../services/productService';
import useAuth from '../../hooks/useAuth';
import styles from './ProductsPage.module.scss';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const { canCreateProduct, canEditProduct, canDeleteProduct } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Per-product expanded state for variant badges
  const [expandedProducts, setExpandedProducts] = useState({});

  // Summary counts
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalVariants: 0,
    totalColors: 0,
  });

  // View mode
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('khata_products_view_mode') || 'list';
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('khata_products_view_mode', mode);
  };

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const [filters, setFilters] = useState({
    color: '',
    minVariants: '',
    startDate: '',
    endDate: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    color: '',
    minVariants: '',
    startDate: '',
    endDate: '',
  });

  const debounceTimer = useRef(null);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicatingProduct, setDuplicatingProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

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
      const data = await productService.getProductSummary();
      if (data?.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load product summary:', err);
    }
  }, []);

  // Fetch products list
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.color) params.color = appliedFilters.color;
      if (appliedFilters.minVariants) params.minVariants = appliedFilters.minVariants;
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;

      const data = await productService.getProducts(params);
      if (data?.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      setError(err.response?.data?.message || 'Failed to load products from server.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, appliedFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Toggle variant expansion for a specific row
  const toggleExpandVariants = (productId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

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
      color: '',
      minVariants: '',
      startDate: '',
      endDate: '',
    };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const handleRemoveFilter = (key) => {
    const updated = { ...appliedFilters, [key]: '' };
    setFilters((prev) => ({ ...prev, [key]: '' }));
    setAppliedFilters(updated);
  };

  // Build active chips
  const activeChips = useMemo(() => {
    const chips = [];
    if (appliedFilters.color) {
      chips.push({
        id: 'color',
        key: 'color',
        label: 'Color',
        value: appliedFilters.color,
        displayValue: appliedFilters.color,
        onRemove: () => handleRemoveFilter('color'),
      });
    }
    if (appliedFilters.minVariants) {
      chips.push({
        id: 'minVariants',
        key: 'minVariants',
        label: 'Min Variants',
        value: appliedFilters.minVariants,
        displayValue: `≥ ${appliedFilters.minVariants}`,
        onRemove: () => handleRemoveFilter('minVariants'),
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

  // Handlers for Add, Edit, Delete
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleOpenDuplicate = (product) => {
    setDuplicatingProduct(product);
    setDuplicateModalOpen(true);
  };

  const handleOpenDelete = (product) => {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  };

  // Create or Update Product
  const handleSaveProduct = async (productData, existingId) => {
    setActionLoading(true);
    setError('');
    try {
      const isDuplicating = duplicateModalOpen;
      const targetId = existingId !== undefined ? existingId : editingProduct?._id;
      if (targetId) {
        await productService.updateProduct(targetId, productData);
        setSuccessMsg('Product updated successfully.');
      } else {
        await productService.createProduct(productData);
        setSuccessMsg(isDuplicating ? 'Product duplicated successfully.' : 'Product created successfully.');
      }
      setModalOpen(false);
      setEditingProduct(null);
      setDuplicateModalOpen(false);
      setDuplicatingProduct(null);
      fetchProducts();
      fetchSummary();
    } catch (err) {
      console.error('Save product error:', err);
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setActionLoading(true);
    setError('');
    try {
      await productService.deleteProduct(deletingProduct._id);
      setSuccessMsg('Product deleted successfully.');
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
      fetchProducts();
      fetchSummary();
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setActionLoading(false);
    }
  };

  // DataGrid Columns extracted to TableColumns.jsx
  const columns = useMemo(
    () =>
      getProductColumns({
        navigate,
        canEdit: canEditProduct(),
        canCreate: canCreateProduct(),
        canDelete: canDeleteProduct(),
        expandedProducts,
        toggleExpandVariants,
        onEdit: handleOpenEdit,
        onDuplicate: handleOpenDuplicate,
        onDelete: handleOpenDelete,
      }),
    [canEditProduct, canDeleteProduct, canCreateProduct, navigate, expandedProducts]
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
            <h1 className={styles.pageTitle}>My Products</h1>
            <p className={styles.pageSubtitle}>
              Manage product listings, variants, and assigned color palettes.
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <ViewToggle
            viewMode={viewMode}
            onChange={handleToggleView}
            ariaLabel="Products view switcher"
          />

          {canCreateProduct() && (
            <Button
              variant="contained"
              startIcon={<AddIcon className={styles.btnIcon} />}
              onClick={handleOpenAdd}
              className={styles.addBtn}
            >
              Add Product
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <Inventory2OutlinedIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Total Products</span>
            <span className={styles.statValue}>{summary.totalProducts}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <LayersOutlinedIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Total Variants</span>
            <span className={styles.statValue}>{summary.totalVariants}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <PaletteOutlinedIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Total Colors</span>
            <span className={styles.statValue}>{summary.totalColors}</span>
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
            placeholder="Search by product name, variant, or color..."
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
          <Tooltip title="Refresh products">
            <Button
              variant="outlined"
              onClick={() => {
                fetchProducts();
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
        title="Product Filters"
      >
        <TextField
          label="Color Name"
          size="small"
          value={filters.color}
          onChange={(e) => handleFilterChange('color', e.target.value)}
          placeholder="e.g. Blue, Red, Midnight"
          className={styles.filterField}
        />

        <TextField
          label="Minimum Variants"
          type="number"
          size="small"
          value={filters.minVariants}
          onChange={(e) => handleFilterChange('minVariants', e.target.value)}
          placeholder="e.g. 3"
          className={styles.filterField}
        />

        <TextField
          label="Created After"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className={styles.filterField}
        />

        <TextField
          label="Created Before"
          type="date"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className={styles.filterField}
        />
      </AdvancedFilterPanel>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={activeChips}
        onClearAll={handleResetFilters}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <CircularProgress className={styles.spinner} size={48} thickness={4} />
          <span className={styles.loadingText}>Loading products...</span>
        </div>
      ) : products.length > 0 ? (
        viewMode === 'list' ? (
          <div className={styles.dataGridContainer}>
            <DataGrid
              rows={products}
              columns={columns}
              getRowId={(row) => row._id}
              autoHeight
              getRowHeight={() => 'auto'}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              disableRowSelectionOnClick
            />
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={handleOpenEdit}
                onDuplicate={handleOpenDuplicate}
                onDelete={handleOpenDelete}
                canEdit={canEditProduct()}
                canDelete={canDeleteProduct()}
                canCreate={canCreateProduct()}
              />
            ))}
          </div>
        )
      ) : (
        <CommonEmptyState
          icon={Inventory2OutlinedIcon}
          title={
            search || activeChips.length > 0
              ? 'No matching products found'
              : 'No products registered yet'
          }
          description={
            search || activeChips.length > 0
              ? 'Try modifying your search or clearing active filters.'
              : 'Add products with variants and available colors to use them when recording orders.'
          }
          actionLabel={!search && activeChips.length === 0 && canCreateProduct() ? 'Add First Product' : undefined}
          onAction={handleOpenAdd}
          actionIcon={<AddIcon className={styles.btnIcon} />}
        />
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialData={editingProduct}
        product={editingProduct}
        loading={actionLoading}
      />

      {/* Duplicate Product Modal */}
      <ProductModal
        open={duplicateModalOpen}
        onClose={() => {
          setDuplicateModalOpen(false);
          setDuplicatingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialData={duplicatingProduct}
        product={duplicatingProduct}
        isDuplicate={true}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingProduct(null);
        }}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleDeleteProduct}
        product={deletingProduct}
        loading={actionLoading}
      />
    </div>
  );
};

export default ProductsPage;
