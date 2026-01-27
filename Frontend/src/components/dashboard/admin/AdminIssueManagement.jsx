/**
 * AdminIssueManagement Component
 *
 * Admin interface for managing reported issues. Ward admins can update
 * status, Super admins can set priorities for ward admins.
 *
 * @component
 *
 * BACKEND INTEGRATION:
 * - GET /api/issues - List issues with filters
 *   Query params: status, ward, priority, search, sort, page, limit
 *
 * - PATCH /api/issues/:id/status - Update issue status (Ward Admin)
 *   Body: { status: string, response?: string, assignedTeam?: string }
 *
 * - PATCH /api/issues/:id/priority - Set priority (Super Admin)
 *   Body: { priority: string, note?: string }
 */

import React, { useState, useMemo } from "react";
import { useLanguage } from "../../../context/useLanguage";
import { useAuth } from "../../../context/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../../context/authConstants";
import { useIssues } from "../../../hooks/useData";
import { issuesAPI } from "../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Image,
  ChevronDown,
  ChevronUp,
  X,
  Flag,
  Loader,
} from "lucide-react";

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
    filterBy: "Filter by",
    sortBy: "Sort by",
    newest: "Newest First",
    oldest: "Oldest First",
    priority: "Priority",
    updateStatus: "Update Status",
    addResponse: "Add Response",
    responsePlaceholder: "Enter your response to the citizen...",
    submit: "Submit",
    cancel: "Cancel",
    reportedBy: "Reported by",
    reportedOn: "Reported on",
    location: "Location",
    description: "Description",
    attachments: "Attachments",
    teams: ["Road Maintenance", "Water Supply", "Electricity", "Sanitation", "General"],
    statusUpdated: "Status updated successfully",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    ward: "Ward",
    allWards: "All Wards",
    yourWard: "Your Ward",
    viewOnlyDesc: "As Super Admin, you can set priority levels for issues. Ward admins will handle status updates.",
    setPriority: "Set Priority",
    setPriorityDesc: "Set priority level for this issue to notify ward admin",
    priorityNote: "Instructions for Ward Admin",
    priorityNotePlaceholder: "Add priority instructions for the ward admin...",
    priorityUpdated: "Priority updated successfully",
    markInProgress: "Mark In Progress",
    markResolved: "Mark Resolved",
    markRejected: "Mark Rejected",
    lowPriority: "Low",
    mediumPriority: "Medium",
    highPriority: "High",
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
    filterBy: "फिल्टर गर्नुहोस्",
    sortBy: "क्रमबद्ध गर्नुहोस्",
    newest: "नयाँ पहिले",
    oldest: "पुरानो पहिले",
    priority: "प्राथमिकता",
    updateStatus: "स्थिति अद्यावधिक गर्नुहोस्",
    addResponse: "प्रतिक्रिया थप्नुहोस्",
    responsePlaceholder: "नागरिकलाई तपाईंको प्रतिक्रिया प्रविष्ट गर्नुहोस्...",
    submit: "पेश गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    reportedBy: "रिपोर्ट गर्ने",
    reportedOn: "रिपोर्ट मिति",
    location: "स्थान",
    description: "विवरण",
    attachments: "संलग्नकहरू",
    teams: ["सडक मर्मत", "पानी आपूर्ति", "बिजुली", "सरसफाई", "सामान्य"],
    statusUpdated: "स्थिति सफलतापूर्वक अद्यावधिक गरियो",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    urgent: "अत्यावश्यक",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    yourWard: "तपाईंको वडा",
    viewOnlyDesc: "सुपर एडमिनको रूपमा, तपाईं समस्याहरूको प्राथमिकता स्तर सेट गर्न सक्नुहुन्छ।",
    setPriority: "प्राथमिकता सेट गर्नुहोस्",
    setPriorityDesc: "वडा प्रशासकलाई सूचित गर्न यो समस्याको प्राथमिकता स्तर सेट गर्नुहोस्",
    priorityNote: "वडा प्रशासकको लागि निर्देशन",
    priorityNotePlaceholder: "वडा प्रशासकको लागि प्राथमिकता निर्देशनहरू थप्नुहोस्...",
    priorityUpdated: "प्राथमिकता सफलतापूर्वक अद्यावधिक गरियो",
    markInProgress: "प्रगतिमा चिन्हित गर्नुहोस्",
    markResolved: "समाधान चिन्हित गर्नुहोस्",
    markRejected: "अस्वीकृत चिन्हित गर्नुहोस्",
    lowPriority: "कम",
    mediumPriority: "मध्यम",
    highPriority: "उच्च",
    loading: "समस्याहरू लोड हुँदैछ...",
    error: "समस्याहरू लोड गर्न असफल",
    retry: "पुन: प्रयास",
    noIssues: "कुनै समस्या भेटिएन",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status icon component based on status.
 * @param {string} status - The issue status
 * @returns {JSX.Element} Icon component
 */
function getStatusIcon(status) {
  if (status === "pending") {
    return <Clock className="text-yellow-500" size={16} />;
  } else if (status === "inProgress") {
    return <AlertCircle className="text-blue-500" size={16} />;
  } else if (status === "resolved") {
    return <CheckCircle className="text-green-500" size={16} />;
  } else if (status === "rejected") {
    return <XCircle className="text-red-500" size={16} />;
  } else {
    return <Clock className="text-yellow-500" size={16} />;
  }
}

/**
 * Get priority color classes.
 * @param {string} priority - The priority level
 * @returns {string} CSS classes for the priority
 */
function getPriorityColor(priority) {
  if (priority === "low") {
    return "text-gray-600 bg-gray-100";
  } else if (priority === "medium") {
    return "text-blue-600 bg-blue-100";
  } else if (priority === "high") {
    return "text-orange-600 bg-orange-100";
  } else if (priority === "urgent") {
    return "text-red-600 bg-red-100";
  } else {
    return "text-gray-600 bg-gray-100";
  }
}

/**
 * Get status color classes.
 * @param {string} status - The issue status
 * @returns {string} CSS classes for the status
 */
function getStatusColor(status) {
  if (status === "pending") {
    return "text-yellow-700 bg-yellow-100";
  } else if (status === "inProgress") {
    return "text-blue-700 bg-blue-100";
  } else if (status === "resolved") {
    return "text-green-700 bg-green-100";
  } else if (status === "rejected") {
    return "text-red-700 bg-red-100";
  } else {
    return "text-yellow-700 bg-yellow-100";
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Loading state component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Loading state element
 */
function LoadingState(props) {
  const t = props.t;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <Loader className="mx-auto text-emerald-500 animate-spin mb-4" size={48} />
      <p className="text-gray-500">{t.loading}</p>
    </div>
  );
}

/**
 * Empty state component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Empty state element
 */
function EmptyState(props) {
  const t = props.t;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
      <p className="text-gray-500">{t.noIssues}</p>
    </div>
  );
}

/**
 * Issue card component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Issue card element
 */
function IssueCard(props) {
  const issue = props.issue;
  const isExpanded = props.isExpanded;
  const onToggle = props.onToggle;
  const onStatusUpdate = props.onStatusUpdate;
  const onPrioritySet = props.onPrioritySet;
  const isSuperAdmin = props.isSuperAdmin;
  const isSubmitting = props.isSubmitting;
  const t = props.t;
  const language = props.language;

  // Local state for form inputs
  const [response, setResponse] = useState("");
  const [priorityNote, setPriorityNote] = useState("");

  // Determine initial priority from issue
  let initialPriority = "medium";
  if (issue.superAdminPriority) {
    initialPriority = issue.superAdminPriority;
  }
  const [selectedPriority, setSelectedPriority] = useState(initialPriority);

  // Determine display priority
  let displayPriority = issue.priority;
  if (issue.superAdminPriority) {
    displayPriority = issue.superAdminPriority;
  }

  // Determine issue type text based on language
  let issueTypeText;
  if (language === "np") {
    issueTypeText = issue.typeNp;
  } else {
    issueTypeText = issue.type;
  }

  // Determine description text based on language
  let descriptionText;
  if (language === "np") {
    descriptionText = issue.descriptionNp;
  } else {
    descriptionText = issue.description;
  }

  // Get status and priority text/colors
  let statusLabel = t[issue.status];
  if (!statusLabel) {
    statusLabel = issue.status;
  }

  let priorityLabel = t[displayPriority];
  if (!priorityLabel) {
    priorityLabel = displayPriority;
  }

  /**
   * Handle response text change.
   * @param {Event} e - Input change event
   */
  function handleResponseChange(e) {
    setResponse(e.target.value);
  }

  /**
   * Handle priority note change.
   * @param {Event} e - Input change event
   */
  function handlePriorityNoteChange(e) {
    setPriorityNote(e.target.value);
  }

  /**
   * Handle priority selection.
   * @param {string} priority - Selected priority value
   */
  function handlePrioritySelect(priority) {
    setSelectedPriority(priority);
  }

  /**
   * Handle priority set button click.
   */
  function handleSetPriority() {
    onPrioritySet(issue.id, selectedPriority, priorityNote);
  }

  /**
   * Handle status update button clicks.
   * @param {string} newStatus - New status to set
   */
  function handleStatusClick(newStatus) {
    onStatusUpdate(issue.id, newStatus, response);
  }

  // Render priority options for super admin
  function renderPriorityButtons() {
    const priorities = ["low", "medium", "high", "urgent"];
    const buttons = [];

    for (let i = 0; i < priorities.length; i++) {
      const p = priorities[i];

      let buttonClass = "px-3 py-1 rounded-full text-xs font-medium transition ";
      if (selectedPriority === p) {
        buttonClass = buttonClass + getPriorityColor(p);
      } else {
        buttonClass = buttonClass + "bg-gray-100 text-gray-600 hover:bg-gray-200";
      }

      let buttonLabel = t[p + "Priority"];
      if (!buttonLabel) {
        buttonLabel = t[p];
      }

      buttons.push(
        <button
          key={p}
          onClick={function () {
            handlePrioritySelect(p);
          }}
          className={buttonClass}
        >
          {buttonLabel}
        </button>
      );
    }

    return buttons;
  }

  // Render attachments count if exists
  let attachmentsElement = null;
  if (issue.images && issue.images.length > 0) {
    attachmentsElement = (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Image size={14} />
        {t.attachments}: {issue.images.length}
      </div>
    );
  }

  // Render priority note from super admin
  let priorityNoteElement = null;
  if (issue.priorityNote) {
    priorityNoteElement = (
      <div className="bg-orange-50 p-3 rounded-lg mb-4">
        <p className="text-sm text-orange-700">
          <Flag size={14} className="inline mr-1" />
          <strong>Super Admin:</strong> {issue.priorityNote}
        </p>
      </div>
    );
  }

  // Render super admin priority section
  let superAdminSection = null;
  if (isSuperAdmin && issue.status === "pending") {
    superAdminSection = (
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">{t.setPriority}</p>
        <div className="flex gap-2 mb-3">{renderPriorityButtons()}</div>
        <textarea
          placeholder={t.priorityNotePlaceholder}
          value={priorityNote}
          onChange={handlePriorityNoteChange}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 mb-3"
          rows={2}
        />
        <button
          onClick={handleSetPriority}
          disabled={isSubmitting}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
        >
          {isSubmitting ? <Loader className="animate-spin" size={16} /> : t.setPriority}
        </button>
      </div>
    );
  }

  // Render ward admin status update section
  let wardAdminSection = null;
  if (!isSuperAdmin && issue.status !== "resolved" && issue.status !== "rejected") {
    let statusButtons = [];

    if (issue.status === "pending") {
      statusButtons.push(
        <button
          key="inProgress"
          onClick={function () {
            handleStatusClick("inProgress");
          }}
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {t.markInProgress}
        </button>
      );
    }

    if (issue.status === "inProgress") {
      statusButtons.push(
        <button
          key="resolved"
          onClick={function () {
            handleStatusClick("resolved");
          }}
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
        >
          {t.markResolved}
        </button>
      );
    }

    statusButtons.push(
      <button
        key="rejected"
        onClick={function () {
          handleStatusClick("rejected");
        }}
        disabled={isSubmitting}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
      >
        {t.markRejected}
      </button>
    );

    wardAdminSection = (
      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">{t.updateStatus}</p>
        <textarea
          placeholder={t.responsePlaceholder}
          value={response}
          onChange={handleResponseChange}
          className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 mb-3"
          rows={2}
        />
        <div className="flex gap-2">{statusButtons}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition">
      {/* Issue Header */}
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          {getStatusIcon(issue.status)}
          <div>
            <p className="font-medium text-gray-800">{issue.id}</p>
            <p className="text-sm text-gray-500">{issueTypeText}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={"px-3 py-1 rounded-full text-xs font-medium " + getPriorityColor(displayPriority)}>
            {issue.superAdminPriority && <Flag size={12} className="inline mr-1" />}
            {priorityLabel}
          </span>
          <span className={"px-3 py-1 rounded-full text-xs font-medium " + getStatusColor(issue.status)}>
            {statusLabel}
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} />
              {issue.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={14} />
              {t.reportedBy}: {issue.reportedBy}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} />
              {t.reportedOn}: {issue.reportedOn}
            </div>
            {attachmentsElement}
          </div>

          <p className="text-gray-700 text-sm mb-4">{descriptionText}</p>

          {priorityNoteElement}
          {superAdminSection}
          {wardAdminSection}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AdminIssueManagement - Main component for issue management.
 * @returns {JSX.Element} The rendered component
 */
function AdminIssueManagement() {
  // ============================================================================
  // HOOKS AND CONTEXT
  // ============================================================================

  const languageContext = useLanguage();
  const language = languageContext.language;
  const t = issueManagementText[language];

  const authContext = useAuth();
  const currentUser = authContext.currentUser;

  // Determine user role
  let isSuperAdmin = false;
  if (currentUser && currentUser.role === ROLES.SUPER_ADMIN) {
    isSuperAdmin = true;
  }

  let userWard = null;
  if (currentUser) {
    userWard = currentUser.wardNumber;
  }

  // ============================================================================
  // STATE
  // ============================================================================

  const [statusFilter, setStatusFilter] = useState("all");

  // Set initial ward filter based on role
  let initialWardFilter = "all";
  if (!isSuperAdmin && userWard) {
    initialWardFilter = userWard;
  }
  const [wardFilter, setWardFilter] = useState(initialWardFilter);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Build query params for API
  const queryParams = useMemo(
    function () {
      const params = {
        sort: sortOrder,
      };

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

  // Fetch issues from API
  const issuesData = useIssues(queryParams);
  const issues = issuesData.issues;
  const loading = issuesData.loading;
  const error = issuesData.error;
  const refetch = issuesData.refetch;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle status update for an issue.
   * @param {string} issueId - Issue ID
   * @param {string} status - New status
   * @param {string} response - Admin response text
   */
  async function handleStatusUpdate(issueId, status, response) {
    setIsSubmitting(true);

    try {
      // Backend: PATCH /api/issues/:id/status
      await issuesAPI.updateStatus(issueId, { status: status, response: response });
      toast.success(t.statusUpdated, { position: "top-right", autoClose: 3000 });
      refetch();
    } catch (err) {
      let errorMessage = "Failed to update status";
      if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle priority set for an issue.
   * @param {string} issueId - Issue ID
   * @param {string} priority - Priority level
   * @param {string} note - Priority note
   */
  async function handlePrioritySet(issueId, priority, note) {
    setIsSubmitting(true);

    try {
      // Backend: PATCH /api/issues/:id/priority
      await issuesAPI.setPriority(issueId, { priority: priority, note: note });
      toast.success(t.priorityUpdated, { position: "top-right", autoClose: 3000 });
      refetch();
    } catch (err) {
      let errorMessage = "Failed to set priority";
      if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle search input change.
   * @param {Event} e - Input change event
   */
  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  /**
   * Handle status filter click.
   * @param {string} status - Status filter value
   */
  function handleStatusFilterClick(status) {
    setStatusFilter(status);
  }

  /**
   * Handle ward filter change.
   * @param {Event} e - Select change event
   */
  function handleWardFilterChange(e) {
    setWardFilter(e.target.value);
  }

  /**
   * Handle sort order change.
   * @param {Event} e - Select change event
   */
  function handleSortChange(e) {
    setSortOrder(e.target.value);
  }

  /**
   * Handle issue card toggle.
   * @param {string} issueId - Issue ID to toggle
   */
  function handleToggleIssue(issueId) {
    if (expandedIssue === issueId) {
      setExpandedIssue(null);
    } else {
      setExpandedIssue(issueId);
    }
  }

  // ============================================================================
  // CONDITIONAL RENDERS
  // ============================================================================

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

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  /**
   * Render status filter buttons.
   * @returns {Array} Array of button elements
   */
  function renderStatusFilters() {
    const statuses = ["all", "pending", "inProgress", "resolved", "rejected"];
    const buttons = [];

    for (let i = 0; i < statuses.length; i++) {
      const s = statuses[i];

      let buttonClass = "px-3 py-1.5 rounded-lg text-sm font-medium transition ";
      if (statusFilter === s) {
        buttonClass = buttonClass + "bg-emerald-600 text-white";
      } else {
        buttonClass = buttonClass + "bg-gray-100 text-gray-600 hover:bg-gray-200";
      }

      let buttonLabel = t[s];
      if (!buttonLabel) {
        buttonLabel = t.all;
      }

      buttons.push(
        <button
          key={s}
          onClick={function () {
            handleStatusFilterClick(s);
          }}
          className={buttonClass}
        >
          {buttonLabel}
        </button>
      );
    }

    return buttons;
  }

  /**
   * Render ward options for select dropdown.
   * @returns {Array} Array of option elements
   */
  function renderWardOptions() {
    const options = [];

    for (let i = 1; i <= DAMAK_TOTAL_WARDS; i++) {
      options.push(
        <option key={i} value={i}>
          {t.ward} {i}
        </option>
      );
    }

    return options;
  }

  /**
   * Render issue cards.
   * @returns {Array} Array of IssueCard elements
   */
  function renderIssueCards() {
    const cards = [];

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];

      cards.push(
        <IssueCard
          key={issue.id}
          issue={issue}
          isExpanded={expandedIssue === issue.id}
          onToggle={function () {
            handleToggleIssue(issue.id);
          }}
          onStatusUpdate={handleStatusUpdate}
          onPrioritySet={handlePrioritySet}
          isSuperAdmin={isSuperAdmin}
          isSubmitting={isSubmitting}
          t={t}
          language={language}
        />
      );
    }

    return cards;
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  // Determine subtitle based on role
  let subtitleText;
  if (isSuperAdmin) {
    subtitleText = t.subtitle;
  } else {
    subtitleText = t.subtitleWardAdmin;
  }

  // Render super admin note
  let superAdminNote = null;
  if (isSuperAdmin) {
    superAdminNote = (
      <p className="text-sm text-orange-600 mt-2">
        <Flag size={14} className="inline mr-1" />
        {t.viewOnlyDesc}
      </p>
    );
  }

  // Render ward filter (super admin only)
  let wardFilterElement = null;
  if (isSuperAdmin) {
    wardFilterElement = (
      <select
        value={wardFilter}
        onChange={handleWardFilterChange}
        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
      >
        <option value="all">{t.allWards}</option>
        {renderWardOptions()}
      </select>
    );
  }

  // Render issues list or empty state
  let issuesListElement;
  if (issues.length === 0) {
    issuesListElement = <EmptyState t={t} />;
  } else {
    issuesListElement = <div className="space-y-4">{renderIssueCards()}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{subtitleText}</p>
        {superAdminNote}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">{renderStatusFilters()}</div>

          {/* Ward Filter (Super Admin only) */}
          {wardFilterElement}

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={handleSortChange}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      {issuesListElement}
    </div>
  );
}

export default AdminIssueManagement;
