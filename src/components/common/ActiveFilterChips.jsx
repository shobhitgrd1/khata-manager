import React from 'react';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import styles from './ActiveFilterChips.module.scss';

/**
 * Reusable ActiveFilterChips displays currently applied filter chips
 * with individual remove actions and a global Clear All button.
 * Zero inline CSS.
 */
const ActiveFilterChips = ({ filters = [], onClearAll }) => {
  if (!filters || filters.length === 0) return null;

  return (
    <div className={styles.activeChipsContainer} role="region" aria-label="Active filters">
      <span className={styles.chipsLabel}>
        <FilterAltOutlinedIcon fontSize="inherit" />
        Active ({filters.length}):
      </span>

      <div className={styles.chipsList}>
        {filters.map((f) => (
          <div key={f.id || f.key} className={styles.filterChip}>
            <span className={styles.chipKey}>{f.label}:</span>
            <span className={styles.chipVal}>{f.displayValue || f.value}</span>
            <button
              type="button"
              onClick={f.onRemove}
              className={styles.chipRemoveBtn}
              aria-label={`Remove filter for ${f.label}`}
              title={`Remove ${f.label}`}
            >
              <CloseIcon className={styles.chipRemoveIcon} />
            </button>
          </div>
        ))}
      </div>

      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className={styles.clearAllBtn}
          title="Clear all active filters"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

ActiveFilterChips.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      value: PropTypes.any,
      displayValue: PropTypes.string,
      onRemove: PropTypes.func.isRequired,
    })
  ),
  onClearAll: PropTypes.func,
};

export default ActiveFilterChips;

