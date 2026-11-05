import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { getAccountLogo } from '../../utils/accountLogos';
import styles from './AccountCard.module.scss';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * AccountCard component for Card View in Account Management.
 * Zero inline CSS.
 */
const AccountCard = ({
  account,
  onEdit,
  onDuplicate,
  onDelete,
  canEdit = true,
  canDelete = true,
  canCreate = true,
}) => {
  const {
    fullName = 'Unnamed Account',
    accountType = 'Other',
    customAccountType = '',
    mobileNumber = '',
    email = '',
    createdAt,
  } = account || {};

  const displayType = accountType === 'Other' && customAccountType ? customAccountType : accountType;
  const initial = fullName ? fullName.trim().charAt(0).toUpperCase() : 'A';
  const logoSrc = getAccountLogo(displayType) || getAccountLogo(accountType);

  return (
    <div className={styles.accountCard}>
      <div className={styles.ambientGlare} />

      <div className={styles.topRow}>
        <div className={styles.headerLeft}>
          {logoSrc ? (
            <div className={styles.logoSquare}>
              <img src={logoSrc} alt={displayType} className={styles.accountLogoImg} />
            </div>
          ) : (
            <div className={styles.avatarBox}>
              <span className={styles.avatarLetter}>{initial}</span>
            </div>
          )}
          <div className={styles.nameAndType}>
            <h3 className={styles.fullName}>{fullName}</h3>
            <span className={styles.typeBadge}>
              <ShoppingBagOutlinedIcon fontSize="inherit" />
              {displayType}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailRow}>
          <ShoppingBagOutlinedIcon className={styles.detailIcon} />
          <span className={styles.orderCountText}>
            Orders: <strong>{account?.orderCount ?? 0}</strong>
          </span>
        </div>

        {mobileNumber ? (
          <div className={styles.detailRow}>
            <PhoneIcon className={styles.detailIcon} />
            <a href={`tel:${mobileNumber}`} className={styles.detailLink}>
              {mobileNumber}
            </a>
          </div>
        ) : null}

        {email ? (
          <div className={styles.detailRow}>
            <EmailOutlinedIcon className={styles.detailIcon} />
            <a href={`mailto:${email}`} className={styles.detailLink}>
              {email}
            </a>
          </div>
        ) : null}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.dateText}>Added: {formatDate(createdAt)}</span>

        <div className={styles.cardActions}>
          {canEdit && onEdit && (
            <Tooltip title="Edit Account" arrow>
              <button
                type="button"
                onClick={() => onEdit(account)}
                className={styles.actionBtn}
                aria-label={`Edit ${fullName}`}
              >
                <EditOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canCreate && onDuplicate && (
            <Tooltip title="Duplicate Account" arrow>
              <button
                type="button"
                onClick={() => onDuplicate(account)}
                className={`${styles.actionBtn} ${styles.duplicateBtn}`}
                aria-label={`Duplicate ${fullName}`}
              >
                <ContentCopyIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canDelete && onDelete && (
            <Tooltip title="Delete Account" arrow>
              <button
                type="button"
                onClick={() => onDelete(account)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label={`Delete ${fullName}`}
              >
                <DeleteOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

AccountCard.propTypes = {
  account: PropTypes.shape({
    _id: PropTypes.string,
    fullName: PropTypes.string,
    accountType: PropTypes.string,
    customAccountType: PropTypes.string,
    mobileNumber: PropTypes.string,
    email: PropTypes.string,
    createdAt: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};

export default AccountCard;

