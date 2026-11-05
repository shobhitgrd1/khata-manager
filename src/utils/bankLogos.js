import auLogo from '../assets/Bank Logo/AU Bank.png';
import axisLogo from '../assets/Bank Logo/Axis.jfif';
import bobLogo from '../assets/Bank Logo/Bank of Baroda.png';
import hdfcLogo from '../assets/Bank Logo/HDFC.png';
import hsbcLogo from '../assets/Bank Logo/HSBC.jpg';
import iciciLogo from '../assets/Bank Logo/icici.png';
import kotakLogo from '../assets/Bank Logo/Kotak.jpg';
import rblLogo from '../assets/Bank Logo/Rbl.jfif';
import sbiLogo from '../assets/Bank Logo/Sbi.jpg';
import yesLogo from '../assets/Bank Logo/Yes Bank.png';

const BANK_LOGOS = {
  'ICICI Bank': iciciLogo,
  'Axis Bank': axisLogo,
  'Kotak Mahindra Bank': kotakLogo,
  'RBL Bank': rblLogo,
  'AU Small Finance Bank': auLogo,
  'AU Bank': auLogo,
  'HSBC Bank': hsbcLogo,
  'State Bank of India (SBI)': sbiLogo,
  'SBI': sbiLogo,
  'Yes Bank': yesLogo,
  'HDFC Bank': hdfcLogo,
  'Bank of Baroda': bobLogo,
};

export const getBankLogo = (bankName) => {
  if (!bankName) return null;
  const trimmed = bankName.trim();
  if (BANK_LOGOS[trimmed]) return BANK_LOGOS[trimmed];

  // Case-insensitive / substring fallback
  const lower = trimmed.toLowerCase();
  if (lower.includes('icici')) return iciciLogo;
  if (lower.includes('axis')) return axisLogo;
  if (lower.includes('kotak')) return kotakLogo;
  if (lower.includes('rbl')) return rblLogo;
  if (lower.includes('au small') || lower.includes('au bank')) return auLogo;
  if (lower.includes('hsbc')) return hsbcLogo;
  if (lower.includes('sbi') || lower.includes('state bank')) return sbiLogo;
  if (lower.includes('yes')) return yesLogo;
  if (lower.includes('hdfc')) return hdfcLogo;
  if (lower.includes('baroda') || lower.includes('bob')) return bobLogo;

  return null;
};

export default BANK_LOGOS;

