import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import styles from './DashboardLayout.module.scss';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileNavToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <div className={styles.layoutRoot}>
      {/* Top Navbar */}
      <div className={styles.mainWrapper}>
        <Navbar onMobileNavToggle={handleMobileNavToggle} />

        <div className={styles.contentRow}>
          {/* Sidebar */}
          <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

          {/* Main Workspace / Content */}
          <main className={styles.mainContent}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
