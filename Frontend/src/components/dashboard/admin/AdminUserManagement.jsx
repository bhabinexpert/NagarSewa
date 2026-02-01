/**
 * AdminUserManagement Component
 *
 * Admin interface for managing users. Includes KYC verification,
 * user account enable/disable, and user search/filtering.
 *
 * @component
 *
 * BACKEND INTEGRATION:
 * - GET /api/users - List users with filters
 *   Query params: status, kycStatus, ward, search, sort, page, limit
 *
 * - PATCH /api/users/:id/kyc - Update KYC status
 *   Body: { status: 'verified' | 'rejected', note?: string }
 *
 * - PATCH /api/users/:id/status - Enable/disable user account
 *   Body: { enabled: boolean, reason?: string }
 */

import React, { useState, useMemo } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../../contexts/auth/authConstants";
import { useUsers } from "../../../hooks/useData";
import { adminAPI } from "../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ShieldOff,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Loader,
  AlertCircle,
  Users,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const userManagementText = {
  en: {
    title: "User Management",
    subtitle: "Manage citizen accounts and KYC verification",
    subtitleWardAdmin: "Manage users in your ward",
    all: "All",
    pendingKyc: "Pending KYC",
    verified: "Verified",
    rejected: "Rejected",
    enabled: "Enabled",
    disabled: "Disabled",
    searchPlaceholder: "Search by name, email, or phone...",
    filterBy: "Filter by",
    sortBy: "Sort by",
    newest: "Newest First",
    oldest: "Oldest First",
    alphabetical: "Alphabetical",
    verifyKyc: "Verify KYC",
    rejectKyc: "Reject KYC",
    enableAccount: "Enable Account",
    disableAccount: "Disable Account",
    viewDetails: "View Details",
    viewDocuments: "View Documents",
    name: "Name",
    email: "Email",
    phone: "Phone",
    ward: "Ward",
    registeredOn: "Registered on",
    kycStatus: "KYC Status",
    accountStatus: "Account Status",
    actions: "Actions",
    noUsers: "No users found",
    loading: "Loading users...",
    error: "Failed to load users",
    retry: "Retry",
    kycVerified: "KYC verified successfully",
    kycRejected: "KYC rejected",
    accountEnabled: "Account enabled",
    accountDisabled: "Account disabled",
    rejectionReason: "Rejection Reason",
    rejectionPlaceholder: "Enter reason for rejection...",
    disableReason: "Disable Reason",
    disablePlaceholder: "Enter reason for disabling account...",
    submit: "Submit",
    cancel: "Cancel",
    confirm: "Confirm",
    allWards: "All Wards",
    yourWard: "Your Ward",
    totalUsers: "Total Users",
    pendingVerification: "Pending Verification",
    activeUsers: "Active Users",
    documents: "Documents",
    citizenshipFront: "Citizenship Front",
    citizenshipBack: "Citizenship Back",
    photo: "Photo",
    closeModal: "Close",
  },
  np: {
    title: "प्रयोगकर्ता व्यवस्थापन",
    subtitle: "नागरिक खाताहरू र KYC प्रमाणीकरण व्यवस्थापन गर्नुहोस्",
    subtitleWardAdmin: "तपाईंको वडाका प्रयोगकर्ताहरू व्यवस्थापन गर्नुहोस्",
    all: "सबै",
    pendingKyc: "पेन्डिङ KYC",
    verified: "प्रमाणित",
    rejected: "अस्वीकृत",
    enabled: "सक्रिय",
    disabled: "निष्क्रिय",
    searchPlaceholder: "नाम, इमेल, वा फोनद्वारा खोज्नुहोस्...",
    filterBy: "फिल्टर गर्नुहोस्",
    sortBy: "क्रमबद्ध गर्नुहोस्",
    newest: "नयाँ पहिले",
    oldest: "पुरानो पहिले",
    alphabetical: "वर्णमाला अनुसार",
    verifyKyc: "KYC प्रमाणित गर्नुहोस्",
    rejectKyc: "KYC अस्वीकार गर्नुहोस्",
    enableAccount: "खाता सक्रिय गर्नुहोस्",
    disableAccount: "खाता निष्क्रिय गर्नुहोस्",
    viewDetails: "विवरण हेर्नुहोस्",
    viewDocuments: "कागजातहरू हेर्नुहोस्",
    name: "नाम",
    email: "इमेल",
    phone: "फोन",
    ward: "वडा",
    registeredOn: "दर्ता मिति",
    kycStatus: "KYC स्थिति",
    accountStatus: "खाता स्थिति",
    actions: "कार्यहरू",
    noUsers: "कुनै प्रयोगकर्ता भेटिएन",
    loading: "प्रयोगकर्ताहरू लोड हुँदैछ...",
    error: "प्रयोगकर्ताहरू लोड गर्न असफल",
    retry: "पुन: प्रयास",
    kycVerified: "KYC सफलतापूर्वक प्रमाणित गरियो",
    kycRejected: "KYC अस्वीकार गरियो",
    accountEnabled: "खाता सक्रिय गरियो",
    accountDisabled: "खाता निष्क्रिय गरियो",
    rejectionReason: "अस्वीकृतिको कारण",
    rejectionPlaceholder: "अस्वीकृतिको कारण प्रविष्ट गर्नुहोस्...",
    disableReason: "निष्क्रियताको कारण",
    disablePlaceholder: "खाता निष्क्रिय गर्ने कारण प्रविष्ट गर्नुहोस्...",
    submit: "पेश गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    confirm: "पुष्टि गर्नुहोस्",
    allWards: "सबै वडाहरू",
    yourWard: "तपाईंको वडा",
    totalUsers: "कुल प्रयोगकर्ताहरू",
    pendingVerification: "पेन्डिङ प्रमाणीकरण",
    activeUsers: "सक्रिय प्रयोगकर्ताहरू",
    documents: "कागजातहरू",
    citizenshipFront: "नागरिकता अगाडि",
    citizenshipBack: "नागरिकता पछाडि",
    photo: "फोटो",
    closeModal: "बन्द गर्नुहोस्",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get KYC status icon.
 * @param {string} status - KYC status value
 * @returns {JSX.Element} Icon component
 */
function getKycIcon(status) {
  if (status === "verified") {
    return <CheckCircle className="text-green-500" size={16} />;
  } else if (status === "rejected") {
    return <XCircle className="text-red-500" size={16} />;
  } else {
    return <Clock className="text-yellow-500" size={16} />;
  }
}

/**
 * Get KYC status color classes.
 * @param {string} status - KYC status value
 * @returns {string} CSS classes
 */
function getKycColor(status) {
  if (status === "verified") {
    return "text-green-700 bg-green-100";
  } else if (status === "rejected") {
    return "text-red-700 bg-red-100";
  } else {
    return "text-yellow-700 bg-yellow-100";
  }
}

/**
 * Get account status color classes.
 * @param {boolean} enabled - Whether account is enabled
 * @returns {string} CSS classes
 */
function getAccountStatusColor(enabled) {
  if (enabled) {
    return "text-green-700 bg-green-100";
  } else {
    return "text-red-700 bg-red-100";
  }
}

/**
 * Format date for display.
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Stats card component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Stats card element
 */
function StatsCard(props) {
  const title = props.title;
  const value = props.value;
  const icon = props.icon;
  const color = props.color;

  let bgClass = "bg-gray-100";
  let textClass = "text-gray-600";

  if (color === "blue") {
    bgClass = "bg-blue-100";
    textClass = "text-blue-600";
  } else if (color === "yellow") {
    bgClass = "bg-yellow-100";
    textClass = "text-yellow-600";
  } else if (color === "green") {
    bgClass = "bg-green-100";
    textClass = "text-green-600";
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className={"p-2 rounded-lg " + bgClass}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={"text-2xl font-bold " + textClass}>{value}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Documents modal component.
 * @param {Object} props - Component props
 * @returns {JSX.Element|null} Modal element or null
 */
function DocumentsModal(props) {
  const user = props.user;
  const t = props.t;
  const onClose = props.onClose;

  if (!user) {
    return null;
  }

  // Get document URLs
  let citizenshipFrontUrl = null;
  let citizenshipBackUrl = null;
  let photoUrl = null;

  if (user.documents) {
    citizenshipFrontUrl = user.documents.citizenshipFront;
    citizenshipBackUrl = user.documents.citizenshipBack;
    photoUrl = user.documents.photo;
  }

  /**
   * Render document image or placeholder.
   * @param {string} url - Image URL
   * @param {string} label - Image label
   * @returns {JSX.Element} Image element
   */
  function renderDocument(url, label) {
    if (url) {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <img
            src={url}
            alt={label}
            className="w-full h-48 object-cover rounded-lg border border-gray-200"
          />
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="text-gray-400" size={48} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{t.documents}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="text-emerald-600" size={32} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{user.name}</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderDocument(citizenshipFrontUrl, t.citizenshipFront)}
            {renderDocument(citizenshipBackUrl, t.citizenshipBack)}
          </div>

          <div className="max-w-xs mx-auto">{renderDocument(photoUrl, t.photo)}</div>
        </div>
        <div className="p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {t.closeModal}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Rejection modal component.
 * @param {Object} props - Component props
 * @returns {JSX.Element|null} Modal element or null
 */
function RejectionModal(props) {
  const isOpen = props.isOpen;
  const title = props.title;
  const placeholder = props.placeholder;
  const onSubmit = props.onSubmit;
  const onClose = props.onClose;
  const isSubmitting = props.isSubmitting;
  const t = props.t;

  const [reason, setReason] = useState("");

  if (!isOpen) {
    return null;
  }

  /**
   * Handle reason change.
   * @param {Event} e - Input event
   */
  function handleReasonChange(e) {
    setReason(e.target.value);
  }

  /**
   * Handle form submit.
   * @param {Event} e - Form event
   */
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(reason);
    setReason("");
  }

  /**
   * Handle close.
   */
  function handleClose() {
    setReason("");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <textarea
            value={reason}
            onChange={handleReasonChange}
            placeholder={placeholder}
            required
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 mb-4"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? <Loader className="animate-spin mx-auto" size={20} /> : t.confirm}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * User card component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} User card element
 */
function UserCard(props) {
  const user = props.user;
  const isExpanded = props.isExpanded;
  const onToggle = props.onToggle;
  const onVerifyKyc = props.onVerifyKyc;
  const onRejectKyc = props.onRejectKyc;
  const onToggleAccount = props.onToggleAccount;
  const onViewDocuments = props.onViewDocuments;
  const isSubmitting = props.isSubmitting;
  const t = props.t;

  // Determine KYC status text
  let kycStatusText = t.pendingKyc;
  if (user.kycStatus === "verified") {
    kycStatusText = t.verified;
  } else if (user.kycStatus === "rejected") {
    kycStatusText = t.rejected;
  }

  // Determine account status text
  let accountStatusText;
  if (user.enabled) {
    accountStatusText = t.enabled;
  } else {
    accountStatusText = t.disabled;
  }

  /**
   * Handle verify KYC button click.
   */
  function handleVerify() {
    onVerifyKyc(user.id);
  }

  /**
   * Handle reject KYC button click.
   */
  function handleReject() {
    onRejectKyc(user.id);
  }

  /**
   * Handle enable/disable account button click.
   */
  function handleToggleAccount() {
    onToggleAccount(user.id, !user.enabled);
  }

  /**
   * Handle view documents button click.
   */
  function handleViewDocs() {
    onViewDocuments(user);
  }

  // Render action buttons based on user state
  function renderActionButtons() {
    const buttons = [];

    // View documents button (if pending KYC)
    if (user.kycStatus === "pending") {
      buttons.push(
        <button
          key="docs"
          onClick={handleViewDocs}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          <FileText size={16} />
          {t.viewDocuments}
        </button>
      );

      buttons.push(
        <button
          key="verify"
          onClick={handleVerify}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
        >
          <CheckCircle size={16} />
          {t.verifyKyc}
        </button>
      );

      buttons.push(
        <button
          key="reject"
          onClick={handleReject}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
        >
          <XCircle size={16} />
          {t.rejectKyc}
        </button>
      );
    }

    // Enable/disable button (if verified)
    if (user.kycStatus === "verified") {
      let buttonClass;
      let buttonIcon;
      let buttonText;

      if (user.enabled) {
        buttonClass =
          "flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm";
        buttonIcon = <ShieldOff size={16} />;
        buttonText = t.disableAccount;
      } else {
        buttonClass =
          "flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 text-sm";
        buttonIcon = <Shield size={16} />;
        buttonText = t.enableAccount;
      }

      buttons.push(
        <button
          key="toggle"
          onClick={handleToggleAccount}
          disabled={isSubmitting}
          className={buttonClass}
        >
          {buttonIcon}
          {buttonText}
        </button>
      );
    }

    return buttons;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition">
      {/* User Header */}
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="text-emerald-600" size={24} />
          </div>
          <div>
            <p className="font-medium text-gray-800">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={"px-2 py-1 rounded-full text-xs font-medium " + getKycColor(user.kycStatus)}>
            {getKycIcon(user.kycStatus)}
            <span className="ml-1">{kycStatusText}</span>
          </span>
          <span className={"px-2 py-1 rounded-full text-xs font-medium " + getAccountStatusColor(user.enabled)}>
            {accountStatusText}
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} />
              {user.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} />
              {t.ward} {user.wardNumber}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} />
              {t.registeredOn}: {formatDate(user.registeredOn)}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={14} />
              {user.email}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">{renderActionButtons()}</div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AdminUserManagement - Main user management component.
 * @returns {JSX.Element} The rendered component
 */
function AdminUserManagement() {
  // ============================================================================
  // HOOKS AND CONTEXT
  // ============================================================================

  const languageContext = useLanguage();
  const language = languageContext.language;
  const t = userManagementText[language];

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

  const [kycFilter, setKycFilter] = useState("all");

  // Set initial ward filter based on role
  let initialWardFilter = "all";
  if (!isSuperAdmin && userWard) {
    initialWardFilter = userWard;
  }
  const [wardFilter, setWardFilter] = useState(initialWardFilter);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedUser, setExpandedUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [documentsUser, setDocumentsUser] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ open: false, userId: null, type: null });

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Build query params for API
  const queryParams = useMemo(
    function () {
      const params = {
        sort: sortOrder,
      };

      if (kycFilter !== "all") {
        params.kycStatus = kycFilter;
      }
      if (wardFilter !== "all") {
        params.ward = wardFilter;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      return params;
    },
    [kycFilter, wardFilter, searchQuery, sortOrder]
  );

  // Fetch users from API
  const usersData = useUsers(queryParams);
  const users = usersData.users;
  const loading = usersData.loading;
  const error = usersData.error;
  const refetch = usersData.refetch;
  const stats = usersData.stats;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle KYC verification.
   * @param {string} userId - User ID to verify
   */
  async function handleVerifyKyc(userId) {
    setIsSubmitting(true);

    try {
      // Backend: PATCH /api/admin/users/:id/kyc
      await adminAPI.verifyKYC(userId, 'VERIFIED');
      toast.success(t.kycVerified, { position: "top-right", autoClose: 3000 });
      refetch();
    } catch (err) {
      let errorMessage = "Failed to verify KYC";
      if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle KYC rejection.
   * @param {string} userId - User ID to reject
   */
  function handleRejectKyc(userId) {
    const modalState = {
      open: true,
      userId: userId,
      type: "kyc",
    };
    setRejectionModal(modalState);
  }

  /**
   * Handle account toggle.
   * @param {string} userId - User ID
   * @param {boolean} enabled - New enabled state
   */
  function handleToggleAccount(userId, enabled) {
    if (enabled) {
      // Enable directly
      submitAccountToggle(userId, true, "");
    } else {
      // Show reason modal for disable
      const modalState = {
        open: true,
        userId: userId,
        type: "disable",
      };
      setRejectionModal(modalState);
    }
  }

  /**
   * Submit rejection with reason.
   * @param {string} reason - Rejection reason
   */
  async function submitRejection(reason) {
    const userId = rejectionModal.userId;
    const type = rejectionModal.type;

    setIsSubmitting(true);

    try {
      if (type === "kyc") {
        // Backend: PATCH /api/admin/users/:id/kyc
        await adminAPI.verifyKYC(userId, 'REJECTED');
        toast.success(t.kycRejected, { position: "top-right", autoClose: 3000 });
      } else if (type === "disable") {
        // Backend: PATCH /api/admin/users/:id/disable
        await adminAPI.disableUser(userId);
        toast.success(t.accountDisabled, { position: "top-right", autoClose: 3000 });
      }
      refetch();
    } catch (err) {
      let errorMessage = "Operation failed";
      if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
      closeRejectionModal();
    }
  }

  /**
   * Submit account toggle.
   * @param {string} userId - User ID
   * @param {boolean} enabled - New enabled state
   * @param {string} reason - Reason (if disabling)
   */
  async function submitAccountToggle(userId, enabled, reason) {
    setIsSubmitting(true);

    try {
      // Backend: PATCH /api/admin/users/:id/disable or /enable
      if (enabled) {
        await adminAPI.enableUser(userId);
      } else {
        await adminAPI.disableUser(userId);
      }

      let successMessage;
      if (enabled) {
        successMessage = t.accountEnabled;
      } else {
        successMessage = t.accountDisabled;
      }

      toast.success(successMessage, { position: "top-right", autoClose: 3000 });
      refetch();
    } catch (err) {
      let errorMessage = "Operation failed";
      if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Close rejection modal.
   */
  function closeRejectionModal() {
    const modalState = {
      open: false,
      userId: null,
      type: null,
    };
    setRejectionModal(modalState);
  }

  /**
   * Handle view documents.
   * @param {Object} user - User object
   */
  function handleViewDocuments(user) {
    setDocumentsUser(user);
  }

  /**
   * Close documents modal.
   */
  function closeDocumentsModal() {
    setDocumentsUser(null);
  }

  /**
   * Handle search input change.
   * @param {Event} e - Input event
   */
  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  /**
   * Handle KYC filter click.
   * @param {string} filter - Filter value
   */
  function handleKycFilterClick(filter) {
    setKycFilter(filter);
  }

  /**
   * Handle ward filter change.
   * @param {Event} e - Select event
   */
  function handleWardFilterChange(e) {
    setWardFilter(e.target.value);
  }

  /**
   * Handle sort order change.
   * @param {Event} e - Select event
   */
  function handleSortChange(e) {
    setSortOrder(e.target.value);
  }

  /**
   * Handle user card toggle.
   * @param {string} userId - User ID to toggle
   */
  function handleToggleUser(userId) {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  }

  // ============================================================================
  // CONDITIONAL RENDERS
  // ============================================================================

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <Loader className="mx-auto text-emerald-500 animate-spin mb-4" size={48} />
        <p className="text-gray-500">{t.loading}</p>
      </div>
    );
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
   * Render KYC filter buttons.
   * @returns {Array} Array of button elements
   */
  function renderKycFilters() {
    const filters = ["all", "pending", "verified", "rejected"];

    return filters.map(function(f) {
      let buttonClass = "px-3 py-1.5 rounded-lg text-sm font-medium transition ";
      if (kycFilter === f) {
        buttonClass = buttonClass + "bg-emerald-600 text-white";
      } else {
        buttonClass = buttonClass + "bg-gray-100 text-gray-600 hover:bg-gray-200";
      }

      let buttonLabel = t[f];
      if (f === "pending") {
        buttonLabel = t.pendingKyc;
      }

      return (
        <button
          key={f}
          onClick={function () {
            handleKycFilterClick(f);
          }}
          className={buttonClass}
        >
          {buttonLabel}
        </button>
      );
    });
  }

  /**
   * Render ward options.
   * @returns {Array} Array of option elements
   */
  function renderWardOptions() {
    return Array.from({ length: DAMAK_TOTAL_WARDS }, function(_, index) {
      const ward = index + 1;
      return (
        <option key={ward} value={ward}>
          {t.ward} {ward}
        </option>
      );
    });
  }

  /**
   * Render user cards.
   * @returns {Array|JSX.Element} Array of user cards or empty state
   */
  function renderUserCards() {
    if (!users || users.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">{t.noUsers}</p>
        </div>
      );
    }

    const cards = users.map(function(user) {
      return (
        <UserCard
          key={user.id}
          user={user}
          isExpanded={expandedUser === user.id}
          onToggle={function () {
            handleToggleUser(user.id);
          }}
          onVerifyKyc={handleVerifyKyc}
          onRejectKyc={handleRejectKyc}
          onToggleAccount={handleToggleAccount}
          onViewDocuments={handleViewDocuments}
          isSubmitting={isSubmitting}
          t={t}
        />
      );
    });

    return <div className="space-y-4">{cards}</div>;
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

  // Get stats values
  let totalUsers = 0;
  let pendingCount = 0;
  let activeCount = 0;

  if (stats) {
    totalUsers = stats.total || 0;
    pendingCount = stats.pendingKyc || 0;
    activeCount = stats.active || 0;
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

  // Determine rejection modal title and placeholder
  let rejectionTitle = "";
  let rejectionPlaceholder = "";

  if (rejectionModal.type === "kyc") {
    rejectionTitle = t.rejectionReason;
    rejectionPlaceholder = t.rejectionPlaceholder;
  } else if (rejectionModal.type === "disable") {
    rejectionTitle = t.disableReason;
    rejectionPlaceholder = t.disablePlaceholder;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <ToastContainer />

      {/* Documents Modal */}
      <DocumentsModal user={documentsUser} t={t} onClose={closeDocumentsModal} />

      {/* Rejection/Disable Modal */}
      <RejectionModal
        isOpen={rejectionModal.open}
        title={rejectionTitle}
        placeholder={rejectionPlaceholder}
        onSubmit={submitRejection}
        onClose={closeRejectionModal}
        isSubmitting={isSubmitting}
        t={t}
      />

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{subtitleText}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title={t.totalUsers}
          value={totalUsers}
          icon={<Users className="text-blue-600" size={24} />}
          color="blue"
        />
        <StatsCard
          title={t.pendingVerification}
          value={pendingCount}
          icon={<Clock className="text-yellow-600" size={24} />}
          color="yellow"
        />
        <StatsCard
          title={t.activeUsers}
          value={activeCount}
          icon={<CheckCircle className="text-green-600" size={24} />}
          color="green"
        />
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

          {/* KYC Filter */}
          <div className="flex gap-2">{renderKycFilters()}</div>

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
            <option value="alphabetical">{t.alphabetical}</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      {renderUserCards()}
    </div>
  );
}

export default AdminUserManagement;
