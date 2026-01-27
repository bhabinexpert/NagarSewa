/**
 * SuperAdminIssues Component
 *
 * Municipal-level issue overview for super administrators.
 * Allows viewing all ward issues and setting priority levels
 * for ward admin action.
 *
 * @component
 */

import React, { useState } from "react";
import { useLanguage } from "../../../context/useLanguage";
import { DAMAK_TOTAL_WARDS } from "../../../context/authConstants";
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
  X,
  Filter,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const text = {
  en: {
    title: "Municipal Issue Overview",
    subtitle: "Set priorities for ward-level action",
    searchPlaceholder: "Search issues...",
    all: "All Issues",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    noIssues: "No issues found",
    setPriority: "Set Priority",
    updatePriority: "Update Priority",
    prioritySet: "Priority Set",
    allWards: "All Wards",
    ward: "Ward",
    newest: "Newest",
    oldest: "Oldest",
    urgent: "Urgent",
    high: "High",
    medium: "Medium",
    low: "Low",
    priorityNote: "Note for Ward Admin",
    priorityNotePlaceholder: "Add instructions...",
    save: "Save Priority",
    cancel: "Cancel",
    reportedBy: "Reported by",
  },
  np: {
    title: "नगरपालिका समस्या अवलोकन",
    subtitle: "वडा-स्तरीय कार्यको लागि प्राथमिकता सेट गर्नुहोस्",
    searchPlaceholder: "समस्याहरू खोज्नुहोस्...",
    all: "सबै समस्याहरू",
    pending: "पेन्डिङ",
    inProgress: "प्रगतिमा",
    resolved: "समाधान",
    noIssues: "कुनै समस्या फेला परेन",
    setPriority: "प्राथमिकता सेट",
    updatePriority: "प्राथमिकता अपडेट",
    prioritySet: "प्राथमिकता सेट भयो",
    allWards: "सबै वडाहरू",
    ward: "वडा",
    newest: "नयाँ",
    oldest: "पुरानो",
    urgent: "अत्यावश्यक",
    high: "उच्च",
    medium: "मध्यम",
    low: "कम",
    priorityNote: "वडा प्रशासकको लागि नोट",
    priorityNotePlaceholder: "निर्देशनहरू थप्नुहोस्...",
    save: "प्राथमिकता बचत",
    cancel: "रद्द",
    reportedBy: "रिपोर्ट गर्ने",
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
    description: "Large pothole near market",
    wardNumber: 1,
    location: "Main Road",
    status: "pending",
    reportedBy: "Ram Sharma",
    reportedOn: "2024-01-15",
    superAdminPriority: null,
    priorityNote: null,
  },
  {
    id: "ISS-002",
    type: "Water Supply",
    typeNp: "पानी आपूर्ति",
    description: "No water for 3 days",
    wardNumber: 3,
    location: "Sector 4",
    status: "pending",
    reportedBy: "Sita Devi",
    reportedOn: "2024-01-16",
    superAdminPriority: "urgent",
    priorityNote: "Critical - affects 200 households",
  },
  {
    id: "ISS-003",
    type: "Street Light",
    typeNp: "सडक बत्ती",
    description: "Lights not working",
    wardNumber: 5,
    location: "Block B",
    status: "inProgress",
    reportedBy: "Hari Prasad",
    reportedOn: "2024-01-17",
    superAdminPriority: "high",
    priorityNote: "Complete before festival",
  },
  {
    id: "ISS-004",
    type: "Drainage",
    typeNp: "ढल निकास",
    description: "Blocked drainage causing flooding",
    wardNumber: 2,
    location: "Market Area",
    status: "pending",
    reportedBy: "Krishna Rai",
    reportedOn: "2024-01-18",
    superAdminPriority: null,
    priorityNote: null,
  },
  {
    id: "ISS-005",
    type: "Garbage",
    typeNp: "फोहोर",
    description: "Garbage not collected",
    wardNumber: 7,
    location: "Residential Area",
    status: "resolved",
    reportedBy: "Maya Thapa",
    reportedOn: "2024-01-10",
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
 * @returns {Object} Status configuration with bg, text, and icon
 */
function getStatusConfig(status) {
  if (status === "pending") {
    return { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock };
  } else if (status === "inProgress") {
    return { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle };
  } else if (status === "resolved") {
    return { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle };
  } else if (status === "rejected") {
    return { bg: "bg-red-100", text: "text-red-700", icon: XCircle };
  } else {
    return { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock };
  }
}

/**
 * Get priority button color class.
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
 * Filter issues based on ward, status, and search.
 * @param {Array} issuesList - List of all issues
 * @param {string} wardFilter - Ward filter value
 * @param {string} statusFilter - Status filter value
 * @param {string} search - Search text
 * @returns {Array} Filtered list of issues
 */
function filterIssues(issuesList, wardFilter, statusFilter, search) {
  const filteredList = [];

  for (let i = 0; i < issuesList.length; i++) {
    const issue = issuesList[i];

    // Check ward filter
    if (wardFilter !== "all") {
      if (issue.wardNumber.toString() !== wardFilter) {
        continue;
      }
    }

    // Check status filter
    if (statusFilter !== "all") {
      if (issue.status !== statusFilter) {
        continue;
      }
    }

    // Check search text
    if (search) {
      const idLower = issue.id.toLowerCase();
      const typeLower = issue.type.toLowerCase();
      const searchLower = search.toLowerCase();

      if (!idLower.includes(searchLower) && !typeLower.includes(searchLower)) {
        continue;
      }
    }

    filteredList.push(issue);
  }

  return filteredList;
}

/**
 * Sort issues by date.
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

  // Sort using bubble sort
  for (let i = 0; i < sortedList.length - 1; i++) {
    for (let j = 0; j < sortedList.length - 1 - i; j++) {
      const dateA = new Date(sortedList[j].reportedOn);
      const dateB = new Date(sortedList[j + 1].reportedOn);

      let shouldSwap = false;
      if (sortOrder === "newest") {
        shouldSwap = dateA < dateB;
      } else {
        shouldSwap = dateA > dateB;
      }

      if (shouldSwap) {
        const temp = sortedList[j];
        sortedList[j] = sortedList[j + 1];
        sortedList[j + 1] = temp;
      }
    }
  }

  return sortedList;
}

/**
 * Calculate statistics from issues list.
 * @param {Array} issuesList - List of all issues
 * @returns {Object} Statistics object
 */
function calculateStats(issuesList) {
  let pendingCount = 0;
  let prioritizedCount = 0;

  for (let i = 0; i < issuesList.length; i++) {
    const issue = issuesList[i];

    if (issue.status === "pending") {
      pendingCount = pendingCount + 1;
    }
    if (issue.superAdminPriority) {
      prioritizedCount = prioritizedCount + 1;
    }
  }

  return {
    total: issuesList.length,
    pending: pendingCount,
    prioritized: prioritizedCount,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SuperAdminIssues - Main component for super admin issue overview.
 * @returns {JSX.Element} The rendered component
 */
function SuperAdminIssues() {
  // ============================================================================
  // HOOKS AND CONTEXT
  // ============================================================================

  const languageContext = useLanguage();
  const language = languageContext.language;
  const t = text[language];

  // ============================================================================
  // STATE
  // ============================================================================

  const [issues, setIssues] = useState(mockIssues);
  const [filter, setFilter] = useState("all");
  const [wardFilter, setWardFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);

  // Priority Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [priorityNote, setPriorityNote] = useState("");

  // ============================================================================
  // DATA PROCESSING
  // ============================================================================

  // Filter and sort issues
  const filteredList = filterIssues(issues, wardFilter, filter, search);
  const filteredIssues = sortIssues(filteredList, sortOrder);

  // Calculate stats
  const stats = calculateStats(issues);

  // Priority options
  const priorityOptions = [
    { value: "low", label: t.low, color: "bg-blue-500" },
    { value: "medium", label: t.medium, color: "bg-yellow-500" },
    { value: "high", label: t.high, color: "bg-orange-500" },
    { value: "urgent", label: t.urgent, color: "bg-red-500" },
  ];

  // Filter tabs
  const filterTabs = [
    { id: "all", label: t.all },
    { id: "pending", label: t.pending },
    { id: "inProgress", label: t.inProgress },
    { id: "resolved", label: t.resolved },
  ];

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Open the priority modal for an issue.
   * @param {Object} issue - The issue to set priority for
   */
  function openPriorityModal(issue) {
    setSelectedIssue(issue);

    if (issue.superAdminPriority) {
      setSelectedPriority(issue.superAdminPriority);
    } else {
      setSelectedPriority("");
    }

    if (issue.priorityNote) {
      setPriorityNote(issue.priorityNote);
    } else {
      setPriorityNote("");
    }

    setShowModal(true);
  }

  /**
   * Save the priority for the selected issue.
   */
  function savePriority() {
    if (!selectedPriority) {
      return;
    }

    setIssues(function (previousIssues) {
      const updatedIssues = [];

      for (let i = 0; i < previousIssues.length; i++) {
        const issue = previousIssues[i];

        if (issue.id === selectedIssue.id) {
          // Create a new issue object with updated priority
          const updatedIssue = {
            id: issue.id,
            type: issue.type,
            typeNp: issue.typeNp,
            description: issue.description,
            wardNumber: issue.wardNumber,
            location: issue.location,
            status: issue.status,
            reportedBy: issue.reportedBy,
            reportedOn: issue.reportedOn,
            superAdminPriority: selectedPriority,
            priorityNote: priorityNote,
          };
          updatedIssues.push(updatedIssue);
        } else {
          updatedIssues.push(issue);
        }
      }

      return updatedIssues;
    });

    // Close modal and reset state
    setShowModal(false);
    setSelectedIssue(null);
    setSelectedPriority("");
    setPriorityNote("");
  }

  /**
   * Close the priority modal.
   */
  function closeModal() {
    setShowModal(false);
  }

  /**
   * Handle search input change.
   * @param {Event} e - Input change event
   */
  function handleSearchChange(e) {
    setSearch(e.target.value);
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

  /**
   * Handle priority selection in modal.
   * @param {string} priority - The selected priority value
   */
  function handlePrioritySelect(priority) {
    setSelectedPriority(priority);
  }

  /**
   * Handle priority note change.
   * @param {Event} e - Input change event
   */
  function handlePriorityNoteChange(e) {
    setPriorityNote(e.target.value);
  }

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

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
   * Render filter tab buttons.
   * @returns {Array} Array of button elements
   */
  function renderFilterTabs() {
    const buttons = [];

    for (let i = 0; i < filterTabs.length; i++) {
      const tab = filterTabs[i];

      let buttonClass = "px-3 py-1.5 text-sm rounded-lg transition ";
      if (filter === tab.id) {
        buttonClass = buttonClass + "bg-purple-600 text-white";
      } else {
        buttonClass = buttonClass + "bg-gray-100 text-gray-600 hover:bg-gray-200";
      }

      buttons.push(
        <button
          key={tab.id}
          onClick={function () {
            handleFilterClick(tab.id);
          }}
          className={buttonClass}
        >
          {tab.label}
        </button>
      );
    }

    return buttons;
  }

  /**
   * Render priority option buttons in modal.
   * @returns {Array} Array of button elements
   */
  function renderPriorityOptions() {
    const buttons = [];

    for (let i = 0; i < priorityOptions.length; i++) {
      const opt = priorityOptions[i];

      let buttonClass = "px-4 py-3 rounded-lg border-2 font-medium transition ";
      if (selectedPriority === opt.value) {
        buttonClass = buttonClass + opt.color + " text-white border-transparent";
      } else {
        buttonClass = buttonClass + "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300";
      }

      buttons.push(
        <button
          key={opt.value}
          onClick={function () {
            handlePrioritySelect(opt.value);
          }}
          className={buttonClass}
        >
          {opt.label}
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
      const statusConfig = getStatusConfig(issue.status);
      const StatusIcon = statusConfig.icon;
      const isExpanded = expandedId === issue.id;

      // Determine container class
      let containerClass = "bg-white rounded-xl shadow-sm overflow-hidden ";
      if (issue.superAdminPriority) {
        containerClass = containerClass + "ring-2 ring-purple-400";
      }

      // Determine issue type text based on language
      let issueTypeText;
      if (language === "en") {
        issueTypeText = issue.type;
      } else {
        issueTypeText = issue.typeNp;
      }

      // Find priority color if exists
      let priorityBadge = null;
      if (issue.superAdminPriority) {
        let priorityColorClass = "";
        for (let j = 0; j < priorityOptions.length; j++) {
          if (priorityOptions[j].value === issue.superAdminPriority) {
            priorityColorClass = priorityOptions[j].color;
            break;
          }
        }
        priorityBadge = (
          <span className={"px-2 py-0.5 rounded text-xs font-medium text-white capitalize " + priorityColorClass}>
            {issue.superAdminPriority}
          </span>
        );
      }

      // Determine button text for priority
      let priorityButtonText;
      let priorityButtonClass;
      if (issue.superAdminPriority) {
        priorityButtonText = t.updatePriority;
        priorityButtonClass = "bg-purple-100 text-purple-700 hover:bg-purple-200";
      } else {
        priorityButtonText = t.setPriority;
        priorityButtonClass = "bg-orange-600 text-white hover:bg-orange-700";
      }

      // Get status label text
      let statusLabelText = t[issue.status];
      if (!statusLabelText) {
        statusLabelText = issue.status;
      }

      cards.push(
        <div key={issue.id} className={containerClass}>
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
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                    {t.ward} {issue.wardNumber}
                  </span>
                  <span className={"px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 " + statusConfig.bg + " " + statusConfig.text}>
                    <StatusIcon size={12} />
                    {statusLabelText}
                  </span>
                  {priorityBadge}
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

              <div className="flex items-center gap-2">
                <button
                  onClick={function (e) {
                    e.stopPropagation();
                    openPriorityModal(issue);
                  }}
                  className={"px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 " + priorityButtonClass}
                >
                  <Flag size={14} />
                  {priorityButtonText}
                </button>
                <button className="p-2 text-gray-400">
                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3">
              <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
              <p className="text-xs text-gray-500">
                <User size={12} className="inline mr-1" />
                {t.reportedBy}: {issue.reportedBy}
              </p>
              {issue.priorityNote && (
                <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-purple-700">Your Priority Note:</p>
                  <p className="text-sm text-gray-700">{issue.priorityNote}</p>
                </div>
              )}
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

  // Prepare modal issue display text
  let modalIssueText = "";
  if (selectedIssue) {
    if (language === "en") {
      modalIssueText = selectedIssue.id + " - " + selectedIssue.type;
    } else {
      modalIssueText = selectedIssue.id + " - " + selectedIssue.typeNp;
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>

          {/* Stats Pills */}
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="px-4 py-2 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-600">Pending</p>
              <p className="text-lg font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="px-4 py-2 bg-orange-50 rounded-lg">
              <p className="text-xs text-orange-600">Prioritized</p>
              <p className="text-lg font-bold text-orange-700">{stats.prioritized}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={wardFilter}
            onChange={handleWardFilterChange}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
          >
            <option value="all">{t.allWards}</option>
            {renderWardOptions()}
          </select>
          <select
            value={sortOrder}
            onChange={handleSortChange}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
          </select>
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

      {/* Priority Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Flag className="text-orange-600" size={20} />
                {t.setPriority}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">{modalIssueText}</p>

            {/* Priority Options */}
            <div className="grid grid-cols-2 gap-2 mb-4">{renderPriorityOptions()}</div>

            {/* Note */}
            <textarea
              value={priorityNote}
              onChange={handlePriorityNoteChange}
              placeholder={t.priorityNotePlaceholder}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 mb-4"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={savePriority}
                disabled={!selectedPriority}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminIssues;
