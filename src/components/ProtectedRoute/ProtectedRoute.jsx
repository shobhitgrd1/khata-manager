import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { CircularProgress } from '@mui/material';
import styles from './ProtectedRoute.module.scss';

const ProtectedRoute = ({
  requiredRole,
  requiredPermission,
  checkUserManagement = false,
  checkCreditCards = false,
  checkAccounts = false,
  checkDealers = false,
  checkProducts = false,
  checkOrders = false,
  checkKhataBook = false,
}) => {
  const {
    user,
    isAuthenticated,
    loading,
    hasRole,
    hasPermission,
    canAccessUserManagement,
    canAccessCreditCards,
    canAccessAccounts,
    canAccessDealers,
    canAccessProducts,
    canAccessOrders,
    canAccessKhataBook,
  } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress className={styles.spinner} size={48} thickness={4} />
        <span className={styles.loadingText}>
          Loading Khata Manager...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If this route strictly requires User Management access (admin + user permission)
  if (checkUserManagement && !canAccessUserManagement()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If this route strictly requires Credit Cards access
  if (checkCreditCards && !canAccessCreditCards()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If this route strictly requires Accounts access
  if (checkAccounts && !canAccessAccounts()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If this route strictly requires Dealers access
  if (checkDealers && !canAccessDealers()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If this route strictly requires Products access
  if (checkProducts && !canAccessProducts()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If this route strictly requires Orders access
  if (checkOrders && !canAccessOrders()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If this route strictly requires Khata Book access
  if (checkKhataBook && canAccessKhataBook && !canAccessKhataBook()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If specific role required
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If specific permission required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
