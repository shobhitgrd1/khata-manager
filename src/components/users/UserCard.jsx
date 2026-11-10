import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import styles from './UserCard.module.scss';

const UserCard = ({ user, onEdit, onDelete, canEdit = true, canDelete = true }) => {
  const navigate = useNavigate();
  const {
    _id,
    name = 'Unnamed User',
    username = '',
    email = '',
    role = 'user',
    permissions = [],
  } = user || {};

  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';
  const isAdmin = role === 'admin';

  const handleCardClick = () => {
    if (_id) navigate(`/users/${_id}`);
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
      {/* ─── Column 1: User Info ────────────────────────────── */}
      <div className={styles.colUser}>
        <div className={styles.userAvatarSquare}>
          <span className={styles.avatarLetter}>{initial}</span>
        </div>
        <div className={styles.userTextGroup}>
          <span className={styles.userName} title={name}>
            {name}
          </span>
          <span className={styles.userSub} title={`@${username}`}>
            @{username || 'user'}
          </span>
        </div>
      </div>

      {/* ─── Column 2: Email & Permissions ──────────────────── */}
      <div className={styles.colDetails}>
        <div className={styles.emailLine}>
          <EmailOutlinedIcon className={styles.detailIcon} />
          <span className={styles.emailText} title={email}>
            {email || 'No email provided'}
          </span>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.permsLine}>
          <SecurityOutlinedIcon className={styles.detailIcon} />
          <span className={styles.permsText}>
            {permissions.length} {permissions.length === 1 ? 'Permission' : 'Permissions'}
          </span>
        </div>
      </div>

      {/* ─── Column 3: Role & Actions ───────────────────────── */}
      <div className={styles.colActions}>
        <span className={`${styles.roleBadge} ${isAdmin ? styles.roleAdmin : styles.roleUser}`}>
          {isAdmin ? 'ADMIN' : 'USER'}
        </span>

        <div className={styles.actionRow} onClick={(e) => e.stopPropagation()}>
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
    permissions: PropTypes.array,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  canEdit: PropTypes.bool,
  canDelete: PropTypes.bool,
};

export default UserCard;
