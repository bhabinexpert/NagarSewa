/**
 * WardAdminIssues Component
 *
 * Issue management interface for ward administrators.
 * Allows viewing, filtering, and updating status of citizen issues.
 *
 * @component
 */

import React, { useState } from "react";
import { useLanguage } from "../../../context/useLanguage";
import { useAuth } from "../../../context/useAuth";
import {
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Flag,
  Filter,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const text = {
  en: {
    title: "Issue Management",
    subtitle: "Manage citizen issues in your ward",
    searchPlaceholder: "Search issues...",
    all: "All",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    prioritized: "Prioritized",
    noIssues: "No issues found",
    markInProgress: "Start Working",
    markResolved: "Mark Resolved",
    markRejected: "Reject",
    completed: "Completed",
    priorityNote: "Municipal Priority Note",
    reportedBy: "Reported by",
    location: "Location",
    newest: "Newest",
    oldest: "Oldest",
  },
  np: {
    title: "समस्या व्यवस्थापन",
    subtitle: "तपाईंको वडाका नागरिक समस्याहरू व्यवस्थापन गर्नुहोस्",
    searchPlaceholder: "समस्याहरू खोज्नुहोस्...",
    all: "सबै",
    pending: "पेन्डिङ",
    inProgress: "प्रगतिमा",
    resolved: "समाधान",
    rejected: "अस्वीकृत",
    prioritized: "प्राथमिकता",
    noIssues: "कुनै समस्या फेला परेन",
    markInProgress: "काम सुरु गर्नुहोस्",
    markResolved: "समाधान चिन्ह",
    markRejected: "अस्वीकार",
    completed: "पूरा भयो",
    priorityNote: "नगरपालिका प्राथमिकता नोट",
    reportedBy: "रिपोर्ट गर्ने",
    location: "स्थान",
    newest: "नयाँ",
    oldest: "पुरानो",
  },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockIssues = [
  {
    id: "ISS-001",
    type: "Road Damage",
    typeNp: "सडक क्षति",
    description: "Large pothole near market area causing accidents",
    descriptionNp: "बजार क्षेत्रमा ठूलो खाल्डो",
    location: "Main Road, Ward 5",
    status: "pending",
    reportedBy: "Ram Sharma",
    reportedOn: "2024-01-15",
    priority: "high",
    superAdminPriority: "urgent",
    priorityNote: "Immediate attention required - safety hazard",
  },
  {
    id: "ISS-002",
    type: "Water Supply",
    typeNp: "पानी आपूर्ति",
    description: "No water supply for 3 days in Sector 4",
    descriptionNp: "३ दिनदेखि पानी छैन",
    location: "Sector 4, Ward 5",
    status: "inProgress",
    reportedBy: "Sita Devi",
    reportedOn: "2024-01-16",
    priority: "medium",
    superAdminPriority: null,
    priorityNote: null,
  },
  {
    id: "ISS-003",
    type: "Street Light",
    typeNp: "सडक बत्ती",
    description: "Street lights not working",
    descriptionNp: "सडक बत्ती काम गर्दैन",
    location: "Block B, Ward 5",
    status: "pending",
    reportedBy: "Hari Prasad",
    reportedOn: "2024-01-17",
    priority: "low",
    superAdminPriority: "high",
    priorityNote: "Complete before festival season",
  },
  {
    id: "ISS-004",
    type: "Garbage",
    typeNp: "फोहोर",
    description: "Garbage not collected",
    descriptionNp: "फोहोर उठाइएको छैन",
    location: "Market Area, Ward 5",
    status: "resolved",
    reportedBy: "Krishna Rai",
    reportedOn: "2024-01-10",
    priority: "medium",
    superAdminPriority: null,
    priorityNote: null,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status configuration including color and icon.
 * @param {string} status - The issue status
 * @param {Object} t - Translation object
 * @returns {Object} Status configuration with bg, text, icon, and label
 */
function getStatusConfig(status, t) {
  if (status === "pending") {
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: Clock,
      label: t.pending,
    };
  } else if (status === "inProgress") {
    return {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: AlertCircle,
      label: t.inProgress,
    };
  } else if (status === "resolved") {
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: CheckCircle,
      label: t.resolved,
    };
  } else if (status === "rejected") {
    return {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: XCircle,
      label: t.rejected,
    };
  } else {
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: Clock,
      label: t.pending,
    };
  }
}

/**
 * Get priority color class based on priority level.
 * @param {string} priority - The priority level
 * @returns {string} CSS class for the priority color
 */
function getPriorityColor(priority) {
  if (priority === "urgent") {
    return "bg-red-500";
  } else if (priority === "high") {
    return "bg-orange-500";
  } else if (priority === "medium") {
    return "bg-yellow-500";
  } else if (priority === "low") {
    return "bg-blue-500";
  } else {
    return "bg-gray-500";
  }
}

/**
 * Filter issues based on filter type and search text.
 * @param {Array} issuesList - List of all issues
 * @param {string} filter - Current filter type
 * @param {string} search - Search text
 * @returns {Array} Filtered list of issues
 */
function filterIssues(issuesList, filter, search) {
  const filteredByType = [];

  // First, filter by status/type
  for (let i = 0; i < issuesList.length; i++) {
    const issue = issuesList[i];

    if (filter === "all") {
      filteredByType.push(issue);
    } else if (filter === "prioritized" && issue.superAdminPriority !== null) {
      filteredByType.push(issue);
    } else if (issue.status === filter) {
      filteredByType.push(issue);
    }
  }

  // Then, filter by search text
  if (!search) {
    return filteredByType;
  }

  const filteredBySearch = [];
  const searchLower = search.toLowerCase();

  for (let i = 0; i < filteredByType.length; i++) {
    const issue = filteredByType[i];
    const idLower = issue.id.toLowerCase();
    const typeLower = issue.type.toLowerCase();
    const locationLower = issue.location.toLowerCase();

    if (
      idLower.includes(searchLower) ||
      typeLower.includes(searchLower) ||
      locationLower.includes(searchLower)
    ) {
      filteredBySearch.push(issue);
    }
  }

  return filteredBySearch;
}

/**
 * Sort issues by date and priority.
 * @param {Array} issuesList - List of issues to sort
 * @param {string} sortOrder - Sort order (newest or oldest)
 * @returns {Array} Sorted list of issues
 */
function sortIssues(issuesList, sortOrder) {
  // Create a copy to avoid mutating original array
  const sortedList = [];
  for (let i = 0; i < issuesList.length; i++) {
    sortedList.push(issuesList[i]);
  }

  // Sort using bubble sort for simplicity
  for (let i = 0; i < sortedList.length - 1; i++) {
    for (let j = 0; j < sortedList.length - 1 - i; j++) {
      const issueA = sortedList[j];
      const issueB = sortedList[j + 1];

      // Prioritized issues always come first
      if (issueA.superAdminPriority && !issueB.superAdminPriority) {
        // A has priority, B doesn't - keep A first
        continue;
      }
      if (!issueA.superAdminPriority && issueB.superAdminPriority) {
        // B has priority, A doesn't - swap
        sortedList[j] = issueB;
        sortedList[j + 1] = issueA;
        continue;
      }

      // Both have same priority status, sort by date
      const dateA = new Date(issueA.reportedOn);
      const dateB = new Date(issueB.reportedOn);

      let shouldSwap = false;
      if (sortOrder === "newest") {
        shouldSwap = dateA < dateB;
      } else {
        shouldSwap = dateA > dateB;
      }

      if (shouldSwap) {
        sortedList[j] = issueB;
        sortedList[j + 1] = issueA;
      }
    }
  }

  return sortedList;
}

/**
 * Count issues by filter type.
 * @param {Array} issuesList - List of all issues
 * @returns {Object} Counts for each filter type
 */
function countIssues(issuesList) {
  const counts = {
    all: issuesList.length,
    prioritized: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
  };

  for (let i = 0; i < issuesList.length; i++) {
    const issue = issuesList[i];

    if (issue.superAdminPriority) {
      counts.prioritized = counts.prioritized + 1;
    }
    if (issue.status === "pending") {
      counts.pending = counts.pending + 1;
    }
    if (issue.status === "inProgress") {
      counts.inProgress = counts.inProgress + 1;
    }
    if (issue.status === "resolved") {
      counts.resolved = counts.resolved + 1;
    }
  }

  return counts;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * WardAdminIssues - Main component for ward admin issue management.
 * @returns {JSX.Element} The rendered component
 */
function WardAdminIssues() {
  // ============================================================================
  // HOOKS AND CONTEXT
  // ============================================================================

  const languageContext = useLanguage();
  const language = languageContext.language;

  const authContext = useAuth();
  const getUserWard = authContext.getUserWard;

  const t = text[language];
  const wardNumber = getUserWard() || 5;

  // ============================================================================
  // STATE
  // ============================================================================

  const [issues, setIssues] = useState(mockIssues);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  // Filter and sort issues
  const filteredList = filterIssues(issues, filter, search);
  const filteredIssues = sortIssues(filteredList, sortOrder);

  // Count issues for filter tabs
  const issueCounts = countIssues(issues);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle updating the status of an issue.
   * @param {string} id - Issue ID
   * @param {string} newStatus - New status to set
   */
  function handleStatusUpdate(id, newStatus) {
    setIssues(function (previousIssues) {
      const updatedIssues = [];

      for (let i = 0; i < previousIssues.length; i++) {
        const issue = previousIssues[i];

        if (issue.id === id) {
          // Create a new issue object with updated status
          const updatedIssue = {
            id: issue.id,
            type: issue.type,
            typeNp: issue.typeNp,
            description: issue.description,
            descriptionNp: issue.descriptionNp,
            location: issue.location,
            status: newStatus,
            reportedBy: issue.reportedBy,
            reportedOn: issue.reportedOn,
            priority: issue.priority,
            superAdminPriority: issue.superAdminPriority,
            priorityNote: issue.priorityNote,
          };
          updatedIssues.push(updatedIssue);
        } else {
          updatedIssues.push(issue);
        }
      }

      return updatedIssues;
    });
  }

  /**
   * Handle search input change.
   * @param {Event} e - Input change event
   */
  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  /**
   * Handle sort order change.
   * @param {Event} e - Select change event
   */
  function handleSortChange(e) {
    setSortOrder(e.target.value);
  }

  /**
   * Handle filter tab click.
   * @param {string} filterId - The filter ID to set
   */
  function handleFilterClick(filterId) {
    setFilter(filterId);
  }

  /**
   * Handle issue card expansion toggle.
   * @param {string} issueId - The issue ID to toggle
   */
  function handleToggleExpand(issueId) {
    if (expandedId === issueId) {
      setExpandedId(null);
    } else {
      setExpandedId(issueId);
    }
  }

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  /**
   * Render filter tab buttons.
   * @returns {Array} Array of button elements
   */
  function renderFilterTabs() {
    const filterTabs = [
      { id: "all", label: t.all, count: issueCounts.all, highlight: false },
      { id: "prioritized", label: t.prioritized, count: issueCounts.prioritized, highlight: true },
      { id: "pending", label: t.pending, count: issueCounts.pending, highlight: false },
      { id: "inProgress", label: t.inProgress, count: issueCounts.inProgress, highlight: false },
      { id: "resolved", label: t.resolved, count: issueCounts.resolved, highlight: false },
    ];

    const buttons = [];

    for (let i = 0; i < filterTabs.length; i++) {
      const tab = filterTabs[i];

      // Determine button classes
      let buttonClass = "px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1.5 ";

      if (filter === tab.id) {
        if (tab.highlight) {
          buttonClass = buttonClass + "bg-orange-600 text-white";
        } else {
          buttonClass = buttonClass + "bg-indigo-600 text-white";
        }
      } else {
        if (tab.highlight) {
          buttonClass = buttonClass + "bg-orange-50 text-orange-700 hover:bg-orange-100";
        } else {
          buttonClass = buttonClass + "bg-gray-100 text-gray-600 hover:bg-gray-200";
        }
      }

      // Determine count badge classes
      let countClass = "px-1.5 py-0.5 text-xs rounded ";
      if (filter === tab.id) {
        countClass = countClass + "bg-white/20";
      } else {
        countClass = countClass + "bg-gray-200";
      }

      buttons.push(
        <button
          key={tab.id}
          onClick={function () {
            handleFilterClick(tab.id);
          }}
          className={buttonClass}
        >
          {tab.highlight && <Flag size={12} />}
          {tab.label}
          <span className={countClass}>{tab.count}</span>
        </button>
      );
    }

    return buttons;
  }

  /**
   * Render issue cards.
   * @returns {Array} Array of issue card elements
   */
  function renderIssueCards() {
    const cards = [];

    for (let i = 0; i < filteredIssues.length; i++) {
      const issue = filteredIssues[i];
      const statusConfig = getStatusConfig(issue.status, t);
      const StatusIcon = statusConfig.icon;
      const isExpanded = expandedId === issue.id;

      // Determine card container class
      let containerClass = "bg-white rounded-xl shadow-sm overflow-hidden ";
      if (issue.superAdminPriority) {
        containerClass = containerClass + "ring-2 ring-orange-400";
      }

      // Render priority banner if exists
      let priorityBanner = null;
      if (issue.superAdminPriority) {
        const priorityColorClass = getPriorityColor(issue.superAdminPriority);
        priorityBanner = (
          <div className={priorityColorClass + " text-white px-4 py-1.5 text-sm flex items-center gap-2"}>
            <Flag size={14} />
            <span className="font-medium capitalize">{issue.superAdminPriority} Priority</span>
            <span className="text-white/70">from Municipality</span>
          </div>
        );
      }

      // Render action buttons based on status
      let actionButtons = null;
      if (issue.status === "pending") {
        actionButtons = (
          <button
            onClick={function (e) {
              e.stopPropagation();
              handleStatusUpdate(issue.id, "inProgress");
            }}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
          >
            <AlertCircle size={14} />
            {t.markInProgress}
          </button>
        );
      } else if (issue.status === "inProgress") {
        actionButtons = (
          <>
            <button
              onClick={function (e) {
                e.stopPropagation();
                handleStatusUpdate(issue.id, "resolved");
              }}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
            >
              <CheckCircle size={14} />
              {t.markResolved}
            </button>
            <button
              onClick={function (e) {
                e.stopPropagation();
                handleStatusUpdate(issue.id, "rejected");
              }}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
            >
              <XCircle size={14} />
              {t.markRejected}
            </button>
          </>
        );
      } else {
        actionButtons = (
          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg flex items-center gap-1">
            <CheckCircle size={14} />
            {t.completed}
          </span>
        );
      }

      // Determine issue type text based on language
      let issueTypeText;
      if (language === "en") {
        issueTypeText = issue.type;
      } else {
        issueTypeText = issue.typeNp;
      }

      // Determine description text based on language
      let descriptionText;
      if (language === "en") {
        descriptionText = issue.description;
      } else {
        descriptionText = issue.descriptionNp;
      }

      cards.push(
        <div key={issue.id} className={containerClass}>
          {/* Priority Banner */}
          {priorityBanner}

          {/* Issue Row */}
          <div
            className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={function () {
              handleToggleExpand(issue.id);
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400 font-mono">{issue.id}</span>
                  <span className={"px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 " + statusConfig.bg + " " + statusConfig.text}>
                    <StatusIcon size={12} />
                    {statusConfig.label}
                  </span>
                </div>
                <h3 className="font-medium text-gray-800">{issueTypeText}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {issue.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {issue.reportedOn}
                  </span>
                </p>
              </div>
              <button className="p-2 text-gray-400">
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <p className="text-sm text-gray-600 mb-3">{descriptionText}</p>

              <p className="text-xs text-gray-500 mb-3">
                <User size={12} className="inline mr-1" />
                {t.reportedBy}: {issue.reportedBy}
              </p>

              {/* Municipal Priority Note */}
              {issue.priorityNote && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-orange-700 mb-1">{t.priorityNote}</p>
                  <p className="text-sm text-gray-700">{issue.priorityNote}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">{actionButtons}</div>
            </div>
          )}
        </div>
      );
    }

    return cards;
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
            <p className="text-sm text-gray-500">
              {t.subtitle} • Ward {wardNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
            >
              <option value="newest">{t.newest}</option>
              <option value="oldest">{t.oldest}</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">{renderFilterTabs()}</div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            {t.noIssues}
          </div>
        ) : (
          renderIssueCards()
        )}
      </div>
    </div>
  );
}

export default WardAdminIssues;
