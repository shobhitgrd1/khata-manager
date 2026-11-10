import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

import userService from '../../services/userService';
import styles from './UserModal.module.scss';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const defaultForm = {
  name: '',
  username: '',
  email: '',
  mobileNumber: '',
  dateOfBirth: '',
  password: '',
  role: 'user',
};

const UserModal = ({
  open,
  onClose,
  onSaved,
  user = null,
  loading: externalLoading = false,
}) => {
  const isEdit = Boolean(user && user._id);

  const [form, setForm] = useState(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);

  const loading = externalLoading || internalLoading;

  useEffect(() => {
    if (open) {
      if (user) {
        let dobStr = '';
        if (user.dateOfBirth) {
          const d = new Date(user.dateOfBirth);
          if (!isNaN(d.getTime())) {
            dobStr = d.toISOString().split('T')[0];
          }
        }

        setForm({
          name: user.name || '',
          username: user.username || '',
          email: user.email || '',
          mobileNumber: user.mobileNumber || user.phone || '',
          dateOfBirth: dobStr,
          password: '',
          role: user.role || 'user',
        });
      } else {
        setForm(defaultForm);
      }
      setShowPassword(false);
      setErrors({});
      setSubmitError('');
    }
  }, [open, user]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSubmitError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!USERNAME_REGEX.test(form.username.trim())) {
      newErrors.username = 'Letters, numbers, and underscores only';
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!form.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!isEdit) {
      if (!form.password) {
        newErrors.password = 'Password is required';
      } else if (form.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    } else if (form.password && form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!['admin', 'user'].includes(form.role)) {
      newErrors.role = 'Please select a valid role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setInternalLoading(true);
    setSubmitError('');

    try {
      const payload = {
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        email: form.email.trim().toLowerCase(),
        mobileNumber: form.mobileNumber.trim(),
        dateOfBirth: form.dateOfBirth,
        role: form.role,
      };

      if (form.password) {
        payload.password = form.password;
      }

      let res;
      if (isEdit) {
        res = await userService.updateUser(user._id, payload);
      } else {
        res = await userService.createUser(payload);
      }

      if (res?.success) {
        if (onSaved) onSaved(res.message || (isEdit ? 'User updated successfully' : 'User created successfully'));
        onClose();
      } else {
        setSubmitError(res?.message || 'Operation failed. Please try again.');
      }
    } catch (err) {
      console.error('Save user error:', err);
      const msg = err.response?.data?.message || err.message || 'Server error saving user.';
      setSubmitError(msg);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: styles.dialogPaper }}
    >
      <form onSubmit={handleSubmit} noValidate>
        {/* Title */}
        <DialogTitle className={styles.dialogTitle}>
          <div className={styles.titleIconBox}>
            <PersonAddAlt1OutlinedIcon className={styles.titleIcon} />
          </div>
          <div>
            <h2 className={styles.modalHeading}>
              {isEdit ? 'Edit User' : 'Create New User'}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEdit
                ? `Update details and role for @${user?.username || ''}`
                : 'Add a new system user with Admin or User access'}
            </p>
          </div>
        </DialogTitle>

        {/* Content */}
        <DialogContent className={styles.dialogContent}>
          {submitError && (
            <Alert severity="error" className={`${styles.alertBox} ${styles.errorAlert}`}>
              {submitError}
            </Alert>
          )}

          <div className={styles.formGrid}>
            {/* Row 1: Full Name & Username */}
            <div className={styles.rowTwo}>
              <TextField
                label="Full Name *"
                size="small"
                fullWidth
                value={form.name}
                onChange={handleChange('name')}
                error={Boolean(errors.name)}
                helperText={errors.name}
                disabled={loading}
                placeholder="e.g. John Doe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon className={styles.inputIcon} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Username *"
                size="small"
                fullWidth
                value={form.username}
                onChange={handleChange('username')}
                error={Boolean(errors.username)}
                helperText={errors.username}
                disabled={loading}
                placeholder="e.g. johndoe"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AlternateEmailIcon className={styles.inputIcon} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Row 2: Email & Mobile Number */}
            <div className={styles.rowTwo}>
              <TextField
                label="Email Address *"
                type="email"
                size="small"
                fullWidth
                value={form.email}
                onChange={handleChange('email')}
                error={Boolean(errors.email)}
                helperText={errors.email}
                disabled={loading}
                placeholder="e.g. john@example.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon className={styles.inputIcon} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Mobile Number"
                size="small"
                fullWidth
                value={form.mobileNumber}
                onChange={handleChange('mobileNumber')}
                error={Boolean(errors.mobileNumber)}
                helperText={errors.mobileNumber}
                disabled={loading}
                placeholder="e.g. +91 9876543210"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon className={styles.inputIcon} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Row 3: Date of Birth & Password */}
            <div className={styles.rowTwo}>
              <TextField
                label="Date of Birth *"
                type="date"
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                error={Boolean(errors.dateOfBirth)}
                helperText={errors.dateOfBirth}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayOutlinedIcon className={styles.inputIcon} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={isEdit ? 'New Password (Optional)' : 'Password *'}
                type={showPassword ? 'text' : 'password'}
                size="small"
                fullWidth
                value={form.password}
                onChange={handleChange('password')}
                error={Boolean(errors.password)}
                helperText={errors.password || (isEdit ? 'Leave blank to keep existing password' : 'Min 6 characters')}
                disabled={loading}
                placeholder={isEdit ? '••••••••' : 'Min 6 characters'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon className={styles.inputIcon} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Row 4: Role Assignment */}
            <TextField
              select
              label="Assigned Role *"
              size="small"
              fullWidth
              value={form.role}
              onChange={handleChange('role')}
              error={Boolean(errors.role)}
              helperText={errors.role}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AdminPanelSettingsOutlinedIcon className={styles.inputIcon} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="admin">
                <strong>Admin</strong> &nbsp;— Full access to all modules and permissions
              </MenuItem>
              <MenuItem value="user">
                <strong>User</strong> &nbsp;— Access to all modules except User Management
              </MenuItem>
            </TextField>

            {/* Role explanation callout */}
            <div className={styles.roleInfoCard}>
              {form.role === 'admin' ? (
                <>
                  <strong>Admin Role:</strong> Grants complete administrative access to all application sections (Dashboard, Orders, Khata Book, System Management, and User Management).
                </>
              ) : (
                <>
                  <strong>User Role:</strong> Grants standard operational access to Dashboard, Orders, Khata Book, and System Management (Credit Cards, Accounts, Dealers, Products). <em>Cannot view or access User Management.</em>
                </>
              )}
            </div>
          </div>
        </DialogContent>

        {/* Actions */}
        <DialogActions className={styles.dialogActions}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            className={styles.submitBtn}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserModal;

