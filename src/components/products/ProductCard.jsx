import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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

  const {
    _id,
    productName = 'Unnamed Product',
    variants = [],
    colors = [],
  } = product || {};

  const totalVariants = variants.length;
  const totalColors = colors.length;

  const variantSummary = variants
    .slice(0, 2)
    .map((v) => (typeof v === 'string' ? v : v.variantName))
    .join(', ');

  const handleCardClick = () => {
    if (_id) navigate(`/products/${_id}`);
  };

  return (
    <div
      className={styles.compactFigmaCard}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* ─── Column 1: Product Icon & Name ──────────────────── */}
      <div className={styles.colProduct}>
        <div className={styles.productAvatarSquare}>
          <Inventory2OutlinedIcon className={styles.productIcon} />
        </div>
        <div className={styles.productTextGroup}>
          <span className={styles.productName} title={productName}>
            {productName}
          </span>
          <span className={styles.productSub}>
            {totalColors} {totalColors === 1 ? 'Color' : 'Colors'}
          </span>
        </div>
      </div>

      {/* ─── Column 2: Variants & Colors ─────────────────────── */}
      <div className={styles.colDetails}>
        <div className={styles.variantLine}>
          <LayersOutlinedIcon className={styles.specIcon} />
          <span
            className={styles.variantText}
            title={`${totalVariants} Variants${variantSummary ? `: ${variantSummary}` : ''}`}
          >
            {totalVariants} Variants {variantSummary ? `(${variantSummary}...)` : ''}
          </span>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.colorsLine}>
          <PaletteOutlinedIcon className={styles.specIcon} />
          <div className={styles.colorDotsGroup}>
            {colors.slice(0, 4).map((c, idx) => (
              <span
                key={idx}
                className={styles.colorDot}
                style={{
                  backgroundColor:
                    typeof c === 'object' && c.colorCode ? c.colorCode : '#36CFFF',
                }}
                title={typeof c === 'string' ? c : c.colorName}
              />
            ))}
            {totalColors > 4 && (
              <span className={styles.moreColorsText}>+{totalColors - 4}</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Column 3: Actions & Chevron ─────────────────────── */}
      <div className={styles.colActions}>
        <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
          {canEdit && onEdit && (
            <Tooltip title="Edit" arrow>
              <button
                type="button"
                onClick={() => onEdit(product)}
                className={styles.actionBtn}
                aria-label={`Edit ${productName}`}
              >
                <EditOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canCreate && onDuplicate && (
            <Tooltip title="Duplicate" arrow>
              <button
                type="button"
                onClick={() => onDuplicate(product)}
                className={`${styles.actionBtn} ${styles.duplicateBtn}`}
                aria-label={`Duplicate ${productName}`}
              >
                <ContentCopyIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canDelete && onDelete && (
            <Tooltip title="Delete" arrow>
              <button
                type="button"
                onClick={() => onDelete(product)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label={`Delete ${productName}`}
              >
                <DeleteOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}
        </div>

        <ChevronRightIcon className={styles.chevronIcon} />
      </div>
    </div>
  );
};

export default ProductCard;
