import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import styles from './AuthTabs.module.scss';

const AuthTabs = ({ activeTab = 'login' }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.tabsContainer}>
      {/* Login Tab */}
      <Button
        disableRipple
        onClick={() => navigate('/login')}
        startIcon={<LoginIcon className={styles.tabIcon} />}
        className={`${styles.tabButton} ${activeTab === 'login' ? styles.activeTab : styles.inactiveTab}`}
      >
        Login
      </Button>

      {/* Register Tab */}
      <Button
        disableRipple
        onClick={() => navigate('/register')}
        startIcon={<PersonAddAlt1Icon className={styles.tabIcon} />}
        className={`${styles.tabButton} ${activeTab === 'register' ? styles.activeTab : styles.inactiveTab}`}
      >
        Register
      </Button>
    </div>
  );
};

export default AuthTabs;
