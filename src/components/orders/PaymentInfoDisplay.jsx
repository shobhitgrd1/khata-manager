import React from 'react';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { getBankLogo } from '../../utils/bankLogos';
import styles from './PaymentInfoDisplay.module.scss';

const PaymentInfoDisplay = ({ order }) => {
  if (!order) return null;

  const method = order.paymentMethod || 'Credit Card';
  const ccObj = order.creditCardId || order.creditCardSnapshot || {};
  const pDetails = order.paymentDetails || {};

  if (method === 'Credit Card') {
    const bankName = ccObj.bankName || pDetails.bankName || 'Credit Card';
    const cardName = ccObj.cardName || pDetails.cardName || 'Card';
    const cardOwner = ccObj.cardOwner || pDetails.cardHolderName || ccObj.cardHolderName || 'Card Owner';
    const lastFour = ccObj.lastFourDigits || pDetails.lastFourDigits || '••••';
    const bankLogo = getBankLogo(bankName);

    return (
      <div className={`${styles.paymentMiniCard} ${styles.creditCardTheme}`}>
        <div className={styles.cardTopRow}>
          <div className={styles.logoBadgeBox}>
            {bankLogo ? (
              <img src={bankLogo} alt={bankName} className={styles.bankLogo} />
            ) : (
              <CreditCardIcon className={styles.methodIcon} />
            )}
          </div>
          <span className={styles.bankNameTag}>{bankName}</span>
        </div>

        <div className={styles.cardDigitsRow}>
          <span className={styles.cardDigits}>•••• {lastFour}</span>
        </div>

        <div className={styles.cardBottomRow}>
          <span className={styles.cardOwnerName} title={cardOwner}>{cardOwner}</span>
          <span className={styles.cardProductTag} title={cardName}>{cardName}</span>
        </div>
      </div>
    );
  }

  if (method === 'Debit Card') {
    const holder = pDetails.cardHolderName || 'Debit Card';
    const lastFour = pDetails.lastFourDigits || '••••';

    return (
      <div className={`${styles.paymentMiniCard} ${styles.debitCardTheme}`}>
        <div className={styles.cardTopRow}>
          <div className={styles.logoBadgeBox}>
            <AccountBalanceWalletOutlinedIcon className={styles.methodIcon} />
          </div>
          <span className={styles.bankNameTag}>Debit Card</span>
        </div>

        <div className={styles.cardDigitsRow}>
          <span className={styles.cardDigits}>•••• {lastFour}</span>
        </div>

        <div className={styles.cardBottomRow}>
          <span className={styles.cardOwnerName} title={holder}>{holder}</span>
          <span className={styles.cardProductTag}>Direct Debit</span>
        </div>
      </div>
    );
  }

  if (method === 'UPI') {
    const upiId = pDetails.upiId || 'UPI';
    const owner = pDetails.upiOwnerName || 'UPI Owner';

    return (
      <div className={`${styles.paymentMiniCard} ${styles.upiTheme}`}>
        <div className={styles.cardTopRow}>
          <div className={styles.logoBadgeBox}>
            <QrCode2OutlinedIcon className={styles.methodIcon} />
          </div>
          <span className={styles.bankNameTag}>UPI Transfer</span>
        </div>

        <div className={styles.cardDigitsRow}>
          <span className={styles.upiIdText} title={upiId}>{upiId}</span>
        </div>

        <div className={styles.cardBottomRow}>
          <span className={styles.cardOwnerName} title={owner}>{owner}</span>
          <span className={styles.cardProductTag}>Instant UPI</span>
        </div>
      </div>
    );
  }

  // Other Method
  const name = pDetails.otherMethodName || method || 'Other';
  const ref = pDetails.referenceNote || 'Payment Settled';

  return (
    <div className={`${styles.paymentMiniCard} ${styles.otherTheme}`}>
      <div className={styles.cardTopRow}>
        <div className={styles.logoBadgeBox}>
          <PaymentsOutlinedIcon className={styles.methodIcon} />
        </div>
        <span className={styles.bankNameTag}>{name}</span>
      </div>

      <div className={styles.cardDigitsRow}>
        <span className={styles.referenceText} title={ref}>{ref}</span>
      </div>

      <div className={styles.cardBottomRow}>
        <span className={styles.cardProductTag}>Settled</span>
      </div>
    </div>
  );
};

export default PaymentInfoDisplay;

