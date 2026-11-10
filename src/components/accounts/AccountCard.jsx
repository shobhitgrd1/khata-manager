import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import { getAccountLogo } from '../../utils/accountLogos';
import styles from './AccountCard.module.scss';

const AccountCard = ({
  account,
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
    fullName = 'Unnamed Account',
    accountType = 'Other',
    customAccountType = '',
    mobileNumber = '',
    email = '',
    orderCount = 0,
  } = account || {};

  const displayType = accountType === 'Other' && customAccountType ? customAccountType : accountType;
  const initial = fullName ? fullName.trim().charAt(0).toUpperCase() : 'A';
  const logoSrc = getAccountLogo(displayType) || getAccountLogo(accountType);

  const handleCardClick = () => {
    if (_id) navigate(`/accounts/${_id}`);
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
      {/* ─── Column 1: Logo & Account Name ─────────────────── */}
      <div className={styles.colAccount}>
        <div className={styles.logoSquare}>
          {logoSrc ? (
            <img src={logoSrc} alt={displayType} className={styles.accountLogoImg} />
          ) : (
            <span className={styles.avatarLetter}>{initial}</span>
          )}
        </div>
        <div className={styles.accountTextGroup}>
          <span className={styles.fullName} title={fullName}>
            {fullName}
          </span>
          <span className={styles.accountSub} title={mobileNumber || email || ''}>
            {mobileNumber || email || 'No contact'}
          </span>
        </div>
      </div>

      {/* ─── Column 2: Type, Details, Divider & Orders ─────── */}
      <div className={styles.colDetails}>
        <div className={styles.typeLine}>
          <span className={styles.typeBadge}>
            {displayType}
          </span>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.orderCountLine}>
          <ShoppingBagOutlinedIcon className={styles.orderBagIcon} />
          <span className={styles.orderCountText}>
            Orders: <strong>{orderCount}</strong>
          </span>
        </div>
      </div>

      {/* ─── Column 3: Actions & Chevron ───────────────────── */}
      <div className={styles.colActions}>
        <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
          {canEdit && onEdit && (
            <Tooltip title="Edit" arrow>
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
            <Tooltip title="Duplicate" arrow>
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
            <Tooltip title="Delete" arrow>
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

        <ChevronRightIcon className={styles.chevronIcon} />
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
    orderCount: PropTypes.number,
  }).isRequired,
  onEdit: PropTypes.func,
  onDuplicate: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
  canCreate: PropTypes.bool,
};

export default AccountCard;
