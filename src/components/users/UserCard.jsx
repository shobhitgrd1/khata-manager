import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate } from 'react-router-dom';
import styles from './UserCard.module.scss';

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * UserCard component for User Management Card View.
 * Zero inline CSS.
 */
const UserCard = ({ user, onEdit, onDelete, canEdit = true, canDelete = true }) => {
  const navigate = useNavigate();
  const {
    _id,
    name = 'Unnamed User',
    username = '',
    email = '',
    role = 'user',
    status = 'active',
    permissions = [],
    createdAt,
  } = user || {};

  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';
  const visiblePerms = permissions.slice(0, 3);
  const remainingPerms = permissions.length - 3;

  return (
    <div className={styles.userCard}>
      <div className={styles.ambientGlare} />

      <div className={styles.topRow}>
        <div className={styles.headerLeft}>
          <div className={styles.avatarBox}>
            <span className={styles.avatarLetter}>{initial}</span>
          </div>
          <div className={styles.nameAndUsername}>
            <h3 className={styles.userName}>{name}</h3>
            <span className={styles.userHandle}>@{username || 'user'}</span>
          </div>
        </div>

        <div className={styles.statusBadges}>
          <span className={`${styles.roleBadge} ${role === 'admin' ? styles.admin : ''}`}>
            {role}
          </span>
          <span className={`${styles.statusBadge} ${status === 'active' ? styles.active : styles.inactive}`}>
            <span className={styles.statusDot} />
            {status}
          </span>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        {email && (
          <div className={styles.detailRow}>
            <EmailOutlinedIcon className={styles.detailIcon} />
            <span>{email}</span>
          </div>
        )}
      </div>

      {permissions.length > 0 && (
        <div className={styles.permissionsSection}>
          <span className={styles.permissionsTitle}>Permissions ({permissions.length})</span>
          <div className={styles.permissionsChips}>
            {visiblePerms.map((p) => (
              <span key={p} className={styles.permChip}>
                {p}
              </span>
            ))}
            {remainingPerms > 0 && (
              <span className={styles.morePerms}>+{remainingPerms} more</span>
            )}
          </div>
        </div>
      )}

      <div className={styles.cardFooter}>
        <span className={styles.dateText}>Joined {formatDate(createdAt)}</span>

        <div className={styles.cardActions}>
          <Tooltip title="View User Details" arrow>
            <button
              type="button"
              onClick={() => navigate(`/users/${_id}`)}
              className={styles.actionBtn}
              aria-label={`View ${name}`}
            >
              <VisibilityOutlinedIcon className={styles.actionIcon} />
            </button>
          </Tooltip>

          {canEdit && onEdit && (
            <Tooltip title="Edit User" arrow>
              <button
                type="button"
                onClick={() => onEdit(user)}
                className={styles.actionBtn}
                aria-label={`Edit ${name}`}
              >
                <EditOutlinedIcon className={styles.actionIcon} />
              </button>
            </Tooltip>
          )}

          {canDelete && onDelete && (
            <Tooltip title="Delete User" arrow>
              <button
                type="button"
                onClick={() => onDelete(user)}
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                aria-label={`Delete ${name}`}
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

UserCard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    status: PropTypes.string,
    permissions: PropTypes.arrayOf(PropTypes.string),
    createdAt: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};

export default UserCard;

