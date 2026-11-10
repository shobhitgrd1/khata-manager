import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Snackbar,
  MenuItem,
  Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PaymentsIcon from '@mui/icons-material/Payments';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import CommonEmptyState from '../../components/common/CommonEmptyState';
import ViewToggle from '../../components/common/ViewToggle';
import TransactionCard from '../../components/khatabook/TransactionCard';
import MoneyTransactionModal from '../../components/khatabook/MoneyTransactionModal';
import PaymentModal from '../../components/khatabook/PaymentModal';
import EditTransactionModal from '../../components/khatabook/EditTransactionModal';
import ReverseTransactionDialog from '../../components/khatabook/ReverseTransactionDialog';
import StatementModal from '../../components/khatabook/StatementModal';
import { getTransactionColumns } from './TableColumns';
import { KHATA_TRANSACTION_TYPES } from '../../constants/khatabook.constants';
import khatabookService from '../../services/khatabookService';
import useAuth from '../../hooks/useAuth';
import { useMobileHeader } from '../../context/MobileHeaderContext';
import styles from './KhataBookDetailsPage.module.scss';

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

const KhataBookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEditKhataBook } = useAuth();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // View mode (card vs list)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('khata_tx_view_mode') || 'card';
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem('khata_tx_view_mode', mode);
  };

  useMobileHeader(
    account
      ? {
          title: account.name || 'Account Ledger',
          action: {
            label: '+ Money Given',
            onClick: () => {
              setMoneyModalType('MONEY_GIVEN');
              setMoneyModalOpen(true);
            },
          },
        }
      : {
          title: 'Khata Ledger',
          action: null,
        }
  );

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const debounceTimer = useRef(null);

  // Modals state
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [moneyModalType, setMoneyModalType] = useState('MONEY_GIVEN');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalType, setPaymentModalType] = useState('PAYMENT_RECEIVED');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [reverseDialogOpen, setReverseDialogOpen] = useState(false);
  const [reversingTransaction, setReversingTransaction] = useState(null);
  const [statementOpen, setStatementOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Load account and transactions
  const loadAccountDetails = useCallback(async () => {
    if (!id) return;
    try {
      const res = await khatabookService.getKhataBookById(id);
      if (res?.success) {
        setAccount(res.khataBook);
      }
    } catch (err) {
      console.error('Failed to load account details:', err);
      setError(err.response?.data?.message || 'Failed to load account details.');
    }
  }, [id]);

  const loadTransactions = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (typeFilter) params.transactionType = typeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await khatabookService.getTransactions(id, params);
      if (res?.success) {
        setTransactions(res.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError(err.response?.data?.message || 'Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  }, [id, debouncedSearch, typeFilter, startDate, endDate]);

  const refreshAll = useCallback(() => {
    loadAccountDetails();
    loadTransactions();
  }, [loadAccountDetails, loadTransactions]);

  useEffect(() => {
    loadAccountDetails();
  }, [loadAccountDetails]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Handlers for Add Money Given / Taken
  const handleOpenMoneyGiven = () => {
    setMoneyModalType('MONEY_GIVEN');
    setMoneyModalOpen(true);
  };

  const handleOpenMoneyTaken = () => {
    setMoneyModalType('MONEY_TAKEN');
    setMoneyModalOpen(true);
  };

  const handleMoneySubmit = async (payload) => {
    setActionLoading(true);
    try {
      const res = await khatabookService.addTransaction(id, payload);
      setSuccessMsg(res?.message || 'Transaction recorded successfully.');
      setMoneyModalOpen(false);
      refreshAll();
    } catch (err) {
      console.error('Add transaction error:', err);
      setError(err.response?.data?.message || 'Failed to record transaction.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Receive Payment / Make Payment
  const handleOpenReceivePayment = () => {
    setPaymentModalType('PAYMENT_RECEIVED');
    setPaymentModalOpen(true);
  };

  const handleOpenMakePayment = () => {
    setPaymentModalType('PAYMENT_MADE');
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (payload) => {
    setActionLoading(true);
    try {
      const res = await khatabookService.recordPayment(id, payload);
      setSuccessMsg(res?.message || 'Payment recorded successfully.');
      setPaymentModalOpen(false);
      refreshAll();
    } catch (err) {
      console.error('Record payment error:', err);
      setError(err.response?.data?.message || 'Failed to process payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Edit
  const handleOpenEditTx = (tx) => {
    setEditingTransaction(tx);
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (payload) => {
    if (!editingTransaction) return;
    setActionLoading(true);
    try {
      const res = await khatabookService.updateTransaction(id, editingTransaction._id, payload);
      setSuccessMsg(res?.message || 'Transaction updated successfully.');
      setEditModalOpen(false);
      setEditingTransaction(null);
      refreshAll();
    } catch (err) {
      console.error('Update transaction error:', err);
      setError(err.response?.data?.message || 'Failed to update transaction.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers for Reversal
  const handleOpenReverseTx = (tx) => {
    setReversingTransaction(tx);
    setReverseDialogOpen(true);
  };

  const handleReverseConfirm = async (reason) => {
    if (!reversingTransaction) return;
    setActionLoading(true);
    try {
      const res = await khatabookService.reverseTransaction(id, reversingTransaction._id, { reason });
      setSuccessMsg(res?.message || 'Transaction reversed successfully.');
      setReverseDialogOpen(false);
      setReversingTransaction(null);
      refreshAll();
    } catch (err) {
      console.error('Reverse transaction error:', err);
      setError(err.response?.data?.message || 'Failed to reverse transaction.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentBalance = account?.currentBalance || 0;
  const isPositive = currentBalance > 0;
  const isNegative = currentBalance < 0;
  const isSettled = currentBalance === 0;

  const columns = useMemo(
    () =>
      getTransactionColumns({
        canEdit: canEditKhataBook(),
        onEdit: handleOpenEditTx,
        onReverse: handleOpenReverseTx,
      }),
    [canEditKhataBook]
  );

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.topHeader}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/khatabook')}
          className={styles.backBtn}
        >
          All Accounts
        </Button>

        <div className={styles.accountHeaderCenter}>
          <h1 className={styles.accountTitle}>{account?.name || 'Ledger Account'}</h1>
          <div className={styles.badgeRow}>
            <span
              className={`${styles.typeBadge} ${
                account?.accountType === 'Dealer' ? styles.typeDealer : styles.typeOther
              }`}
            >
              <StorefrontIcon className={styles.storeIcon} />
              <span>{account?.accountType === 'Dealer' ? 'DEALER ACCOUNT' : (account?.accountType || 'OTHER').toUpperCase()}</span>
            </span>
          </div>

          {account?.mobileNumber && (
            <a href={`tel:${account.mobileNumber}`} className={styles.phoneLink}>
              <PhoneIcon className={styles.phoneIcon} />
              <span>{account.mobileNumber}</span>
            </a>
          )}
        </div>

        <Button
          variant="outlined"
          startIcon={<AssessmentOutlinedIcon />}
          onClick={() => setStatementOpen(true)}
          className={styles.statementBtn}
        >
          View Statement
        </Button>
      </div>

      {/* 2x2 Glowing Summary Grid */}
      <div className={styles.summaryContainer}>
        {/* Card 1: Total to Receive */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconGreen}`}>
            <TrendingUpIcon className={styles.summaryIcon} />
          </div>
          <div className={styles.summaryTextGroup}>
            <span className={styles.summaryLabel}>Total to Receive</span>
            <span className={`${styles.summaryValue} ${styles.valGreen}`}>
              {formatINR(isPositive ? currentBalance : 0)}
            </span>
          </div>
          <ChevronRightIcon className={styles.summaryChevron} />
        </div>

        {/* Card 2: Total to Pay */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconRed}`}>
            <TrendingDownIcon className={styles.summaryIcon} />
          </div>
          <div className={styles.summaryTextGroup}>
            <span className={styles.summaryLabel}>Total to Pay</span>
            <span className={`${styles.summaryValue} ${styles.valRed}`}>
              {formatINR(isNegative ? Math.abs(currentBalance) : 0)}
            </span>
          </div>
          <ChevronRightIcon className={styles.summaryChevron} />
        </div>

        {/* Card 3: Total Money Kept / Given */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconCyan}`}>
            <AccountBalanceWalletOutlinedIcon className={styles.summaryIcon} />
          </div>
          <div className={styles.summaryTextGroup}>
            <span className={styles.summaryLabel}>Total Money Kept</span>
            <span className={`${styles.summaryValue} ${styles.valCyan}`}>
              {formatINR(account?.totalGiven || 0)}
            </span>
          </div>
          <ChevronRightIcon className={styles.summaryChevron} />
        </div>

        {/* Card 4: Total Money Taken */}
        <div className={styles.summaryCard}>
          <div className={`${styles.summaryIconBox} ${styles.iconPurple}`}>
            <PaymentsOutlinedIcon className={styles.summaryIcon} />
          </div>
          <div className={styles.summaryTextGroup}>
            <span className={styles.summaryLabel}>Total Money Taken</span>
            <span className={`${styles.summaryValue} ${styles.valPurple}`}>
              {formatINR(account?.totalTaken || 0)}
            </span>
          </div>
          <ChevronRightIcon className={styles.summaryChevron} />
        </div>
      </div>

      {/* Main Action Buttons: + Add Money Given & — Add Money Taken */}
      <div className={styles.mainActionsRow}>
        <button
          type="button"
          onClick={handleOpenMoneyGiven}
          className={styles.addMoneyGivenBtn}
        >
          <AddIcon className={styles.actionSignIcon} />
          <span>Add Money Given</span>
        </button>

        <button
          type="button"
          onClick={handleOpenMoneyTaken}
          className={styles.addMoneyTakenBtn}
        >
          <span className={styles.minusSign}>—</span>
          <span>Add Money Taken</span>
        </button>
      </div>

      {/* Settlement Dues Actions if balance is not 0 */}
      {(isPositive || isNegative) && (
        <div className={styles.settlementsRow}>
          {isPositive && (
            <button
              type="button"
              onClick={handleOpenReceivePayment}
              className={styles.settleReceiveBtn}
            >
              <PriceCheckIcon fontSize="small" />
              <span>Receive Payment ({formatINR(currentBalance)})</span>
            </button>
          )}
          {isNegative && (
            <button
              type="button"
              onClick={handleOpenMakePayment}
              className={styles.settlePayBtn}
            >
              <PaymentsIcon fontSize="small" />
              <span>Make Payment ({formatINR(currentBalance)})</span>
            </button>
          )}
        </div>
      )}

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} className={styles.alert}>
          {error}
        </Alert>
      )}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg('')} className={styles.alert}>
          {successMsg}
        </Alert>
      )}

      {/* Transactions Section */}
      <div className={styles.transactionsSection}>
        <div className={styles.txSectionHeader}>
          <div className={styles.txTitleWithIcon}>
            <ReceiptLongIcon className={styles.txDocIcon} />
            <h3 className={styles.txTitleText}>Transaction History ({transactions.length})</h3>
          </div>

          <div className={styles.desktopViewToggle}>
            <ViewToggle
              viewMode={viewMode}
              onChange={handleToggleView}
              ariaLabel="Transaction history view switcher"
            />
          </div>
        </div>

        {/* Filter Bar: Search & Date */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <SearchIcon className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search description, mode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.dateBox}>
            <CalendarMonthIcon className={styles.calendarIcon} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.dateInput}
            />
          </div>

          <div className={styles.mobileViewToggle}>
            <ViewToggle
              viewMode={viewMode}
              onChange={handleToggleView}
              ariaLabel="Transaction history view switcher"
            />
          </div>
        </div>

        {/* Transactions Card View vs Table View */}
        {loading ? (
          <div className={styles.loadingBox}>
            <CircularProgress className={styles.spinner} />
            <span>Loading ledger entries...</span>
          </div>
        ) : transactions.length === 0 ? (
          <CommonEmptyState
            icon={TrendingUpIcon}
            title="No Transactions Found"
            description="No ledger transactions have been recorded yet or matched your filters."
            actionLabel="+ Add Money Given"
            onAction={handleOpenMoneyGiven}
          />
        ) : viewMode === 'card' ? (
          <div className={styles.txCardGrid}>
            {transactions.map((tx) => (
              <TransactionCard
                key={tx._id}
                transaction={tx}
                canEdit={canEditKhataBook()}
                onEdit={handleOpenEditTx}
                onReverse={handleOpenReverseTx}
              />
            ))}
          </div>
        ) : (
          <div className={styles.tableCard}>
            <DataGrid
              rows={transactions}
              columns={columns}
              getRowId={(row) => row._id}
              autoHeight
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: { paginationModel: { pageSize: 15, page: 0 } },
              }}
              disableRowSelectionOnClick
              className={styles.dataGrid}
            />
          </div>
        )}
      </div>

      {/* Bottom Full-Width Button: Go to Dealer */}
      {account?.accountType === 'Dealer' && (
        <button
          type="button"
          onClick={() => navigate('/dealers')}
          className={styles.goToDealerBottomBtn}
        >
          <LeaderboardIcon className={styles.dealerBtnIcon} />
          <span className={styles.dealerBtnText}>Go to Dealer</span>
          <ChevronRightIcon className={styles.dealerBtnChevron} />
        </button>
      )}

      {/* Modals */}
      <MoneyTransactionModal
        open={moneyModalOpen}
        onClose={() => setMoneyModalOpen(false)}
        onSubmit={handleMoneySubmit}
        type={moneyModalType}
        accountName={account?.name}
        loading={actionLoading}
      />

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        paymentType={paymentModalType}
        account={account}
        loading={actionLoading}
      />

      <EditTransactionModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleEditSubmit}
        transaction={editingTransaction}
        loading={actionLoading}
      />

      <ReverseTransactionDialog
        open={reverseDialogOpen}
        onClose={() => {
          setReverseDialogOpen(false);
          setReversingTransaction(null);
        }}
        onConfirm={handleReverseConfirm}
        transaction={reversingTransaction}
        loading={actionLoading}
      />

      <StatementModal
        open={statementOpen}
        onClose={() => setStatementOpen(false)}
        accountId={id}
      />

      {/* Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2500}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
};

export default KhataBookDetailsPage;
