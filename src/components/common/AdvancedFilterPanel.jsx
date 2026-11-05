import React from 'react';
import PropTypes from 'prop-types';
import TuneIcon from '@mui/icons-material/Tune';
import FilterListIcon from '@mui/icons-material/FilterList';
import CheckIcon from '@mui/icons-material/Check';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import styles from './AdvancedFilterPanel.module.scss';

/**
 * Reusable FilterTriggerButton component for toolbar placement.
 */
export const FilterTriggerButton = ({
  isOpen = false,
  onToggle,
  filterCount = 0,
  label = 'Filters',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`${styles.filterTriggerBtn} ${isOpen ? styles.open : ''} ${className}`}
      aria-expanded={isOpen}
    >
      <TuneIcon fontSize="small" />
      <span>{label}</span>
      {filterCount > 0 && (
        <span className={styles.filterBadge}>{filterCount}</span>
      )}
    </button>
  );
};

FilterTriggerButton.propTypes = {
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  filterCount: PropTypes.number,
  label: PropTypes.string,
  className: PropTypes.string,
};

/**
 * Reusable AdvancedFilterPanel wrapper.
 * Provides the toggle button (with active count badge),
 * collapsible filter panel container, and Apply / Reset buttons.
 * Supports hideTrigger={true} to render only the drawer underneath the toolbar.
 * Zero inline CSS.
 */
const AdvancedFilterPanel = ({
  isOpen = false,
  onToggle,
  filterCount = 0,
  onApply,
  onReset,
  children,
  title = 'Advanced Filters',
  applyLabel = 'Apply Filters',
  resetLabel = 'Reset All',
  hideTrigger = false,
  className = '',
}) => {
  const drawerContent = (
    <div className={styles.panelDrawer} role="region" aria-label={title}>
      <div className={styles.panelHeader}>
        <div className={styles.panelTitle}>
          <FilterListIcon className={styles.titleIcon} />
          <span>{title}</span>
        </div>
        {filterCount > 0 && (
          <span className={styles.filterBadge}>
            {filterCount} active
          </span>
        )}
      </div>

      <div className={styles.panelContent}>
        {children}
      </div>

      <div className={styles.panelFooter}>
        <button
          type="button"
          onClick={onReset}
          className={styles.resetBtn}
        >
          <RotateLeftIcon className={styles.btnActionIcon} />
          {resetLabel}
        </button>
        <button
          type="button"
          onClick={onApply}
          className={styles.applyBtn}
        >
          <CheckIcon fontSize="inherit" />
          {applyLabel}
        </button>
      </div>
    </div>
  );

  if (hideTrigger) {
    if (!isOpen) return null;
    return <div className={`${styles.standaloneDrawerWrapper} ${className}`}>{drawerContent}</div>;
  }

  return (
    <div className={`${styles.filterWrapper} ${isOpen ? styles.open : ''} ${className}`}>
      <FilterTriggerButton
        isOpen={isOpen}
        onToggle={onToggle}
        filterCount={filterCount}
      />
      {isOpen && drawerContent}
    </div>
  );
};

// Note: To eliminate inline styles completely, let's remove the style prop on RotateLeftIcon and use CSS.
AdvancedFilterPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  filterCount: PropTypes.number,
  onApply: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  applyLabel: PropTypes.string,
  resetLabel: PropTypes.string,
};

export default AdvancedFilterPanel;
