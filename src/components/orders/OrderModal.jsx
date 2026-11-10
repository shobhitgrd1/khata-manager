import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PercentIcon from '@mui/icons-material/Percent';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import dealerService from '../../services/dealerService';
import productService from '../../services/productService';
import accountService from '../../services/accountService';
import creditCardService from '../../services/creditCardService';
import orderService from '../../services/orderService';
import khatabookService from '../../services/khatabookService';
import { getAccountLogo } from '../../utils/accountLogos';
import { getBankLogo } from '../../utils/bankLogos';
import { CASHBACK_PERCENTAGE_PRESETS } from '../../constants/order.constants';
import styles from './OrderModal.module.scss';

const OrderModal = ({
  open,
  onClose,
  onSubmit,
  onSaved,
  order = null,
  initialData = null,
  isDuplicate = false,
  loading: externalLoading = false,
}) => {
  const activeOrder = order || initialData;
  const isDuplicateMode = Boolean(isDuplicate);
  const isEditMode = Boolean(!isDuplicateMode && activeOrder && activeOrder._id);

  // Lists fetched from existing modules
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [dealerId, setDealerId] = useState('');
  const [dealerAddressId, setDealerAddressId] = useState('');
  const [productId, setProductId] = useState('');
  const [variant, setVariant] = useState('');
  const [colorName, setColorName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [creditCardId, setCreditCardId] = useState('');
  const [otherPaymentType, setOtherPaymentType] = useState('Debit Card');
  const [debitCardHolder, setDebitCardHolder] = useState('');
  const [debitLastFour, setDebitLastFour] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiOwner, setUpiOwner] = useState('');
  const [otherMethodName, setOtherMethodName] = useState('');
  const [referenceNote, setReferenceNote] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Order In Process');
  const [deliveryPrice, setDeliveryPrice] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [profitPercent, setProfitPercent] = useState('');
  const [applyCashback, setApplyCashback] = useState(false);
  const [cashbackAmount, setCashbackAmount] = useState('');
  const [isCashbackManuallyEdited, setIsCashbackManuallyEdited] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [hasLinkedKhataBook, setHasLinkedKhataBook] = useState(false);
  const [addToKhataBook, setAddToKhataBook] = useState(true);
  const [customProductName, setCustomProductName] = useState('');
  const [payUsingCreditCard, setPayUsingCreditCard] = useState(false);
  const [originalOrderId, setOriginalOrderId] = useState('');

  // Check if selected dealer has a linked Khata Book account
  useEffect(() => {
    let isMounted = true;
    if (dealerId) {
      khatabookService
        .getKhataBookByDealerId(dealerId)
        .then((res) => {
          if (isMounted) {
            const exists = Boolean(res?.exists);
            setHasLinkedKhataBook(exists);
            if (exists) {
              setAddToKhataBook(true);
            }
          }
        })
        .catch(() => {
          if (isMounted) setHasLinkedKhataBook(false);
        });
    } else {
      setHasLinkedKhataBook(false);
    }
    return () => {
      isMounted = false;
    };
  }, [dealerId]);

  // Fetch reference data when modal opens
  useEffect(() => {
    if (open) {
      let isMounted = true;
      const loadOptions = async () => {
        setFetchingData(true);
        try {
          const [dRes, pRes, aRes, cRes] = await Promise.all([
            dealerService.getDealers({ limit: 150 }).catch(() => ({ dealers: [] })),
            productService.getProducts({ limit: 150 }).catch(() => ({ products: [] })),
            accountService.getAccounts({ limit: 150 }).catch(() => ({ accounts: [] })),
            creditCardService.getCreditCards({ limit: 150 }).catch(() => ({ creditCards: [] })),
          ]);

          if (isMounted) {
            setDealers(dRes.dealers || []);
            setProducts(pRes.products || []);
            setAccounts(aRes.accounts || []);
            setCreditCards(cRes.creditCards || []);
          }
        } catch (err) {
          console.error('Failed to load order references:', err);
        } finally {
          if (isMounted) setFetchingData(false);
        }
      };

      loadOptions();
    }
  }, [open]);

  // Populate or reset form values
  useEffect(() => {
    if (open) {
      setValidationError('');
      if (activeOrder) {
        setDealerId(activeOrder.dealerId?._id || activeOrder.dealerId || '');
        setDealerAddressId(activeOrder.dealerAddressId || '');
        if (activeOrder.productId?._id) {
          setProductId(activeOrder.productId._id);
          setCustomProductName('');
        } else if (activeOrder.productId && typeof activeOrder.productId === 'string') {
          setProductId(activeOrder.productId);
          setCustomProductName('');
        } else if (activeOrder.customProductName) {
          setProductId('OTHER');
          setCustomProductName(activeOrder.customProductName);
        } else {
          setProductId('');
          setCustomProductName('');
        }
        setVariant(activeOrder.variant || '');
        setColorName(activeOrder.color?.colorName || '');
        setAccountId(activeOrder.accountId?._id || activeOrder.accountId || '');
        setPaymentMethod(activeOrder.paymentMethod === 'Credit Card' ? 'Credit Card' : 'Other');
        setCreditCardId(activeOrder.creditCardId?._id || activeOrder.creditCardId || '');
        setPayUsingCreditCard(Boolean(activeOrder.payUsingCreditCard));
        setOriginalOrderId(activeOrder.originalOrderId || '');
        setPurchasePrice(
          activeOrder.purchasePrice !== undefined && activeOrder.purchasePrice !== null
            ? String(activeOrder.purchasePrice)
            : ''
        );

        if (isDuplicateMode) {
          // Reset order lifecycle fields for duplicated order
          setOrderDate(new Date().toISOString().split('T')[0]);
          setStatus('Order In Process');
          setDeliveryPrice('');
          setDeliveryDate(new Date().toISOString().split('T')[0]);
          setProfitPercent('');
          setApplyCashback(false);
        } else {
          // Edit mode preserves existing dates and delivery details
          setOrderDate(
            activeOrder.orderDate
              ? activeOrder.orderDate.split('T')[0]
              : activeOrder.createdAt
              ? activeOrder.createdAt.split('T')[0]
              : new Date().toISOString().split('T')[0]
          );
          setStatus(activeOrder.status === 'Delivered' ? 'Delivered' : 'Order In Process');
          setDeliveryPrice(
            activeOrder.deliveryPrice !== undefined && activeOrder.deliveryPrice !== null
              ? String(activeOrder.deliveryPrice)
              : ''
          );
          setDeliveryDate(
            activeOrder.deliveryDate
              ? activeOrder.deliveryDate.split('T')[0]
              : new Date().toISOString().split('T')[0]
          );
          setProfitPercent(
            activeOrder.profitPercentage !== undefined && activeOrder.profitPercentage !== null
              ? String(activeOrder.profitPercentage)
              : ''
          );
          const hasSavedCb = Boolean(activeOrder.cashbackApplied);
          setApplyCashback(hasSavedCb);
          if (hasSavedCb && activeOrder.cashbackAmount !== undefined && activeOrder.cashbackAmount !== null) {
            setCashbackAmount(String(activeOrder.cashbackAmount));
            setIsCashbackManuallyEdited(true);
          } else {
            const p = parseFloat(activeOrder.purchasePrice) || 0;
            setCashbackAmount(String(Math.round(((p * 5) / 100) * 100) / 100));
            setIsCashbackManuallyEdited(false);
          }
        }

        const pDetails = activeOrder.paymentDetails || {};
        if (activeOrder.paymentMethod === 'Debit Card') {
          setOtherPaymentType('Debit Card');
          setDebitCardHolder(pDetails.cardHolderName || '');
          setDebitLastFour(pDetails.lastFourDigits || '');
        } else if (activeOrder.paymentMethod === 'UPI') {
          setOtherPaymentType('UPI');
          setUpiId(pDetails.upiId || '');
          setUpiOwner(pDetails.upiOwnerName || '');
        } else if (activeOrder.paymentMethod && activeOrder.paymentMethod !== 'Credit Card') {
          setOtherPaymentType('Other');
          setOtherMethodName(pDetails.otherMethodName || activeOrder.paymentMethod || '');
          setReferenceNote(pDetails.referenceNote || '');
        } else {
          setOtherPaymentType('Debit Card');
          setDebitCardHolder('');
          setDebitLastFour('');
        }
      } else {
        setDealerId('');
        setDealerAddressId('');
        setProductId('');
        setCustomProductName('');
        setVariant('');
        setColorName('');
        setAccountId('');
        setPaymentMethod('Credit Card');
        setCreditCardId('');
        setPayUsingCreditCard(false);
        setOriginalOrderId('');
        setOtherPaymentType('Debit Card');
        setDebitCardHolder('');
        setDebitLastFour('');
        setUpiId('');
        setUpiOwner('');
        setOtherMethodName('');
        setReferenceNote('');
        setPurchasePrice('');
        setOrderDate(new Date().toISOString().split('T')[0]);
        setStatus('Order In Process');
        setDeliveryPrice('');
        setDeliveryDate(new Date().toISOString().split('T')[0]);
        setProfitPercent('');
        setApplyCashback(false);
        setCashbackAmount('');
        setIsCashbackManuallyEdited(false);
      }
    }
  }, [open, activeOrder, isDuplicateMode]);

  // Selected Dealer and Address derivation
  const selectedDealer = dealers.find((d) => d._id === dealerId);
  const dealerAddresses = selectedDealer?.addresses || [];

  const handleDealerChange = (newDealerId) => {
    setDealerId(newDealerId);
    const d = dealers.find((item) => item._id === newDealerId);
    if (d?.addresses?.length === 1) {
      setDealerAddressId(d.addresses[0]._id || '0');
    } else {
      setDealerAddressId('');
    }
  };

  // Selected Product, Variants, Colors derivation
  const selectedProduct = products.find((p) => p._id === productId);
  const productVariants = selectedProduct?.variants || [];
  const productColors = selectedProduct?.colors || [];

  const handleProductChange = (newProductId) => {
    setProductId(newProductId);
    if (newProductId === 'OTHER') {
      setVariant('');
      setColorName('');
      return;
    }
    const prod = products.find((p) => p._id === newProductId);
    const variants = prod?.variants || [];
    const colors = prod?.colors || [];

    if (variants.length === 1) {
      setVariant(variants[0].variantName);
    } else {
      setVariant('');
    }

    if (colors.length === 1) {
      setColorName(colors[0].colorName);
    } else {
      setColorName('');
    }
  };

  const selectedColorObj = productColors.find((c) => c.colorName === colorName);
  const selectedAccount = accounts.find((a) => a._id === accountId);
  const selectedCreditCard = creditCards.find((c) => c._id === creditCardId);

  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  const numPurchase = parseFloat(purchasePrice) || 0;
  const numDelivery = parseFloat(deliveryPrice) || 0;

  // Selected Credit Card Limits & Exceed check
  const cardTotalLimit = Number(selectedCreditCard?.totalLimit || 0);
  const cardAvailableLimit = selectedCreditCard
    ? (selectedCreditCard.availableLimit !== undefined
        ? Number(selectedCreditCard.availableLimit)
        : Math.max(0, cardTotalLimit - Number(selectedCreditCard.usedLimit || 0)))
    : 0;
  const isCreditLimitExceeded = Boolean(selectedCreditCard && numPurchase > cardAvailableLimit);

  const default5PctCashback = Math.round(((numPurchase * 5) / 100) * 100) / 100;
  const liveProfit = status === 'Delivered' && numPurchase > 0 && numDelivery > 0
    ? Math.round((numDelivery - numPurchase) * 100) / 100
    : null;
  const numericCashback = parseFloat(cashbackAmount);
  const validCashbackAmount = applyCashback && !isNaN(numericCashback) && numericCashback >= 0
    ? numericCashback
    : 0;
  const netProfit = liveProfit !== null
    ? Math.round((liveProfit + validCashbackAmount) * 100) / 100
    : null;

  const handleCashbackToggle = (e) => {
    const isChecked = e.target.checked;
    setApplyCashback(isChecked);
    if (isChecked && !isCashbackManuallyEdited) {
      setCashbackAmount(String(default5PctCashback));
    }
  };

  const handleCashbackAmountChange = (e) => {
    setCashbackAmount(e.target.value);
    setIsCashbackManuallyEdited(true);
  };

  const isFormBusy = externalLoading || submitting;

  // Form submit handler with validations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    // Dealer validation
    if (!dealerId) {
      setValidationError('Please select a dealer.');
      return;
    }
    if (dealerAddresses.length === 0) {
      setValidationError('The selected dealer has no addresses. Please add an address to the dealer in Dealer Management.');
      return;
    }
    if (!dealerAddressId && dealerAddresses.length > 1) {
      setValidationError('Please select a dealer address.');
      return;
    }

    // Product validation
    if (productId === 'OTHER') {
      if (!customProductName || !customProductName.trim()) {
        setValidationError('Please enter a custom product name.');
        return;
      }
    } else {
      if (!productId) {
        setValidationError('Please select a product.');
        return;
      }
      if (!variant) {
        setValidationError('Please select a product variant.');
        return;
      }
      if (!colorName) {
        setValidationError('Please select a product color.');
        return;
      }
    }

    // Account validation
    if (!accountId) {
      setValidationError('Please select the account used for this order.');
      return;
    }

    // Payment validation
    let finalPaymentMethod = paymentMethod;
    const finalPaymentDetails = {};

    if (paymentMethod === 'Credit Card') {
      if (!creditCardId) {
        setValidationError('Please select a registered credit card.');
        return;
      }
    } else {
      finalPaymentMethod = otherPaymentType;
      if (otherPaymentType === 'Debit Card') {
        if (!debitCardHolder.trim()) {
          setValidationError('Please enter the debit cardholder name.');
          return;
        }
        if (!/^\d{4}$/.test(debitLastFour.trim())) {
          setValidationError('Please enter the last 4 digits of the debit card.');
          return;
        }
        finalPaymentDetails.cardHolderName = debitCardHolder.trim();
        finalPaymentDetails.lastFourDigits = debitLastFour.trim();
      } else if (otherPaymentType === 'UPI') {
        if (!upiId.trim()) {
          setValidationError('Please enter the UPI ID.');
          return;
        }
        if (!upiOwner.trim()) {
          setValidationError('Please enter the UPI account owner name.');
          return;
        }
        finalPaymentDetails.upiId = upiId.trim();
        finalPaymentDetails.upiOwnerName = upiOwner.trim();
      } else if (otherPaymentType === 'Other') {
        if (!otherMethodName.trim()) {
          setValidationError('Please enter the payment method name.');
          return;
        }
        finalPaymentDetails.otherMethodName = otherMethodName.trim();
        finalPaymentDetails.referenceNote = referenceNote.trim();
      }
    }

    // Order Date validation
    if (!orderDate) {
      setValidationError('Please select the order date.');
      return;
    }
    const isoOrderDate = new Date(orderDate).toISOString();

    // Purchase Price validation
    const numPrice = parseFloat(purchasePrice);
    if (!purchasePrice || isNaN(numPrice) || numPrice <= 0) {
      setValidationError('Please enter a valid positive purchase price.');
      return;
    }

    // Delivery validation if Delivered
    let numDeliveryVal = null;
    let isoDeliveryDate = null;
    if (status === 'Delivered') {
      numDeliveryVal = parseFloat(deliveryPrice);
      if (!deliveryPrice || isNaN(numDeliveryVal) || numDeliveryVal <= 0) {
        setValidationError('Please enter a valid positive delivery price for delivered orders.');
        return;
      }
      if (!deliveryDate) {
        setValidationError('Please select the delivery date.');
        return;
      }
      isoDeliveryDate = new Date(deliveryDate).toISOString();
    }

    const payload = {
      orderDate: isoOrderDate,
      dealerId,
      dealerAddressId: dealerAddressId || (dealerAddresses.length === 1 ? dealerAddresses[0]._id : ''),
      productId: productId === 'OTHER' ? 'OTHER' : productId,
      customProductName: productId === 'OTHER' ? customProductName.trim() : undefined,
      variant: variant || 'Standard',
      color: {
        colorName: colorName || 'Standard',
        colorCode: selectedColorObj?.colorCode || '#36CFFF',
      },
      accountId,
      paymentMethod: finalPaymentMethod,
      creditCardId: paymentMethod === 'Credit Card' ? creditCardId : null,
      payUsingCreditCard: paymentMethod === 'Credit Card' ? Boolean(payUsingCreditCard) : false,
      paymentDetails: finalPaymentDetails,
      originalOrderId: originalOrderId.trim() || undefined,
      purchasePrice: numPrice,
      status,
    };

    if (status === 'Delivered') {
      payload.deliveryPrice = numDeliveryVal;
      payload.deliveryDate = isoDeliveryDate;
      payload.profitPercentage =
        profitPercent !== '' && !isNaN(Number(profitPercent)) ? Number(profitPercent) : null;
      payload.cashbackApplied = Boolean(applyCashback);
      payload.cashbackAmount = applyCashback ? validCashbackAmount : 0;
      payload.addToKhataBook = Boolean(hasLinkedKhataBook && addToKhataBook);
    }

    try {
      setSubmitting(true);
      if (typeof onSubmit === 'function') {
        await onSubmit(payload);
      } else {
        if (isEditMode) {
          await orderService.updateOrder(activeOrder._id, payload);
        } else {
          await orderService.createOrder(payload);
        }
      }
      if (typeof onSaved === 'function') {
        onSaved();
      }
      onClose();
    } catch (err) {
      console.error('Order submission error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save order. Please check inputs.';
      setValidationError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isFormBusy ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: styles.dialogPaper,
      }}
    >
      {/* Header */}
      <div className={styles.dialogHeader}>
        <div className={styles.headerTitleBox}>
          <div className={styles.headerIconBox}>
            {isDuplicateMode ? (
              <ContentCopyIcon className={styles.headerIcon} />
            ) : (
              <ReceiptLongOutlinedIcon className={styles.headerIcon} />
            )}
          </div>
          <div>
            <h2 className={styles.dialogTitle}>
              {isDuplicateMode
                ? 'Duplicate Order'
                : isEditMode
                ? 'Edit Order'
                : 'Create New Order'}
            </h2>
            <p className={styles.dialogSubtitle}>
              {isDuplicateMode
                ? `Creating duplicate copy of order #${activeOrder?.orderId || 'record'}`
                : isEditMode
                ? 'Update order specifications, selections, and price information'
                : 'Follow the workflow below to configure and save your order'}
            </p>
          </div>
        </div>

        <IconButton
          onClick={onClose}
          disabled={isFormBusy}
          className={styles.closeButton}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit}>
        <DialogContent className={styles.dialogContent}>
          {validationError && (
            <Alert severity="error" className={styles.alertBox}>
              {validationError}
            </Alert>
          )}

          {fetchingData && (
            <Alert severity="info" className={styles.alertBox}>
              Loading reference data from modules...
            </Alert>
          )}

          {/* STEP 1 & 2: Dealer & Address */}
          <div className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepBadge}>1</div>
              <h4 className={styles.stepTitle}>Select Dealer & Delivery Address</h4>
            </div>

            <div className={styles.stepGrid}>
              {/* Select Dealer */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="dealerSelect">
                  Dealer <span className={styles.requiredStar}>*</span>
                </label>
                <TextField
                  id="dealerSelect"
                  select
                  size="small"
                  value={dealerId}
                  onChange={(e) => handleDealerChange(e.target.value)}
                  disabled={isFormBusy || fetchingData}
                  className={styles.customSelect}
                  helperText={selectedDealer ? `${dealerAddresses.length} address(es)` : ''}
                >
                  <MenuItem value="">
                    <em>Select Dealer</em>
                  </MenuItem>
                  {dealers.map((d) => (
                    <MenuItem key={d._id} value={d._id}>
                      <div className={styles.menuItemOption}>
                        <span className={styles.optionPrimary}>{d.dealerName}</span>
                        {d.mobileNumbers?.[0] && (
                          <span className={styles.optionSecondary}>({d.mobileNumbers[0]})</span>
                        )}
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {/* Select Dealer Address */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="dealerAddressSelect">
                  Delivery Address <span className={styles.requiredStar}>*</span>
                </label>
                <TextField
                  id="dealerAddressSelect"
                  select
                  size="small"
                  value={dealerAddressId}
                  onChange={(e) => setDealerAddressId(e.target.value)}
                  disabled={isFormBusy || !dealerId || dealerAddresses.length === 0}
                  className={styles.customSelect}
                  helperText={
                    !dealerId
                      ? 'Select dealer first'
                      : dealerAddresses.length === 0
                        ? 'No addresses saved for this dealer'
                        : ''
                  }
                >
                  <MenuItem value="">
                    <em>Select Address</em>
                  </MenuItem>
                  {dealerAddresses.map((addr) => (
                    <MenuItem key={addr._id || addr.addressTitle} value={addr._id || addr.addressTitle}>
                      <div className={styles.menuItemOption}>
                        <span className={styles.optionPrimary}>[{addr.addressTitle}]</span>
                        <span className={styles.optionSecondary}>
                          {addr.city}, {addr.state}
                        </span>
                      </div>
                    </MenuItem>
                  ))}
                </TextField>
              </div>
            </div>
          </div>

          {/* STEP 3 & 4: Product, Variant & Color */}
          <div className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepBadge}>2</div>
              <h4 className={styles.stepTitle}>Select Product, Variant & Color</h4>
            </div>

            <div className={styles.productSpecGrid}>
              {/* Product */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="productSelect">
                  Product <span className={styles.requiredStar}>*</span>
                </label>
                <TextField
                  id="productSelect"
                  select
                  size="small"
                  value={productId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  disabled={isFormBusy || fetchingData}
                  className={styles.customSelect}
                >
                  <MenuItem value="">
                    <em>Select Product</em>
                  </MenuItem>
                  {products.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.productName}
                    </MenuItem>
                  ))}
                  <MenuItem value="OTHER">
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>+ Other (Add Custom Product)</span>
                  </MenuItem>
                </TextField>
              </div>

              {/* Custom Product Name (when Other selected) */}
              {productId === 'OTHER' && (
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label className={styles.fieldLabel} htmlFor="customProductNameInput">
                    Custom Product Name <span className={styles.requiredStar}>*</span>
                  </label>
                  <TextField
                    id="customProductNameInput"
                    size="small"
                    placeholder="Enter custom product name..."
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    disabled={isFormBusy}
                    className={styles.customInput}
                    helperText="This product will automatically be created in your Products catalog upon saving."
                    required
                  />
                </div>
              )}

              {/* Variant */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="variantSelect">
                  Variant {productId !== 'OTHER' && <span className={styles.requiredStar}>*</span>}
                </label>
                {productId === 'OTHER' ? (
                  <TextField
                    id="customVariantInput"
                    size="small"
                    placeholder="e.g. 256 GB (Optional)"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    disabled={isFormBusy}
                    className={styles.customInput}
                    helperText="Optional for custom product"
                  />
                ) : (
                  <TextField
                    id="variantSelect"
                    select
                    size="small"
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    disabled={isFormBusy || !productId || productVariants.length === 0}
                    className={styles.customSelect}
                    helperText={!productId ? 'Select product first' : `${productVariants.length} available`}
                  >
                    <MenuItem value="">
                      <em>Select Variant</em>
                    </MenuItem>
                    {productVariants.map((v, idx) => (
                      <MenuItem key={idx} value={v.variantName}>
                        {v.variantName}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </div>

              {/* Color */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="colorSelect">
                  Color {productId !== 'OTHER' && <span className={styles.requiredStar}>*</span>}
                </label>
                {productId === 'OTHER' ? (
                  <TextField
                    id="customColorInput"
                    size="small"
                    placeholder="e.g. Black (Optional)"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    disabled={isFormBusy}
                    className={styles.customInput}
                    helperText="Optional for custom product"
                  />
                ) : (
                  <TextField
                    id="colorSelect"
                    select
                    size="small"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    disabled={isFormBusy || !productId || productColors.length === 0}
                    className={styles.customSelect}
                    helperText={!productId ? 'Select product first' : `${productColors.length} available`}
                  >
                    <MenuItem value="">
                      <em>Select Color</em>
                    </MenuItem>
                    {productColors.map((c, idx) => (
                      <MenuItem key={idx} value={c.colorName}>
                        <div className={styles.menuItemOption}>
                          <div className={styles.colorOptionWrap}>
                            <svg width="14" height="14" viewBox="0 0 14 14" className={styles.colorPreviewDot}>
                              <circle
                                cx="7"
                                cy="7"
                                r="6"
                                fill={c.colorCode || '#36CFFF'}
                                stroke="rgba(255, 255, 255, 0.4)"
                                strokeWidth="1"
                              />
                            </svg>
                            <span>{c.colorName}</span>
                          </div>
                        </div>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </div>
            </div>
          </div>

          {/* STEP 5: Account Selection */}
          <div className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepBadge}>3</div>
              <h4 className={styles.stepTitle}>Select Account</h4>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.fieldLabel} htmlFor="accountAutocomplete">
                Order Account <span className={styles.requiredStar}>*</span>
              </label>
              <Autocomplete
                id="accountAutocomplete"
                options={accounts}
                value={accounts.find((a) => a._id === accountId) || null}
                onChange={(_, newVal) => {
                  setAccountId(newVal ? newVal._id : '');
                }}
                getOptionLabel={(opt) =>
                  opt ? `${opt.fullName} - ${opt.accountType} (${opt.mobileNumber || ''})` : ''
                }
                isOptionEqualToValue={(opt, val) => opt._id === (val?._id || val)}
                disabled={isFormBusy || fetchingData}
                renderOption={(props, option) => {
                  const logo = getAccountLogo(option.accountType);
                  return (
                    <li {...props} key={option._id} className={styles.accountOptionRow}>
                      <div className={styles.accountOptionLogoBox}>
                        {logo ? (
                          <img
                            src={logo}
                            alt={option.accountType}
                            className={styles.accountOptionLogo}
                          />
                        ) : (
                          <div className={styles.accountOptionFallback}>
                            {(option.accountType || 'ACC').slice(0, 3).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={styles.accountOptionText}>
                        <span className={styles.accountOptionName}>
                          {option.fullName}{' '}
                          <span className={styles.accountOptionType}>({option.accountType})</span>
                        </span>
                        <span className={styles.accountOptionMobile}>
                          {option.mobileNumber || 'No mobile number'}
                        </span>
                      </div>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder="Search by account name, type, or mobile..."
                    className={styles.customInput}
                  />
                )}
              />

              {selectedAccount && (
                <div className={styles.selectedAccountPreview}>
                  <div className={styles.accountOptionLogoBox}>
                    {getAccountLogo(selectedAccount.accountType) ? (
                      <img
                        src={getAccountLogo(selectedAccount.accountType)}
                        alt={selectedAccount.accountType}
                        className={styles.accountOptionLogo}
                      />
                    ) : (
                      <div className={styles.accountOptionFallback}>
                        {(selectedAccount.accountType || 'ACC').slice(0, 3).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className={styles.accountOptionText}>
                    <span className={styles.accountOptionName}>
                      {selectedAccount.fullName}{' '}
                      <span className={styles.accountOptionType}>({selectedAccount.accountType})</span>
                    </span>
                    <span className={styles.accountOptionMobile}>
                      {selectedAccount.mobileNumber || 'No mobile number'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 6: Payment Method & Details */}
          <div className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepBadge}>4</div>
              <h4 className={styles.stepTitle}>Select Payment Method & Details</h4>
            </div>

            <div className={styles.stepGrid}>
              {/* Payment Method Primary Category */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="paymentMethodSelect">
                  Payment Method Category <span className={styles.requiredStar}>*</span>
                </label>
                <TextField
                  id="paymentMethodSelect"
                  select
                  size="small"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={isFormBusy}
                  className={styles.customSelect}
                >
                  <MenuItem value="Credit Card">Existing Credit Card</MenuItem>
                  <MenuItem value="Other">Other Payment Method</MenuItem>
                </TextField>
              </div>

              {/* Sub-selection based on method */}
              {paymentMethod === 'Credit Card' ? (
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel} htmlFor="creditCardAutocomplete">
                    Registered Credit Card <span className={styles.requiredStar}>*</span>
                  </label>
                  <Autocomplete
                    id="creditCardAutocomplete"
                    options={creditCards}
                    value={creditCards.find((c) => c._id === creditCardId) || null}
                    onChange={(_, newVal) => {
                      setCreditCardId(newVal ? newVal._id : '');
                    }}
                    getOptionLabel={(opt) =>
                      opt
                        ? `${opt.bankName} ${opt.cardName} (${opt.lastFourDigits}) - ${opt.cardOwner || ''}`
                        : ''
                    }
                    isOptionEqualToValue={(opt, val) => opt._id === (val?._id || val)}
                    disabled={isFormBusy || fetchingData}
                    renderOption={(props, option) => {
                      const bankLogo = getBankLogo(option.bankName);
                      return (
                        <li {...props} key={option._id} className={styles.creditCardOptionRow}>
                          <div className={styles.cardOptionLeft}>
                            <div className={styles.cardBankLogoBox}>
                              {bankLogo ? (
                                <img
                                  src={bankLogo}
                                  alt={option.bankName}
                                  className={styles.cardBankLogo}
                                />
                              ) : (
                                <CreditCardIcon className={styles.cardFallbackIcon} />
                              )}
                            </div>
                            <div className={styles.cardLeftDetails}>
                              <span className={styles.cardBankName}>{option.bankName}</span>
                              <span className={styles.cardHolderName}>
                                {option.cardOwner || 'Card Owner'}
                              </span>
                            </div>
                          </div>
                          <div className={styles.cardOptionRight}>
                            <span className={styles.cardNameText}>
                              {option.cardName || 'Card'}
                            </span>
                            <span className={styles.cardLastFour}>•••• {option.lastFourDigits}</span>
                          </div>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        placeholder="Search by bank name, card name, or last 4 digits..."
                        className={styles.customInput}
                      />
                    )}
                  />

                  {selectedCreditCard && (
                    <>
                      <div className={styles.selectedCreditCardPreview}>
                        <div className={styles.cardOptionLeft}>
                          <div className={styles.cardBankLogoBox}>
                            {getBankLogo(selectedCreditCard.bankName) ? (
                              <img
                                src={getBankLogo(selectedCreditCard.bankName)}
                                alt={selectedCreditCard.bankName}
                                className={styles.cardBankLogo}
                              />
                            ) : (
                              <CreditCardIcon className={styles.cardFallbackIcon} />
                            )}
                          </div>
                          <div className={styles.cardLeftDetails}>
                            <span className={styles.cardBankName}>{selectedCreditCard.bankName}</span>
                            <span className={styles.cardHolderName}>
                              {selectedCreditCard.cardOwner || 'Card Owner'}
                            </span>
                          </div>
                        </div>
                        <div className={styles.cardOptionRight}>
                          <span className={styles.cardNameText}>
                            {selectedCreditCard.cardName || 'Card'}
                          </span>
                          <span className={styles.cardLastFour}>•••• {selectedCreditCard.lastFourDigits}</span>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: isCreditLimitExceeded ? '#ef4444' : '#10b981',
                              fontWeight: 700,
                              marginTop: 2,
                            }}
                          >
                            Avail: {formatINR(cardAvailableLimit)}
                          </span>
                        </div>
                      </div>

                      {/* Pay Using Credit Card Checkbox */}
                      <div
                        style={{
                          marginTop: 10,
                          padding: '10px 14px',
                          borderRadius: 8,
                          background: isCreditLimitExceeded
                            ? 'rgba(239, 68, 68, 0.08)'
                            : 'rgba(54, 207, 255, 0.05)',
                          border: isCreditLimitExceeded
                            ? '1px solid rgba(239, 68, 68, 0.35)'
                            : '1px solid rgba(54, 207, 255, 0.25)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            color: 'var(--text-primary, #ffffff)',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={payUsingCreditCard}
                            onChange={(e) => setPayUsingCreditCard(e.target.checked)}
                            style={{
                              width: 17,
                              height: 17,
                              accentColor: isCreditLimitExceeded ? '#ef4444' : '#38bdf8',
                              cursor: 'pointer',
                            }}
                          />
                          <span>Pay Using Credit Card</span>
                        </label>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', paddingLeft: 27 }}>
                          When enabled, deducts order amount ({formatINR(numPurchase)}) from credit card remaining limit (increasing Used Credit Limit) and adds an itemized transaction in the card history.
                          <div
                            style={{
                              marginTop: 4,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              flexWrap: 'wrap',
                            }}
                          >
                            <span
                              style={{
                                color: isCreditLimitExceeded ? '#ef4444' : '#10b981',
                                fontWeight: 700,
                                transition: 'color 0.2s ease',
                              }}
                            >
                              Available Limit: {formatINR(cardAvailableLimit)}
                            </span>
                            <span style={{ color: '#64748b' }}>•</span>
                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                              Total Limit: {formatINR(cardTotalLimit)}
                            </span>
                            {isCreditLimitExceeded && (
                              <span
                                style={{
                                  color: '#ef4444',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: 4,
                                  padding: '1px 6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                }}
                              >
                                (Exceeds available limit by {formatINR(numPurchase - cardAvailableLimit)})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label className={styles.fieldLabel} htmlFor="otherPaymentTypeSelect">
                    Payment Type <span className={styles.requiredStar}>*</span>
                  </label>
                  <TextField
                    id="otherPaymentTypeSelect"
                    select
                    size="small"
                    value={otherPaymentType}
                    onChange={(e) => setOtherPaymentType(e.target.value)}
                    disabled={isFormBusy}
                    className={styles.customSelect}
                  >
                    <MenuItem value="Debit Card">Debit Card</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Other">Other Payment Method</MenuItem>
                  </TextField>
                </div>
              )}

              {/* Additional details for Other payment types */}
              {paymentMethod === 'Other' && otherPaymentType === 'Debit Card' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="debitCardHolderInput">
                      Cardholder Name <span className={styles.requiredStar}>*</span>
                    </label>
                    <TextField
                      id="debitCardHolderInput"
                      size="small"
                      placeholder="e.g. John Doe"
                      value={debitCardHolder}
                      onChange={(e) => setDebitCardHolder(e.target.value)}
                      disabled={isFormBusy}
                      className={styles.customInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="debitLastFourInput">
                      Last 4 Digits <span className={styles.requiredStar}>*</span>
                    </label>
                    <TextField
                      id="debitLastFourInput"
                      size="small"
                      placeholder="e.g. 5432"
                      inputProps={{ maxLength: 4 }}
                      value={debitLastFour}
                      onChange={(e) => setDebitLastFour(e.target.value.replace(/\D/g, ''))}
                      disabled={isFormBusy}
                      className={styles.customInput}
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'Other' && otherPaymentType === 'UPI' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="upiIdInput">
                      UPI ID <span className={styles.requiredStar}>*</span>
                    </label>
                    <TextField
                      id="upiIdInput"
                      size="small"
                      placeholder="e.g. user@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      disabled={isFormBusy}
                      className={styles.customInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="upiOwnerInput">
                      Account Owner Name <span className={styles.requiredStar}>*</span>
                    </label>
                    <TextField
                      id="upiOwnerInput"
                      size="small"
                      placeholder="e.g. John Doe"
                      value={upiOwner}
                      onChange={(e) => setUpiOwner(e.target.value)}
                      disabled={isFormBusy}
                      className={styles.customInput}
                    />
                  </div>
                </>
              )}

              {paymentMethod === 'Other' && otherPaymentType === 'Other' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="otherMethodNameInput">
                      Payment Method Name <span className={styles.requiredStar}>*</span>
                    </label>
                    <TextField
                      id="otherMethodNameInput"
                      size="small"
                      placeholder="e.g. Net Banking, Cash, Cheque"
                      value={otherMethodName}
                      onChange={(e) => setOtherMethodName(e.target.value)}
                      disabled={isFormBusy}
                      className={styles.customInput}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="referenceNoteInput">
                      Reference Note (Optional)
                    </label>
                    <TextField
                      id="referenceNoteInput"
                      size="small"
                      placeholder="e.g. Txn #987212"
                      value={referenceNote}
                      onChange={(e) => setReferenceNote(e.target.value)}
                      disabled={isFormBusy}
                      className={styles.customInput}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* STEP 5: Order Date, Purchase Price & Order Status */}
          <div className={styles.stepSection}>
            <div className={styles.stepHeader}>
              <div className={styles.stepBadge}>5</div>
              <h4 className={styles.stepTitle}>Order Date, Price & Status Configuration</h4>
            </div>

            <div className={styles.stepGrid}>
              {/* Original Order ID */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="originalOrderIdInput">
                  Original Order ID (Optional)
                </label>
                <TextField
                  id="originalOrderIdInput"
                  size="small"
                  placeholder="e.g. OD432198765432 or 402-1234567"
                  value={originalOrderId}
                  onChange={(e) => setOriginalOrderId(e.target.value)}
                  disabled={isFormBusy}
                  className={styles.customInput}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReceiptLongOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              {/* Order Date */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="orderDateInput">
                  Order Date <span className={styles.requiredStar}>*</span>
                </label>
                <TextField
                  id="orderDateInput"
                  size="small"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  disabled={isFormBusy}
                  className={styles.customInput}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              {/* Purchase Price */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel} htmlFor="purchasePriceInput">
                  Purchase Price (INR) <span className={styles.requiredStar}>*</span>
                </label>
                <TextField
                  id="purchasePriceInput"
                  size="small"
                  type="number"
                  placeholder="e.g. 45000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  disabled={isFormBusy}
                  className={styles.customInput}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CurrencyRupeeIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>

              {/* Status Selector */}
              <div className={styles.formGroup}>
                <label className={styles.fieldLabel}>
                  Order Status <span className={styles.requiredStar}>*</span>
                </label>
                <div className={styles.statusSelectorRow}>
                  <div
                    className={`${styles.statusCardOption} ${
                      status === 'Order In Process' ? styles.statusCardSelectedProcess : ''
                    }`}
                    onClick={() => setStatus('Order In Process')}
                  >
                    <div
                      className={`${styles.statusRadioDot} ${
                        status === 'Order In Process' ? styles.statusRadioDotActiveProcess : ''
                      }`}
                    />
                    <div className={styles.statusCardText}>
                      <span className={styles.statusCardLabel}>Order In Process</span>
                      <span className={styles.statusCardDesc}>Delivery pending from dealer</span>
                    </div>
                  </div>

                  <div
                    className={`${styles.statusCardOption} ${
                      status === 'Delivered' ? styles.statusCardSelectedDelivered : ''
                    }`}
                    onClick={() => setStatus('Delivered')}
                  >
                    <div
                      className={`${styles.statusRadioDot} ${
                        status === 'Delivered' ? styles.statusRadioDotActiveDelivered : ''
                      }`}
                    />
                    <div className={styles.statusCardText}>
                      <span className={styles.statusCardLabel}>Delivered</span>
                      <span className={styles.statusCardDesc}>Order completed & settled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivered Specific Inputs */}
            {status === 'Delivered' && (
              <>
                <div className={styles.deliveredInputsGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="deliveryPriceInput">
                      Delivery Price (INR) <span className={styles.requiredStar}>*</span>
                    </label>
                    <TextField
                      id="deliveryPriceInput"
                      size="small"
                      type="number"
                      placeholder="e.g. 46500"
                      value={deliveryPrice}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDeliveryPrice(val);
                        const numD = parseFloat(val);
                        const numP = parseFloat(purchasePrice);
                        if (!isNaN(numD) && !isNaN(numP) && numP > 0) {
                          setProfitPercent((((numD - numP) / numP) * 100).toFixed(2));
                        }
                      }}
                      disabled={isFormBusy}
                      className={styles.customInput}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CurrencyRupeeIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      helperText={
                        liveProfit !== null ? (
                          liveProfit >= 0 ? (
                            <span className={styles.profitBadgeLiveGreen}>
                              Gross Profit: +{formatINR(liveProfit)}
                            </span>
                          ) : (
                            <span className={styles.profitBadgeLiveRed}>
                              Loss: -{formatINR(Math.abs(liveProfit))}
                            </span>
                          )
                        ) : (
                          'Enter selling/delivered price to calculate profit'
                        )
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="profitPercentInput">
                      Profit Percentage (%)
                    </label>
                    <TextField
                      id="profitPercentInput"
                      size="small"
                      type="number"
                      placeholder="e.g. 5, 4, 10"
                      value={profitPercent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfitPercent(val);
                        const numP = parseFloat(purchasePrice);
                        if (val !== '' && !isNaN(Number(val)) && !isNaN(numP) && numP > 0) {
                          const autoD = Math.round(numP * (1 + Number(val) / 100));
                          setDeliveryPrice(String(autoD));
                        }
                      }}
                      disabled={isFormBusy}
                      className={styles.customInput}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PercentIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                      helperText="Target margin % (auto-calculates price)"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.fieldLabel} htmlFor="deliveryDateInput">
                      Delivery Date <span className={styles.requiredStar}>*</span>
                    </label>
                    <TextField
                      id="deliveryDateInput"
                      size="small"
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      disabled={isFormBusy}
                      className={styles.customInput}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                </div>

                {/* Simplified Profit Cashback Section */}
                <div className={styles.cashbackSection}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={applyCashback}
                        onChange={handleCashbackToggle}
                        disabled={isFormBusy}
                        className={styles.cashbackCheckbox}
                        color="primary"
                      />
                    }
                    label={
                      <span className={styles.cashbackLabelText}>Apply Profit Cashback</span>
                    }
                    className={styles.cashbackFormControl}
                  />

                  {applyCashback && (
                    <div className={styles.cashbackCard}>
                      {/* Editable Cashback Amount Field */}
                      <div className={styles.cashbackInputRow}>
                        <label className={styles.fieldLabel} htmlFor="orderModalCashbackAmountInput">
                          Cashback Amount <span className={styles.requiredStar}>*</span>
                        </label>
                        <TextField
                          id="orderModalCashbackAmountInput"
                          fullWidth
                          size="small"
                          type="number"
                          placeholder={`Default: ₹${default5PctCashback}`}
                          value={cashbackAmount}
                          onChange={handleCashbackAmountChange}
                          disabled={isFormBusy}
                          className={styles.customInput}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CurrencyRupeeIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          helperText={`Default: 5% of purchase price (${formatINR(default5PctCashback)}). You can manually edit this amount.`}
                        />
                      </div>

                      {/* Summary Table */}
                      <div className={styles.cashbackTable}>
                        <div className={styles.cashbackRow}>
                          <span className={styles.cashbackKey}>Gross Profit</span>
                          <span className={styles.cashbackVal}>
                            {liveProfit !== null
                              ? (liveProfit >= 0 ? `+${formatINR(liveProfit)}` : `-${formatINR(Math.abs(liveProfit))}`)
                              : '—'}
                          </span>
                        </div>
                        <div className={styles.cashbackRow}>
                          <span className={styles.cashbackKey}>Profit Cashback (Added)</span>
                          <span className={styles.cashbackValAddition}>
                            + {formatINR(validCashbackAmount)}
                          </span>
                        </div>
                        <div className={styles.cashbackDivider} />
                        <div className={styles.cashbackRowHighlight}>
                          <span className={styles.cashbackKeyNet}>Net Profit</span>
                          <span
                            className={
                              netProfit !== null && netProfit < 0
                                ? styles.profitBadgeLiveRed
                                : styles.cashbackValNet
                            }
                          >
                            {netProfit !== null
                              ? (netProfit >= 0 ? `+${formatINR(netProfit)}` : `-${formatINR(Math.abs(netProfit))}`)
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Automatic Dealer Transaction in Khata Book */}
                {hasLinkedKhataBook && (
                  <div className={styles.khataDeliverySection}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={addToKhataBook}
                          onChange={(e) => setAddToKhataBook(e.target.checked)}
                          disabled={isFormBusy}
                          className={styles.cashbackCheckbox}
                          color="primary"
                        />
                      }
                      label={
                        <div className={styles.khataLabelGroup}>
                          <span className={styles.khataLabelTitle}>
                            Add Delivery Price to Dealer's Khata Book
                          </span>
                          <span className={styles.khataLabelSub}>
                            Credits {numDelivery > 0 ? formatINR(numDelivery) : 'delivery price'} to dealer's ledger as receivable
                          </span>
                        </div>
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* STEP 8: Order Summary Preview */}
          <div className={styles.orderSummaryBox}>
            <div className={styles.summaryHeader}>
              <h4 className={styles.summaryTitle}>Live Order Preview</h4>
              <span className={styles.statusIndicator}>
                Status: {status}
              </span>
            </div>

            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Dealer</span>
                <span className={styles.summaryItemValue}>
                  {selectedDealer?.dealerName || '—'}
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Address</span>
                <span className={styles.summaryItemValue}>
                  {dealerAddresses.find((a) => a._id === dealerAddressId)?.addressTitle ||
                    (dealerAddresses.length === 1 ? dealerAddresses[0].addressTitle : '—')}
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Product</span>
                <span className={styles.summaryItemValue}>
                  {selectedProduct?.productName
                    ? `${selectedProduct.productName} (${variant || '—'})`
                    : '—'}
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Color</span>
                <span className={styles.summaryItemValue}>{colorName || '—'}</span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Account</span>
                <span className={styles.summaryItemValue}>
                  {selectedAccount ? `${selectedAccount.fullName} (${selectedAccount.accountType})` : '—'}
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Payment</span>
                <span className={styles.summaryItemValue}>
                  {paymentMethod === 'Credit Card'
                    ? selectedCreditCard
                      ? `${selectedCreditCard.bankName} (•••• ${selectedCreditCard.lastFourDigits})`
                      : 'Credit Card'
                    : otherPaymentType}
                </span>
              </div>

              {originalOrderId && (
                <div className={styles.summaryItem}>
                  <span className={styles.summaryItemLabel}>Original Order ID</span>
                  <span className={styles.summaryItemValue}>{originalOrderId}</span>
                </div>
              )}

              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Purchase Price</span>
                <span className={styles.summaryItemValue}>
                  {purchasePrice ? formatINR(purchasePrice) : '—'}
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryItemLabel}>Delivery Price & Profit</span>
                <span className={styles.summaryItemValue}>
                  {status === 'Delivered'
                    ? deliveryPrice
                      ? `${formatINR(deliveryPrice)} (${
                          liveProfit !== null
                            ? liveProfit >= 0
                              ? applyCashback && cashbackAmount > 0
                                ? `Net: +${formatINR(netProfit)} | Gross: +${formatINR(liveProfit)}`
                                : `+${formatINR(liveProfit)}`
                              : `-${formatINR(Math.abs(liveProfit))}`
                            : '₹0'
                        })`
                      : 'Delivered (price pending)'
                    : 'Pending Delivery'}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions className={styles.dialogActions}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isFormBusy}
            className={styles.cancelBtn}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isFormBusy}
            className={styles.submitBtn}
          >
            {isFormBusy && <CircularProgress size={16} className={styles.spinner} color="inherit" />}
            {isDuplicateMode
              ? 'Create Duplicate Order'
              : isEditMode
              ? 'Save Changes'
              : 'Create Order'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrderModal;
