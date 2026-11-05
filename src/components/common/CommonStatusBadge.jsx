import React from 'react';
import PropTypes from 'prop-types';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import styles from './CommonStatusBadge.module.scss';

const getVariantAndIcon = (status, explicitVariant) => {
  if (explicitVariant) return { variant: explicitVariant, defaultIcon: null };

  const s = String(status || '').toLowerCase().trim();

  if (s === 'delivered' || s === 'active' || s === 'paid' || s === 'profit') {
    return { variant: 'success', defaultIcon: CheckCircleOutlinedIcon };
  }
  if (s === 'order in process' || s === 'in process' || s === 'pending') {
    return { variant: 'warning', defaultIcon: HourglassEmptyIcon };
  }
  if (s === 'cancelled' || s === 'inactive' || s === 'failed' || s === 'loss') {
    return { variant: 'danger', defaultIcon: CancelOutlinedIcon };
  }
  return { variant: 'neutral', defaultIcon: null };
};

const CommonStatusBadge = ({
  status,
  variant,
  icon: CustomIcon,
  showIcon = true,
  className = '',
}) => {
  const { variant: computedVariant, defaultIcon } = getVariantAndIcon(status, variant);
  const IconComponent = CustomIcon || (showIcon ? defaultIcon : null);

  return (
    <div className={`${styles.badge} ${styles[computedVariant] || styles.neutral} ${className}`}>
      {IconComponent && <IconComponent className={styles.icon} />}
      <span>{status}</span>
    </div>
  );
};

CommonStatusBadge.propTypes = {
  status: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'neutral']),
  icon: PropTypes.elementType,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
};

export default CommonStatusBadge;

