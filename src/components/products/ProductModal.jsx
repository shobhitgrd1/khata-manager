import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import styles from './ProductModal.module.scss';

const VARIANT_SUGGESTIONS = [
  '128 GB',
  '256 GB',
  '512 GB',
  '1 TB',
  'Small',
  'Medium',
  'Large',
  '1 kg',
  '2 kg',
];

const COLOR_SUGGESTIONS = [
  { name: 'Black', code: '#0f172a' },
  { name: 'White', code: '#ffffff' },
  { name: 'Red', code: '#ef4444' },
  { name: 'Blue', code: '#3b82f6' },
  { name: 'Green', code: '#10b981' },
  { name: 'Silver', code: '#94a3b8' },
];

const HEX_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const ProductModal = ({
  open,
  onClose,
  onSubmit,
  onSaved,
  initialData = null,
  product = null,
  isDuplicate = false,
  loading = false,
}) => {
  // Support both initialData and product props
  const activeProduct = initialData || product;
  const isDuplicateMode = Boolean(isDuplicate);
  const isEditMode = Boolean(!isDuplicateMode && activeProduct && activeProduct._id);

  const [productName, setProductName] = useState('');
  const [variants, setVariants] = useState([{ variantName: '' }]);
  const [colors, setColors] = useState([{ colorName: '', colorCode: '#36CFFF' }]);
  const [validationError, setValidationError] = useState('');

  // Reset or pre-populate all fields when modal opens or product changes
  useEffect(() => {
    if (open) {
      setValidationError('');
      const data = initialData || product;
      if (data) {
        setProductName(data.productName || '');

        // Pre-populate all variants preserving exact order
        if (Array.isArray(data.variants) && data.variants.length > 0) {
          setVariants(
            data.variants.map((v) => ({
              variantName: typeof v === 'string' ? v : v.variantName || '',
            }))
          );
        } else {
          setVariants([{ variantName: '' }]);
        }

        // Pre-populate all colors preserving exact order and hex codes
        if (Array.isArray(data.colors) && data.colors.length > 0) {
          setColors(
            data.colors.map((c) => ({
              colorName: typeof c === 'string' ? c : c.colorName || '',
              colorCode: typeof c === 'object' && c.colorCode ? c.colorCode : '#36CFFF',
            }))
          );
        } else {
          setColors([{ colorName: '', colorCode: '#36CFFF' }]);
        }
      } else {
        setProductName('');
        setVariants([{ variantName: '' }]);
        setColors([{ colorName: '', colorCode: '#36CFFF' }]);
      }
    }
  }, [open, initialData, product]);

  // Variant operations
  const handleVariantChange = (index, value) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], variantName: value };
      return updated;
    });
    setValidationError('');
  };

  const handleAddVariant = (presetName = '') => {
    setVariants((prev) => [...prev, { variantName: presetName }]);
    setValidationError('');
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setValidationError('');
  };

  // Color operations
  const handleColorNameChange = (index, value) => {
    setColors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], colorName: value };
      return updated;
    });
    setValidationError('');
  };

  const handleColorCodeChange = (index, value) => {
    setColors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], colorCode: value };
      return updated;
    });
  };

  const handleAddColor = (preset = null) => {
    setColors((prev) => [
      ...prev,
      {
        colorName: preset ? preset.name : '',
        colorCode: preset ? preset.code : '#36CFFF',
      },
    ]);
    setValidationError('');
  };

  const handleRemoveColor = (index) => {
    if (colors.length <= 1) return;
    setColors((prev) => prev.filter((_, i) => i !== index));
    setValidationError('');
  };

  // Form submit handler with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const cleanName = productName.trim();
    if (!cleanName) {
      setValidationError('Product name is mandatory.');
      return;
    }

    // Validate Variants
    const cleanedVariants = [];
    const seenVariants = new Set();
    for (let i = 0; i < variants.length; i++) {
      const raw = variants[i]?.variantName;
      const vName = (raw || '').trim();
      if (!vName) {
        setValidationError(`Variant #${i + 1} cannot be empty.`);
        return;
      }
      const lowerV = vName.toLowerCase();
      if (seenVariants.has(lowerV)) {
        setValidationError(`Duplicate variant "${vName}" found. Each variant must be unique.`);
        return;
      }
      seenVariants.add(lowerV);
      cleanedVariants.push({ variantName: vName });
    }

    if (cleanedVariants.length === 0) {
      setValidationError('At least one product variant is required.');
      return;
    }

    // Validate Colors
    const cleanedColors = [];
    const seenColors = new Set();
    for (let i = 0; i < colors.length; i++) {
      const rawName = colors[i]?.colorName;
      const cName = (rawName || '').trim();
      if (!cName) {
        setValidationError(`Color #${i + 1} name cannot be empty.`);
        return;
      }
      const lowerC = cName.toLowerCase();
      if (seenColors.has(lowerC)) {
        setValidationError(`Duplicate color "${cName}" found. Each color must be unique.`);
        return;
      }
      seenColors.add(lowerC);

      let code = (colors[i]?.colorCode || '#36CFFF').trim();
      if (!code.startsWith('#')) {
        code = `#${code}`;
      }
      if (!HEX_REGEX.test(code)) {
        code = '#36CFFF';
      }

      cleanedColors.push({
        colorName: cName,
        colorCode: code,
      });
    }

    if (cleanedColors.length === 0) {
      setValidationError('At least one product color is required.');
      return;
    }

    const payload = {
      productName: cleanName,
      variants: cleanedVariants,
      colors: cleanedColors,
    };

    const targetId = isDuplicateMode ? null : activeProduct?._id;

    if (onSubmit) {
      onSubmit(payload, targetId);
    } else if (onSaved) {
      onSaved(payload, targetId);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: styles.dialogPaper,
      }}
    >
      {/* Header */}
      <div className={styles.dialogHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.headerIconBox}>
            {isDuplicateMode ? (
              <ContentCopyIcon className={styles.headerIcon} />
            ) : (
              <Inventory2OutlinedIcon className={styles.headerIcon} />
            )}
          </div>
          <div>
            <h2 className={styles.dialogTitle}>
              {isDuplicateMode
                ? 'Duplicate Product'
                : isEditMode
                ? 'Edit Product'
                : 'Add New Product'}
            </h2>
            <p className={styles.dialogSubtitle}>
              {isDuplicateMode
                ? `Duplicating variants and color options from "${activeProduct?.productName || 'product'}"`
                : isEditMode
                ? 'Update product details, variants, and colors'
                : 'Create a new product with multiple variants and color options'}
            </p>
          </div>
        </div>

        <IconButton
          onClick={onClose}
          disabled={loading}
          className={styles.closeButton}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent className={styles.dialogContent}>
          {validationError && (
            <Alert severity="error" className={styles.alertBox}>
              {validationError}
            </Alert>
          )}

          {/* Product Name */}
          <div className={styles.formGroup}>
            <label className={styles.fieldLabel} htmlFor="productNameInput">
              Product Name <span className={styles.requiredStar}>*</span>
            </label>
            <TextField
              id="productNameInput"
              fullWidth
              size="small"
              placeholder="e.g. Cricket Bat, Mobile Phone, T-Shirt"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setValidationError('');
              }}
              disabled={loading}
              className={styles.customInput}
              autoFocus
            />
          </div>

          {/* Variants Section */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.sectionTitleGroup}>
                <LayersOutlinedIcon className={styles.sectionIcon} />
                <h4 className={styles.sectionTitle}>Product Variants</h4>
                <span className={styles.countIndicator}>
                  {variants.length} {variants.length === 1 ? 'Variant' : 'Variants'}
                </span>
              </div>

              {/* Quick suggestions */}
              <div className={styles.quickPillsRow}>
                <span className={styles.quickPillLabel}>Add:</span>
                {VARIANT_SUGGESTIONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddVariant(preset)}
                    disabled={loading}
                    className={styles.quickPillBtn}
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Variant Rows */}
            <div className={styles.dynamicList}>
              {variants.map((v, idx) => (
                <div key={idx} className={styles.dynamicRow}>
                  <div className={styles.rowNumberBadge}>{idx + 1}</div>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. 128 GB, Small, 1 kg"
                    value={v.variantName}
                    onChange={(e) => handleVariantChange(idx, e.target.value)}
                    disabled={loading}
                    className={styles.customInput}
                  />
                  <Tooltip
                    title={
                      variants.length <= 1
                        ? 'At least one variant is required'
                        : 'Remove variant'
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveVariant(idx)}
                        disabled={loading || variants.length <= 1}
                        className={styles.removeRowBtn}
                        aria-label={`Remove variant #${idx + 1}`}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => handleAddVariant('')}
              disabled={loading}
              className={styles.addAnotherBtn}
            >
              <AddIcon className={styles.btnPlusIcon} />
              + Add Another Variant
            </Button>
          </div>

          {/* Colors Section */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.sectionTitleGroup}>
                <PaletteOutlinedIcon className={styles.sectionIcon} />
                <h4 className={styles.sectionTitle}>Product Colors</h4>
                <span className={styles.countIndicator}>
                  {colors.length} {colors.length === 1 ? 'Color' : 'Colors'}
                </span>
              </div>

              {/* Quick suggestions */}
              <div className={styles.quickPillsRow}>
                <span className={styles.quickPillLabel}>Add:</span>
                {COLOR_SUGGESTIONS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleAddColor(c)}
                    disabled={loading}
                    className={styles.quickPillBtn}
                  >
                    +{c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Color Rows */}
            <div className={styles.dynamicList}>
              {colors.map((c, idx) => (
                <div key={idx} className={styles.dynamicRow}>
                  <div className={styles.rowNumberBadge}>{idx + 1}</div>

                  {/* Native Color Picker swatch */}
                  <div className={styles.colorPickerBox}>
                    <input
                      type="color"
                      value={c.colorCode || '#36CFFF'}
                      onChange={(e) => handleColorCodeChange(idx, e.target.value)}
                      disabled={loading}
                      className={styles.colorInput}
                      title="Choose hex color"
                    />
                    <span className={styles.colorHexText}>{c.colorCode || '#36CFFF'}</span>
                  </div>

                  <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Black, Midnight Blue, Silver"
                    value={c.colorName}
                    onChange={(e) => handleColorNameChange(idx, e.target.value)}
                    disabled={loading}
                    className={styles.customInput}
                  />

                  <Tooltip
                    title={
                      colors.length <= 1
                        ? 'At least one color is required'
                        : 'Remove color'
                    }
                  >
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveColor(idx)}
                        disabled={loading || colors.length <= 1}
                        className={styles.removeRowBtn}
                        aria-label={`Remove color #${idx + 1}`}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => handleAddColor()}
              disabled={loading}
              className={styles.addAnotherBtn}
            >
              <AddIcon className={styles.btnPlusIcon} />
              + Add Another Color
            </Button>
          </div>
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions className={styles.dialogActions}>
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading && <CircularProgress size={16} className={styles.spinner} color="inherit" />}
            {isDuplicateMode
              ? 'Create Duplicate Product'
              : isEditMode
              ? 'Save Changes'
              : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductModal;
