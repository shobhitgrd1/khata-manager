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
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import Logo from '../../components/common/Logo';
import authService from '../../services/authService';
import styles from './ForgotPasswordPage.module.scss';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Step 1: verify, Step 2: reset password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Step 1: Verify Identity
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !dateOfBirth) {
      setError('Please provide both your registered email and date of birth');
      return;
    }

    setLoading(true);

    try {
      const data = await authService.verifyForgotPassword(email.trim(), dateOfBirth);
      setResetToken(data.resetToken);
      setStep(2);
      setSuccessMsg('Identity verified! Please set your new password.');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Verification failed. Information provided does not match our records.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(resetToken, newPassword, confirmPassword);
      setSuccessMsg('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Failed to reset password. The session may have expired.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Brand Logo & Title */}
      <Logo size="medium" />

      {/* Step Badge */}
      <div className={styles.stepBadge}>
        <span
          className={`${styles.stepText} ${step === 1 ? styles.stepActive : ''}`}
        >
          Step 1: Verify Identity
        </span>
        <span className={styles.stepBullet}>
          •
        </span>
        <span
          className={`${styles.stepText} ${step === 2 ? styles.stepActive : ''}`}
        >
          Step 2: Reset Password
        </span>
      </div>

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

      {/* Success Alert */}
      {successMsg && (
        <Alert
          severity="success"
          icon={<CheckCircleOutlinedIcon />}
          className={styles.successAlert}
        >
          {successMsg}
        </Alert>
      )}

      {/* Step 1 Form */}
      {step === 1 && (
        <form
          onSubmit={handleVerifySubmit}
          noValidate
          className={styles.form}
        >
          <p className={styles.formDesc}>
            Enter your registered email and date of birth to verify your account.
          </p>

          {/* Email */}
          <TextField
            fullWidth
            id="email"
            name="email"
            type="email"
            placeholder="Registered Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon className={styles.inputIcon} />
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
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonthIcon className={styles.inputIcon} />
                </InputAdornment>
              ),
            }}
          />

          {/* Verify Button */}
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
                <KeyIcon className={styles.btnIcon} />
              )
            }
          >
            {loading ? 'Verifying...' : 'Verify User'}
          </Button>
        </form>
      )}

      {/* Step 2 Form */}
      {step === 2 && (
        <form
          onSubmit={handleResetSubmit}
          noValidate
          className={styles.form}
        >
          <p className={styles.formDesc}>
            Create a new password for your account.
          </p>

          {/* New Password */}
          <TextField
            fullWidth
            id="newPassword"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="New Password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon className={styles.inputIcon} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle new password visibility"
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

          {/* Confirm New Password */}
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

          {/* Update Password Button */}
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
                <KeyIcon className={styles.btnIcon} />
              )
            }
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      )}

      {/* Divider */}
      <Divider className={styles.divider} />

      {/* Back to Login link */}
      <div className={styles.backLinkWrapper}>
        <Link
          component={RouterLink}
          to="/login"
          className={styles.linkCyan}
        >
          <ArrowBackIcon className={styles.backIcon} />
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
