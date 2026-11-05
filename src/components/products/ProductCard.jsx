import React, { useState } from 'react';
import { Button, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import styles from './ProductCard.module.scss';

const ProductCard = ({
  product,
  onEdit,
  onDuplicate,
  onDelete,
  canEdit = true,
  canDelete = true,
  canCreate = true,
}) => {
  const navigate = useNavigate();
  const [expandedVariants, setExpandedVariants] = useState(false);

  const {
    _id,
    productName = 'Unnamed Product',
    variants = [],
    colors = [],
    createdAt,
  } = product || {};

  const totalVariants = variants.length;
  const totalColors = colors.length;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '';

  const visibleVariants = expandedVariants ? variants : variants.slice(0, 5);
  const hasMoreVariants = totalVariants > 5;
  const remainingVariantsCount = totalVariants - 5;

  const displayColors = colors.slice(0, 6);
  const remainingColors = totalColors - 6;

  return (
    <div className={styles.productCard}>
      <div className={styles.ambientGlare} />

      {/* Top Header Row */}
      <div className={styles.topRow}>
        <div className={styles.productHeader}>
          <div className={styles.avatarBox}>
            <Inventory2OutlinedIcon className={styles.productIcon} />
          </div>

          <div className={styles.nameAndDate}>
            <Link to={`/products/${_id}`} className={styles.productLink}>
              <h3 className={styles.productName}>{productName}</h3>
            </Link>
            {formattedDate && (
              <span className={styles.dateText}>
                <CalendarMonthIcon className={styles.calendarIcon} />
                {formattedDate}
              </span>
            )}
          </div>
        </div>

        {/* Count Badges */}
        <div className={styles.badgesGroup}>
          <div className={styles.variantCountBadge}>
            <LayersOutlinedIcon className={styles.badgeIcon} />
            <span>{totalVariants} {totalVariants === 1 ? 'Variant' : 'Variants'}</span>
          </div>

          <div className={styles.colorCountBadge}>
            <PaletteOutlinedIcon className={styles.badgeIcon} />
            <span>{totalColors} {totalColors === 1 ? 'Color' : 'Colors'}</span>
          </div>
        </div>
      </div>

      {/* Specifications Preview */}
      <div className={styles.specSection}>
        {/* Variants row with badges */}
        <div className={styles.specRow}>
          <span className={styles.specLabel}>Variants</span>
          <div className={styles.chipsContainer}>
            {visibleVariants.map((v, idx) => (
              <span key={`${v.variantName || v}-${idx}`} className={styles.variantChip}>
                {typeof v === 'string' ? v : v.variantName}
              </span>
            ))}
            {hasMoreVariants && !expandedVariants && (
              <button
                type="button"
                className={styles.moreVariantsBtn}
                onClick={() => setExpandedVariants(true)}
                title={`Show all ${totalVariants} variants`}
              >
                +{remainingVariantsCount}
              </button>
            )}
            {hasMoreVariants && expandedVariants && (
              <button
                type="button"
                className={styles.collapseVariantsBtn}
                onClick={() => setExpandedVariants(false)}
                title="Collapse variants"
              >
                Show Less
              </button>
            )}
          </div>
        </div>

        {/* Colors row */}
        <div className={styles.specRow}>
          <span className={styles.specLabel}>Available Colors</span>
          <div className={styles.chipsContainer}>
            {displayColors.map((c, idx) => (
              <span key={`${c.colorName || c}-${idx}`} className={styles.colorPill}>
                <svg width="12" height="12" viewBox="0 0 12 12" className={styles.colorCircle}>
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    fill={(typeof c === 'object' && c.colorCode) ? c.colorCode : '#36CFFF'}
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="1"
                  />
                </svg>
                <span>{typeof c === 'string' ? c : c.colorName}</span>
              </span>
            ))}
            {remainingColors > 0 && (
              <span className={styles.moreCount}>+{remainingColors} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions Bottom Row */}
      <div className={styles.cardActions}>
        <Tooltip title="View Product Details" arrow>
          <button
            type="button"
            onClick={() => navigate(`/products/${_id}`)}
            className={styles.viewDetailsBtn}
          >
            <span>Details</span>
            <ArrowForwardIcon className={styles.viewIcon} />
          </button>
        </Tooltip>

        <div className={styles.actionButtonsRight}>
          {canEdit && (
            <Tooltip title="Edit Product" arrow>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditOutlinedIcon className={styles.btnIcon} />}
                onClick={() => onEdit && onEdit(product)}
                className={styles.editBtn}
              >
                Edit
              </Button>
            </Tooltip>
          )}

          {canCreate && (
            <Tooltip title="Duplicate Product" arrow>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon className={styles.btnIcon} />}
                onClick={() => onDuplicate && onDuplicate(product)}
                className={styles.duplicateBtn}
              >
                Duplicate
              </Button>
            </Tooltip>
          )}

          {canDelete && (
            <Tooltip title="Delete Product" arrow>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteOutlinedIcon className={styles.btnIcon} />}
                onClick={() => onDelete && onDelete(product)}
                className={styles.deleteBtn}
              >
                Delete
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
