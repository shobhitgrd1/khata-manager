import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('khata_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Check current session from backend on mount
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const data = await authService.getMe();
        if (isMounted && data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        if (isMounted) {
          // If 401 or invalid session, clear local user state
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier, password) => {
    const data = await authService.login(identifier, password);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  const updateCurrentUser = (updatedUser) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedUser };
      localStorage.setItem('khata_user', JSON.stringify(next));
      return next;
    });
  };

  // Helper: check if user has one of the roles
  const hasRole = useCallback(
    (...roles) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  // Helper: check if user has any of the permissions
  const hasPermission = useCallback(
    (...permissions) => {
      if (!user || !Array.isArray(user.permissions)) return false;
      return permissions.some((perm) => user.permissions.includes(perm));
    },
    [user]
  );

  // User Management access: strictly Admin role only
  const canAccessUserManagement = useCallback(() => {
    if (!user) return false;
    return user.role === 'admin';
  }, [user]);

  // Credit card access helper
  const canAccessCreditCards = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('view_credit_cards');
  }, [user]);

  const canCreateCreditCard = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('create_credit_card');
  }, [user]);

  const canEditCreditCard = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('edit_credit_card');
  }, [user]);

  const canDeleteCreditCard = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('delete_credit_card');
  }, [user]);

  const canAccessAccounts = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('view_accounts');
  }, [user]);

  const canCreateAccount = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('create_account');
  }, [user]);

  const canEditAccount = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('edit_account');
  }, [user]);

  const canDeleteAccount = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('delete_account');
  }, [user]);

  const canAccessDealers = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('view_dealers');
  }, [user]);

  const canCreateDealer = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('create_dealer');
  }, [user]);

  const canEditDealer = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('edit_dealer');
  }, [user]);

  const canDeleteDealer = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('delete_dealer');
  }, [user]);

  const canAccessProducts = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('view_products');
  }, [user]);

  const canCreateProduct = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('create_product');
  }, [user]);

  const canEditProduct = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('edit_product');
  }, [user]);

  const canDeleteProduct = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('delete_product');
  }, [user]);

  const canAccessOrders = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('view_orders');
  }, [user]);

  const canCreateOrder = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('create_order');
  }, [user]);

  const canEditOrder = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('edit_order');
  }, [user]);

  const canDeleteOrder = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return Array.isArray(user.permissions) && user.permissions.includes('delete_order');
  }, [user]);

  // Khata Book access helpers
  const canAccessKhataBook = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (!Array.isArray(user.permissions)) return true;
    return (
      user.permissions.includes('view_khatabook') ||
      user.permissions.includes('khatabook') ||
      user.permissions.includes('view_orders') ||
      user.permissions.includes('view_dealers') ||
      true
    );
  }, [user]);

  const canCreateKhataBook = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return true;
  }, [user]);

  const canEditKhataBook = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return true;
  }, [user]);

  const canDeleteKhataBook = useCallback(() => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return true;
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    updateCurrentUser,
    hasRole,
    hasPermission,
    canAccessUserManagement,
    canAccessCreditCards,
    canCreateCreditCard,
    canEditCreditCard,
    canDeleteCreditCard,
    canAccessAccounts,
    canCreateAccount,
    canEditAccount,
    canDeleteAccount,
    canAccessDealers,
    canCreateDealer,
    canEditDealer,
    canDeleteDealer,
    canAccessProducts,
    canCreateProduct,
    canEditProduct,
    canDeleteProduct,
    canAccessOrders,
    canCreateOrder,
    canEditOrder,
    canDeleteOrder,
    canAccessKhataBook,
    canCreateKhataBook,
    canEditKhataBook,
    canDeleteKhataBook,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

