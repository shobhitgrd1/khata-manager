import React, { useState } from 'react';
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';
import Logo from '../../components/common/Logo';
import AuthTabs from '../../components/common/AuthTabs';
import useAuth from '../../hooks/useAuth';
import styles from './LoginPage.module.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your email address or username');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      await login(identifier.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
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
      <AuthTabs activeTab="login" />

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
        {/* Email or Username */}
        <TextField
          fullWidth
          id="identifier"
          name="identifier"
          placeholder="Email Address or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={loading}
          autoComplete="username"
          autoFocus
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon className={styles.inputIcon} />
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
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

        {/* Remember Me and Forgot Password row */}
        <div className={styles.rowOptions}>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
              />
            }
            label={
              <span className={styles.rememberText}>
                Remember Me
              </span>
            }
          />

          <Link
            component={RouterLink}
            to="/forgot-password"
            className={styles.linkCyan}
          >
            Forgot Password?
          </Link>
        </div>

        {/* Primary Login Button */}
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
              <LoginIcon className={styles.btnIcon} />
            )
          }
        >
          {loading ? 'Authenticating...' : 'Login'}
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
        <span>Don't have an account? </span>
        <Link
          component={RouterLink}
          to="/register"
          className={styles.linkCyan}
        >
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
