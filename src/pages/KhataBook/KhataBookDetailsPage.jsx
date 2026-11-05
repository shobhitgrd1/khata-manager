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
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import PaymentsIcon from '@mui/icons-material/Payments';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import PhoneIcon from '@mui/icons-material/Phone';

import CommonEmptyState from '../../components/common/CommonEmptyState';
import MoneyTransactionModal from '../../components/khatabook/MoneyTransactionModal';
import PaymentModal from '../../components/khatabook/PaymentModal';
import EditTransactionModal from '../../components/khatabook/EditTransactionModal';
import ReverseTransactionDialog from '../../components/khatabook/ReverseTransactionDialog';
import StatementModal from '../../components/khatabook/StatementModal';
import { getTransactionColumns } from './TableColumns';
import { KHATA_TRANSACTION_TYPES } from '../../constants/khatabook.constants';
import khatabookService from '../../services/khatabookService';
import useAuth from '../../hooks/useAuth';
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
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/khatabook')}
            className={styles.backBtn}
          >
            All Accounts
          </Button>

          <div className={styles.titleInfo}>
            <div className={styles.titleRow}>
              <h1 className={styles.accountName}>{account?.name || 'Ledger Account'}</h1>
              <span
                className={`${styles.typeBadge} ${
                  account?.accountType === 'Dealer' ? styles.typeDealer : styles.typeOther
                }`}
              >
                {account?.accountType === 'Dealer' ? (
                  <>
                    <StorefrontIcon fontSize="inherit" /> Dealer Account
                  </>
                ) : (
                  <>
                    <PersonOutlinedIcon fontSize="inherit" /> Other Person
                  </>
                )}
              </span>
            </div>

            {account?.mobileNumber && (
              <span className={styles.mobileText}>
                <PhoneIcon className={styles.phoneIcon} /> {account.mobileNumber}
              </span>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          <Button
            variant="outlined"
            startIcon={<AssessmentOutlinedIcon />}
            onClick={() => setStatementOpen(true)}
            className={styles.statementBtn}
          >
            View Statement
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshAll}
            className={styles.refreshBtn}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Linked Dealer Banner if available */}
      {account?.accountType === 'Dealer' && account?.dealerId && (
        <div className={styles.dealerBanner}>
          <div className={styles.dealerBannerLeft}>
            <StorefrontIcon className={styles.dealerIcon} />
            <div>
              <strong>Linked to Dealer: {account.dealerId.dealerName || account.name}</strong>
              <p>Delivery prices from confirmed delivered orders can be automatically credited here.</p>
            </div>
          </div>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/dealers')}
            className={styles.goToDealersBtn}
          >
            Go to Dealers
          </Button>
        </div>
      )}

      {/* Hero Financial Strip */}
      <div className={styles.heroStrip}>
        {/* Outstanding Balance Highlight Card */}
        <div
          className={`${styles.balanceHighlightCard} ${
            isPositive
              ? styles.cardPositive
              : isNegative
              ? styles.cardNegative
              : styles.cardSettled
          }`}
        >
          <div className={styles.balanceHeader}>
            <span className={styles.balanceStatusLabel}>
              {isPositive ? 'Amount to Receive (Positive)' : isNegative ? 'Amount to Pay (Negative)' : 'All Dues Settled'}
            </span>
            <span className={styles.statusPill}>
              {isPositive ? 'You will receive' : isNegative ? 'You will pay' : 'Settled'}
            </span>
          </div>

          <div className={styles.balanceAmountDisplay}>
            {isPositive && `+${formatINR(currentBalance)}`}
            {isNegative && `-${formatINR(currentBalance)}`}
            {isSettled && '₹0'}
          </div>

          <p className={styles.balanceExplanation}>
            {isPositive
              ? `The person owes you ${formatINR(currentBalance)}. Click Receive Payment when payment is received.`
              : isNegative
              ? `You owe this person ${formatINR(currentBalance)}. Click Make Payment when paying.`
              : 'Zero balance. No outstanding receivables or payables.'}
          </p>
        </div>

        {/* Breakdown Metric Boxes */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Total to Receive</span>
            <span className={styles.metricValGreen}>
              {isPositive ? `+${formatINR(currentBalance)}` : '₹0'}
            </span>
            <span className={styles.metricSub}>Outstanding Receivable</span>
          </div>

          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Total to Pay</span>
            <span className={styles.metricValRed}>
              {isNegative ? `-${formatINR(currentBalance)}` : '₹0'}
            </span>
            <span className={styles.metricSub}>Outstanding Payable</span>
          </div>

          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Total Money Given</span>
            <span className={styles.metricValGreen}>{formatINR(account?.totalGiven)}</span>
            <span className={styles.metricSub}>Lent / Credited</span>
          </div>

          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Total Money Taken</span>
            <span className={styles.metricValRed}>{formatINR(account?.totalTaken)}</span>
            <span className={styles.metricSub}>Borrowed / Debited</span>
          </div>

          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Payments Received</span>
            <span className={styles.metricValGreen}>{formatINR(account?.totalPaymentsReceived)}</span>
            <span className={styles.metricSub}>Settlement In</span>
          </div>

          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Payments Made</span>
            <span className={styles.metricValBlue}>{formatINR(account?.totalPaymentsMade)}</span>
            <span className={styles.metricSub}>Settlement Out</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className={styles.actionsBar}>
        <div className={styles.actionsGroup}>
          <Button
            variant="contained"
            startIcon={<TrendingUpIcon />}
            onClick={handleOpenMoneyGiven}
            className={styles.moneyGivenBtn}
          >
            + Add Money Given
          </Button>

          <Button
            variant="contained"
            startIcon={<TrendingDownIcon />}
            onClick={handleOpenMoneyTaken}
            className={styles.moneyTakenBtn}
          >
            + Add Money Taken
          </Button>
        </div>

        <div className={styles.paymentsGroup}>
          {/* Receive Payment is active when balance > 0 */}
          <Button
            variant="contained"
            startIcon={<PriceCheckIcon />}
            onClick={handleOpenReceivePayment}
            className={styles.receivePaymentBtn}
            disabled={!isPositive}
          >
            Receive Payment
          </Button>

          {/* Make Payment is active when balance < 0 */}
          <Button
            variant="contained"
            startIcon={<PaymentsIcon />}
            onClick={handleOpenMakePayment}
            className={styles.makePaymentBtn}
            disabled={!isNegative}
          >
            Make Payment
          </Button>
        </div>
      </div>

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
        <div className={styles.sectionHeader}>
          <h3>Transaction History ({transactions.length})</h3>

          {/* Filters */}
          <div className={styles.filtersRow}>
            <TextField
              placeholder="Search description, mode..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              size="small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={styles.selectField}
            >
              <MenuItem value="">All Transaction Types</MenuItem>
              {KHATA_TRANSACTION_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="From"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className={styles.dateField}
            />

            <TextField
              label="To"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className={styles.dateField}
            />
          </div>
        </div>

        {/* Transactions Table */}
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
