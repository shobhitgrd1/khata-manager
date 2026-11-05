import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Button,
  TextField,
  Chip,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import MailIcon from '@mui/icons-material/Mail';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useAuth from '../../hooks/useAuth';
import userService from '../../services/userService';
import styles from './UserDetailsPage.module.scss';

const ALL_AVAILABLE_PERMISSIONS = [
  'dashboard',
  'user',
  'create_user',
  'edit_user',
  'delete_user',
  'view_user',
  'view_credit_cards',
  'create_credit_card',
  'edit_credit_card',
  'delete_credit_card',
  'view_accounts',
  'create_account',
  'edit_account',
  'delete_account',
  'view_dealers',
  'create_dealer',
  'edit_dealer',
  'delete_dealer',
  'view_products',
  'create_product',
  'edit_product',
  'delete_product',
  'view_orders',
  'create_order',
  'edit_order',
  'delete_order',
];

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: currentUser, updateCurrentUser, hasPermission } = useAuth();

  const [targetUser, setTargetUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');

  // Edit form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    dateOfBirth: '',
    status: 'active',
    role: 'user',
    permissions: [],
  });

  const isSelf = currentUser?._id === id;
  const isAdmin = currentUser?.role === 'admin';
  const canEditAny = isAdmin && hasPermission('edit_user');
  const canEdit = isSelf || canEditAny;

  // Fetch target user data
  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getUserById(id);
      if (data?.user) {
        setTargetUser(data.user);
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          username: data.user.username || '',
          dateOfBirth: data.user.dateOfBirth
            ? new Date(data.user.dateOfBirth).toISOString().split('T')[0]
            : '',
          status: data.user.status || 'active',
          role: data.user.role || 'user',
          permissions: Array.isArray(data.user.permissions) ? data.user.permissions : [],
        });
      }
    } catch (err) {
      console.error('Fetch user details error:', err);
      setError(err.response?.data?.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePermissionsChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      permissions: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        dateOfBirth: formData.dateOfBirth,
      };

      if (canEditAny) {
        payload.status = formData.status;
        payload.role = formData.role;
        payload.permissions = formData.permissions;
      }

      const res = await userService.updateUser(id, payload);
      setTargetUser(res.user);
      setSuccessMsg('User profile updated successfully!');
      setIsEditing(false);

      if (isSelf) {
        updateCurrentUser(res.user);
      }
    } catch (err) {
      console.error('Update user error:', err);
      setError(err.response?.data?.message || 'Failed to update user profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (targetUser) {
      setFormData({
        name: targetUser.name || '',
        email: targetUser.email || '',
        username: targetUser.username || '',
        dateOfBirth: targetUser.dateOfBirth
          ? new Date(targetUser.dateOfBirth).toISOString().split('T')[0]
          : '',
        status: targetUser.status || 'active',
        role: targetUser.role || 'user',
        permissions: Array.isArray(targetUser.permissions) ? targetUser.permissions : [],
      });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress className={styles.loadingSpinner} size={48} thickness={4} />
        <span className={styles.loadingText}>
          Loading user details...
        </span>
      </div>
    );
  }

  if (error && !targetUser) {
    return (
      <div className={styles.errorWrapper}>
        <Alert severity="error" className={styles.errorAlert}>
          {error}
        </Alert>
        <Button
          onClick={() => navigate(-1)}
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          className={styles.backBtn}
        >
          Go Back
        </Button>
      </div>
    );
  }

  const formattedDob = targetUser?.dateOfBirth
    ? new Date(targetUser.dateOfBirth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const formattedCreatedAt = targetUser?.createdAt
    ? new Date(targetUser.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const formattedUpdatedAt = targetUser?.updatedAt
    ? new Date(targetUser.updatedAt).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            onClick={() => navigate('/users')}
            startIcon={<ArrowBackIcon />}
            variant="outlined"
            size="small"
            className={styles.backBtn}
          >
            All Users
          </Button>
          <h1 className={styles.pageTitle}>
            User Details
          </h1>
        </div>

        {/* Edit Button */}
        {canEdit && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            startIcon={<EditIcon />}
            variant="contained"
            className={styles.editBtn}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          className={styles.errorAlert}
        >
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg('')}
          className={styles.successAlert}
        >
          {successMsg}
        </Alert>
      )}

      {/* VIEW MODE */}
      {!isEditing ? (
        <div className={styles.detailsCard}>
          {/* Top User Identity Section */}
          <div className={styles.userTopIdentity}>
            <Avatar className={styles.avatar}>
              {targetUser?.name ? targetUser.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>

            <div className={styles.identityInfo}>
              <div className={styles.identityTopRow}>
                <h2 className={styles.userName}>
                  {targetUser?.name}
                </h2>
                <Chip
                  label={targetUser?.role ? targetUser.role.toUpperCase() : 'USER'}
                  size="small"
                  className={targetUser?.role === 'admin' ? styles.roleChipAdmin : styles.roleChipUser}
                />
                <Chip
                  label={targetUser?.status ? targetUser.status.toUpperCase() : 'ACTIVE'}
                  size="small"
                  className={targetUser?.status === 'active' ? styles.statusChipActive : styles.statusChipInactive}
                />
              </div>
              <p className={styles.userMeta}>
                @{targetUser?.username} • ID: {targetUser?._id}
              </p>
            </div>
          </div>

          {/* User Information Grid */}
          <Grid container spacing={3.5} className={styles.infoGrid}>
            <Grid item xs={12} sm={6}>
              <div className={styles.infoRow}>
                <MailIcon className={styles.iconCyan} />
                <div>
                  <div className={styles.infoLabel}>
                    Email Address
                  </div>
                  <div className={styles.infoValue}>
                    {targetUser?.email}
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <div className={styles.infoRow}>
                <AlternateEmailIcon className={styles.iconCyan} />
                <div>
                  <div className={styles.infoLabel}>
                    Username
                  </div>
                  <div className={styles.infoValue}>
                    @{targetUser?.username}
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <div className={styles.infoRow}>
                <CalendarMonthIcon className={styles.iconCyan} />
                <div>
                  <div className={styles.infoLabel}>
                    Date of Birth
                  </div>
                  <div className={styles.infoValue}>
                    {formattedDob}
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <div className={styles.infoRow}>
                <ShieldIcon className={styles.iconCyan} />
                <div>
                  <div className={styles.infoLabel}>
                    System Role
                  </div>
                  <div className={styles.infoValue}>
                    {targetUser?.role === 'admin' ? 'Administrator' : 'Standard User'}
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <div className={styles.infoRow}>
                <CheckCircleIcon className={styles.iconCyan} />
                <div>
                  <div className={styles.infoLabel}>
                    Created On
                  </div>
                  <div className={styles.infoValue}>
                    {formattedCreatedAt}
                  </div>
                </div>
              </div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <div className={styles.infoRow}>
                <CheckCircleIcon className={styles.iconCyan} />
                <div>
                  <div className={styles.infoLabel}>
                    Last Updated
                  </div>
                  <div className={styles.infoValue}>
                    {formattedUpdatedAt}
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>

          {/* Permissions Section */}
          <div className={styles.permissionsSection}>
            <div className={styles.permissionsSectionTitle}>
              Assigned System Permissions
            </div>
            <div className={styles.permissionsList}>
              {targetUser?.permissions?.length > 0 ? (
                targetUser.permissions.map((perm) => (
                  <Chip
                    key={perm}
                    label={perm}
                    size="small"
                    className={styles.permChip}
                  />
                ))
              ) : (
                <p className={styles.noPermsText}>
                  No extra permissions assigned.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* EDIT MODE FORM */
        <form
          onSubmit={handleSave}
          className={styles.detailsCard}
        >
          <h2 className={styles.editTitle}>
            Edit Profile
          </h2>
          <p className={styles.editDesc}>
            Update account information. Fields permitted for editing depend on your authorization level.
          </p>

          <Grid container spacing={2.5}>
            {/* Full Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={saving}
              />
            </Grid>

            {/* Email Address */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={saving}
              />
            </Grid>

            {/* Username */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={saving}
              />
            </Grid>

            {/* Date of Birth */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                required
                disabled={saving}
              />
            </Grid>

            {/* Admin only fields */}
            {canEditAny && (
              <>
                {/* Status */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Account Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                  </TextField>
                </Grid>

                {/* Role */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="User Role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <MenuItem value="admin">Administrator (admin)</MenuItem>
                    <MenuItem value="user">Standard User (user)</MenuItem>
                  </TextField>
                </Grid>

                {/* Permissions Multi-select */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="permissions-label">System Permissions</InputLabel>
                    <Select
                      labelId="permissions-label"
                      multiple
                      value={formData.permissions}
                      onChange={handlePermissionsChange}
                      input={<OutlinedInput label="System Permissions" />}
                      renderValue={(selected) => (
                        <div className={styles.selectedPermsWrap}>
                          {selected.map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              className={styles.selectPermChip}
                            />
                          ))}
                        </div>
                      )}
                      disabled={saving}
                    >
                      {ALL_AVAILABLE_PERMISSIONS.map((perm) => (
                        <MenuItem key={perm} value={perm}>
                          <Checkbox
                            checked={formData.permissions.indexOf(perm) > -1}
                            className={styles.checkboxPrimary}
                          />
                          <ListItemText primary={perm} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}
          </Grid>

          {/* Form Actions */}
          <div className={styles.editActionsRow}>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              className={styles.saveBtn}
              startIcon={
                saving ? (
                  <CircularProgress size={20} className={styles.spinner} />
                ) : (
                  <SaveIcon />
                )
              }
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>

            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
              startIcon={<CloseIcon />}
              className={styles.cancelBtn}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserDetailsPage;
