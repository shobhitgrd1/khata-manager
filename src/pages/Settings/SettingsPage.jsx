import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Switch,
  FormControlLabel,
  Chip,
  Alert,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SecurityIcon from '@mui/icons-material/Security';
import { useAppTheme } from '../../context/ThemeContext';
import useAuth from '../../hooks/useAuth';
import { useMobileHeader } from '../../context/MobileHeaderContext';
import styles from './SettingsPage.module.scss';

const SettingsPage = () => {
  const { setThemeMode, isDark } = useAppTheme();
  const { user } = useAuth();

  useMobileHeader({ title: 'Settings', action: null });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleModeChange = (e) => {
    const newMode = e.target.checked ? 'dark' : 'light';
    setThemeMode(newMode);
    triggerSavedFeedback();
  };

  const handleSelectTheme = (newMode) => {
    setThemeMode(newMode);
    triggerSavedFeedback();
  };

  const triggerSavedFeedback = () => {
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
    }, 2500);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Settings & Preferences</h1>
        <p className={styles.subtitle}>
          Manage your interface appearance, theme modes, notifications, and account settings.
        </p>
      </div>

      {/* Success alert */}
      {savedAlert && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          className={styles.alert}
        >
          Theme preference updated to <strong>{isDark ? 'Dark Mode' : 'Light Mode'}</strong>!
        </Alert>
      )}

      {/* Section 1: Appearance & Theme */}
      <div className={styles.panel}>
        <div className={styles.sectionHeader}>
          <PaletteIcon className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Appearance & Theme</h2>
        </div>
        <p className={styles.sectionDesc}>
          Toggle between Dark Mode and Light Mode. Your choice is automatically saved and applied across the entire Khata Manager platform.
        </p>

        {/* Quick Switch Bar */}
        <div className={styles.switchBar}>
          <div className={styles.switchInfo}>
            <div className={styles.switchIconBox}>
              {isDark ? <DarkModeIcon /> : <LightModeIcon />}
            </div>
            <div className={styles.switchText}>
              <span className={styles.switchName}>
                {isDark ? 'Dark Mode (Active)' : 'Light Mode (Active)'}
              </span>
              <span className={styles.switchDesc}>
                {isDark
                  ? 'Switch off to activate clean Light Mode'
                  : 'Switch on to activate futuristic Dark Mode'}
              </span>
            </div>
          </div>

          <FormControlLabel
            control={
              <Switch
                checked={isDark}
                onChange={handleModeChange}
                color="primary"
                className={styles.themeSwitch}
              />
            }
            label={
              <span className={styles.switchLabelText}>
                {isDark ? 'Dark Mode ON' : 'Dark Mode OFF'}
              </span>
            }
          />
        </div>

        {/* Visual Theme Selection Cards */}
        <div className={styles.cardsHeading}>Choose Preferred Theme Palette</div>

        <Grid container spacing={3}>
          {/* Dark Mode Card */}
          <Grid item xs={12} sm={6}>
            <Card
              className={`${styles.themeCard} ${styles.darkThemeCard} ${isDark ? styles.activeTheme : ''}`}
            >
              <CardActionArea onClick={() => handleSelectTheme('dark')} className={styles.cardActionArea}>
                <CardContent className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <DarkModeIcon className={styles.cardIconDark} />
                      <h3 className={`${styles.cardTitle} ${styles.cardTitleDark}`}>
                        Futuristic Dark Mode
                      </h3>
                    </div>
                    {isDark && (
                      <Chip
                        icon={<CheckCircleIcon className={styles.chipCheckIconDark} />}
                        label="ACTIVE"
                        size="small"
                        className={styles.activeChipDark}
                      />
                    )}
                  </div>

                  <p className={styles.cardDescriptionDark}>
                    Deep navy background (#071526) with cyan lighting, subtle dotted grid texture, and glowing blue glassmorphism panels.
                  </p>

                  {/* Swatches */}
                  <div className={styles.swatchesRow}>
                    <div className={`${styles.swatch} ${styles.swatchNavy}`} />
                    <div className={`${styles.swatch} ${styles.swatchDarkBlue}`} />
                    <div className={`${styles.swatch} ${styles.swatchCyan}`} />
                    <div className={`${styles.swatch} ${styles.swatchLightCyan}`} />
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>

          {/* Light Mode Card */}
          <Grid item xs={12} sm={6}>
            <Card
              className={`${styles.themeCard} ${styles.lightThemeCard} ${!isDark ? styles.activeTheme : ''}`}
            >
              <CardActionArea onClick={() => handleSelectTheme('light')} className={styles.cardActionArea}>
                <CardContent className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <LightModeIcon className={styles.cardIconLight} />
                      <h3 className={`${styles.cardTitle} ${styles.cardTitleLight}`}>
                        Clean Light Mode
                      </h3>
                    </div>
                    {!isDark && (
                      <Chip
                        icon={<CheckCircleIcon className={styles.chipCheckIconLight} />}
                        label="ACTIVE"
                        size="small"
                        className={styles.activeChipLight}
                      />
                    )}
                  </div>

                  <p className={styles.cardDescriptionLight}>
                    Clean slate background (#F1F5F9), high-contrast crisp text, subtle frosted glass panels, and sky-blue highlights.
                  </p>

                  {/* Swatches */}
                  <div className={styles.swatchesRow}>
                    <div className={`${styles.swatch} ${styles.swatchSlate}`} />
                    <div className={`${styles.swatch} ${styles.swatchWhite}`} />
                    <div className={`${styles.swatch} ${styles.swatchSky}`} />
                    <div className={`${styles.swatch} ${styles.swatchLightSky}`} />
                  </div>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>
      </div>

      {/* Section 2: Preferences */}
      <div className={styles.panel}>
        <div className={styles.sectionHeader}>
          <NotificationsNoneIcon className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>General Preferences</h2>
        </div>

        <div className={`${styles.prefItem} ${styles.withBorder}`}>
          <div>
            <div className={styles.prefTitle}>Application Notifications</div>
            <div className={styles.prefDescription}>
              Show toast alerts for data updates, password resets, and deletions.
            </div>
          </div>
          <Switch
            checked={notificationsEnabled}
            onChange={(e) => setNotificationsEnabled(e.target.checked)}
            color="primary"
          />
        </div>

        <div className={styles.prefItem}>
          <div>
            <div className={styles.prefTitle}>Compact Density Tables</div>
            <div className={styles.prefDescription}>
              Display denser rows in Material UI Data Grid for smaller laptop screens.
            </div>
          </div>
          <Switch
            checked={compactMode}
            onChange={(e) => setCompactMode(e.target.checked)}
            color="primary"
          />
        </div>
      </div>

      {/* Section 3: Active Session Security */}
      <div className={styles.panel}>
        <div className={styles.sectionHeader}>
          <SecurityIcon className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Active Session Security</h2>
        </div>
        <div className={styles.securityCard}>
          <p className={styles.securityUser}>
            Signed in as <strong>{user?.name}</strong> (@{user?.username}) with role
            <Chip
              label={user?.role?.toUpperCase()}
              size="small"
              className={styles.roleChip}
            />
          </p>
          <p className={styles.securityEmail}>
            Registered Email: <strong>{user?.email}</strong> • Session authenticated with secure HTTP-only cookies and JWT.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
