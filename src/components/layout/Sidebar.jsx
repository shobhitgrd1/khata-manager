import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  Button,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import FolderCopyOutlinedIcon from "@mui/icons-material/FolderCopyOutlined";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

import useAuth from "../../hooks/useAuth";
import { useAppTheme } from "../../context/ThemeContext";
import styles from "./Sidebar.module.scss";

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useAppTheme();
  const {
    user,
    logout,
    canAccessUserManagement,
    canAccessCreditCards,
    canAccessAccounts,
    canAccessDealers,
    canAccessProducts,
    canAccessOrders,
    canAccessKhataBook,
  } = useAuth();

  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    if (onMobileClose) onMobileClose();
    await logout();
    navigate("/login");
  };

  // Permissions checks
  const showUserManagement = canAccessUserManagement();
  const showCreditCards = canAccessCreditCards();
  const showAccounts = canAccessAccounts();
  const showDealers = canAccessDealers();
  const showProducts = canAccessProducts();
  const showOrders = canAccessOrders();
  const showKhataBook = canAccessKhataBook ? canAccessKhataBook() : true;

  // Submenu items under System Management
  const systemSubItems = [
    {
      title: "Credit Cards",
      path: "/credit-cards",
      icon: <CreditCardIcon className={styles.navIcon} />,
      visible: showCreditCards,
    },
    {
      title: "Accounts",
      path: "/accounts",
      icon: <ManageAccountsIcon className={styles.navIcon} />,
      visible: showAccounts,
    },
    {
      title: "Dealers",
      path: "/dealers",
      icon: <StorefrontIcon className={styles.navIcon} />,
      visible: showDealers,
    },
    {
      title: "Products",
      path: "/products",
      icon: <Inventory2OutlinedIcon className={styles.navIcon} />,
      visible: showProducts,
    },
  ].filter((item) => item.visible);

  const showSystemManagement = systemSubItems.length > 0;

  // Check if current route is a child of System Management
  const isSystemChildRoute =
    location.pathname.startsWith("/credit-cards") ||
    location.pathname.startsWith("/accounts") ||
    location.pathname.startsWith("/dealers") ||
    location.pathname.startsWith("/products");

  // Submenu expand state: automatically expand when on a system child route
  const [systemOpen, setSystemOpen] = useState(isSystemChildRoute);

  useEffect(() => {
    if (isSystemChildRoute) {
      setSystemOpen(true);
    }
  }, [location.pathname, isSystemChildRoute]);

  const handleNavClick = (path) => {
    navigate(path);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const handleToggleSystemMenu = () => {
    setSystemOpen((prev) => !prev);
  };

  const drawerContent = (
    <div className={styles.drawerContainer}>
      {/* ─── Mobile Profile Header (User Info & Logout moved to hamburger) ─── */}
      <div className={styles.mobileProfileHeader}>
        <div className={styles.mobileProfileTop}>
          <div className={styles.mobileAvatar}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className={styles.mobileProfileText}>
            <span className={styles.mobileProfileName}>{user?.name || "User"}</span>
            <span className={styles.mobileProfileUsername}>@{user?.username || "user"}</span>
          </div>
          <Chip
            size="small"
            label={isAdmin ? "ADMIN" : "USER"}
            className={`${styles.mobileRoleChip} ${isAdmin ? styles.roleAdmin : styles.roleUser}`}
          />
        </div>

        <div className={styles.mobileProfileActions}>
          <Button
            size="small"
            variant="outlined"
            onClick={toggleTheme}
            startIcon={isDark ? <LightModeIcon /> : <DarkModeIcon />}
            className={styles.mobileThemeToggleBtn}
          >
            {isDark ? "Light" : "Dark"}
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
            className={styles.mobileLogoutBtn}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* ─── Top Main Navigation Section ──────────────────────── */}
      <div className={styles.mainNavSection}>
        <List className={styles.navList}>
          {/* 1. Dashboard */}
          <ListItem disablePadding className={styles.navItem}>
            <ListItemButton
              onClick={() => handleNavClick("/dashboard")}
              className={`${styles.navButton} ${
                location.pathname === "/dashboard" ? styles.activeNav : ""
              }`}
            >
              <ListItemIcon
                className={`${styles.itemIcon} ${
                  location.pathname === "/dashboard" ? styles.itemIconActive : ""
                }`}
              >
                <DashboardIcon className={styles.navIcon} />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard"
                classes={{
                  primary:
                    location.pathname === "/dashboard"
                      ? styles.itemTextActive
                      : styles.itemText,
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* 2. Orders */}
          {showOrders && (
            <ListItem disablePadding className={styles.navItem}>
              <ListItemButton
                onClick={() => handleNavClick("/orders")}
                className={`${styles.navButton} ${
                  location.pathname.startsWith("/orders") ? styles.activeNav : ""
                }`}
              >
                <ListItemIcon
                  className={`${styles.itemIcon} ${
                    location.pathname.startsWith("/orders")
                      ? styles.itemIconActive
                      : ""
                  }`}
                >
                  <ReceiptLongOutlinedIcon className={styles.navIcon} />
                </ListItemIcon>
                <ListItemText
                  primary="Orders"
                  classes={{
                    primary: location.pathname.startsWith("/orders")
                      ? styles.itemTextActive
                      : styles.itemText,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {/* 3. System Management (Expandable / Collapsible) */}
          {showSystemManagement && (
            <div className={styles.submenuContainer}>
              <ListItem disablePadding className={styles.navItem}>
                <ListItemButton
                  onClick={handleToggleSystemMenu}
                  className={`${styles.navButton} ${
                    isSystemChildRoute ? styles.parentActiveNav : ""
                  }`}
                >
                  <ListItemIcon
                    className={`${styles.itemIcon} ${
                      isSystemChildRoute ? styles.itemIconActive : ""
                    }`}
                  >
                    <FolderCopyOutlinedIcon className={styles.navIcon} />
                  </ListItemIcon>
                  <ListItemText
                    primary="System Management"
                    classes={{
                      primary: isSystemChildRoute
                        ? styles.itemTextActive
                        : styles.itemText,
                    }}
                  />
                  {systemOpen ? (
                    <ExpandLessIcon
                      className={`${styles.expandIcon} ${
                        isSystemChildRoute ? styles.expandIconActive : ""
                      }`}
                    />
                  ) : (
                    <ExpandMoreIcon
                      className={`${styles.expandIcon} ${
                        isSystemChildRoute ? styles.expandIconActive : ""
                      }`}
                    />
                  )}
                </ListItemButton>
              </ListItem>

              {/* Submenu Items */}
              <Collapse in={systemOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding className={styles.submenuList}>
                  {systemSubItems.map((subItem) => {
                    const isSubActive =
                      location.pathname === subItem.path ||
                      location.pathname.startsWith(subItem.path + "/");

                    return (
                      <ListItem
                        key={subItem.title}
                        disablePadding
                        className={styles.subItem}
                      >
                        <ListItemButton
                          onClick={() => handleNavClick(subItem.path)}
                          className={`${styles.subItemButton} ${
                            isSubActive ? styles.activeNav : ""
                          }`}
                        >
                          <ListItemIcon
                            className={`${styles.subItemIcon} ${
                              isSubActive ? styles.subItemIconActive : ""
                            }`}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.title}
                            classes={{
                              primary: isSubActive
                                ? styles.subItemTextActive
                                : styles.subItemText,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </div>
          )}

          {/* 4. User Management */}
          {showUserManagement && (
            <ListItem disablePadding className={styles.navItem}>
              <ListItemButton
                onClick={() => handleNavClick("/users")}
                className={`${styles.navButton} ${
                  location.pathname === "/users" ? styles.activeNav : ""
                }`}
              >
                <ListItemIcon
                  className={`${styles.itemIcon} ${
                    location.pathname === "/users" ? styles.itemIconActive : ""
                  }`}
                >
                  <PeopleAltIcon className={styles.navIcon} />
                </ListItemIcon>
                <ListItemText
                  primary="User Management"
                  classes={{
                    primary:
                      location.pathname === "/users"
                        ? styles.itemTextActive
                        : styles.itemText,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {/* 5. Khata Book */}
          {showKhataBook && (
            <ListItem disablePadding className={styles.navItem}>
              <ListItemButton
                onClick={() => handleNavClick("/khatabook")}
                className={`${styles.navButton} ${
                  location.pathname.startsWith("/khatabook") ? styles.activeNav : ""
                }`}
              >
                <ListItemIcon
                  className={`${styles.itemIcon} ${
                    location.pathname.startsWith("/khatabook")
                      ? styles.itemIconActive
                      : ""
                  }`}
                >
                  <MenuBookIcon className={styles.navIcon} />
                </ListItemIcon>
                <ListItemText
                  primary="Khata Book"
                  classes={{
                    primary: location.pathname.startsWith("/khatabook")
                      ? styles.itemTextActive
                      : styles.itemText,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {/* 6. My Profile */}
          <ListItem disablePadding className={styles.navItem}>
            <ListItemButton
              onClick={() =>
                handleNavClick(user ? `/users/${user._id}` : "/dashboard")
              }
              className={`${styles.navButton} ${
                user && location.pathname === `/users/${user._id}`
                  ? styles.activeNav
                  : ""
              }`}
            >
              <ListItemIcon
                className={`${styles.itemIcon} ${
                  user && location.pathname === `/users/${user._id}`
                    ? styles.itemIconActive
                    : ""
                }`}
              >
                <AccountCircleIcon className={styles.navIcon} />
              </ListItemIcon>
              <ListItemText
                primary="My Profile"
                classes={{
                  primary:
                    user && location.pathname === `/users/${user._id}`
                      ? styles.itemTextActive
                      : styles.itemText,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </div>

      {/* ─── Bottom Pinned Section: Settings ─────────────────── */}
      <div className={styles.bottomSection}>
        <ListItem disablePadding className={styles.settingsItem}>
          <ListItemButton
            onClick={() => handleNavClick("/settings")}
            className={`${styles.settingsButton} ${
              location.pathname === "/settings" ? styles.activeNav : ""
            }`}
          >
            <ListItemIcon
              className={`${styles.itemIcon} ${
                location.pathname === "/settings" ? styles.itemIconActive : ""
              }`}
            >
              <SettingsIcon className={styles.navIcon} />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              classes={{
                primary:
                  location.pathname === "/settings"
                    ? styles.itemTextActive
                    : styles.itemText,
              }}
            />
          </ListItemButton>
        </ListItem>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        className={styles.mobileDrawer}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Persistent Drawer */}
      <Drawer variant="permanent" className={styles.desktopDrawer} open>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
