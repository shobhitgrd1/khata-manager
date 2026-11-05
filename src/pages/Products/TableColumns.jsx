import React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import styles from './ProductsPage.module.scss';

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getProductColumns = ({
  navigate,
  canEdit = true,
  canCreate = true,
  canDelete = true,
  expandedProducts = {},
  toggleExpandVariants,
  onEdit,
  onDuplicate,
  onDelete,
}) => [
  {
    field: 'productName',
    headerName: 'Product Name',
    flex: 1.3,
    minWidth: 180,
    renderCell: (params) => {
      const row = params?.row || {};
      return (
        <div className={styles.productNameCell}>
          <Link to={`/products/${row._id}`} className={styles.productNameLink}>
            {row.productName}
          </Link>
        </div>
      );
    },
  },
  {
    field: 'variants',
    headerName: 'Variants',
    flex: 2,
    minWidth: 260,
    sortable: false,
    renderCell: (params) => {
      const row = params?.row || {};
      const variants = row.variants || [];

      if (variants.length === 0) {
        return <span className={styles.noVariantsText}>No variants</span>;
      }

      const isExpanded = Boolean(expandedProducts[row._id]);
      const hasMore = variants.length > 5;
      const visibleVariants = isExpanded || !hasMore ? variants : variants.slice(0, 5);
      const remainingCount = variants.length - 5;

      return (
        <div className={styles.variantsBadgeContainer}>
          {visibleVariants.map((v, idx) => {
            const name = typeof v === 'string' ? v : v.variantName;
            return (
              <span key={idx} className={styles.variantBadge}>
                {name}
              </span>
            );
          })}

          {hasMore && !isExpanded && (
            <Tooltip title={`Click to show all ${variants.length} variants`} arrow>
              <button
                type="button"
                className={styles.moreVariantBadge}
                onClick={(e) => toggleExpandVariants && toggleExpandVariants(row._id, e)}
              >
                +{remainingCount}
              </button>
            </Tooltip>
          )}

          {hasMore && isExpanded && (
            <Tooltip title="Click to collapse variants" arrow>
              <button
                type="button"
                className={styles.collapseVariantBadge}
                onClick={(e) => toggleExpandVariants && toggleExpandVariants(row._id, e)}
              >
                Show Less
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
  },
  {
    field: 'colors',
    headerName: 'Colors',
    flex: 1.2,
    minWidth: 160,
    sortable: false,
    renderCell: (params) => {
      const colors = params?.row?.colors || [];
      if (colors.length === 0) {
        return <span className={styles.noColorsText}>None</span>;
      }

      return (
        <div className={styles.colorsPreviewRow}>
          {colors.slice(0, 5).map((c, i) => (
            <Tooltip
              key={i}
              title={`${c.colorName || c} (${c.colorCode || '#36CFFF'})`}
              arrow
            >
              <span className={styles.colorDotWrapper}>
                <svg width="15" height="15" viewBox="0 0 15 15" className={styles.colorDot}>
                  <circle
                    cx="7.5"
                    cy="7.5"
                    r="6.5"
                    fill={c.colorCode || '#36CFFF'}
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="1.2"
                  />
                </svg>
              </span>
            </Tooltip>
          ))}
          {colors.length > 5 && (
            <span className={styles.moreColorsCount}>+{colors.length - 5}</span>
          )}
        </div>
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Created Date',
    width: 130,
    renderCell: (params) => formatDate(params?.row?.createdAt),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 200,
    minWidth: 200,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const row = params?.row;
      return (
        <div className={styles.actionsCell}>
          <Tooltip title="View Details" arrow>
            <button
              type="button"
              onClick={() => navigate(`/products/${row?._id}`)}
              className={styles.rowActionBtn}
              aria-label={`View ${row?.productName}`}
            >
              <VisibilityOutlinedIcon fontSize="inherit" />
            </button>
          </Tooltip>

          {canEdit && (
            <Tooltip title="Edit Product" arrow>
              <button
                type="button"
                onClick={() => onEdit && onEdit(row)}
                className={styles.rowActionBtn}
                aria-label={`Edit ${row?.productName}`}
              >
                <EditOutlinedIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}

          {canCreate && (
            <Tooltip title="Duplicate Product" arrow>
              <button
                type="button"
                onClick={() => onDuplicate && onDuplicate(row)}
                className={`${styles.rowActionBtn} ${styles.duplicateAction}`}
                aria-label={`Duplicate ${row?.productName}`}
              >
                <ContentCopyIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip title="Delete Product" arrow>
              <button
                type="button"
                onClick={() => onDelete && onDelete(row)}
                className={`${styles.rowActionBtn} ${styles.deleteAction}`}
                aria-label={`Delete ${row?.productName}`}
              >
                <DeleteOutlinedIcon fontSize="inherit" />
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];

export default getProductColumns;

