import React, { useState } from 'react';
import { Tooltip } from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckIcon from '@mui/icons-material/Check';
import styles from './DealerAddressCard.module.scss';

export const formatAddressForCopy = (address) => {
  if (!address) return '';
  const parts = [];
  if (address.addressTitle) parts.push(address.addressTitle.trim());
  if (address.completeAddress) parts.push(address.completeAddress.trim());

  const cityState = [address.city, address.state].filter(Boolean).map((s) => s.trim()).join(', ');
  if (cityState) parts.push(cityState);

  if (address.pinCode) parts.push(address.pinCode.trim());
  if (address.country) parts.push(address.country.trim());

  return parts.join('\n');
};

const DealerAddressCard = ({ address, onCopySuccess, onCopyError }) => {
  const [copied, setCopied] = useState(false);

  const {
    addressTitle = 'Address',
    completeAddress = '',
    city = '',
    state = '',
    pinCode = '',
    country = 'India',
  } = address || {};

  const handleCopy = async () => {
    const formatted = formatAddressForCopy(address);
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(formatted);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = formatted;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      if (onCopySuccess) onCopySuccess(addressTitle);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      if (onCopyError) onCopyError();
    }
  };

  const localityLine = [city, state].filter(Boolean).join(', ');

  return (
    <div className={styles.addressBox}>
      <div className={styles.headerRow}>
        <div className={styles.titleBadge}>
          <LocationOnOutlinedIcon className={styles.titleIcon} />
          <span className={styles.titleText}>{addressTitle}</span>
        </div>

        <Tooltip title={copied ? 'Copied to clipboard!' : 'Copy complete address'}>
          <button
            type="button"
            onClick={handleCopy}
            className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
            aria-label={`Copy address for ${addressTitle}`}
          >
            {copied ? (
              <>
                <CheckIcon className={styles.btnIcon} />
                <span className={styles.btnLabel}>Copied</span>
              </>
            ) : (
              <>
                <ContentCopyOutlinedIcon className={styles.btnIcon} />
                <span className={styles.btnLabel}>Copy Address</span>
              </>
            )}
          </button>
        </Tooltip>
      </div>

      <div className={styles.body}>
        <p className={styles.streetLine}>{completeAddress}</p>
        {(localityLine || pinCode) && (
          <p className={styles.localityLine}>
            {localityLine}
            {pinCode && ` - ${pinCode}`}
          </p>
        )}
        {country && <p className={styles.countryLine}>{country}</p>}
      </div>
    </div>
  );
};

export default DealerAddressCard;

