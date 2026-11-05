import React from 'react';
import { getAccountLogo } from '../../utils/accountLogos';
import styles from './AccountInfoDisplay.module.scss';

const AccountInfoDisplay = ({ order, onClick, clickable = false }) => {
  if (!order) return null;

  const accountType = order.accountTypeSnapshot || order.accountId?.accountType || '';
  const accountName = order.accountNameSnapshot || order.accountId?.fullName || 'Account';
  const mobile = order.accountId?.mobileNumber || order.accountMobileSnapshot || '';
  const email = order.accountId?.email || order.accountEmailSnapshot || '';
  const secondaryText = mobile ? mobile : email;

  const logo = getAccountLogo(accountType || accountName);

  const handleClick = (e) => {
    if (clickable && onClick) {
      e.stopPropagation();
      onClick(order);
    }
  };

  const handleKeyDown = (e) => {
    if (clickable && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      e.stopPropagation();
      onClick(order);
    }
  };

  return (
    <div
      className={`${styles.accountContainer} ${clickable ? styles.clickable : ''}`}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      title={clickable ? `Open Order #${order.orderId}` : accountName}
      aria-label={clickable ? `View details for order ${order.orderId}` : undefined}
    >
      <div className={styles.logoWrapper}>
        {logo ? (
          <img
            src={logo}
            alt={accountType || accountName}
            className={styles.accountLogo}
          />
        ) : (
          <div className={styles.fallbackBadge}>
            {(accountType || accountName || 'ACC').slice(0, 3).toUpperCase()}
          </div>
        )}
      </div>

      <div className={styles.accountDetails}>
        <span className={styles.accountName}>{accountName}</span>
        {secondaryText ? (
          <span className={styles.secondaryText}>{secondaryText}</span>
        ) : null}
      </div>
    </div>
  );
};

export default AccountInfoDisplay;

