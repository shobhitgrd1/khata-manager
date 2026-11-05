import React, { useState } from 'react';
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import Logo from '../../components/common/Logo';
import AuthTabs from '../../components/common/AuthTabs';
import useAuth from '../../hooks/useAuth';
import styles from './RegisterPage.module.scss';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { name, email, username, password, confirmPassword, dateOfBirth } = formData;

    if (!name || !email || !username || !password || !confirmPassword || !dateOfBirth) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Brand Logo & Title */}
      <Logo size="medium" />

      {/* Login / Register Segmented Control */}
      <AuthTabs activeTab="register" />

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          className={styles.errorAlert}
        >
          {error}
        </Alert>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className={styles.form}
      >
        {/* Full Name */}
        <TextField
          fullWidth
          id="name"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlinedIcon className={styles.inputIcon} />
              </InputAdornment>
            ),
          }}
        />

        {/* Email Address */}
        <TextField
          fullWidth
          id="email"
          name="email"
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon className={styles.inputIcon} />
              </InputAdornment>
            ),
          }}
        />

        {/* Username */}
        <TextField
          fullWidth
          id="username"
          name="username"
          placeholder="Username (e.g. johndoe)"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AlternateEmailIcon className={styles.inputIcon} />
              </InputAdornment>
            ),
          }}
        />

        {/* Date of Birth */}
        <TextField
          fullWidth
          id="dateOfBirth"
          name="dateOfBirth"
          type="date"
          label="Date of Birth"
          InputLabelProps={{ shrink: true }}
          value={formData.dateOfBirth}
          onChange={handleChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonthIcon className={styles.inputIcon} />
              </InputAdornment>
            ),
          }}
        />

        {/* Password */}
        <TextField
          fullWidth
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Password (minimum 6 characters)"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon className={styles.inputIcon} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  size="small"
                  className={styles.iconBtn}
                >
                  {showPassword ? (
                    <VisibilityOff className={styles.toggleIcon} />
                  ) : (
                    <Visibility className={styles.toggleIcon} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Confirm Password */}
        <TextField
          fullWidth
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon className={styles.inputIcon} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                  size="small"
                  className={styles.iconBtn}
                >
                  {showConfirmPassword ? (
                    <VisibilityOff className={styles.toggleIcon} />
                  ) : (
                    <Visibility className={styles.toggleIcon} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          className={styles.submitBtn}
          startIcon={
            loading ? (
              <CircularProgress size={20} className={styles.btnSpinner} />
            ) : (
              <PersonAddAlt1Icon className={styles.btnIcon} />
            )
          }
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {/* OR Divider */}
      <div className={styles.orDivider}>
        <Divider className={styles.dividerLine} />
        <span className={styles.orText}>
          OR
        </span>
        <Divider className={styles.dividerLine} />
      </div>

      {/* Footer navigation */}
      <div className={styles.footerText}>
        <span>Already have an account? </span>
        <Link
          component={RouterLink}
          to="/login"
          className={styles.linkCyan}
        >
          Login Here
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
