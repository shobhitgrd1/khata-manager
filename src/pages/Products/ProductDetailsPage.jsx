import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import UpdateIcon from '@mui/icons-material/Update';

import ProductModal from '../../components/products/ProductModal';
import DeleteProductDialog from '../../components/products/DeleteProductDialog';
import productService from '../../services/productService';
import useAuth from '../../hooks/useAuth';
import styles from './ProductDetailsPage.module.scss';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEditProduct, canDeleteProduct } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch product details
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await productService.getProductById(id);
      if (data?.product) {
        setProduct(data.product);
      }
    } catch (err) {
      console.error('Fetch product error:', err);
      setError(err.response?.data?.message || 'Failed to load product details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Handle edit submit
  const handleEditSubmit = async (formData) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await productService.updateProduct(id, formData);
      if (res?.product) {
        setProduct(res.product);
      }
      setSuccessMsg('Product details updated successfully.');
      setEditModalOpen(false);
    } catch (err) {
      console.error('Update product error:', err);
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    setError('');
    try {
      await productService.deleteProduct(id);
      navigate('/products', {
        state: { message: `Product "${product?.productName}" deleted successfully.` },
      });
    } catch (err) {
      console.error('Delete product error:', err);
      setError(err.response?.data?.message || 'Failed to delete product.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress size={44} className={styles.loadingSpinner} />
        <span className={styles.loadingText}>Loading product details...</span>
      </div>
    );
  }

  const {
    _id,
    productName = 'Unknown Product',
    variants = [],
    colors = [],
    createdAt,
    updatedAt,
  } = product || {};

  const formattedCreated = createdAt
    ? new Date(createdAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'N/A';

  const formattedUpdated = updatedAt
    ? new Date(updatedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'N/A';

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/products')}
            className={styles.backBtn}
            startIcon={<ArrowBackIcon />}
          >
            Back to Products
          </Button>

          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>Product Details</h1>
            <p className={styles.pageSubtitle}>
              Viewing specifications, variant options, and color palette
            </p>
          </div>
        </div>

        <div className={styles.headerActionsRight}>
          {canEditProduct() && (
            <Button
              variant="outlined"
              onClick={() => setEditModalOpen(true)}
              className={styles.editBtn}
              startIcon={<EditOutlinedIcon />}
            >
              Edit Product
            </Button>
          )}

          {canDeleteProduct() && (
            <Button
              variant="outlined"
              onClick={() => setDeleteDialogOpen(true)}
              className={styles.deleteBtn}
              startIcon={<DeleteOutlinedIcon />}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} className={styles.alertBox}>
          {error}
        </Alert>
      )}

      {/* Hero Overview Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroTopRow}>
          <div className={styles.heroIconBox}>
            <Inventory2OutlinedIcon className={styles.heroIcon} />
          </div>

          <div className={styles.heroDetails}>
            <h2 className={styles.heroProductName}>{productName}</h2>
            <span className={styles.heroProductId}>ID: {_id}</span>
          </div>
        </div>

        {/* Timestamps Strip */}
        <div className={styles.timestampsGrid}>
          <div className={styles.timestampItem}>
            <CalendarMonthIcon className={styles.timestampIcon} />
            <div className={styles.timestampText}>
              <span className={styles.timestampLabel}>Created On</span>
              <span className={styles.timestampValue}>{formattedCreated}</span>
            </div>
          </div>

          <div className={styles.timestampItem}>
            <UpdateIcon className={styles.timestampIcon} />
            <div className={styles.timestampText}>
              <span className={styles.timestampLabel}>Last Updated</span>
              <span className={styles.timestampValue}>{formattedUpdated}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Sections: Variants and Colors */}
      <div className={styles.sectionsGrid}>
        {/* Variants Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionTitleGroup}>
              <LayersOutlinedIcon className={styles.sectionIcon} />
              <h3 className={styles.sectionHeading}>Product Variants</h3>
            </div>
            <span className={styles.countChip}>
              {variants.length} {variants.length === 1 ? 'Variant' : 'Variants'}
            </span>
          </div>

          <div className={styles.variantsList}>
            {variants.map((v, idx) => (
              <div key={idx} className={styles.variantItem}>
                <div className={styles.variantLeft}>
                  <div className={styles.variantIndexBadge}>{idx + 1}</div>
                  <span className={styles.variantName}>{v.variantName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Colors Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeaderRow}>
            <div className={styles.sectionTitleGroup}>
              <PaletteOutlinedIcon className={styles.sectionIcon} />
              <h3 className={styles.sectionHeading}>Available Colors</h3>
            </div>
            <span className={styles.countChip}>
              {colors.length} {colors.length === 1 ? 'Color' : 'Colors'}
            </span>
          </div>

          <div className={styles.colorsList}>
            {colors.map((c, idx) => (
              <div key={idx} className={styles.colorItem}>
                <div className={styles.colorLeft}>
                  <svg width="26" height="26" viewBox="0 0 26 26" className={styles.colorSwatch}>
                    <circle
                      cx="13"
                      cy="13"
                      r="12"
                      fill={c.colorCode || '#36CFFF'}
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="1.5"
                    />
                  </svg>
                  <span className={styles.colorName}>{c.colorName}</span>
                </div>
                <span className={styles.colorCodeText}>{c.colorCode || '#36CFFF'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={product}
        loading={actionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        product={product}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={actionLoading}
      />

      {/* Success Notification */}
      <Snackbar
        open={Boolean(successMsg)}
        autoHideDuration={4000}
        onClose={() => setSuccessMsg('')}
        message={successMsg}
      />
    </div>
  );
};

export default ProductDetailsPage;

