import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import styles from './CommonEmptyState.module.scss';

const CommonEmptyState = ({
  icon: Icon,
  title = 'No Records Found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {Icon && (
        <div className={styles.emptyIconBox}>
          <Icon className={styles.emptyIcon} />
        </div>
      )}
      {title && <h3 className={styles.emptyTitle}>{title}</h3>}
      {description && <p className={styles.emptyDesc}>{description}</p>}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          startIcon={actionIcon}
          className={styles.emptyActionBtn}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

CommonEmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  actionIcon: PropTypes.node,
  className: PropTypes.string,
};

export default CommonEmptyState;

