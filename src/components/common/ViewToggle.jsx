import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import styles from './ViewToggle.module.scss';

/**
 * Reusable ViewToggle component for switching between Card View and List (Data Grid) View.
 * Zero inline CSS - completely styled via SCSS module.
 */
const ViewToggle = ({ viewMode = 'card', onChange, ariaLabel = 'View switcher' }) => {
  return (
    <div className={styles.viewToggleContainer} role="group" aria-label={ariaLabel}>
      <Tooltip title="Card View" arrow>
        <button
          type="button"
          onClick={() => onChange('card')}
          className={`${styles.toggleBtn} ${viewMode === 'card' ? styles.active : ''}`}
          aria-pressed={viewMode === 'card'}
          aria-label="Switch to Card View"
        >
          <ViewModuleIcon className={styles.btnIcon} />
          <span className={styles.btnText}>Cards</span>
        </button>
      </Tooltip>

      <Tooltip title="List View (Data Grid)" arrow>
        <button
          type="button"
          onClick={() => onChange('list')}
          className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
          aria-pressed={viewMode === 'list'}
          aria-label="Switch to List View"
        >
          <ViewListIcon className={styles.btnIcon} />
          <span className={styles.btnText}>List</span>
        </button>
      </Tooltip>
    </div>
  );
};

ViewToggle.propTypes = {
  viewMode: PropTypes.oneOf(['card', 'list']).isRequired,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
};

export default ViewToggle;

