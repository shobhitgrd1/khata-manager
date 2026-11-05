import React from 'react';
import { Button, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import StorefrontIcon from '@mui/icons-material/Storefront';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

import styles from './KhataBookCard.module.scss';

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

const KhataBookCard = ({
  account,
  onEdit,
  onArchive,
  canEdit = true,
  canDelete = true,
  onCopySuccess,
  onCopyError,
}) => {
  const navigate = useNavigate();

  const {
    _id,
    name = 'Unknown Account',
    mobileNumber = '',
    accountType = 'Other',
    dealerId,
    currentBalance = 0,
    totalGiven = 0,
    totalTaken = 0,
    totalPaymentsReceived = 0,
    totalPaymentsMade = 0,
    lastTransactionDate,
  } = account || {};

  const isPositive = currentBalance > 0;
  const isNegative = currentBalance < 0;
  const isSettled = currentBalance === 0;

  const initial = name ? name.trim().charAt(0).toUpperCase() : 'K';

  const handleCopyMobile = async (num, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!num) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(num);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = num;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      if (onCopySuccess) onCopySuccess(`Mobile number ${num}`);
    } catch (err) {
      console.error('Failed to copy mobile:', err);
      if (onCopyError) onCopyError();
    }
  };

  const formattedDate = lastTransactionDate
    ? new Date(lastTransactionDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <div className={styles.khataCard}>
      <div className={styles.ambientGlare} />

      {/* Top Header Row */}
      <div className={styles.topRow}>
        <div className={styles.personInfo}>
          <div className={styles.avatarBox}>
            <span className={styles.avatarLetter}>{initial}</span>
          </div>

          <div className={styles.nameAndMeta}>
            <div className={styles.titleLine}>
              <h3 className={styles.accountName} title={name}>
                {name}
              </h3>
              <span
                className={`${styles.typeBadge} ${
                  accountType === 'Dealer' ? styles.typeDealer : styles.typeOther
                }`}
              >
                {accountType === 'Dealer' ? (
                  <>
                    <StorefrontIcon className={styles.typeIcon} /> Dealer
                  </>
                ) : (
                  <>
                    <PersonOutlinedIcon className={styles.typeIcon} /> Other
                  </>
                )}
              </span>
            </div>

            <div className={styles.mobileRow}>
              {mobileNumber ? (
                <Tooltip title="Click to copy mobile number" arrow>
                  <button
                    type="button"
                    className={styles.mobileLink}
                    onClick={(e) => handleCopyMobile(mobileNumber, e)}
                  >
                    <PhoneIcon className={styles.phoneIcon} />
                    <span>{mobileNumber}</span>
                  </button>
                </Tooltip>
              ) : (
                <span className={styles.noMobile}>No mobile number</span>
              )}
            </div>
          </div>
        </div>

        {/* Current Balance Badge */}
        <div
          className={`${styles.balanceBadge} ${
            isPositive
              ? styles.badgePositive
              : isNegative
              ? styles.badgeNegative
              : styles.badgeSettled
          }`}
        >
          <span className={styles.balanceLabel}>
            {isPositive ? 'To Receive' : isNegative ? 'To Pay' : 'Settled'}
          </span>
          <span className={styles.balanceValue}>
            {isPositive && `+${formatINR(currentBalance)}`}
            {isNegative && `-${formatINR(currentBalance)}`}
            {isSettled && '₹0'}
          </span>
        </div>
      </div>

      {/* Linked Dealer Banner if applicable */}
      {accountType === 'Dealer' && dealerId && (
        <div className={styles.dealerLinkedBanner}>
          <StorefrontIcon className={styles.linkedIcon} />
          <span>Linked to Dealer Management</span>
        </div>
      )}

      {/* Ledger Metrics Strip */}
      <div className={styles.ledgerStrip}>
        <div className={styles.ledgerCol}>
          <span className={styles.ledgerLabel}>To Receive</span>
          <span className={isPositive ? styles.ledgerValReceived : styles.ledgerVal}>
            {isPositive ? `+${formatINR(currentBalance)}` : '₹0'}
          </span>
        </div>

        <div className={styles.ledgerDivider} />

        <div className={styles.ledgerCol}>
          <span className={styles.ledgerLabel}>To Pay</span>
          <span className={isNegative ? styles.ledgerValToPay : styles.ledgerVal}>
            {isNegative ? `-${formatINR(currentBalance)}` : '₹0'}
          </span>
        </div>

        <div className={styles.ledgerDivider} />

        <div className={styles.ledgerCol}>
          <span className={styles.ledgerLabel}>Given</span>
          <span className={styles.ledgerVal}>{formatINR(totalGiven)}</span>
        </div>

        <div className={styles.ledgerDivider} />

        <div className={styles.ledgerCol}>
          <span className={styles.ledgerLabel}>Taken</span>
          <span className={styles.ledgerVal}>{formatINR(totalTaken)}</span>
        </div>
      </div>

      {/* Date & Meta Row */}
      <div className={styles.metaRow}>
        <span className={styles.dateInfo}>
          <CalendarMonthIcon className={styles.calendarIcon} />
          {formattedDate ? `Last Activity: ${formattedDate}` : 'No transactions yet'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className={styles.cardActions}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<VisibilityOutlinedIcon className={styles.btnIcon} />}
          onClick={() => navigate(`/khatabook/${_id}`)}
          className={styles.viewBtn}
        >
          View Ledger
        </Button>

        {canEdit && (
          <Tooltip title="Edit Account" arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditOutlinedIcon className={styles.btnIcon} />}
              onClick={() => onEdit && onEdit(account)}
              className={styles.editBtn}
            >
              Edit
            </Button>
          </Tooltip>
        )}

        {canDelete && (
          <Tooltip title="Archive Account" arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteOutlinedIcon className={styles.btnIcon} />}
              onClick={() => onArchive && onArchive(account)}
              className={styles.archiveBtn}
            >
              Archive
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default KhataBookCard;
