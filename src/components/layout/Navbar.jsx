import React, { useContext } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Button,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsIcon from '@mui/icons-material/Settings';
import useAuth from '../../hooks/useAuth';
import { useAppTheme } from '../../context/ThemeContext';
import MobileHeaderContext from '../../context/MobileHeaderContext';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Navbar.module.scss';

const getRouteTitle = (path) => {
  if (path.startsWith('/orders')) return 'Order Management';
  if (path.startsWith('/accounts')) return 'Accounts';
  if (path.startsWith('/credit-cards')) return 'Credit Cards';
  if (path.startsWith('/dealers')) return 'Dealers';
  if (path.startsWith('/products')) return 'Products';
  if (path.startsWith('/khatabook')) return 'Khata Book';
  if (path.startsWith('/users')) return 'User Management';
  if (path.startsWith('/settings')) return 'Settings';
  if (path.startsWith('/dashboard')) return 'Dashboard';
  return 'Khata Manager';
};

const Navbar = ({ onMobileNavToggle }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { title, actionLabel, handleActionClick } = useContext(MobileHeaderContext);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const displayTitle = title || getRouteTitle(location.pathname);

  return (
    <AppBar position="sticky" elevation={0} className={styles.appBar}>
      <Toolbar className={styles.toolbar}>
        {/* Left: Mobile hamburger & Logo / Mobile Title */}
        <div className={styles.leftSection}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileNavToggle}
            className={styles.menuBtn}
          >
            <MenuIcon />
          </IconButton>

          {/* Mobile Title (Image 1 & 2 design) */}
          <h1 className={styles.mobileSectionTitle}>
            {displayTitle}
          </h1>

          {/* Desktop Mini Logo */}
          <div
            onClick={() => navigate('/dashboard')}
            className={styles.logoContainer}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.logoSvg}
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H16a2 2 0 0 1 2 2v2" />
              <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H18a2 2 0 0 0 2-2V13" />
              <line x1="7" y1="7" x2="11" y2="7" />
              <line x1="7" y1="11" x2="13" y2="11" />
              <line x1="7" y1="15" x2="11" y2="15" />
              <path d="M14 6l4-4 4 4-4 4z" />
              <path d="M16 8l-6 6v3h3l6-6" />
            </svg>
          </div>

          <div
            onClick={() => navigate('/dashboard')}
            className={styles.brandText}
          >
            <h2 className={styles.brandTitle}>
              Khata Manager
            </h2>
            <p className={styles.brandSubtitle}>
              Manage Your Accounts Smartly
            </p>
          </div>
        </div>

        {/* Right: Mobile Action Button (Image 1 & 2) */}
        {actionLabel && (
          <div className={styles.mobileActionContainer}>
            <Button
              variant="contained"
              size="small"
              onClick={handleActionClick}
              className={styles.mobileHeaderActionBtn}
            >
              {actionLabel}
            </Button>
          </div>
        )}

        {/* Desktop Right Section: Theme Toggle, Profile chip & Logout */}
        <div className={styles.desktopRightSection}>
          {/* Quick Light/Dark Mode Toggle Button */}
          <Tooltip title={isDark ? 'Turn on Light Mode' : 'Turn on Dark Mode'}>
            <IconButton
              onClick={toggleTheme}
              className={styles.themeToggleBtn}
            >
              {isDark ? (
                <LightModeIcon className={styles.btnIcon} />
              ) : (
                <DarkModeIcon className={styles.btnIcon} />
              )}
            </IconButton>
          </Tooltip>

          {/* Settings Shortcut */}
          <Tooltip title="Settings">
            <IconButton
              onClick={() => navigate('/settings')}
              className={`${styles.themeToggleBtn} ${styles.settingsBtn}`}
            >
              <SettingsIcon className={styles.btnIcon} />
            </IconButton>
          </Tooltip>

          {/* User profile chip */}
          <div className={styles.profileBadge}>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>
                {user?.name}
              </div>
              <div className={styles.profileUsername}>
                @{user?.username}
              </div>
            </div>

            <Chip
              icon={
                isAdmin ? (
                  <ShieldOutlinedIcon className={styles.chipIcon} />
                ) : (
                  <PersonOutlinedIcon className={styles.chipIcon} />
                )
              }
              label={isAdmin ? 'ADMIN' : 'USER'}
              size="small"
              className={`${styles.roleChip} ${isAdmin ? styles.roleChipAdmin : styles.roleChipUser}`}
            />
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outlined"
            size="small"
            startIcon={<LogoutIcon className={styles.logoutIcon} />}
            className={styles.logoutBtn}
          >
            <span className={styles.logoutLabel}>
              Logout
            </span>
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
