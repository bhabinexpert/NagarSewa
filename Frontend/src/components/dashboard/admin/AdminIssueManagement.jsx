import React, { useState } from "react";
import { useLanguage } from "../../../context/useLanguage";
import { useAuth } from "../../../context/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../../context/authConstants";
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
} from "lucide-react";

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
    markedForAction: "Marked for Action",
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
    adminNotes: "Admin Notes",
    assignTo: "Assign to Team",
    selectTeam: "Select team",
    teams: ["Road Maintenance", "Water Supply", "Electricity", "Sanitation", "General"],
    statusUpdated: "Status updated successfully",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    ward: "Ward",
    allWards: "All Wards",
    yourWard: "Your Ward",
    markForAction: "Mark for Action",
    markForActionDesc: "Flag this issue for the ward admin to take immediate action",
    actionRequired: "Action Required",
    markedBy: "Marked by Super Admin",
    actionNote: "Note for Ward Admin",
    actionNotePlaceholder: "Add instructions for the ward admin...",
    viewOnly: "View Only",
    viewOnlyDesc: "As Super Admin, you can set priority levels for issues. Ward admins will handle status updates.",
    setPriority: "Set Priority",
    setPriorityDesc: "Set priority level for this issue to notify ward admin",
    prioritySet: "Priority Set",
    prioritySetBy: "Priority set by Super Admin",
    selectPriority: "Select Priority Level",
    priorityNote: "Instructions for Ward Admin",
    priorityNotePlaceholder: "Add priority instructions for the ward admin...",
    priorityUpdated: "Priority updated successfully",
    markInProgress: "Mark In Progress",
    markResolved: "Mark Resolved",
    markRejected: "Mark Rejected",
    issueCompleted: "Issue Completed",
    lowPriority: "Low",
    mediumPriority: "Medium",
    highPriority: "High",
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
    markedForAction: "कारबाहीको लागि चिन्हित",
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
    adminNotes: "प्रशासक नोटहरू",
    assignTo: "टोलीलाई तोक्नुहोस्",
    selectTeam: "टोली चयन गर्नुहोस्",
    teams: ["सडक मर्मत", "पानी आपूर्ति", "बिजुली", "सरसफाई", "सामान्य"],
    statusUpdated: "स्थिति सफलतापूर्वक अद्यावधिक गरियो",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    urgent: "अत्यावश्यक",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    yourWard: "तपाईंको वडा",
    markForAction: "कारबाहीको लागि चिन्ह लगाउनुहोस्",
    markForActionDesc: "वडा प्रशासकलाई तत्काल कारबाही गर्न यो समस्या चिन्हित गर्नुहोस्",
    actionRequired: "कारबाही आवश्यक",
    markedBy: "सुपर एडमिनले चिन्हित गर्नुभयो",
    actionNote: "वडा प्रशासकको लागि नोट",
    actionNotePlaceholder: "वडा प्रशासकको लागि निर्देशनहरू थप्नुहोस्...",
    viewOnly: "हेर्ने मात्र",
    viewOnlyDesc: "सुपर एडमिनको रूपमा, तपाईं समस्याहरूको प्राथमिकता स्तर सेट गर्न सक्नुहुन्छ। वडा प्रशासकहरूले स्थिति अपडेट ह्यान्डल गर्नेछन्।",
    setPriority: "प्राथमिकता सेट गर्नुहोस्",
    setPriorityDesc: "वडा प्रशासकलाई सूचित गर्न यो समस्याको प्राथमिकता स्तर सेट गर्नुहोस्",
    prioritySet: "प्राथमिकता सेट भयो",
    prioritySetBy: "सुपर एडमिनले प्राथमिकता सेट गर्नुभयो",
    selectPriority: "प्राथमिकता स्तर चयन गर्नुहोस्",
    priorityNote: "वडा प्रशासकको लागि निर्देशन",
    priorityNotePlaceholder: "वडा प्रशासकको लागि प्राथमिकता निर्देशनहरू थप्नुहोस्...",
    priorityUpdated: "प्राथमिकता सफलतापूर्वक अद्यावधिक गरियो",
    markInProgress: "प्रगतिमा चिन्हित गर्नुहोस्",
    markResolved: "समाधान चिन्हित गर्नुहोस्",
    markRejected: "अस्वीकृत चिन्हित गर्नुहोस्",
    issueCompleted: "समस्या पूरा भयो",
    lowPriority: "कम",
    mediumPriority: "मध्यम",
    highPriority: "उच्च",
  },
};

// Mock issues data with ward numbers and priority flags from super admin
const mockIssues = [
  {
    id: "ISS-2024-001",
    type: "Road Damage",
    typeNp: "सडक क्षति",
    wardNumber: 5,
    description: "Large pothole causing accidents near the main market area.",
    descriptionNp: "मुख्य बजार क्षेत्र नजिक ठूलो खाल्डोले दुर्घटना गराउँदै।",
    location: "Ward 5, Damak",
    priority: "low", // Original priority set by user
    superAdminPriority: "urgent", // Priority set by super admin
    priorityNote: "This is causing accidents - needs immediate attention",
    prioritySetAt: "2024-01-16",
    status: "pending",
    reportedBy: "Ram Bahadur",
    reportedOn: "2024-01-15",
    images: 2,
    phone: "+977 9841234567",
  },
  {
    id: "ISS-2024-002",
    type: "Water Supply",
    typeNp: "पानी आपूर्ति",
    wardNumber: 4,
    description: "No water supply for the past 3 days in our area.",
    descriptionNp: "हाम्रो क्षेत्रमा गत 3 दिनदेखि पानी आपूर्ति छैन।",
    location: "Ward 4, Damak",
    priority: "urgent",
    superAdminPriority: null,
    status: "inProgress",
    reportedBy: "Sita Sharma",
    reportedOn: "2024-01-10",
    images: 1,
    phone: "+977 9851234567",
    assignedTeam: "Water Supply",
    adminResponse: "Team dispatched. Working on repair.",
  },
  {
    id: "ISS-2024-003",
    type: "Street Light",
    typeNp: "सडक बत्ती",
    wardNumber: 3,
    description: "Street light not working for 2 weeks.",
    descriptionNp: "सडक बत्ती २ हप्तादेखि काम गरिरहेको छैन।",
    location: "Ward 3, Damak",
    priority: "medium",
    superAdminPriority: null,
    status: "resolved",
    reportedBy: "Hari Prasad",
    reportedOn: "2024-01-05",
    images: 1,
    phone: "+977 9861234567",
    assignedTeam: "Electricity",
    adminResponse: "Fixed on 10th January.",
  },
  {
    id: "ISS-2024-004",
    type: "Garbage",
    typeNp: "फोहोर",
    wardNumber: 5,
    description: "Garbage not collected for a week.",
    descriptionNp: "एक हप्तादेखि फोहोर संकलन भएको छैन।",
    location: "Ward 5, Damak",
    priority: "medium",
    superAdminPriority: "high",
    priorityNote: "Health hazard - prioritize sanitation issues",
    prioritySetAt: "2024-01-09",
    status: "pending",
    reportedBy: "Gita Thapa",
    reportedOn: "2024-01-08",
    images: 2,
    phone: "+977 9871234567",
  },
  {
    id: "ISS-2024-005",
    type: "Drainage",
    typeNp: "ढल निकास",
    wardNumber: 7,
    description: "Blocked drainage causing water logging.",
    descriptionNp: "अवरुद्ध ढल निकासले पानी जमाव गर्दै।",
    location: "Ward 7, Damak",
    priority: "low",
    superAdminPriority: "high",
    priorityNote: "Health hazard - prioritize this issue",
    prioritySetAt: "2024-01-21",
    status: "pending",
    reportedBy: "Krishna Rai",
    reportedOn: "2024-01-20",
    images: 1,
    phone: "+977 9881234567",
  },
];

const AdminIssueManagement = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = issueManagementText[language];

  // Determine user role
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const isWardAdmin = user?.role === ROLES.WARD_ADMIN;
  const isAdmin = isSuperAdmin || isWardAdmin; // Either admin type can manage issues
  const userWard = user?.wardNumber || user?.jurisdiction?.wardNumber || 5;

  const [issues, setIssues] = useState(mockIssues);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [priorityNote, setPriorityNote] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [wardFilter, setWardFilter] = useState(isSuperAdmin ? "all" : userWard.toString());

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock size={14} />, label: t.pending };
      case "inProgress":
        return { bg: "bg-blue-100", text: "text-blue-700", icon: <AlertCircle size={14} />, label: t.inProgress };
      case "resolved":
        return { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle size={14} />, label: t.resolved };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-700", icon: <XCircle size={14} />, label: t.rejected };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", icon: <Clock size={14} />, label: status };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "low": return { color: "text-green-600 bg-green-100", label: t.low };
      case "medium": return { color: "text-yellow-600 bg-yellow-100", label: t.medium };
      case "high": return { color: "text-orange-600 bg-orange-100", label: t.high };
      case "urgent": return { color: "text-red-600 bg-red-100", label: t.urgent };
      default: return { color: "text-gray-600 bg-gray-100", label: priority };
    }
  };

  const filteredIssues = issues
    // First filter by ward
    .filter((issue) => {
      // Ward admin only sees their ward
      if (isWardAdmin) return issue.wardNumber === userWard;
      // Super admin with ward filter
      if (isSuperAdmin && wardFilter !== "all") {
        return issue.wardNumber.toString() === wardFilter;
      }
      return true;
    })
    .filter((issue) => {
      if (filter === "all") return true;
      if (filter === "prioritySet") return issue.superAdminPriority !== null;
      return issue.status === filter;
    })
    .filter((issue) => {
      if (!searchQuery) return true;
      return (
        issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Priority order for sorting
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, null: 0 };
      
      // For ward admins, issues with super admin priority come first
      if (isWardAdmin) {
        const aPriority = priorityOrder[a.superAdminPriority] || 0;
        const bPriority = priorityOrder[b.superAdminPriority] || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
      }
      
      if (sortOrder === "newest") return new Date(b.reportedOn) - new Date(a.reportedOn);
      return new Date(a.reportedOn) - new Date(b.reportedOn);
    });

  // Ward admin directly updates status
  const handleStatusUpdate = (issueId, status) => {
    setIssues(issues.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          status,
        };
      }
      return issue;
    }));
    setSelectedIssue(null);
  };

  // Super admin sets priority for an issue
  const handlePriorityUpdate = (issueId, priority, note) => {
    setIssues(issues.map((issue) => {
      if (issue.id === issueId) {
        return {
          ...issue,
          superAdminPriority: priority,
          priorityNote: note,
          prioritySetAt: new Date().toISOString().split('T')[0],
        };
      }
      return issue;
    }));
    setShowPriorityModal(false);
    setSelectedIssue(null);
    setSelectedPriority("");
    setPriorityNote("");
  };

  // Get ward-filtered issues for counts
  const getWardFilteredIssues = () => {
    return issues.filter((issue) => {
      if (isWardAdmin) return issue.wardNumber === userWard;
      if (isSuperAdmin && wardFilter !== "all") {
        return issue.wardNumber.toString() === wardFilter;
      }
      return true;
    });
  };

  const wardFilteredIssues = getWardFilteredIssues();

  const filterTabs = [
    { id: "all", label: t.all, count: wardFilteredIssues.length },
    { id: "pending", label: t.pending, count: wardFilteredIssues.filter((i) => i.status === "pending").length },
    { id: "inProgress", label: t.inProgress, count: wardFilteredIssues.filter((i) => i.status === "inProgress").length },
    { id: "resolved", label: t.resolved, count: wardFilteredIssues.filter((i) => i.status === "resolved").length },
    { id: "rejected", label: t.rejected, count: wardFilteredIssues.filter((i) => i.status === "rejected").length },
    // Ward admins see "Priority Set" tab to filter issues with super admin priority
    ...(isWardAdmin ? [{ id: "prioritySet", label: t.prioritySet, count: wardFilteredIssues.filter((i) => i.superAdminPriority !== null).length, highlight: true }] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Debug: Show current user role */}
      {user && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4 text-sm">
          <span className="font-medium text-indigo-700">Logged in as: </span>
          <span className="text-indigo-600">{user.fullName || user.email}</span>
          <span className="mx-2 text-indigo-300">|</span>
          <span className="font-medium text-indigo-700">Role: </span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            isSuperAdmin ? 'bg-purple-100 text-purple-700' : 
            isWardAdmin ? 'bg-blue-100 text-blue-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            {isSuperAdmin ? 'Super Admin' : isWardAdmin ? `Ward ${userWard} Admin` : 'User'}
          </span>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-500">
              {isSuperAdmin ? t.subtitle : t.subtitleWardAdmin}
            </p>
            {/* Admin Role Notice */}
            {isAdmin && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle size={16} />
                <span>{isSuperAdmin ? 'You can manage issues and set priority levels' : 'You can manage issues in your ward'}</span>
              </div>
            )}
          </div>
          {/* Ward Indicator for Ward Admin */}
          {isWardAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
              <MapPin size={16} />
              <span className="font-medium">{t.yourWard}: {userWard}</span>
            </div>
          )}
          {/* Ward Filter for Super Admin */}
          {isSuperAdmin && (
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">{t.allWards}</option>
              {Array.from({ length: DAMAK_TOTAL_WARDS }, (_, i) => i + 1).map((ward) => (
                <option key={ward} value={ward}>
                  {t.ward} {ward}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === tab.id
                  ? tab.highlight ? "bg-orange-600 text-white" : "bg-indigo-600 text-white"
                  : tab.highlight ? "bg-orange-100 text-orange-700 hover:bg-orange-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.highlight && <Flag size={14} />}
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${filter === tab.id ? "bg-white/20" : tab.highlight ? "bg-orange-200" : "bg-gray-200"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => {
          const statusStyle = getStatusStyle(issue.status);
          const priorityStyle = getPriorityStyle(issue.priority);
          const superAdminPriorityStyle = issue.superAdminPriority ? getPriorityStyle(issue.superAdminPriority) : null;
          const isExpanded = selectedIssue === issue.id;

          return (
            <div 
              key={issue.id} 
              className={`bg-white rounded-2xl shadow-sm overflow-hidden ${
                issue.superAdminPriority ? "ring-2 ring-orange-400" : ""
              }`}
            >
              {/* Super Admin Priority Banner - Visible to Ward Admins */}
              {issue.superAdminPriority && isWardAdmin && (
                <div className={`px-4 py-2 flex items-center gap-2 ${
                  issue.superAdminPriority === 'urgent' ? 'bg-red-500 text-white' :
                  issue.superAdminPriority === 'high' ? 'bg-orange-500 text-white' :
                  issue.superAdminPriority === 'medium' ? 'bg-yellow-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  <Flag size={16} />
                  <span className="font-medium">{t.prioritySetBy}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    issue.superAdminPriority === 'urgent' ? 'bg-red-700' :
                    issue.superAdminPriority === 'high' ? 'bg-orange-700' :
                    issue.superAdminPriority === 'medium' ? 'bg-yellow-700' :
                    'bg-blue-700'
                  }`}>
                    {superAdminPriorityStyle?.label}
                  </span>
                </div>
              )}
              
              {/* Issue Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedIssue(isExpanded ? null : issue.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500 font-mono">{issue.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon}
                        {statusStyle.label}
                      </span>
                      {/* User-set priority */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityStyle.color}`}>
                        {priorityStyle.label}
                      </span>
                      {/* Super Admin Priority Badge */}
                      {issue.superAdminPriority && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                          issue.superAdminPriority === 'urgent' ? 'bg-red-100 text-red-700' :
                          issue.superAdminPriority === 'high' ? 'bg-orange-100 text-orange-700' :
                          issue.superAdminPriority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          <Flag size={10} />
                          {t.setPriority}: {superAdminPriorityStyle?.label}
                        </span>
                      )}
                      {/* Ward Badge */}
                      <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-indigo-100 text-indigo-700">
                        <MapPin size={10} />
                        {t.ward} {issue.wardNumber}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {language === "en" ? issue.type : issue.typeNp}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={14} />
                        {issue.reportedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {issue.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {issue.reportedOn}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.description}</p>
                      <p className="text-gray-800">
                        {language === "en" ? issue.description : issue.descriptionNp}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.attachments}</p>
                      <div className="flex items-center gap-2">
                        <Image className="text-gray-400" size={16} />
                        <span>{issue.images} image(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Note from Super Admin - Visible to Ward Admins */}
                  {issue.superAdminPriority && issue.priorityNote && isWardAdmin && (
                    <div className={`border rounded-xl p-3 mb-4 ${
                      issue.superAdminPriority === 'urgent' ? 'bg-red-50 border-red-200' :
                      issue.superAdminPriority === 'high' ? 'bg-orange-50 border-orange-200' :
                      issue.superAdminPriority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Flag className={`${
                          issue.superAdminPriority === 'urgent' ? 'text-red-600' :
                          issue.superAdminPriority === 'high' ? 'text-orange-600' :
                          issue.superAdminPriority === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} size={16} />
                        <p className={`text-sm font-medium ${
                          issue.superAdminPriority === 'urgent' ? 'text-red-700' :
                          issue.superAdminPriority === 'high' ? 'text-orange-700' :
                          issue.superAdminPriority === 'medium' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>{t.priorityNote}</p>
                        <span className={`text-xs ${
                          issue.superAdminPriority === 'urgent' ? 'text-red-500' :
                          issue.superAdminPriority === 'high' ? 'text-orange-500' :
                          issue.superAdminPriority === 'medium' ? 'text-yellow-500' :
                          'text-blue-500'
                        }`}>({issue.prioritySetAt})</span>
                      </div>
                      <p className="text-gray-700">{issue.priorityNote}</p>
                    </div>
                  )}

                  {issue.adminResponse && (
                    <div className="bg-indigo-50 rounded-xl p-3 mb-4">
                      <p className="text-sm font-medium text-indigo-700 mb-1">{t.adminNotes}</p>
                      <p className="text-gray-700">{issue.adminResponse}</p>
                    </div>
                  )}

                  {/* Action Buttons - Both Admin Types Can Manage Status */}
                  <div className="flex flex-wrap gap-3">
                    {/* Both Ward Admin and Super Admin can change status */}
                    {isAdmin && (
                      <>
                        {issue.status === "pending" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(issue.id, "inProgress");
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                          >
                            <AlertCircle size={16} />
                            {t.markInProgress || "Mark In Progress"}
                          </button>
                        )}
                        {issue.status === "inProgress" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(issue.id, "resolved");
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                            >
                              <CheckCircle size={16} />
                              {t.markResolved || "Mark Resolved"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(issue.id, "rejected");
                              }}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                            >
                              <XCircle size={16} />
                              {t.markRejected || "Mark Rejected"}
                            </button>
                          </>
                        )}
                        {(issue.status === "resolved" || issue.status === "rejected") && (
                          <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-2">
                            <CheckCircle size={16} />
                            {t.issueCompleted || "Issue Completed"}
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Super Admin can also set priority */}
                    {isSuperAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssue(issue.id);
                          setSelectedPriority(issue.superAdminPriority || "");
                          setPriorityNote(issue.priorityNote || "");
                          setShowPriorityModal(true);
                        }}
                        className={`px-4 py-2 text-white rounded-lg transition flex items-center gap-2 ${
                          issue.superAdminPriority 
                            ? 'bg-amber-600 hover:bg-amber-700' 
                            : 'bg-orange-600 hover:bg-orange-700'
                        }`}
                      >
                        <Flag size={16} />
                        {issue.superAdminPriority ? t.priorityUpdated : t.setPriority}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Priority Setting Modal - For Super Admin */}
      {showPriorityModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag className="text-orange-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">{t.setPriority}</h3>
              </div>
              <button
                onClick={() => {
                  setShowPriorityModal(false);
                  setPriorityNote("");
                  setSelectedPriority("");
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-gray-600 mb-4">{t.setPriorityDesc}</p>
            
            <div className="space-y-4">
              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.selectPriority}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "low", label: t.lowPriority, color: "bg-blue-100 text-blue-700 border-blue-300", activeColor: "bg-blue-600 text-white" },
                    { value: "medium", label: t.mediumPriority, color: "bg-yellow-100 text-yellow-700 border-yellow-300", activeColor: "bg-yellow-600 text-white" },
                    { value: "high", label: t.highPriority, color: "bg-orange-100 text-orange-700 border-orange-300", activeColor: "bg-orange-600 text-white" },
                    { value: "urgent", label: t.urgent, color: "bg-red-100 text-red-700 border-red-300", activeColor: "bg-red-600 text-white" },
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => setSelectedPriority(priority.value)}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                        selectedPriority === priority.value 
                          ? priority.activeColor + " border-transparent"
                          : priority.color + " hover:opacity-80"
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Priority Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.priorityNote}
                </label>
                <textarea
                  value={priorityNote}
                  onChange={(e) => setPriorityNote(e.target.value)}
                  placeholder={t.priorityNotePlaceholder}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPriorityModal(false);
                    setPriorityNote("");
                    setSelectedPriority("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => handlePriorityUpdate(selectedIssue, selectedPriority, priorityNote)}
                  disabled={!selectedPriority}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Flag size={16} />
                  {t.setPriority}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIssueManagement;
