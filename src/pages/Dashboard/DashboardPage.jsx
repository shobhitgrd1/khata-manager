import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  TextField,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import PercentIcon from "@mui/icons-material/Percent";
import RedeemIcon from "@mui/icons-material/Redeem";

import useAuth from "../../hooks/useAuth";
import userService from "../../services/userService";
import creditCardService from "../../services/creditCardService";
import accountService from "../../services/accountService";
import dealerService from "../../services/dealerService";
import productService from "../../services/productService";
import orderService from "../../services/orderService";
import { useMobileHeader } from "../../context/MobileHeaderContext";
import styles from "./DashboardPage.module.scss";

const formatINR = (val) => {
  return `₹${Number(val || 0).toLocaleString("en-IN")}`;
};

const formatDateBounds = (preset) => {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  let start = new Date();

  switch (preset) {
    case "7days":
      start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
      break;
    case "15days":
      start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000);
      break;
    case "30days":
      start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
      break;
    case "60days":
      start = new Date(end.getTime() - 59 * 24 * 60 * 60 * 1000);
      break;
    case "90days":
      start = new Date(end.getTime() - 89 * 24 * 60 * 60 * 1000);
      break;
    case "this_month":
      start = new Date(end.getFullYear(), end.getMonth(), 1);
      break;
    case "last_month":
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000);
  }
  start.setHours(0, 0, 0, 0);

  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatYMD(start),
    endDate: formatYMD(end),
  };
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const {
    canAccessUserManagement,
    canAccessCreditCards,
    canAccessAccounts,
    canAccessDealers,
    canAccessProducts,
    canAccessOrders,
  } = useAuth();

  // Summary states for modules
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [ccSummary, setCcSummary] = useState(null);
  const [loadingCcSummary, setLoadingCcSummary] = useState(true);
  const [accountSummary, setAccountSummary] = useState(null);
  const [loadingAccountSummary, setLoadingAccountSummary] = useState(true);
  const [dealerSummary, setDealerSummary] = useState(null);
  const [loadingDealerSummary, setLoadingDealerSummary] = useState(true);
  const [productSummary, setProductSummary] = useState(null);
  const [loadingProductSummary, setLoadingProductSummary] = useState(true);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loadingOrderSummary, setLoadingOrderSummary] = useState(true);

  // Order Performance & Profit state
  const [datePreset, setDatePreset] = useState("15days");
  const [customStartDate, setCustomStartDate] = useState(() => formatDateBounds("15days").startDate);
  const [customEndDate, setCustomEndDate] = useState(() => formatDateBounds("15days").endDate);
  const [orderPerformance, setOrderPerformance] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(true);

  const showUserManagement = canAccessUserManagement();
  const showCreditCards = canAccessCreditCards();
  const showAccounts = canAccessAccounts();
  const showDealers = canAccessDealers();
  const showProducts = canAccessProducts();
  const showOrders = canAccessOrders();

  useMobileHeader({ title: 'Dashboard', action: null });

  // Fetch Reference Summaries
  useEffect(() => {
    let isMounted = true;
    const fetchUserStats = async () => {
      try {
        if (showUserManagement) {
          const data = await userService.getUserStats();
          if (isMounted && data?.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load user stats:", err);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    const fetchCreditCardSummary = async () => {
      try {
        if (showCreditCards) {
          const data = await creditCardService.getCreditCardSummary();
          if (isMounted && data?.summary) setCcSummary(data.summary);
        }
      } catch (err) {
        console.error("Failed to load credit card summary:", err);
      } finally {
        if (isMounted) setLoadingCcSummary(false);
      }
    };

    fetchUserStats();
    fetchCreditCardSummary();
    return () => {
      isMounted = false;
    };
  }, [showUserManagement, showCreditCards]);

  useEffect(() => {
    let isMounted = true;
    const fetchAccountSummary = async () => {
      try {
        if (showAccounts) {
          const data = await accountService.getAccountSummary();
          if (isMounted && data?.summary) setAccountSummary(data.summary);
        }
      } catch (err) {
        console.error("Failed to load account summary:", err);
      } finally {
        if (isMounted) setLoadingAccountSummary(false);
      }
    };
    fetchAccountSummary();
    return () => {
      isMounted = false;
    };
  }, [showAccounts]);

  useEffect(() => {
    let isMounted = true;
    const fetchDealerSummary = async () => {
      try {
        if (showDealers) {
          const data = await dealerService.getDealerSummary();
          if (isMounted && data?.summary) setDealerSummary(data.summary);
        }
      } catch (err) {
        console.error("Failed to load dealer summary:", err);
      } finally {
        if (isMounted) setLoadingDealerSummary(false);
      }
    };
    fetchDealerSummary();
    return () => {
      isMounted = false;
    };
  }, [showDealers]);

  useEffect(() => {
    let isMounted = true;
    const fetchProductSummary = async () => {
      try {
        if (showProducts) {
          const data = await productService.getProductSummary();
          if (isMounted && data?.summary) setProductSummary(data.summary);
        }
      } catch (err) {
        console.error("Failed to load product summary:", err);
      } finally {
        if (isMounted) setLoadingProductSummary(false);
      }
    };
    fetchProductSummary();
    return () => {
      isMounted = false;
    };
  }, [showProducts]);

  useEffect(() => {
    let isMounted = true;
    const fetchOrderSummary = async () => {
      try {
        if (showOrders) {
          const data = await orderService.getOrderSummary();
          if (isMounted && data?.summary) setOrderSummary(data.summary);
        }
      } catch (err) {
        console.error("Failed to load order summary:", err);
      } finally {
        if (isMounted) setLoadingOrderSummary(false);
      }
    };
    fetchOrderSummary();
    return () => {
      isMounted = false;
    };
  }, [showOrders]);

  // Fetch Order Performance (filtered by delivery date)
  const fetchOrderPerformance = useCallback(async () => {
    if (!showOrders) return;
    setLoadingPerformance(true);
    try {
      let start;
      let end;
      if (datePreset === "custom") {
        start = customStartDate;
        end = customEndDate;
      } else {
        const bounds = formatDateBounds(datePreset);
        start = bounds.startDate;
        end = bounds.endDate;
      }

      const data = await orderService.getOrderPerformance({
        startDate: start,
        endDate: end,
      });

      if (data?.performance) {
        setOrderPerformance(data.performance);
      }
    } catch (err) {
      console.error("Failed to load order performance:", err);
    } finally {
      setLoadingPerformance(false);
    }
  }, [showOrders, datePreset, customStartDate, customEndDate]);

  useEffect(() => {
    fetchOrderPerformance();
  }, [fetchOrderPerformance]);

  const handleDatePresetChange = (e) => {
    const val = e.target.value;
    setDatePreset(val);
    if (val !== "custom") {
      const bounds = formatDateBounds(val);
      setCustomStartDate(bounds.startDate);
      setCustomEndDate(bounds.endDate);
    }
  };

  return (
    <div className={styles.container}>
      {/* ─── 1. ORDERS SECTION (TOP SECTION) ─────────────────────────── */}
      {showOrders && (
        <section className={styles.dashboardSection}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionHeading}>Orders</h2>
              <p className={styles.sectionSubheading}>
                Real-time snapshot of active dealer orders and deliveries
              </p>
            </div>
          </div>

          <Card className={styles.ordersTopCard}>
            <CardActionArea
              onClick={() => navigate("/orders")}
              className={styles.ordersCardActionArea}
            >
              <CardContent className={styles.ordersCardContent}>
                <div className={styles.ordersCardHeader}>
                  <div className={styles.orderIconBox}>
                    <ReceiptLongOutlinedIcon className={styles.mgmtIcon} />
                  </div>
                  <div className={styles.ordersCardTitleArea}>
                    <h3 className={styles.cardHeading}>Orders</h3>
                    <p className={styles.cardDesc}>
                      Track dealer orders, manage deliveries, and calculate real-time profit margins.
                    </p>
                  </div>
                  <div className={styles.ctaLinkInline}>
                    <span>Open Orders</span>
                    <ArrowForwardIcon className={styles.arrowIcon} />
                  </div>
                </div>

                <div className={styles.ordersMetricsGrid}>
                  <div className={styles.orderMetricItem}>
                    <span className={styles.metricItemLabel}>Total Orders</span>
                    <span className={styles.metricItemVal}>
                      {loadingOrderSummary ? (
                        <Skeleton width={40} height={28} />
                      ) : (
                        orderSummary?.totalOrders ?? 0
                      )}
                    </span>
                  </div>

                  <div className={styles.metricDivider} />

                  <div className={styles.orderMetricItem}>
                    <span className={styles.metricItemLabel}>In Process</span>
                    <span className={styles.metricItemValWarning}>
                      {loadingOrderSummary ? (
                        <Skeleton width={40} height={28} />
                      ) : (
                        orderSummary?.inProcessOrders ?? 0
                      )}
                    </span>
                  </div>

                  <div className={styles.metricDivider} />

                  <div className={styles.orderMetricItem}>
                    <span className={styles.metricItemLabel}>Delivered</span>
                    <span className={styles.metricItemValSuccess}>
                      {loadingOrderSummary ? (
                        <Skeleton width={40} height={28} />
                      ) : (
                        orderSummary?.deliveredOrders ?? 0
                      )}
                    </span>
                  </div>

                  <div className={styles.metricDivider} />

                  <div className={styles.orderMetricItem}>
                    <span className={styles.metricItemLabel}>Total Profit</span>
                    <span className={styles.metricItemValHighlight}>
                      {loadingOrderSummary ? (
                        <Skeleton width={70} height={28} />
                      ) : (
                        formatINR(orderSummary?.totalProfit ?? 0)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </CardActionArea>
          </Card>
        </section>
      )}

      {/* ─── 2. ORDER PERFORMANCE & PROFIT SECTION (FULL WIDTH) ──────── */}
      {showOrders && (
        <section className={styles.orderPerformanceSection}>
          <div className={styles.perfHeaderRow}>
            <div className={styles.perfTitleArea}>
              <h2 className={styles.sectionHeading}>Order Performance & Profit</h2>
              <p className={styles.sectionSubheading}>
                Delivered orders, profit margins, and financial volume for the selected delivery period
              </p>
            </div>

            <div className={styles.dateFilterContainer}>
              <TextField
                select
                size="small"
                value={datePreset}
                onChange={handleDatePresetChange}
                className={styles.datePresetSelect}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="15days">Last 15 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="60days">Last 60 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="this_month">This Month</MenuItem>
                <MenuItem value="last_month">Last Month</MenuItem>
                <MenuItem value="custom">Custom Date Range</MenuItem>
              </TextField>

              {datePreset === "custom" && (
                <div className={styles.customDateInputs}>
                  <TextField
                    type="date"
                    size="small"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className={styles.customDateField}
                  />
                  <TextField
                    type="date"
                    size="small"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className={styles.customDateField}
                  />
                </div>
              )}
            </div>
          </div>

          <div className={styles.perfGrid}>
            {/* 1. Total Profit Cashback */}
            <div className={styles.perfCard}>
              <div className={styles.perfIconBoxCashback}>
                <PercentIcon fontSize="inherit" />
              </div>
              <div className={styles.perfContent}>
                <span className={styles.perfLabel}>Total Profit Cashback</span>
                <span className={styles.perfValueCashback}>
                  {loadingPerformance ? (
                    <Skeleton width={80} height={32} />
                  ) : (
                    `+${formatINR(orderPerformance?.totalCashbackProfit ?? 0)}`
                  )}
                </span>
                <span className={styles.perfSubtext}>Extra dealer profit</span>
              </div>
            </div>

            {/* 2. Total Cashback Orders */}
            <div className={styles.perfCard}>
              <div className={styles.perfIconBoxCashbackOrders}>
                <RedeemIcon fontSize="inherit" />
              </div>
              <div className={styles.perfContent}>
                <span className={styles.perfLabel}>Total Cashback Orders</span>
                <span className={styles.perfValueCyan}>
                  {loadingPerformance ? (
                    <Skeleton width={50} height={32} />
                  ) : (
                    orderPerformance?.totalCashbackOrders ?? 0
                  )}
                </span>
                <span className={styles.perfSubtext}>
                  {(orderPerformance?.totalCashbackOrders ?? 0) > 0
                    ? `${orderPerformance.totalCashbackOrders} delivered with CB`
                    : 'Delivered orders with CB'}
                </span>
              </div>
            </div>

            {/* 3. Total Gross Profit */}
            <div className={styles.perfCard}>
              <div className={styles.perfIconBoxProfit}>
                <TrendingUpIcon fontSize="inherit" />
              </div>
              <div className={styles.perfContent}>
                <span className={styles.perfLabel}>Total Gross Profit</span>
                <span className={styles.perfValueProfit}>
                  {loadingPerformance ? (
                    <Skeleton width={80} height={32} />
                  ) : (
                    `+${formatINR(orderPerformance?.totalProfit ?? 0)}`
                  )}
                </span>
                <span className={styles.perfSubtext}>Delivery - Purchase</span>
              </div>
            </div>

            {/* 4. Total Net Profit */}
            <div className={styles.perfCard}>
              <div className={styles.perfIconBoxCompleted}>
                <CheckCircleOutlinedIcon fontSize="inherit" />
              </div>
              <div className={styles.perfContent}>
                <span className={styles.perfLabel}>Total Net Profit</span>
                <span className={styles.perfValueSuccess}>
                  {loadingPerformance ? (
                    <Skeleton width={80} height={32} />
                  ) : (
                    (() => {
                      const netVal = orderPerformance?.netProfitAfterCashback ?? (
                        Number(orderPerformance?.totalProfit || 0) +
                        Number(orderPerformance?.totalCashbackProfit || 0) -
                        Number(orderPerformance?.totalLoss || 0)
                      );
                      return netVal >= 0 ? `+${formatINR(netVal)}` : `-${formatINR(Math.abs(netVal))}`;
                    })()
                  )}
                </span>
                <span className={styles.perfSubtext}>Gross Profit + Cashback</span>
              </div>
            </div>

            {/* 5. Total Loss */}
            <div className={styles.perfCard}>
              <div className={styles.perfIconBoxLoss}>
                <TrendingDownIcon fontSize="inherit" />
              </div>
              <div className={styles.perfContent}>
                <span className={styles.perfLabel}>Total Loss</span>
                <span className={styles.perfValueLoss}>
                  {loadingPerformance ? (
                    <Skeleton width={80} height={32} />
                  ) : (
                    `-${formatINR(orderPerformance?.totalLoss ?? 0)}`
                  )}
                </span>
                <span className={styles.perfSubtext}>Realized deficit</span>
              </div>
            </div>

            {/* 5. Total Purchase Amount */}
            <div className={styles.perfCard}>
              <div className={styles.perfIconBoxPurchase}>
                <AccountBalanceWalletIcon fontSize="inherit" />
              </div>
              <div className={styles.perfContent}>
                <span className={styles.perfLabel}>Total Purchase Amount</span>
                <span className={styles.perfValuePrimary}>
                  {loadingPerformance ? (
                    <Skeleton width={90} height={32} />
                  ) : (
                    formatINR(orderPerformance?.totalPurchaseAmount ?? 0)
                  )}
                </span>
                <span className={styles.perfSubtext}>Purchase cost</span>
              </div>
            </div>

            {/* 6. Total Delivery Amount */}
            <div className={styles.perfCard}>
              <div className={styles.perfIconBoxDelivery}>
                <LocalShippingOutlinedIcon fontSize="inherit" />
              </div>
              <div className={styles.perfContent}>
                <span className={styles.perfLabel}>Total Delivery Amount</span>
                <span className={styles.perfValueDelivery}>
                  {loadingPerformance ? (
                    <Skeleton width={90} height={32} />
                  ) : (
                    formatINR(orderPerformance?.totalDeliveryAmount ?? 0)
                  )}
                </span>
                <span className={styles.perfSubtext}>Delivery revenue</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── 3. OPERATIONS MODULE (EQUAL CARD LAYOUT, 3 PER ROW) ──────── */}
      <section className={styles.operationsSection}>
        <div className={styles.sectionHeaderRow}>
          <div>
            <h2 className={styles.sectionHeading}>Operations & Modules</h2>
            <p className={styles.sectionSubheading}>
              Manage credit lines, platform accounts, dealers, and product catalog
            </p>
          </div>
        </div>

        <div className={styles.operationsFlexGrid}>
          {/* CREDIT CARD MANAGEMENT CARD */}
          {showCreditCards && (
            <div className={styles.operationsFlexItem}>
              <Card className={styles.ccMgmtCard}>
                <CardActionArea
                  onClick={() => navigate("/credit-cards")}
                  className={styles.cardActionArea}
                >
                  <CardContent className={styles.cardContent}>
                    <div>
                      <div className={styles.cardTopRow}>
                        <div className={styles.ccIconBox}>
                          <CreditCardIcon className={styles.mgmtIcon} />
                        </div>
                        <div className={styles.countBadge}>
                          <span className={styles.countLabel}>Total Cards</span>
                          {loadingCcSummary ? (
                            <Skeleton width={40} height={32} />
                          ) : (
                            <span className={styles.countValue}>
                              {ccSummary?.totalCards ?? 0}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className={styles.cardHeading}>Credit Card Management</h3>
                      <p className={styles.cardDesc}>
                        Manage credit cards and monitor available credit lines and limits.
                      </p>
                    </div>

                    <div>
                      <div className={styles.ccLimitsRow}>
                        <div className={styles.ccLimitCol}>
                          <span className={styles.ccLimitLabel}>Total Limit</span>
                          <span className={styles.ccLimitVal}>
                            {loadingCcSummary ? (
                              <Skeleton width={80} height={22} />
                            ) : (
                              formatINR(ccSummary?.totalLimit)
                            )}
                          </span>
                        </div>
                        <div className={styles.ccLimitDivider} />
                        <div className={styles.ccLimitCol}>
                          <span className={styles.ccLimitLabel}>Available</span>
                          <span className={styles.ccLimitValHighlight}>
                            {loadingCcSummary ? (
                              <Skeleton width={80} height={22} />
                            ) : (
                              formatINR(ccSummary?.availableLimit)
                            )}
                          </span>
                        </div>
                      </div>

                      <div className={styles.ctaLink}>
                        <span>Open Credit Cards</span>
                        <ArrowForwardIcon className={styles.arrowIcon} />
                      </div>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </div>
          )}

          {/* ACCOUNT MANAGEMENT CARD */}
          {showAccounts && (
            <div className={styles.operationsFlexItem}>
              <Card className={styles.acctMgmtCard}>
                <CardActionArea
                  onClick={() => navigate("/accounts")}
                  className={styles.cardActionArea}
                >
                  <CardContent className={styles.cardContent}>
                    <div>
                      <div className={styles.cardTopRow}>
                        <div className={styles.acctIconBox}>
                          <ManageAccountsIcon className={styles.mgmtIcon} />
                        </div>
                        <div className={styles.countBadge}>
                          <span className={styles.countLabel}>Total Accounts</span>
                          {loadingAccountSummary ? (
                            <Skeleton width={40} height={32} />
                          ) : (
                            <span className={styles.countValue}>
                              {accountSummary?.totalAccounts ?? 0}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className={styles.cardHeading}>Account Management</h3>
                      <p className={styles.cardDesc}>
                        Manage and organize all shopping, platform, and registered accounts in one place.
                      </p>
                    </div>

                    <div>
                      <div className={styles.ccLimitsRow}>
                        <div className={styles.ccLimitCol}>
                          <span className={styles.ccLimitLabel}>Distinct Platforms</span>
                          <span className={styles.ccLimitVal}>
                            {loadingAccountSummary ? (
                              <Skeleton width={40} height={22} />
                            ) : (
                              accountSummary?.distinctAccountTypes ?? 0
                            )}
                          </span>
                        </div>
                      </div>

                      <div className={styles.ctaLink}>
                        <span>Open Account Management</span>
                        <ArrowForwardIcon className={styles.arrowIcon} />
                      </div>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </div>
          )}

          {/* DEALER MANAGEMENT CARD */}
          {showDealers && (
            <div className={styles.operationsFlexItem}>
              <Card className={styles.dealerMgmtCard}>
                <CardActionArea
                  onClick={() => navigate("/dealers")}
                  className={styles.cardActionArea}
                >
                  <CardContent className={styles.cardContent}>
                    <div>
                      <div className={styles.cardTopRow}>
                        <div className={styles.dealerIconBox}>
                          <StorefrontIcon className={styles.mgmtIcon} />
                        </div>
                        <div className={styles.countBadge}>
                          <span className={styles.countLabel}>Total Dealers</span>
                          {loadingDealerSummary ? (
                            <Skeleton width={40} height={32} />
                          ) : (
                            <span className={styles.countValue}>
                              {dealerSummary?.totalDealers ?? 0}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className={styles.cardHeading}>Dealer Management</h3>
                      <p className={styles.cardDesc}>
                        Manage dealers, contact details, and multiple business addresses in one place.
                      </p>
                    </div>

                    <div>
                      <div className={styles.ccLimitsRow}>
                        <div className={styles.ccLimitCol}>
                          <span className={styles.ccLimitLabel}>Total Addresses</span>
                          <span className={styles.ccLimitVal}>
                            {loadingDealerSummary ? (
                              <Skeleton width={40} height={22} />
                            ) : (
                              dealerSummary?.totalAddresses ?? 0
                            )}
                          </span>
                        </div>
                      </div>

                      <div className={styles.ctaLink}>
                        <span>Open Dealer Management</span>
                        <ArrowForwardIcon className={styles.arrowIcon} />
                      </div>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </div>
          )}

          {/* PRODUCT MANAGEMENT CARD */}
          {showProducts && (
            <div className={styles.operationsFlexItem}>
              <Card className={styles.productMgmtCard}>
                <CardActionArea
                  onClick={() => navigate("/products")}
                  className={styles.cardActionArea}
                >
                  <CardContent className={styles.cardContent}>
                    <div>
                      <div className={styles.cardTopRow}>
                        <div className={styles.productIconBox}>
                          <Inventory2OutlinedIcon className={styles.mgmtIcon} />
                        </div>
                        <div className={styles.countBadge}>
                          <span className={styles.countLabel}>Total Products</span>
                          {loadingProductSummary ? (
                            <Skeleton width={40} height={32} />
                          ) : (
                            <span className={styles.countValue}>
                              {productSummary?.totalProducts ?? 0}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className={styles.cardHeading}>Product Management</h3>
                      <p className={styles.cardDesc}>
                        Manage and organize all products, their variants, and available colors.
                      </p>
                    </div>

                    <div>
                      <div className={styles.ccLimitsRow}>
                        <div className={styles.ccLimitCol}>
                          <span className={styles.ccLimitLabel}>Variants</span>
                          <span className={styles.ccLimitVal}>
                            {loadingProductSummary ? (
                              <Skeleton width={40} height={22} />
                            ) : (
                              productSummary?.totalVariants ?? 0
                            )}
                          </span>
                        </div>
                        <div className={styles.ccLimitDivider} />
                        <div className={styles.ccLimitCol}>
                          <span className={styles.ccLimitLabel}>Colors</span>
                          <span className={styles.ccLimitValHighlight}>
                            {loadingProductSummary ? (
                              <Skeleton width={40} height={22} />
                            ) : (
                              productSummary?.totalColors ?? 0
                            )}
                          </span>
                        </div>
                      </div>

                      <div className={styles.ctaLink}>
                        <span>Open Product Management</span>
                        <ArrowForwardIcon className={styles.arrowIcon} />
                      </div>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* ─── 4. ADMINISTRATION (USER MANAGEMENT) ───────────────────────── */}
      {showUserManagement && (
        <section className={styles.userMgmtSection}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionHeading}>Administration</h2>
              <p className={styles.sectionSubheading}>
                System user directory, role assignments, and permission controls
              </p>
            </div>
          </div>

          <div className={styles.operationsFlexGrid}>
            <div className={styles.operationsFlexItem}>
              <Card className={styles.userMgmtCard}>
                <CardActionArea
                  onClick={() => navigate("/users")}
                  className={styles.cardActionArea}
                >
                  <CardContent className={styles.cardContent}>
                    <div>
                      <div className={styles.cardTopRow}>
                        <div className={styles.userMgmtIconBox}>
                          <PeopleAltIcon className={styles.mgmtIcon} />
                        </div>
                        <div className={styles.countBadge}>
                          <span className={styles.countLabel}>Total Users</span>
                          {loadingStats ? (
                            <Skeleton width={40} height={32} />
                          ) : (
                            <span className={styles.countValue}>
                              {stats?.totalUsers ?? 0}
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className={styles.cardHeading}>User Management</h3>
                      <p className={styles.cardDesc}>
                        View, filter, edit, and manage registered system users and their permissions.
                      </p>
                    </div>

                    <div>
                      <div className={styles.ctaLink}>
                        <span>Open User Management</span>
                        <ArrowForwardIcon className={styles.arrowIcon} />
                      </div>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
