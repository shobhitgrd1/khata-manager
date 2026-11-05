import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  TextField,
  Tooltip,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';

import khatabookService from '../../services/khatabookService';
import styles from './StatementModal.module.scss';

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${Math.abs(Math.round(num * 100) / 100).toLocaleString('en-IN')}`;
};

const StatementModal = ({ open, onClose, accountId }) => {
  const [loading, setLoading] = useState(true);
  const [statementData, setStatementData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStatement = async () => {
    if (!accountId) return;
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await khatabookService.getStatement(accountId, params);
      if (res?.success) {
        setStatementData(res);
      }
    } catch (err) {
      console.error('Failed to load statement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && accountId) {
      fetchStatement();
    }
  }, [open, accountId]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!statementData?.transactions) return;
    const headers = [
      'Date',
      'Transaction Type',
      'Description',
      'Payment Mode',
      'Money Given (+)',
      'Money Taken (-)',
      'Payment Received (-)',
      'Payment Made (+)',
      'Running Balance',
    ];

    const rows = statementData.transactions.map((tx) => [
      tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString('en-IN') : '',
      tx.transactionType,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      tx.paymentMode || '',
      tx.transactionType === 'MONEY_GIVEN' ? tx.amount : '',
      tx.transactionType === 'MONEY_TAKEN' || (tx.transactionType === 'REVERSAL' && !tx.isReversed) ? tx.amount : '',
      tx.transactionType === 'PAYMENT_RECEIVED' ? tx.amount : '',
      tx.transactionType === 'PAYMENT_MADE' ? tx.amount : '',
      tx.runningBalance,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `KhataBook_Statement_${statementData.account?.name || 'Account'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const account = statementData?.account;
  const statement = statementData?.statement;
  const transactions = statementData?.transactions || [];
  const currentBalance = statement?.currentBalance || 0;

  return (
    <Dialog
      open={Boolean(open)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ className: styles.statementPaper }}
    >
      <DialogTitle className={styles.dialogHeader}>
        <div className={styles.headerLeft}>
          <MenuBookIcon className={styles.headerIcon} />
          <div>
            <h3>Account Statement / Ledger Report</h3>
            <p className={styles.headerSubtitle}>
              {account?.name} • {account?.accountType} Account
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Tooltip title="Export to CSV Spreadsheet">
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCSV}
              className={styles.csvBtn}
            >
              Export CSV
            </Button>
          </Tooltip>

          <Tooltip title="Print Statement / Save as PDF">
            <Button
              variant="contained"
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              className={styles.printBtn}
            >
              Print / PDF
            </Button>
          </Tooltip>

          <button type="button" onClick={onClose} className={styles.closeBtn}>
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        {/* Date Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.dateInputs}>
            <TextField
              label="From Date"
              type="date"
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className={styles.filterField}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              className={styles.filterField}
            />
            <Button variant="outlined" size="small" onClick={fetchStatement} className={styles.applyBtn}>
              Filter
            </Button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingBox}>
            <CircularProgress size={36} />
            <span>Generating ledger statement...</span>
          </div>
        ) : (
          <div className={styles.printableStatement} id="printable-statement">
            {/* Business Header for Statement */}
            <div className={styles.statementHero}>
              <div>
                <h2 className={styles.statementAccountName}>{account?.name}</h2>
                {account?.mobileNumber && (
                  <p className={styles.statementMobile}>Mobile: {account.mobileNumber}</p>
                )}
                <span className={styles.accountTypeTag}>{account?.accountType} Account</span>
              </div>

              <div className={styles.statementMetaRight}>
                <p>
                  <strong>Statement Date:</strong> {new Date().toLocaleDateString('en-IN')}
                </p>
                <div
                  className={`${styles.heroBalanceBadge} ${
                    currentBalance > 0
                      ? styles.badgePositive
                      : currentBalance < 0
                      ? styles.badgeNegative
                      : styles.badgeSettled
                  }`}
                >
                  <span className={styles.badgeLabel}>
                    {currentBalance > 0 ? 'Net Receivable' : currentBalance < 0 ? 'Net Payable' : 'Settled'}
                  </span>
                  <span className={styles.badgeVal}>
                    {currentBalance > 0 && `+${formatINR(currentBalance)}`}
                    {currentBalance < 0 && `-${formatINR(currentBalance)}`}
                    {currentBalance === 0 && '₹0'}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Grid */}
            <div className={styles.summaryGrid}>
              <div className={styles.summaryBox}>
                <span className={styles.sumLabel}>Opening Balance</span>
                <span className={styles.sumVal}>{formatINR(statement?.openingBalance)}</span>
              </div>
              <div className={styles.summaryBox}>
                <span className={styles.sumLabel}>Total Money Given</span>
                <span className={styles.sumValGreen}>{formatINR(statement?.totalGiven)}</span>
              </div>
              <div className={styles.summaryBox}>
                <span className={styles.sumLabel}>Total Money Taken</span>
                <span className={styles.sumValRed}>{formatINR(statement?.totalTaken)}</span>
              </div>
              <div className={styles.summaryBox}>
                <span className={styles.sumLabel}>Total Received</span>
                <span className={styles.sumValGreen}>{formatINR(statement?.totalPaymentsReceived)}</span>
              </div>
              <div className={styles.summaryBox}>
                <span className={styles.sumLabel}>Total Paid</span>
                <span className={styles.sumValBlue}>{formatINR(statement?.totalPaymentsMade)}</span>
              </div>
            </div>

            {/* Itemized Transactions Table */}
            <div className={styles.tableWrapper}>
              <table className={styles.statementTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Mode</th>
                    <th className={styles.numCol}>Money Given (+)</th>
                    <th className={styles.numCol}>Money Taken (-)</th>
                    <th className={styles.numCol}>Received (-)</th>
                    <th className={styles.numCol}>Paid (+)</th>
                    <th className={styles.numCol}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={styles.emptyRow}>
                        No transactions recorded for this period.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx._id} className={tx.isReversed ? styles.reversedRow : ''}>
                        <td>
                          {tx.transactionDate
                            ? new Date(tx.transactionDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td>
                          <span className={styles.typeTag}>
                            {tx.transactionType.replace(/_/g, ' ')}
                            {tx.isReversed && ' (Reversed)'}
                          </span>
                        </td>
                        <td className={styles.descCell}>{tx.description || '-'}</td>
                        <td>{tx.paymentMode || '-'}</td>
                        <td className={`${styles.numCol} ${styles.greenText}`}>
                          {tx.transactionType === 'MONEY_GIVEN' ? `+${formatINR(tx.amount)}` : '-'}
                        </td>
                        <td className={`${styles.numCol} ${styles.redText}`}>
                          {tx.transactionType === 'MONEY_TAKEN' || (tx.transactionType === 'REVERSAL' && !tx.isReversed)
                            ? `-${formatINR(tx.amount)}`
                            : '-'}
                        </td>
                        <td className={`${styles.numCol} ${styles.greenText}`}>
                          {tx.transactionType === 'PAYMENT_RECEIVED' ? `-${formatINR(tx.amount)}` : '-'}
                        </td>
                        <td className={`${styles.numCol} ${styles.blueText}`}>
                          {tx.transactionType === 'PAYMENT_MADE' ? `+${formatINR(tx.amount)}` : '-'}
                        </td>
                        <td className={`${styles.numCol} ${styles.balanceCell}`}>
                          {tx.runningBalance > 0
                            ? `+${formatINR(tx.runningBalance)}`
                            : tx.runningBalance < 0
                            ? `-${formatINR(tx.runningBalance)}`
                            : '₹0'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StatementModal;

