/**
 * IssueHistory Component
 * 
 * Displays a list of reported issues with filtering, searching, and sorting capabilities.
 * Users see their ward's issues, while admins can view all wards.
 * 
 * @component
 * 
 * BACKEND INTEGRATION:
 * - GET /api/issues - Fetches issues list with filters
 * - Query params: status, ward, search, sort, page, limit
 * 
 * REQUIRED RESPONSE FORMAT:
 * {
 *   success: true,
 *   data: {
 *     issues: [{
 *       id: string,
 *       type: string,
 *       typeNp: string,
 *       description: string,
 *       descriptionNp: string,
 *       location: string,
 *       wardNumber: number,
 *       priority: 'low' | 'medium' | 'high' | 'urgent',
 *       status: 'pending' | 'inProgress' | 'resolved' | 'rejected',
 *       reportedOn: string (ISO date),
 *       lastUpdated: string (ISO date),
 *       images: number,
 *       adminResponse?: string,
 *       adminResponseNp?: string
 *     }],
 *     total: number,
 *     page: number
 *   }
 * }
 */

import React, { useState, useMemo } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../../contexts/auth/authConstants";
import { useIssues } from "../../../hooks/useData";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  Image,
  FileText,
  Loader,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const historyText = {
  en: {
    title: "Issue History",
    subtitle: "Track all reported issues and their status",
    allIssues: "All Issues",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    searchPlaceholder: "Search issues...",
    newest: "Newest First",
    oldest: "Oldest First",
    noIssues: "No issues found",
    noIssuesDesc: "Issues reported in your area will appear here.",
    status: "Status",
    reportedOn: "Reported On",
    lastUpdated: "Last Updated",
    location: "Location",
    priority: "Priority",
    adminResponse: "Admin Response",
    attachments: "Attachments",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    ward: "Ward",
    allWards: "All Wards",
    yourWard: "Your Ward",
    loading: "Loading issues...",
    error: "Failed to load issues",
    retry: "Retry",
    images: "image(s)",
  },
  np: {
    title: "समस्या इतिहास",
    subtitle: "सबै रिपोर्ट गरिएका समस्याहरू र तिनीहरूको स्थिति ट्र्याक गर्नुहोस्",
    allIssues: "सबै समस्याहरू",
    pending: "पेन्डिङ",
    inProgress: "प्रगतिमा",
    resolved: "समाधान भएको",
    rejected: "अस्वीकृत",
    searchPlaceholder: "समस्याहरू खोज्नुहोस्...",
    newest: "नयाँ पहिले",
    oldest: "पुरानो पहिले",
    noIssues: "कुनै समस्या भेटिएन",
    noIssuesDesc: "तपाईंको क्षेत्रमा रिपोर्ट गरिएका समस्याहरू यहाँ देखिनेछ।",
    status: "स्थिति",
    reportedOn: "रिपोर्ट गरिएको मिति",
    lastUpdated: "अन्तिम अद्यावधिक",
    location: "स्थान",
    priority: "प्राथमिकता",
    adminResponse: "प्रशासक प्रतिक्रिया",
    attachments: "संलग्नकहरू",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    urgent: "अत्यावश्यक",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    yourWard: "तपाईंको वडा",
    loading: "समस्याहरू लोड हुँदैछ...",
    error: "समस्याहरू लोड गर्न असफल",
    retry: "पुन: प्रयास",
    images: "तस्बिर(हरू)",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the styling configuration for an issue's status badge.
 * 
 * Each status has a different color and icon to help users quickly
 * identify the state of their reported issue.
 * 
 * @param {string} status - The issue status ('pending', 'inProgress', 'resolved', 'rejected')
 * @param {Object} t - Translation object containing status labels
 * @returns {Object} Object containing bg, text, icon, and label properties
 * 
 * EXAMPLE:
 *   const style = getStatusStyle('pending', translations);
 *   // Returns: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: "Pending" }
 */
function getStatusStyle(status, t) {
  // Define all possible status styles
  const styles = {
    pending: { 
      bg: "bg-yellow-100", 
      text: "text-yellow-700", 
      icon: Clock, 
      label: t.pending 
    },
    inProgress: { 
      bg: "bg-blue-100", 
      text: "text-blue-700", 
      icon: AlertCircle, 
      label: t.inProgress 
    },
    resolved: { 
      bg: "bg-green-100", 
      text: "text-green-700", 
      icon: CheckCircle, 
      label: t.resolved 
    },
    rejected: { 
      bg: "bg-red-100", 
      text: "text-red-700", 
      icon: XCircle, 
      label: t.rejected 
    },
  };
  
  // Return the matching style, or a default gray style if status is unknown
  const matchedStyle = styles[status];
  if (matchedStyle) {
    return matchedStyle;
  }
  
  // Default fallback for unknown statuses
  const defaultStyle = { 
    bg: "bg-gray-100", 
    text: "text-gray-700", 
    icon: Clock, 
    label: status 
  };
  return defaultStyle;
}

/**
 * Get the styling configuration for an issue's priority badge.
 * 
 * Priority levels are color-coded:
 * - Low: Green (not urgent)
 * - Medium: Yellow (needs attention)
 * - High: Orange (important)
 * - Urgent: Red (needs immediate action)
 * 
 * @param {string} priority - The priority level ('low', 'medium', 'high', 'urgent')
 * @param {Object} t - Translation object containing priority labels
 * @returns {Object} Object containing color and label properties
 */
function getPriorityStyle(priority, t) {
  // Define all possible priority styles
  const styles = {
    low: { 
      color: "text-green-600", 
      label: t.low 
    },
    medium: { 
      color: "text-yellow-600", 
      label: t.medium 
    },
    high: { 
      color: "text-orange-600", 
      label: t.high 
    },
    urgent: { 
      color: "text-red-600", 
      label: t.urgent 
    },
  };
  
  // Return the matching style, or a default gray style if priority is unknown
  const matchedStyle = styles[priority];
  if (matchedStyle) {
    return matchedStyle;
  }
  
  // Default fallback for unknown priorities
  const defaultStyle = { 
    color: "text-gray-600", 
    label: priority 
  };
  return defaultStyle;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * IssueCard Component
 * 
 * Displays a single issue as an expandable card. Clicking on the card
 * expands/collapses additional details like admin response and attachments.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.issue - The issue data object
 * @param {boolean} props.isExpanded - Whether this card is currently expanded
 * @param {Function} props.onToggle - Function to call when card is clicked
 * @param {string} props.language - Current language ('en' or 'np')
 * @param {Object} props.t - Translation object
 */
function IssueCard(props) {
  // Destructure props for easier access
  const issue = props.issue;
  const isExpanded = props.isExpanded;
  const onToggle = props.onToggle;
  const language = props.language;
  const t = props.t;
  
  // Get styling for status and priority badges
  const statusStyle = getStatusStyle(issue.status, t);
  const priorityStyle = getPriorityStyle(issue.priority, t);
  
  // Get the icon component for the status
  const StatusIcon = statusStyle.icon;
  
  // Determine which text to show based on language
  const issueType = language === "en" ? issue.type : issue.typeNp;
  const issueDescription = language === "en" ? issue.description : issue.descriptionNp;
  const adminResponseText = language === "en" ? issue.adminResponse : issue.adminResponseNp;
  
  // Format dates for display
  const reportedDate = new Date(issue.reportedOn).toLocaleDateString();
  const updatedDate = new Date(issue.lastUpdated).toLocaleDateString();

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Clickable Header Section */}
      <div className="p-6 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Issue ID, Status Badge, and Ward Badge */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-gray-500 font-mono">{issue.id}</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                <StatusIcon size={14} />
                {statusStyle.label}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-indigo-100 text-indigo-700">
                <MapPin size={10} />
                {t.ward} {issue.wardNumber}
              </span>
            </div>
            
            {/* Issue Type Title */}
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {issueType}
            </h3>
            
            {/* Issue Description (truncated to 2 lines) */}
            <p className="text-gray-600 line-clamp-2">
              {issueDescription}
            </p>
            
            {/* Location, Date, and Priority Info */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {issue.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {reportedDate}
              </span>
              <span className={`font-medium ${priorityStyle.color}`}>
                {t.priority}: {priorityStyle.label}
              </span>
            </div>
          </div>
          
          {/* Expand/Collapse Button */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            {isExpanded ? <ChevronUp className="text-gray-400" size={20} /> : <ChevronDown className="text-gray-400" size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Details Section - Only shown when card is expanded */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 pt-4">
          {/* Date Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.reportedOn}</p>
              <p className="font-medium text-gray-800">{reportedDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.lastUpdated}</p>
              <p className="font-medium text-gray-800">{updatedDate}</p>
            </div>
          </div>
          
          {/* Attachments Section - Only shown if there are images */}
          {issue.images > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">{t.attachments}</p>
              <div className="flex items-center gap-2">
                <Image className="text-gray-400" size={16} />
                <span className="text-gray-600">{issue.images} {t.images}</span>
              </div>
            </div>
          )}
          
          {/* Admin Response Section - Only shown if admin has responded */}
          {issue.adminResponse && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="text-emerald-600" size={16} />
                <p className="text-sm font-medium text-gray-700">{t.adminResponse}</p>
              </div>
              <p className="text-gray-600">{adminResponseText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * LoadingState Component
 * 
 * Displays a loading spinner while issues are being fetched from the server.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.t - Translation object
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
 * ErrorState Component
 * 
 * Displays an error message with a retry button when issues fail to load.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.t - Translation object
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 */
function ErrorState(props) {
  const t = props.t;
  const onRetry = props.onRetry;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
      <p className="text-gray-700 font-medium mb-2">{t.error}</p>
      <button onClick={onRetry} className="text-emerald-600 hover:underline">{t.retry}</button>
    </div>
  );
}

/**
 * EmptyState Component
 * 
 * Displays a message when there are no issues to show.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.t - Translation object
 */
function EmptyState(props) {
  const t = props.t;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <FileText className="mx-auto text-gray-300 mb-4" size={48} />
      <p className="text-gray-700 font-medium mb-1">{t.noIssues}</p>
      <p className="text-gray-500 text-sm">{t.noIssuesDesc}</p>
    </div>
  );
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * IssueHistory Component
 * 
 * The main component that displays a filterable, searchable list of issues.
 * - Regular users see only their ward's issues
 * - Super admins can filter by any ward
 * 
 * Features:
 * - Filter by status (all, pending, in progress, resolved, rejected)
 * - Search issues by text
 * - Sort by newest or oldest first
 * - Ward filter (super admin only)
 * - Expandable issue cards for detailed view
 */
function IssueHistory() {
  // -------------------------------------------------------------------------
  // HOOKS AND CONTEXT
  // -------------------------------------------------------------------------
  
  // Get language settings from context
  const { language } = useLanguage();
  
  // Get current user from auth context
  const { user } = useAuth();
  
  // Get translations for current language
  const t = historyText[language];

  // -------------------------------------------------------------------------
  // USER INFO
  // -------------------------------------------------------------------------
  
  // Get user's ward number (default to 5 if not set)
  let userWard = 5;
  if (user && user.ward) {
    userWard = user.ward;
  }
  
  // Check if user is a super admin (can see all wards)
  let isSuperAdmin = false;
  if (user && user.role === ROLES.SUPER_ADMIN) {
    isSuperAdmin = true;
  }

  // -------------------------------------------------------------------------
  // STATE VARIABLES
  // -------------------------------------------------------------------------
  
  // Current filter selection ('all', 'pending', 'inProgress', 'resolved', 'rejected')
  const [filter, setFilter] = useState("all");
  
  // Search query text entered by user
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sort order ('newest' or 'oldest')
  const [sortOrder, setSortOrder] = useState("newest");
  
  // ID of the currently expanded issue card (null if none expanded)
  const [expandedIssue, setExpandedIssue] = useState(null);
  
  // Ward filter (super admin can change this, regular users see only their ward)
  const [wardFilter, setWardFilter] = useState(
    isSuperAdmin ? "all" : userWard.toString()
  );

  // -------------------------------------------------------------------------
  // API PARAMETERS
  // -------------------------------------------------------------------------
  
  // Build API parameters from current filter/search/sort state
  // useMemo ensures this only recalculates when dependencies change
  const apiParams = useMemo(function() {
    const params = {};
    
    // Add status filter if not 'all'
    if (filter !== "all") {
      params.status = filter;
    }
    
    // Add ward filter if not 'all'
    if (wardFilter !== "all") {
      params.ward = wardFilter;
    }
    
    // Add search query if not empty
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    // Always include sort order
    params.sort = sortOrder;
    
    return params;
  }, [filter, wardFilter, searchQuery, sortOrder]);

  // -------------------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------------------
  
  // Fetch issues from API using our custom hook
  const { issues, loading, error, refetch } = useIssues(apiParams);

  // -------------------------------------------------------------------------
  // FILTER TABS
  // -------------------------------------------------------------------------
  
  // Calculate counts for each filter tab
  // useMemo ensures this only recalculates when issues change
  const filterTabs = useMemo(function() {
    // Count issues for each status using reduce
    const counts = issues.reduce(function(acc, issue) {
      if (issue.status === "pending") {
        acc.pending += 1;
      } else if (issue.status === "inProgress") {
        acc.inProgress += 1;
      } else if (issue.status === "resolved") {
        acc.resolved += 1;
      } else if (issue.status === "rejected") {
        acc.rejected += 1;
      }
      return acc;
    }, { pending: 0, inProgress: 0, resolved: 0, rejected: 0 });
    
    // Return array of tab configurations
    return [
      { id: "all", label: t.allIssues, count: issues.length },
      { id: "pending", label: t.pending, count: counts.pending },
      { id: "inProgress", label: t.inProgress, count: counts.inProgress },
      { id: "resolved", label: t.resolved, count: counts.resolved },
      { id: "rejected", label: t.rejected, count: counts.rejected },
    ];
  }, [issues, t]);

  // -------------------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------------------
  
  /**
   * Handle clicking on an issue card to expand/collapse it.
   * If the clicked issue is already expanded, collapse it.
   * Otherwise, expand the clicked issue and collapse any other.
   * 
   * @param {string} issueId - The ID of the clicked issue
   */
  function handleToggleExpand(issueId) {
    // Check if this issue is already expanded
    if (expandedIssue === issueId) {
      // Collapse it
      setExpandedIssue(null);
    } else {
      // Expand this issue (and collapse any other)
      setExpandedIssue(issueId);
    }
  }

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
          {!isSuperAdmin ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <MapPin size={16} />
              <span className="font-medium">{t.yourWard}: {userWard}</span>
            </div>
          ) : (
            // Super Admin Ward Selector
            <WardSelector 
              wardFilter={wardFilter} 
              setWardFilter={setWardFilter} 
              t={t} 
            />
          )}
        </div>
      </div>

      {/* Filter Tabs Section */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map(function(tab) {
            // Determine button styling based on whether this tab is active
            let buttonClass = "px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ";
            let countClass = "text-xs px-2 py-0.5 rounded-full ";
            
            if (filter === tab.id) {
              buttonClass = buttonClass + "bg-emerald-600 text-white";
              countClass = countClass + "bg-white/20";
            } else {
              buttonClass = buttonClass + "bg-gray-100 text-gray-600 hover:bg-gray-200";
              countClass = countClass + "bg-gray-200";
            }
            
            return (
              <button 
                key={tab.id} 
                onClick={function() { setFilter(tab.id); }} 
                className={buttonClass}
              >
                {tab.label}
                <span className={countClass}>{tab.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Sort Section */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery} 
              onChange={function(e) { setSearchQuery(e.target.value); }} 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
            />
          </div>
          
          {/* Sort Order Dropdown */}
          <select 
            value={sortOrder} 
            onChange={function(e) { setSortOrder(e.target.value); }} 
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
          </select>
        </div>
      </div>

      {/* Issues List Section */}
      <div className="space-y-4">
        {renderIssuesList()}
      </div>
    </div>
  );
  
  /**
   * Helper function to render the issues list based on current state.
   * Shows loading, error, empty, or the actual list of issues.
   */
  function renderIssuesList() {
    // Show loading state while fetching
    if (loading) {
      return <LoadingState t={t} />;
    }
    
    // Show error state if fetch failed
    if (error) {
      return <ErrorState t={t} onRetry={refetch} />;
    }
    
    // Show empty state if no issues
    if (issues.length === 0) {
      return <EmptyState t={t} />;
    }
    
    // Render the list of issue cards using map
    return issues.map(function(issue) {
      const isExpanded = expandedIssue === issue.id;
      
      return (
        <IssueCard 
          key={issue.id} 
          issue={issue} 
          isExpanded={isExpanded} 
          onToggle={function() { handleToggleExpand(issue.id); }} 
          language={language} 
          t={t} 
        />
      );
    });
  }
}

/**
 * WardSelector Component
 * 
 * Dropdown for super admins to filter issues by ward.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.wardFilter - Current ward filter value
 * @param {Function} props.setWardFilter - Function to update ward filter
 * @param {Object} props.t - Translation object
 */
function WardSelector(props) {
  const wardFilter = props.wardFilter;
  const setWardFilter = props.setWardFilter;
  const t = props.t;
  
  // Build ward options array using Array.from and map
  const wardOptions = Array.from({ length: DAMAK_TOTAL_WARDS }, function(_, index) {
    const ward = index + 1;
    return (
      <option key={ward} value={ward}>{t.ward} {ward}</option>
    );
  });
  
  return (
    <select 
      value={wardFilter} 
      onChange={function(e) { setWardFilter(e.target.value); }} 
      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
    >
      <option value="all">{t.allWards}</option>
      {wardOptions}
    </select>
  );
}

export default IssueHistory;
