import React from 'react';
import useAuth from '../../hooks/useAuth';

const PermissionGuard = ({
  permission,
  role,
  requiresUserManagement = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasRole, canAccessUserManagement } = useAuth();

  if (requiresUserManagement && !canAccessUserManagement()) {
    return fallback;
  }

  if (role && !hasRole(role)) {
    return fallback;
  }

  if (permission && !hasPermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;

