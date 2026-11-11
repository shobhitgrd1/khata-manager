import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Guard
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';

// Pages
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import UsersPage from '../pages/Users/UsersPage';
import UserDetailsPage from '../pages/UserDetails/UserDetailsPage';
import CreditCardsPage from '../pages/CreditCards/CreditCardsPage';
import CreditCardDetailsPage from '../pages/CreditCards/CreditCardDetailsPage';
import AccountsPage from '../pages/Accounts/AccountsPage';
import AccountDetailsPage from '../pages/Accounts/AccountDetailsPage';
import DealersPage from '../pages/Dealers/DealersPage';
import ProductsPage from '../pages/Products/ProductsPage';
import ProductDetailsPage from '../pages/Products/ProductDetailsPage';
import OrdersPage from '../pages/Orders/OrdersPage';
import OrderDetailsPage from '../pages/Orders/OrderDetailsPage';
import KhataBookPage from '../pages/KhataBook/KhataBookPage';
import KhataBookDetailsPage from '../pages/KhataBook/KhataBookDetailsPage';
import SettingsPage from '../pages/Settings/SettingsPage';
import NotFoundPage from '../pages/NotFound/NotFoundPage';
import UnauthorizedPage from '../pages/Unauthorized/UnauthorizedPage';

// Redirect authenticated users away from public auth pages
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Auth Routes wrapped in AuthLayout */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <AuthLayout>
              <RegisterPage />
            </AuthLayout>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <AuthLayout>
            <ForgotPasswordPage />
          </AuthLayout>
        }
      />

      {/* Protected Routes wrapped in DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* User Management listing strictly requires Admin role */}
          <Route element={<ProtectedRoute checkUserManagement={true} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          {/* User Details / My Profile: Admins can view any user; Standard Users can view/edit their own profile */}
          <Route path="/users/:id" element={<UserDetailsPage />} />

          {/* Credit Card Management */}
          <Route element={<ProtectedRoute checkCreditCards={true} />}>
            <Route path="/credit-cards" element={<CreditCardsPage />} />
            <Route path="/credit-cards/:id" element={<CreditCardDetailsPage />} />
          </Route>

          {/* Account Management */}
          <Route element={<ProtectedRoute checkAccounts={true} />}>
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/:id" element={<AccountDetailsPage />} />
          </Route>

          {/* Dealer Management */}
          <Route element={<ProtectedRoute checkDealers={true} />}>
            <Route path="/dealers" element={<DealersPage />} />
          </Route>

          {/* Product Management */}
          <Route element={<ProtectedRoute checkProducts={true} />}>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailsPage />} />
          </Route>

          {/* Order Management */}
          <Route element={<ProtectedRoute checkOrders={true} />}>
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
          </Route>

          {/* Khata Book Module */}
          <Route element={<ProtectedRoute checkKhataBook={true} />}>
            <Route path="/khatabook" element={<KhataBookPage />} />
            <Route path="/khatabook/:id" element={<KhataBookDetailsPage />} />
          </Route>

          {/* Settings Page */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
