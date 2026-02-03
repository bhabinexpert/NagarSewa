/**
 * AdminIssueManagement Component
 *
 * Admin interface for managing reported issues. Ward admins can update
 * status, Super admins can set priorities for ward admins.
 */

import React, { useMemo, useState, useEffect } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../../contexts/auth/authConstants";
import { useIssues } from "../../../hooks/useData";
import { issuesAPI } from "../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IssueCard } from "./NewIssueCard";
import { Search, Loader, AlertCircle, Flag } from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const issueManagementText = {
  en: {
    title: "Issue Management",
    subtitle: "Review and manage all reported issues",
    subtitleWardAdmin: "Manage issues from your ward",
    all: "All",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    searchPlaceholder: "Search by ID, type, or location...",
    newest: "Newest First",
    oldest: "Oldest First",
    statusUpdated: "Status updated successfully",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    ward: "Ward",
    allWards: "All Wards",
    viewOnlyDesc:
      "As Super Admin, you can set priority levels for issues. Ward admins will handle status updates.",
    priorityUpdated: "Priority updated successfully",
    loading: "Loading issues...",
    error: "Failed to load issues",
    retry: "Retry",
    noIssues: "No issues found",
  },
  np: {
    title: "समस्या व्यवस्थापन",
    subtitle: "सबै रिपोर्ट गरिएका समस्याहरू समीक्षा र व्यवस्थापन गर्नुहोस्",
    subtitleWardAdmin: "तपाईंको वडाका समस्याहरू व्यवस्थापन गर्नुहोस्",
    all: "सबै",
    pending: "पेन्डिङ",
    inProgress: "प्रगतिमा",
    resolved: "समाधान भएको",
    rejected: "अस्वीकृत",
    searchPlaceholder: "ID, प्रकार, वा स्थान द्वारा खोज्नुहोस्...",
    newest: "नयाँ पहिले",
    oldest: "पुरानो पहिले",
    statusUpdated: "स्थिति सफलतापूर्वक अद्यावधिक गरियो",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    urgent: "अत्यावश्यक",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    viewOnlyDesc: "सुपर एडमिनको रूपमा, तपाईं समस्याहरूको प्राथमिकता स्तर सेट गर्न सक्नुहुन्छ।",
    priorityUpdated: "प्राथमिकता सफलतापूर्वक अद्यावधिक गरियो",
    loading: "समस्याहरू लोड हुँदैछ...",
    error: "समस्याहरू लोड गर्न असफल",
    retry: "पुन: प्रयास",
    noIssues: "कुनै समस्या भेटिएन",
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function LoadingState({ t }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <Loader className="mx-auto text-emerald-500 animate-spin mb-4" size={48} />
      <p className="text-gray-500">{t.loading}</p>
    </div>
  );
}

function EmptyState({ t }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
      <p className="text-gray-500">{t.noIssues}</p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminIssueManagement() {
  const { language } = useLanguage();
  const t = issueManagementText[language];
  const { currentUser } = useAuth();

  const isSuperAdmin = currentUser?.role === ROLES.SUPER_ADMIN;
  const userWard = currentUser?.wardNumber || null;

  const [statusFilter, setStatusFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState(
    !isSuperAdmin && userWard ? userWard : "all"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryParams = useMemo(
    function () {
      const params = { sort: sortOrder };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (wardFilter !== "all") {
        params.ward = wardFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      return params;
    },
    [statusFilter, wardFilter, searchQuery, sortOrder]
  );

  const { issues = [], loading, error, refetch } = useIssues(queryParams);

  useEffect(() => {
    refetch();
  }, [queryParams, refetch]);

  function normalizeStatus(value) {
    if (!value) return "pending";
    const statusValue = String(value).toLowerCase();
    if (statusValue === "inprogress") return "in_progress";
    return statusValue;
  }

  const statusCounts = useMemo(
    function () {
      const counts = {
        all: issues.length,
        pending: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
      };

      issues.forEach(function (issue) {
        const normalized = normalizeStatus(issue.status);
        if (counts[normalized] !== undefined) {
          counts[normalized] = counts[normalized] + 1;
        }
      });

      return counts;
    },
    [issues]
  );

  const statusOptions = [
    { key: "all", label: t.all, count: statusCounts.all },
    { key: "pending", label: t.pending, count: statusCounts.pending },
    { key: "in_progress", label: t.inProgress, count: statusCounts.in_progress },
    { key: "resolved", label: t.resolved, count: statusCounts.resolved },
    { key: "rejected", label: t.rejected, count: statusCounts.rejected },
  ];

  async function handleStatusUpdate(issueId, status, response) {
    setIsSubmitting(true);

    try {
      await issuesAPI.updateStatus(issueId, status, response);
      toast.success(t.statusUpdated, { position: "top-right", autoClose: 3000 });
      refetch();
    } catch (err) {
      const errorMessage = err.message || "Failed to update status";
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePrioritySet(issueId, priority, note) {
    setIsSubmitting(true);

    try {
      await issuesAPI.setPriority(issueId, priority, note);
      toast.success(t.priorityUpdated, { position: "top-right", autoClose: 3000 });
      refetch();
    } catch (err) {
      const errorMessage = err.message || "Failed to set priority";
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderStatusFilters() {
    return statusOptions.map(function (option) {
      let buttonClass =
        "px-3 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-2 ";
      if (statusFilter === option.key) {
        buttonClass = buttonClass + "bg-emerald-600 text-white shadow";
      } else {
        buttonClass = buttonClass + "bg-gray-100 text-gray-700 hover:bg-gray-200";
      }

      return (
        <button
          key={option.key}
          onClick={function () {
            setStatusFilter(option.key);
          }}
          className={buttonClass}
        >
          {option.label}
          <span
            className={
              (statusFilter === option.key
                ? "bg-white/20 text-white"
                : "bg-white text-gray-700") +
              " px-2 py-0.5 rounded-full text-xs font-bold"
            }
          >
            {option.count}
          </span>
        </button>
      );
    });
  }

  function renderWardOptions() {
    return Array.from({ length: DAMAK_TOTAL_WARDS }, function (_, index) {
      const ward = index + 1;
      return <option key={ward} value={ward} />;
    });
  }

  function renderIssueCards() {
    return issues.map(function (issue) {
      return (
        <IssueCard
          key={issue.id}
          issue={issue}
          onStatusUpdate={handleStatusUpdate}
          onPrioritySet={handlePrioritySet}
          isSuperAdmin={isSuperAdmin}
          isSubmitting={isSubmitting}
          t={t}
        />
      );
    });
  }

  if (loading) {
    return <LoadingState t={t} />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
        <p className="text-gray-700 font-medium mb-2">{t.error}</p>
        <button onClick={refetch} className="text-emerald-600 hover:underline">
          {t.retry}
        </button>
      </div>
    );
  }

  const subtitleText = isSuperAdmin
    ? t.subtitle
    : userWard
    ? `${t.subtitleWardAdmin} • ${t.ward} ${userWard}`
    : t.subtitleWardAdmin;

  const superAdminNote = isSuperAdmin ? (
    <p className="text-sm text-orange-600 mt-2 flex items-center gap-2">
      <Flag size={14} />
      {t.viewOnlyDesc}
    </p>
  ) : null;

  const wardFilterElement = isSuperAdmin ? (
    <div className="flex items-center gap-2">
      <input
        list="ward-options"
        value={wardFilter}
        onChange={(e) => setWardFilter(e.target.value || "all")}
        placeholder={t.allWards}
        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 w-32"
      />
      <datalist id="ward-options">
        <option value="all">{t.allWards}</option>
        {renderWardOptions()}
      </datalist>
      <button
        type="button"
        onClick={() => setWardFilter("all")}
        className="px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
      >
        {t.all}
      </button>
    </div>
  ) : null;

  const summaryCards = [
    { key: "all", label: t.all, count: statusCounts.all, tone: "bg-indigo-50 text-indigo-700" },
    { key: "pending", label: t.pending, count: statusCounts.pending, tone: "bg-yellow-50 text-yellow-700" },
    { key: "in_progress", label: t.inProgress, count: statusCounts.in_progress, tone: "bg-blue-50 text-blue-700" },
    { key: "resolved", label: t.resolved, count: statusCounts.resolved, tone: "bg-emerald-50 text-emerald-700" },
    { key: "rejected", label: t.rejected, count: statusCounts.rejected, tone: "bg-red-50 text-red-700" },
  ];

  const issuesListElement = issues.length === 0 ? (
    <EmptyState t={t} />
  ) : (
    <div className="space-y-4">{renderIssueCards()}</div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ToastContainer />

      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
            <p className="text-gray-500">{subtitleText}</p>
            {superAdminNote}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full lg:w-auto">
            {summaryCards.map((card) => (
              <div
                key={card.key}
                className="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm"
              >
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${card.tone}`}
                >
                  {card.label}
                </span>
                <p className="text-2xl font-bold text-gray-900 mt-2">{card.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-[220px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">{renderStatusFilters()}</div>

          {wardFilterElement}

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
          </select>
        </div>
      </div>

      {issuesListElement}
    </div>
  );
}
