import React from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import styles from './NotFoundPage.module.scss';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.description}>
          The page you are looking for does not exist or has been moved within Khata Manager.
        </p>

        <Button
          variant="contained"
          onClick={() => navigate('/dashboard')}
          startIcon={<HomeIcon />}
          className={styles.button}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
