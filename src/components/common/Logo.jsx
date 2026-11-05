import React from 'react';
import styles from './Logo.module.scss';

const Logo = ({ size = 'medium', showSubtitle = true, centered = true }) => {
  const iconBoxClass = size === 'small' ? styles.iconSmall : size === 'large' ? styles.iconLarge : styles.iconMedium;
  const titleClass = size === 'small' ? styles.titleSmall : size === 'large' ? styles.titleLarge : styles.titleMedium;
  const subtitleClass = size === 'small' ? styles.subtitleSmall : size === 'large' ? styles.subtitleLarge : styles.subtitleMedium;
  const svgDim = size === 'small' ? 24 : size === 'large' ? 40 : 32;

  return (
    <div className={`${styles.logoWrapper} ${centered ? styles.centered : styles.leftAligned}`}>
      {/* Icon Container matching reference image */}
      <div className={`${styles.iconBox} ${iconBoxClass}`}>
        {/* Notebook & Pen Stylized SVG */}
        <svg
          width={svgDim}
          height={svgDim}
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.svgIcon}
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

      {/* Typography */}
      <div>
        <h1 className={`${styles.title} ${titleClass}`}>
          Khata Manager
        </h1>
        {showSubtitle && (
          <p className={`${styles.subtitle} ${subtitleClass}`}>
            Manage Your Accounts Smartly
          </p>
        )}
      </div>
    </div>
  );
};

export default Logo;
