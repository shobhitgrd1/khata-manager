import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PaymentsIcon from '@mui/icons-material/Payments';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import UndoIcon from '@mui/icons-material/Undo';
import ViewToggle from '../../components/common/ViewToggle';
import CommonEmptyState from '../../components/common/CommonEmptyState';
import ReverseTransactionDialog from '../../components/khatabook/ReverseTransactionDialog';
import CreditCardTransactionModal from '../../components/creditCards/CreditCardTransactionModal';
import { getBankLogo } from '../../utils/bankLogos';
import creditCardService from '../../services/creditCardService';
import useAuth from '../../hooks/useAuth';
import styles from './CreditCardDetailsPage.module.scss';

const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return '₹' + Number(val).toLocaleString('en-IN');
};

const formatDate = (val) => {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (val) => {
  if (!val) return '';
  return new Date(val).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CreditCardDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEditCreditCard } = useAuth();

  const [card, setCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View mode
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('khata_cc_tx_view_mode') || 'card';
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('khata_cc_tx_view_mode', mode);
  };

  // Search & Type Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Modals state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('PAY_CARD');
  const [reverseDialogOpen, setReverseDialogOpen] = useState(false);
  const [reversingTx, setReversingTx] = useState(null);

  // Load card details & transactions
  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [cardRes, txRes] = await Promise.all([
        creditCardService.getCreditCardById(id),
        creditCardService.getTransactions(id, {
          search: debouncedSearch.trim() || undefined,
          type: typeFilter || undefined,
        }),
      ]);

      if (cardRes?.creditCard) {
        setCard(cardRes.creditCard);
      }
      if (txRes?.transactions) {
        setTransactions(txRes.transactions);
      }
    } catch (err) {
      console.error('Failed to load card details or transactions:', err);
      setError(err.response?.data?.message || 'Failed to load card transactions.');
    } finally {
      setLoading(false);
    }
  }, [id, debouncedSearch, typeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Pay Credit Card
  const handleOpenPayModal = () => {
    setTxModalType('PAY_CARD');
    setTxModalOpen(true);
  };

  // Handle Use Credit Card
  const handleOpenUseModal = () => {
    setTxModalType('USE_CARD');
    setTxModalOpen(true);
  };

  // Submit Transaction
  const handleTxSubmit = async (payload) => {
    try {
      setActionLoading(true);
      const res = await creditCardService.addTransaction(id, payload);
      setSuccessMsg(res?.message || 'Transaction recorded successfully');
      setTxModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Add transaction error:', err);
      setError(err.response?.data?.message || 'Failed to record transaction');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reversal
  const handleOpenReverse = (tx) => {
    setReversingTx(tx);
    setReverseDialogOpen(true);
  };

  const handleConfirmReverse = async (reason) => {
    if (!reversingTx?._id) return;
    try {
      setActionLoading(true);
      const res = await creditCardService.reverseTransaction(id, reversingTx._id, { reason });
      setSuccessMsg(res?.message || 'Transaction reversed successfully');
      setReverseDialogOpen(false);
      setReversingTx(null);
      loadData();
    } catch (err) {
      console.error('Reverse transaction error:', err);
      setError(err.response?.data?.message || 'Failed to reverse transaction');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculations for summary cards
  const totalLimit = Number(card?.totalLimit || 0);
  const usedLimit =
    card?.usedLimit !== undefined
      ? Number(card.usedLimit)
      : Math.max(0, totalLimit - Number(card?.availableLimit || 0));
  const remainingLimit = Math.max(0, totalLimit - usedLimit);
  const utilization = totalLimit > 0 ? Math.min(100, Math.round((usedLimit / totalLimit) * 100)) : 0;
  const bankLogo = card?.bankName ? getBankLogo(card.bankName) : null;

  // DataGrid Columns
  const tableColumns = useMemo(
    () => [
      {
        field: 'transactionDate',
        headerName: 'Date & Time',
        width: 170,
        renderCell: (params) => (
          <div>
            <div style={{ fontWeight: 600 }}>{formatDate(params.value)}</div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{formatTime(params.value)}</div>
          </div>
        ),
      },
      {
        field: 'transactionType',
        headerName: 'Type',
        width: 150,
        renderCell: (params) => {
          const isPay = params.value === 'PAY_CARD';
          return (
            <span
              className={`${styles.txBadge} ${isPay ? styles.badgePay : styles.badgeUse}`}
            >
              {isPay ? 'Pay Credit Card' : 'Use Credit Card'}
            </span>
          );
        },
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 1.5,
        minWidth: 220,
        renderCell: (params) => {
          const row = params?.row || {};
          return (
            <div>
              <div style={{ fontWeight: 600 }}>{row.description || '—'}</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Mode: {row.paymentMode || 'Card'}
                {row.referenceType === 'Order' && ' • [Order Linked]'}
                {row.isReversed && ' • (REVERSED)'}
              </div>
            </div>
          );
        },
      },
      {
        field: 'amount',
        headerName: 'Amount',
        width: 140,
        renderCell: (params) => {
          const row = params?.row || {};
          const isPay = row.transactionType === 'PAY_CARD';
          return (
            <span
              className={`${styles.txAmount} ${isPay ? styles.amountGreen : styles.amountOrange}`}
            >
              {isPay ? `— ${formatINR(row.amount)}` : `+ ${formatINR(row.amount)}`}
            </span>
          );
        },
      },
      {
        field: 'runningUsedLimit',
        headerName: 'Running Used',
        width: 140,
        renderCell: (params) => (
          <span style={{ fontWeight: 600 }}>{formatINR(params.value)}</span>
        ),
      },
      {
        field: 'actions',
        headerName: 'Action',
        width: 100,
        sortable: false,
        renderCell: (params) => {
          const row = params?.row;
          if (row?.isReversed) {
            return <span className={`${styles.txBadge} ${styles.badgeReversed}`}>Reversed</span>;
          }
          return canEditCreditCard() ? (
            <Tooltip title="Reverse Transaction" arrow>
              <button
                type="button"
                onClick={() => handleOpenReverse(row)}
                className={styles.reverseBtn}
              >
                <UndoIcon fontSize="small" />
              </button>
            </Tooltip>
          ) : null;
        },
      },
    ],
    [canEditCreditCard]
  );

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topHeader}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/credit-cards')}
          className={styles.backBtn}
        >
          All Credit Cards
        </Button>

        <div className={styles.cardHeaderCenter}>
          <div className={styles.cardBankLogo}>
            {bankLogo ? (
              <img src={bankLogo} alt={card?.bankName} />
            ) : (
              <span className={styles.cardFallbackLogo}>
                {(card?.bankName || 'CC').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className={styles.cardHeaderInfo}>
            <h1 className={styles.cardTitle}>
              {card?.cardName || 'Credit Card'} •••• {card?.lastFourDigits}
            </h1>
            <p className={styles.cardSubtitle}>
              <span>{card?.bankName}</span>
              <span>•</span>
              <span>Cardholder: <strong>{card?.cardOwner || 'Owner'}</strong></span>
            </p>
          </div>
        </div>

        <div style={{ width: 120 }} />
      </div>

      {/* 4 Summary Cards Grid */}
      <div className={styles.summaryContainer}>
        {/* Card 1: Total Limit */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconBlue}`}>
            <AccountBalanceWalletIcon />
          </div>
          <div className={styles.summaryTextGroup}>
            <span className={styles.summaryLabel}>Total Credit Limit</span>
            <span className={styles.summaryValue}>{formatINR(totalLimit)}</span>
          </div>
        </div>

        {/* Card 2: Used Limit */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconOrange}`}>
            <DonutLargeIcon />
          </div>
          <div className={styles.summaryTextGroup}>
            <span className={styles.summaryLabel}>Used Credit Limit</span>
            <span className={`${styles.summaryValue} ${styles.valOrange}`}>
              {formatINR(usedLimit)}
            </span>
          </div>
        </div>

        {/* Card 3: Remaining Limit */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconGreen}`}>
            <CheckCircleOutlinedIcon />
          </div>
          <div className={styles.summaryTextGroup}>
            <span className={styles.summaryLabel}>Remaining Limit</span>
            <span className={`${styles.summaryValue} ${styles.valGreen}`}>
              {formatINR(remainingLimit)}
            </span>
          </div>
        </div>

        {/* Card 4: Utilization */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconPurple}`}>
            <CreditCardIcon />
          </div>
          <div className={styles.summaryTextGroup}>
            <span className={styles.summaryLabel}>Card Utilization</span>
            <span className={styles.summaryValue}>{utilization}%</span>
          </div>
        </div>
      </div>

      {/* Main Action Buttons: + Pay Credit Card & + Use Credit Card */}
      {canEditCreditCard() && (
        <div className={styles.mainActionsRow}>
          <button
            type="button"
            onClick={handleOpenPayModal}
            className={styles.payCardBtn}
          >
            <PaymentsIcon fontSize="small" />
            <span>Pay Credit Card</span>
          </button>

          <button
            type="button"
            onClick={handleOpenUseModal}
            className={styles.useCardBtn}
          >
            <CreditCardIcon fontSize="small" />
            <span>Use Credit Card</span>
          </button>
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      {/* Search & Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <TextField
            placeholder="Search by description or mode..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <ClearIcon
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSearch('')}
                  />
                </InputAdornment>
              ) : null,
            }}
          />

          <TextField
            select
            size="small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.typeFilterSelect}
          >
            <MenuItem value="">All Transactions</MenuItem>
            <MenuItem value="PAY_CARD">Payments Only</MenuItem>
            <MenuItem value="USE_CARD">Usage Only</MenuItem>
          </TextField>
        </div>

        <ViewToggle
          viewMode={viewMode}
          onChange={handleToggleView}
          ariaLabel="Transaction view toggle"
        />
      </div>

      {/* Transactions Section */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <CircularProgress size={44} />
          <span>Loading transaction history...</span>
        </div>
      ) : transactions.length === 0 ? (
        <CommonEmptyState
          title="No Transactions Yet"
          description="Use the buttons above to record payments or card usage."
        />
      ) : viewMode === 'list' ? (
        <div className={styles.dataGridContainer}>
          <DataGrid
            rows={transactions}
            columns={tableColumns}
            getRowId={(r) => r._id}
            autoHeight
            rowHeight={64}
            initialState={{
              pagination: { paginationModel: { pageSize: 10, page: 0 } },
            }}
            pageSizeOptions={[10, 20, 50]}
            disableRowSelectionOnClick
          />
        </div>
      ) : (
        <div className={styles.txCardsList}>
          {transactions.map((tx) => {
            const isPay = tx.transactionType === 'PAY_CARD';
            return (
              <div
                key={tx._id}
                className={`${styles.txCard} ${tx.isReversed ? styles.reversedCard : ''}`}
              >
                <div className={styles.txLeft}>
                  <div
                    className={`${styles.txIconCircle} ${
                      isPay ? styles.payCircle : styles.useCircle
                    }`}
                  >
                    {isPay ? <PaymentsIcon fontSize="inherit" /> : <CreditCardIcon fontSize="inherit" />}
                  </div>

                  <div className={styles.txMainText}>
                    <div className={styles.txTopLine}>
                      <span
                        className={`${styles.txBadge} ${
                          isPay ? styles.badgePay : styles.badgeUse
                        }`}
                      >
                        {isPay ? 'Payment' : 'Usage'}
                      </span>
                      {tx.referenceType === 'Order' && (
                        <span className={`${styles.txBadge} ${styles.badgeOrder}`}>
                          Order Linked
                        </span>
                      )}
                      {tx.isReversed && (
                        <span className={`${styles.txBadge} ${styles.badgeReversed}`}>
                          Reversed
                        </span>
                      )}
                      <span className={styles.txDate}>
                        {formatDate(tx.transactionDate)} • {formatTime(tx.transactionDate)}
                      </span>
                    </div>

                    <div className={styles.txDesc}>{tx.description || 'No description'}</div>
                    <div className={styles.txSubMeta}>
                      Mode: {tx.paymentMode || 'Card'}
                      {tx.reversalReason && ` • Reversal Reason: ${tx.reversalReason}`}
                    </div>
                  </div>
                </div>

                <div className={styles.txRight}>
                  <div className={styles.amountGroup}>
                    <span
                      className={`${styles.txAmount} ${
                        isPay ? styles.amountGreen : styles.amountOrange
                      }`}
                    >
                      {isPay ? `— ${formatINR(tx.amount)}` : `+ ${formatINR(tx.amount)}`}
                    </span>
                    <span className={styles.txRunning}>
                      Used Limit: {formatINR(tx.runningUsedLimit)}
                    </span>
                  </div>

                  {!tx.isReversed && canEditCreditCard() && (
                    <Tooltip title="Reverse Transaction" arrow>
                      <button
                        type="button"
                        onClick={() => handleOpenReverse(tx)}
                        className={styles.reverseBtn}
                      >
                        <UndoIcon fontSize="small" />
                      </button>
                    </Tooltip>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Modal (Pay / Use) */}
      <CreditCardTransactionModal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        type={txModalType}
        card={card}
        onSubmit={handleTxSubmit}
        loading={actionLoading}
      />

      {/* Reverse Transaction Confirmation Dialog */}
      <ReverseTransactionDialog
        open={reverseDialogOpen}
        transaction={reversingTx}
        onConfirm={handleConfirmReverse}
        onClose={() => setReverseDialogOpen(false)}
        loading={actionLoading}
      />
    </div>
  );
};

export default CreditCardDetailsPage;
