import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddCardIcon from "@mui/icons-material/AddCard";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import DonutLargeIcon from "@mui/icons-material/DonutLarge";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import CreditCardItem from "../../components/creditCards/CreditCardItem";
import CreditCardModal from "../../components/creditCards/CreditCardModal";
import DeleteCardModal from "../../components/creditCards/DeleteCardModal";
import ViewToggle from "../../components/common/ViewToggle";
import AdvancedFilterPanel, {
  FilterTriggerButton,
} from "../../components/common/AdvancedFilterPanel";
import ActiveFilterChips from "../../components/common/ActiveFilterChips";
import CommonEmptyState from "../../components/common/CommonEmptyState";
import { getCreditCardColumns } from "./TableColumns";
import { SUPPORTED_BANKS, PAGE_SIZE_OPTIONS } from "../../constants";
import creditCardService from "../../services/creditCardService";
import { getBankLogo } from "../../utils/bankLogos";
import useAuth from "../../hooks/useAuth";
import { useMobileHeader } from "../../context/MobileHeaderContext";
import styles from "./CreditCardsPage.module.scss";

const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return "₹0";
  return "₹" + Number(val).toLocaleString("en-IN");
};

const formatDate = (val) => {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CreditCardsPage = () => {
  const navigate = useNavigate();
  const { canCreateCreditCard, canEditCreditCard, canDeleteCreditCard } =
    useAuth();

  const [cards, setCards] = useState([]);
  const [summary, setSummary] = useState({
    totalCards: 0,
    totalCreditLimit: 0,
    availableCreditLimit: 0,
    usedCreditAmount: 0,
    overallUtilization: 0,
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // View mode (persisted)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("khata_credit_cards_view_mode") || "card";
  });

  const handleToggleView = (mode) => {
    setViewMode(mode);
    localStorage.setItem("khata_credit_cards_view_mode", mode);
  };

  useMobileHeader(
    canCreateCreditCard()
      ? {
          title: "Credit Cards",
          action: {
            label: "+ Add Card",
            onClick: () => {
              setSelectedCard(null);
              setModalOpen(true);
            },
          },
        }
      : { title: "Credit Cards", action: null }
  );

  // Search & Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Advanced Filter state (Bank, Card Owner)
  const [filters, setFilters] = useState({
    bank: "",
    cardOwner: "",
  });

  // Applied filter state (applied on button click or chip remove)
  const [appliedFilters, setAppliedFilters] = useState({
    bank: "",
    cardOwner: "",
  });

  const debounceTimer = useRef(null);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceTimer.current);
  }, [search]);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicatingCard, setDuplicatingCard] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCard, setDeletingCard] = useState(null);

  // Fetch cards and summary from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (appliedFilters.bank) params.bank = appliedFilters.bank;
      if (appliedFilters.cardOwner) params.cardOwner = appliedFilters.cardOwner;

      const [cardsData, summaryData] = await Promise.all([
        creditCardService.getCreditCards(params),
        creditCardService.getCreditCardSummary(),
      ]);

      if (cardsData?.creditCards) {
        setCards(cardsData.creditCards);
      }
      if (summaryData?.summary) {
        setSummary(summaryData.summary);
      }
    } catch (err) {
      console.error("Fetch credit cards error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load credit cards from server",
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, appliedFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter change handlers
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setFilterPanelOpen(false);
  };

  const handleResetFilters = () => {
    const empty = {
      bank: "",
      cardOwner: "",
    };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const handleRemoveFilter = (key) => {
    const updated = { ...appliedFilters, [key]: "" };
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setAppliedFilters(updated);
  };

  // Build active chips (Bank, Card Owner)
  const activeChips = useMemo(() => {
    const chips = [];
    if (appliedFilters.bank) {
      chips.push({
        id: "bank",
        key: "bank",
        label: "Bank",
        value: appliedFilters.bank,
        displayValue: appliedFilters.bank,
        onRemove: () => handleRemoveFilter("bank"),
      });
    }
    if (appliedFilters.cardOwner) {
      chips.push({
        id: "cardOwner",
        key: "cardOwner",
        label: "Owner",
        value: appliedFilters.cardOwner,
        displayValue: appliedFilters.cardOwner,
        onRemove: () => handleRemoveFilter("cardOwner"),
      });
    }
    return chips;
  }, [appliedFilters]);

  // Modal actions
  const handleOpenAdd = () => {
    setEditingCard(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (card) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleOpenDuplicate = (card) => {
    setDuplicatingCard(card);
    setDuplicateModalOpen(true);
  };

  const handleOpenDelete = (card) => {
    setDeletingCard(card);
    setDeleteModalOpen(true);
  };

  const handleCardSaved = (msg) => {
    setSuccessMsg(msg || "Card saved successfully");
    fetchData();
  };

  const handleSaveCard = async (cardPayload) => {
    try {
      setActionLoading(true);
      if (editingCard) {
        await creditCardService.updateCreditCard(editingCard._id, cardPayload);
        handleCardSaved("Credit card updated successfully");
      } else {
        await creditCardService.createCreditCard(cardPayload);
        handleCardSaved("Credit card added successfully");
      }
      setModalOpen(false);
    } catch (err) {
      console.error("Save credit card error:", err);
      setError(err.response?.data?.message || "Failed to save credit card");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardDeleted = (msg) => {
    setSuccessMsg(msg || "Card removed successfully");
    fetchData();
  };

  const handleConfirmDelete = async () => {
    if (!deletingCard?._id) return;
    try {
      setActionLoading(true);
      await creditCardService.deleteCreditCard(deletingCard._id);
      handleCardDeleted("Credit card removed successfully");
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Delete credit card error:", err);
      setError(err.response?.data?.message || "Failed to delete credit card");
    } finally {
      setActionLoading(false);
    }
  };

  // DataGrid Columns extracted to TableColumns.jsx
  const columns = useMemo(
    () =>
      getCreditCardColumns({
        canEdit: canEditCreditCard(),
        canCreate: canCreateCreditCard(),
        canDelete: canDeleteCreditCard(),
        onEdit: handleOpenEdit,
        onDuplicate: handleOpenDuplicate,
        onDelete: handleOpenDelete,
        onViewHistory: (card) => navigate(`/credit-cards/${card._id}`),
      }),
    [canEditCreditCard, canDeleteCreditCard, canCreateCreditCard, navigate],
  );

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/dashboard")}
            className={styles.backBtn}
          >
            Dashboard
          </Button>
          <div className={styles.titleArea}>
            <h1 className={styles.pageTitle}>My Credit Cards</h1>
          </div>
        </div>

        <div className={styles.headerActions}>
          <ViewToggle
            viewMode={viewMode}
            onChange={handleToggleView}
            ariaLabel="Credit cards view toggle"
          />

          {canCreateCreditCard() && (
            <Button
              variant="contained"
              startIcon={<AddCardIcon className={styles.btnIcon} />}
              onClick={handleOpenAdd}
              className={styles.addCardBtn}
            >
              Add Credit Card
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats Strip */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <CreditCardIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Total Cards</span>
            <span className={styles.statValue}>{summary.totalCards}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <AccountBalanceWalletIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Total Credit Limit</span>
            <span className={styles.statValue}>
              {formatINR(summary.totalCreditLimit)}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <CheckCircleOutlinedIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>Remaining Limit</span>
            <span
              className={`${styles.statValue} ${styles.statValueAvailable}`}
            >
              {formatINR(summary.availableCreditLimit)}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <DonutLargeIcon fontSize="inherit" />
          </div>
          <div className={styles.statText}>
            <span className={styles.statLabel}>
              Used Credit ({summary.overallUtilization}%)
            </span>
            <span className={`${styles.statValue} ${styles.statValueUsed}`}>
              {formatINR(summary.usedCreditAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          className={`${styles.alertBox} ${styles.errorAlert}`}
        >
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          className={`${styles.alertBox} ${styles.successAlert}`}
        >
          {successMsg}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterLeft}>
          <TextField
            placeholder="Search by card name, bank, or card owner..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className={styles.inputIcon} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <ClearIcon
                    className={styles.inputIcon}
                    onClick={() => setSearch("")}
                  />
                </InputAdornment>
              ) : null,
            }}
          />

          <FilterTriggerButton
            isOpen={filterPanelOpen}
            onToggle={() => setFilterPanelOpen((prev) => !prev)}
            filterCount={activeChips.length}
            label="Filters"
          />
        </div>

        <div className={styles.filterRight}>
          <div className={styles.mobileViewToggle}>
            <ViewToggle
              viewMode={viewMode}
              onChange={handleToggleView}
              ariaLabel="Credit cards view toggle"
            />
          </div>
        </div>
      </div>

      {/* Advanced Filter Drawer (Full Width when Open) */}
      <AdvancedFilterPanel
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen((prev) => !prev)}
        filterCount={activeChips.length}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        title="Credit Card Filters"
        hideTrigger={true}
      >
        <TextField
          select
          label="Bank"
          size="small"
          value={filters.bank}
          onChange={(e) => handleFilterChange("bank", e.target.value)}
          className={styles.filterField}
        >
          <MenuItem value="">All Banks</MenuItem>
          {SUPPORTED_BANKS.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Card Owner"
          size="small"
          value={filters.cardOwner}
          onChange={(e) => handleFilterChange("cardOwner", e.target.value)}
          placeholder="e.g. John Doe"
          className={styles.filterField}
        />
      </AdvancedFilterPanel>

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={activeChips}
        onClearAll={handleResetFilters}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className={styles.loadingWrapper}>
          <CircularProgress
            className={styles.spinner}
            size={48}
            thickness={4}
          />
          <span className={styles.loadingText}>
            Loading your credit cards...
          </span>
        </div>
      ) : cards.length > 0 ? (
        viewMode === "list" ? (
          <div className={styles.dataGridContainer}>
            <DataGrid
              rows={cards}
              columns={columns}
              getRowId={(row) => row._id}
              autoHeight
              rowHeight={66}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              initialState={{
                pagination: { paginationModel: { pageSize: 10, page: 0 } },
              }}
              disableRowSelectionOnClick
            />
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {cards.map((card) => (
              <CreditCardItem
                key={card._id}
                card={card}
                onEdit={handleOpenEdit}
                onDuplicate={handleOpenDuplicate}
                onDelete={handleOpenDelete}
                canEdit={canEditCreditCard()}
                canDelete={canDeleteCreditCard()}
                canCreate={canCreateCreditCard()}
              />
            ))}
          </div>
        )
      ) : (
        <CommonEmptyState
          icon={CreditCardIcon}
          title={
            search || activeChips.length > 0
              ? "No matching credit cards found"
              : "No credit cards registered yet"
          }
          description={
            search || activeChips.length > 0
              ? "Try modifying your search query or clearing active filters."
              : "Add your credit cards to keep track of total limits, available balance, and payment utilization in one smart place."
          }
          actionLabel={!search && activeChips.length === 0 && canCreateCreditCard() ? "Add Your First Card" : undefined}
          onAction={handleOpenAdd}
          actionIcon={<AddCardIcon className={styles.btnIcon} />}
        />
      )}

      {/* Add / Edit Modal */}
      <CreditCardModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveCard}
        onSaved={handleCardSaved}
        card={editingCard}
        initialData={editingCard}
        loading={actionLoading}
      />

      {/* Duplicate Card Modal */}
      <CreditCardModal
        open={duplicateModalOpen}
        onClose={() => {
          setDuplicateModalOpen(false);
          setDuplicatingCard(null);
        }}
        card={duplicatingCard}
        initialData={duplicatingCard}
        isDuplicate={true}
        onSaved={(msg) => {
          handleCardSaved(msg || "Credit card duplicated successfully");
          setDuplicateModalOpen(false);
          setDuplicatingCard(null);
        }}
        loading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCardModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        onDeleted={handleCardDeleted}
        card={deletingCard}
        loading={actionLoading}
      />
    </div>
  );
};

export default CreditCardsPage;
