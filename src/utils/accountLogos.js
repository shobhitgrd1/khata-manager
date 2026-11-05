import amazonLogo from '../assets/Account logo/Amazon.webp';
import blinkitLogo from '../assets/Account logo/blinkit.png';
import cromaLogo from '../assets/Account logo/Croma store.gif';
import flipkartLogo from '../assets/Account logo/flipkart.jfif';
import instamartLogo from '../assets/Account logo/instamart.png';
import myntraLogo from '../assets/Account logo/myntra.jfif';
import oneplusLogo from '../assets/Account logo/oneplus store.png';
import oppoLogo from '../assets/Account logo/oppo store.png';
import realmeLogo from '../assets/Account logo/realme store.webp';
import samsungLogo from '../assets/Account logo/samsung store.png';
import vivoLogo from '../assets/Account logo/vivo store.jpg';

const ACCOUNT_LOGOS = {
  Amazon: amazonLogo,
  Blinkit: blinkitLogo,
  Croma: cromaLogo,
  'Croma Store': cromaLogo,
  Flipkart: flipkartLogo,
  Instamart: instamartLogo,
  'Swiggy Instamart': instamartLogo,
  Myntra: myntraLogo,
  OnePlus: oneplusLogo,
  'OnePlus Store': oneplusLogo,
  Oppo: oppoLogo,
  'Oppo Store': oppoLogo,
  Realme: realmeLogo,
  'Realme Store': realmeLogo,
  Samsung: samsungLogo,
  'Samsung Store': samsungLogo,
  Vivo: vivoLogo,
  'Vivo Store': vivoLogo,
};

/**
 * Get account logo asset by account type or name.
 * Uses exact match, lowercase match, or substring match.
 * Returns null if no matching logo exists (triggers fallback badge).
 */
export const getAccountLogo = (accountType) => {
  if (!accountType) return null;
  const trimmed = accountType.trim();
  if (ACCOUNT_LOGOS[trimmed]) return ACCOUNT_LOGOS[trimmed];

  const lower = trimmed.toLowerCase();
  if (lower.includes('amazon')) return amazonLogo;
  if (lower.includes('blinkit')) return blinkitLogo;
  if (lower.includes('croma')) return cromaLogo;
  if (lower.includes('flipkart')) return flipkartLogo;
  if (lower.includes('instamart')) return instamartLogo;
  if (lower.includes('myntra')) return myntraLogo;
  if (lower.includes('oneplus') || lower.includes('one plus')) return oneplusLogo;
  if (lower.includes('oppo')) return oppoLogo;
  if (lower.includes('realme')) return realmeLogo;
  if (lower.includes('samsung')) return samsungLogo;
  if (lower.includes('vivo')) return vivoLogo;

  return null;
};

export default ACCOUNT_LOGOS;

