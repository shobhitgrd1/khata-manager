import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import styles from './UnauthorizedPage.module.scss';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.iconBox}>
          <SecurityIcon fontSize="inherit" />
        </div>

        <h1 className={styles.title}>403 - Access Denied</h1>

        <p className={styles.description}>
          You do not have the required administrative role or privileges to access this page. Please contact your system administrator if you believe this is an error.
        </p>

        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          startIcon={<DashboardIcon />}
          className={styles.button}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
