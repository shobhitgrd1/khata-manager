import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAppTheme } from '../context/ThemeContext';
import styles from './AuthLayout.module.scss';

const AuthLayout = ({ children }) => {
  const { isDark, toggleTheme } = useAppTheme();

  return (
    <div className={styles.container}>
      {/* Quick Theme Toggle in Top Right of Auth Screens */}
      <div className={styles.themeToggleWrapper}>
        <Tooltip title={isDark ? 'Turn on Light Mode' : 'Turn on Dark Mode'}>
          <IconButton
            onClick={toggleTheme}
            className={styles.themeBtn}
          >
            {isDark ? (
              <LightModeIcon className={styles.themeIcon} />
            ) : (
              <DarkModeIcon className={styles.themeIcon} />
            )}
          </IconButton>
        </Tooltip>
      </div>

      {/* Top ambient cyan light flare behind card */}
      <div className={styles.ambientGlow} />

      {/* Main Glassmorphism Card */}
      <div className={styles.glassCard}>
        {/* Subtle top edge glare */}
        <div className={styles.topEdgeGlare} />
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
