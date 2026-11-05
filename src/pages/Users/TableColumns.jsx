import React from 'react';
import { Chip, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import styles from './UsersPage.module.scss';

export const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getUserColumns = ({
  currentUser,
  canEdit = true,
  canDelete = true,
  navigate,
  onDelete,
}) => [
  {
    field: '_id',
    headerName: 'ID',
    width: 110,
    sortable: false,
    renderCell: (params) => (
      <span className={styles.idCell} title={params.value}>
        {params.value ? `...${params.value.slice(-6)}` : '—'}
      </span>
    ),
  },
  {
    field: 'name',
    headerName: 'Full Name',
    flex: 1.2,
    minWidth: 160,
    renderCell: (params) => (
      <RouterLink
        to={`/users/${params.row._id}`}
        className={styles.nameLink}
      >
        {params.value}
      </RouterLink>
    ),
  },
  {
    field: 'email',
    headerName: 'Email Address',
    flex: 1.4,
    minWidth: 200,
    renderCell: (params) => (
      <span className={styles.emailCell}>{params.value}</span>
    ),
  },
  {
    field: 'username',
    headerName: 'Username',
    flex: 1,
    minWidth: 130,
    renderCell: (params) => (
      <span className={styles.usernameCell}>@{params.value}</span>
    ),
  },
  {
    field: 'role',
    headerName: 'Role',
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        className={
          params.value === 'admin'
            ? styles.roleChipAdmin
            : styles.roleChipUser
        }
      />
    ),
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        className={
          params.value === 'active'
            ? styles.statusChipActive
            : styles.statusChipInactive
        }
      />
    ),
  },
  {
    field: 'createdAt',
    headerName: 'Joined Date',
    width: 140,
    renderCell: (params) => (
      <span className={styles.dateCell}>{formatDate(params.value)}</span>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 130,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const isSelf = currentUser?._id === params.row._id;
      return (
        <div className={styles.actionsCell}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              className={styles.actionBtnView}
              onClick={() => navigate && navigate(`/users/${params.row._id}`)}
            >
              <VisibilityIcon className={styles.actionIcon} />
            </IconButton>
          </Tooltip>

          {canEdit && (
            <Tooltip title="Edit Permissions">
              <IconButton
                size="small"
                className={styles.actionBtnEdit}
                onClick={() => navigate && navigate(`/users/${params.row._id}`)}
              >
                <EditIcon className={styles.actionIcon} />
              </IconButton>
            </Tooltip>
          )}

          {canDelete && !isSelf && (
            <Tooltip title="Delete User">
              <IconButton
                size="small"
                className={styles.actionBtnDelete}
                onClick={() => onDelete && onDelete(params.row)}
              >
                <DeleteOutlinedIcon className={styles.actionIcon} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];

export default getUserColumns;

