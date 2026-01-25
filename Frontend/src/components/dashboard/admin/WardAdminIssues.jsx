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

// Mock issues for ward admin
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

const WardAdminIssues = () => {
  const { language } = useLanguage();
  const { getUserWard } = useAuth();
  const t = text[language];
  const wardNumber = getUserWard() || 5;

  const [issues, setIssues] = useState(mockIssues);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedId, setExpandedId] = useState(null);

  // Filter and sort issues
  const filteredIssues = issues
    .filter((issue) => {
      if (filter === "all") return true;
      if (filter === "prioritized") return issue.superAdminPriority !== null;
      return issue.status === filter;
    })
    .filter((issue) => {
      if (!search) return true;
      return (
        issue.id.toLowerCase().includes(search.toLowerCase()) ||
        issue.type.toLowerCase().includes(search.toLowerCase()) ||
        issue.location.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Prioritized issues first
      if (a.superAdminPriority && !b.superAdminPriority) return -1;
      if (!a.superAdminPriority && b.superAdminPriority) return 1;
      // Then by date
      return sortOrder === "newest"
        ? new Date(b.reportedOn) - new Date(a.reportedOn)
        : new Date(a.reportedOn) - new Date(b.reportedOn);
    });

  const handleStatusUpdate = (id, newStatus) => {
    setIssues(issues.map((issue) =>
      issue.id === id ? { ...issue, status: newStatus } : issue
    ));
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, label: t.pending },
      inProgress: { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle, label: t.inProgress },
      resolved: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, label: t.resolved },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle, label: t.rejected },
    };
    return config[status] || config.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-blue-500",
    };
    return colors[priority] || "bg-gray-500";
  };

  const filterTabs = [
    { id: "all", label: t.all, count: issues.length },
    { id: "prioritized", label: t.prioritized, count: issues.filter(i => i.superAdminPriority).length, highlight: true },
    { id: "pending", label: t.pending, count: issues.filter(i => i.status === "pending").length },
    { id: "inProgress", label: t.inProgress, count: issues.filter(i => i.status === "inProgress").length },
    { id: "resolved", label: t.resolved, count: issues.filter(i => i.status === "resolved").length },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle} • Ward {wardNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 w-48"
              />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
            >
              <option value="newest">{t.newest}</option>
              <option value="oldest">{t.oldest}</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1.5 ${
                filter === tab.id
                  ? tab.highlight
                    ? "bg-orange-600 text-white"
                    : "bg-indigo-600 text-white"
                  : tab.highlight
                  ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.highlight && <Flag size={12} />}
              {tab.label}
              <span className={`px-1.5 py-0.5 text-xs rounded ${
                filter === tab.id ? "bg-white/20" : "bg-gray-200"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">
            {t.noIssues}
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const status = getStatusConfig(issue.status);
            const StatusIcon = status.icon;
            const isExpanded = expandedId === issue.id;

            return (
              <div
                key={issue.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                  issue.superAdminPriority ? "ring-2 ring-orange-400" : ""
                }`}
              >
                {/* Priority Banner */}
                {issue.superAdminPriority && (
                  <div className={`${getPriorityColor(issue.superAdminPriority)} text-white px-4 py-1.5 text-sm flex items-center gap-2`}>
                    <Flag size={14} />
                    <span className="font-medium capitalize">{issue.superAdminPriority} Priority</span>
                    <span className="text-white/70">from Municipality</span>
                  </div>
                )}

                {/* Issue Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-mono">{issue.id}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${status.bg} ${status.text}`}>
                          <StatusIcon size={12} />
                          {status.label}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-800">
                        {language === "en" ? issue.type : issue.typeNp}
                      </h3>
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
                    <p className="text-sm text-gray-600 mb-3">
                      {language === "en" ? issue.description : issue.descriptionNp}
                    </p>
                    
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
                    <div className="flex flex-wrap gap-2">
                      {issue.status === "pending" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(issue.id, "inProgress");
                          }}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-1"
                        >
                          <AlertCircle size={14} />
                          {t.markInProgress}
                        </button>
                      )}
                      {issue.status === "inProgress" && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(issue.id, "resolved");
                            }}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            {t.markResolved}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(issue.id, "rejected");
                            }}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center gap-1"
                          >
                            <XCircle size={14} />
                            {t.markRejected}
                          </button>
                        </>
                      )}
                      {(issue.status === "resolved" || issue.status === "rejected") && (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg flex items-center gap-1">
                          <CheckCircle size={14} />
                          {t.completed}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WardAdminIssues;
