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

// Mock issues from all wards
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

const SuperAdminIssues = () => {
  const { language } = useLanguage();
  const t = text[language];

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

  // Filter and sort
  const filteredIssues = issues
    .filter((issue) => {
      if (wardFilter !== "all" && issue.wardNumber.toString() !== wardFilter) return false;
      if (filter === "all") return true;
      return issue.status === filter;
    })
    .filter((issue) => {
      if (!search) return true;
      return (
        issue.id.toLowerCase().includes(search.toLowerCase()) ||
        issue.type.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      return sortOrder === "newest"
        ? new Date(b.reportedOn) - new Date(a.reportedOn)
        : new Date(a.reportedOn) - new Date(b.reportedOn);
    });

  const openPriorityModal = (issue) => {
    setSelectedIssue(issue);
    setSelectedPriority(issue.superAdminPriority || "");
    setPriorityNote(issue.priorityNote || "");
    setShowModal(true);
  };

  const savePriority = () => {
    if (!selectedPriority) return;
    setIssues(issues.map((issue) =>
      issue.id === selectedIssue.id
        ? { ...issue, superAdminPriority: selectedPriority, priorityNote }
        : issue
    ));
    setShowModal(false);
    setSelectedIssue(null);
    setSelectedPriority("");
    setPriorityNote("");
  };

  const getStatusConfig = (status) => {
    const config = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      inProgress: { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle },
      resolved: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    return config[status] || config.pending;
  };

  const priorityOptions = [
    { value: "low", label: t.low, color: "bg-blue-500" },
    { value: "medium", label: t.medium, color: "bg-yellow-500" },
    { value: "high", label: t.high, color: "bg-orange-500" },
    { value: "urgent", label: t.urgent, color: "bg-red-500" },
  ];

  const filterTabs = [
    { id: "all", label: t.all },
    { id: "pending", label: t.pending },
    { id: "inProgress", label: t.inProgress },
    { id: "resolved", label: t.resolved },
  ];

  // Stats
  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === "pending").length,
    prioritized: issues.filter(i => i.superAdminPriority).length,
  };

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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
          >
            <option value="all">{t.allWards}</option>
            {Array.from({ length: DAMAK_TOTAL_WARDS }, (_, i) => (
              <option key={i + 1} value={i + 1}>{t.ward} {i + 1}</option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
          </select>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                filter === tab.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
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
                  issue.superAdminPriority ? "ring-2 ring-purple-400" : ""
                }`}
              >
                {/* Issue Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400 font-mono">{issue.id}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          {t.ward} {issue.wardNumber}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${status.bg} ${status.text}`}>
                          <StatusIcon size={12} />
                          {t[issue.status] || issue.status}
                        </span>
                        {issue.superAdminPriority && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium text-white capitalize ${
                            priorityOptions.find(p => p.value === issue.superAdminPriority)?.color
                          }`}>
                            {issue.superAdminPriority}
                          </span>
                        )}
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
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPriorityModal(issue);
                        }}
                        className={`px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 ${
                          issue.superAdminPriority
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                            : "bg-orange-600 text-white hover:bg-orange-700"
                        }`}
                      >
                        <Flag size={14} />
                        {issue.superAdminPriority ? t.updatePriority : t.setPriority}
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
          })
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
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              {selectedIssue.id} - {language === "en" ? selectedIssue.type : selectedIssue.typeNp}
            </p>

            {/* Priority Options */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedPriority(opt.value)}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition ${
                    selectedPriority === opt.value
                      ? `${opt.color} text-white border-transparent`
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Note */}
            <textarea
              value={priorityNote}
              onChange={(e) => setPriorityNote(e.target.value)}
              placeholder={t.priorityNotePlaceholder}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 mb-4"
            />

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
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
};

export default SuperAdminIssues;
