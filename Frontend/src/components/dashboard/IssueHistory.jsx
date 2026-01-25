import React, { useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import { useAuth } from "../../context/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../context/authConstants";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Image,
  FileText,
  Building,
} from "lucide-react";

const historyText = {
  en: {
    title: "Issue History",
    subtitle: "Track all reported issues and their status",
    myIssues: "My Issues",
    allIssues: "All Issues",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    searchPlaceholder: "Search issues...",
    filterBy: "Filter by",
    sortBy: "Sort by",
    newest: "Newest First",
    oldest: "Oldest First",
    noIssues: "No issues found",
    viewDetails: "View Details",
    status: "Status",
    reportedOn: "Reported On",
    lastUpdated: "Last Updated",
    location: "Location",
    priority: "Priority",
    adminResponse: "Admin Response",
    attachments: "Attachments",
    issueId: "Issue ID",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    ward: "Ward",
    allWards: "All Wards",
    yourWard: "Your Ward",
  },
  np: {
    title: "समस्या इतिहास",
    subtitle: "सबै रिपोर्ट गरिएका समस्याहरू र तिनीहरूको स्थिति ट्र्याक गर्नुहोस्",
    myIssues: "मेरो समस्याहरू",
    allIssues: "सबै समस्याहरू",
    pending: "पेन्डिङ",
    inProgress: "प्रगतिमा",
    resolved: "समाधान भएको",
    rejected: "अस्वीकृत",
    searchPlaceholder: "समस्याहरू खोज्नुहोस्...",
    filterBy: "फिल्टर गर्नुहोस्",
    sortBy: "क्रमबद्ध गर्नुहोस्",
    newest: "नयाँ पहिले",
    oldest: "पुरानो पहिले",
    noIssues: "कुनै समस्या भेटिएन",
    viewDetails: "विवरण हेर्नुहोस्",
    status: "स्थिति",
    reportedOn: "रिपोर्ट गरिएको मिति",
    lastUpdated: "अन्तिम अद्यावधिक",
    location: "स्थान",
    priority: "प्राथमिकता",
    adminResponse: "प्रशासक प्रतिक्रिया",
    attachments: "संलग्नकहरू",
    issueId: "समस्या ID",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    urgent: "अत्यावश्यक",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    yourWard: "तपाईंको वडा",
  },
};

// Mock data for issues with ward numbers
const mockIssues = [
  {
    id: "ISS-2024-001",
    type: "Road Damage",
    typeNp: "सडक क्षति",
    wardNumber: 5,
    description: "Large pothole causing accidents near the main market area. Multiple vehicles have been damaged.",
    descriptionNp: "मुख्य बजार क्षेत्र नजिक ठूलो खाल्डोले दुर्घटना गराउँदै। धेरै गाडीहरू क्षतिग्रस्त भएका छन्।",
    location: "Ward 5, Damak",
    priority: "high",
    status: "inProgress",
    reportedOn: "2024-01-15",
    lastUpdated: "2024-01-18",
    images: 2,
    adminResponse: "Team has been dispatched. Expected completion within 3 days.",
    adminResponseNp: "टोली पठाइएको छ। 3 दिन भित्र पूरा हुने अपेक्षा।",
  },
  {
    id: "ISS-2024-002",
    type: "Water Supply",
    typeNp: "पानी आपूर्ति",
    wardNumber: 4,
    description: "No water supply for the past 3 days in our area. Urgent attention needed.",
    descriptionNp: "हाम्रो क्षेत्रमा गत 3 दिनदेखि पानी आपूर्ति छैन। तत्काल ध्यान चाहिन्छ।",
    location: "Ward 4, Damak",
    priority: "urgent",
    status: "resolved",
    reportedOn: "2024-01-10",
    lastUpdated: "2024-01-12",
    images: 1,
    adminResponse: "Issue has been resolved. Pipeline repaired successfully.",
    adminResponseNp: "समस्या समाधान भएको छ। पाइपलाइन सफलतापूर्वक मर्मत गरियो।",
  },
  {
    id: "ISS-2024-003",
    type: "Street Light",
    typeNp: "सडक बत्ती",
    wardNumber: 3,
    description: "Street light not working for 2 weeks. Area is very dark at night.",
    descriptionNp: "सडक बत्ती २ हप्तादेखि काम गरिरहेको छैन। राति क्षेत्र धेरै अँध्यारो हुन्छ।",
    location: "Ward 3, Damak",
    priority: "medium",
    status: "pending",
    reportedOn: "2024-01-20",
    lastUpdated: "2024-01-20",
    images: 3,
    adminResponse: null,
  },
  {
    id: "ISS-2024-004",
    type: "Garbage/Sanitation",
    typeNp: "फोहोर/सरसफाई",
    wardNumber: 5,
    description: "Garbage not collected for a week. Causing health hazards.",
    descriptionNp: "एक हप्तादेखि फोहोर संकलन भएको छैन। स्वास्थ्य जोखिम उत्पन्न गर्दै।",
    location: "Ward 5, Damak",
    priority: "high",
    status: "rejected",
    reportedOn: "2024-01-05",
    lastUpdated: "2024-01-06",
    images: 2,
    adminResponse: "This area is under different municipality jurisdiction. Please contact concerned authority.",
    adminResponseNp: "यो क्षेत्र फरक नगरपालिका क्षेत्राधिकार अन्तर्गत छ। कृपया सम्बन्धित अधिकारीलाई सम्पर्क गर्नुहोस्।",
  },
  {
    id: "ISS-2024-005",
    type: "Drainage",
    typeNp: "ढल निकास",
    wardNumber: 7,
    description: "Blocked drainage causing water logging during rain. Health hazard.",
    descriptionNp: "अवरुद्ध ढल निकासले पानी जमाव गर्दै। स्वास्थ्य जोखिम।",
    location: "Ward 7, Damak",
    priority: "high",
    status: "pending",
    reportedOn: "2024-01-22",
    lastUpdated: "2024-01-22",
    images: 1,
    adminResponse: null,
  },
];

const IssueHistory = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = historyText[language];

  // Get user's ward - for regular users this filters content
  const userWard = user?.ward || 5; // Default to ward 5 for demo
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;
  const isWardAdmin = user?.role === ROLES.WARD_ADMIN;
  const isAdmin = isSuperAdmin || isWardAdmin;

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [wardFilter, setWardFilter] = useState(isSuperAdmin ? "all" : userWard.toString());

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: <Clock size={16} />,
          label: t.pending,
        };
      case "inProgress":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          icon: <AlertCircle size={16} />,
          label: t.inProgress,
        };
      case "resolved":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: <CheckCircle size={16} />,
          label: t.resolved,
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: <XCircle size={16} />,
          label: t.rejected,
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-700",
          icon: <Clock size={16} />,
          label: status,
        };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "low":
        return { color: "text-green-600", label: t.low };
      case "medium":
        return { color: "text-yellow-600", label: t.medium };
      case "high":
        return { color: "text-orange-600", label: t.high };
      case "urgent":
        return { color: "text-red-600", label: t.urgent };
      default:
        return { color: "text-gray-600", label: priority };
    }
  };

  const filteredIssues = mockIssues
    // First, filter by ward
    .filter((issue) => {
      // For super admin with "all" filter, show all
      if (isSuperAdmin && wardFilter === "all") return true;
      
      // For ward admin, only show their ward's issues
      if (isWardAdmin) {
        return issue.wardNumber === userWard;
      }
      
      // For regular users, only show their ward's issues
      if (!isAdmin) {
        return issue.wardNumber === userWard;
      }
      
      // For super admin with specific ward filter
      return issue.wardNumber.toString() === wardFilter;
    })
    .filter((issue) => {
      if (filter === "all") return true;
      return issue.status === filter;
    })
    .filter((issue) => {
      if (!searchQuery) return true;
      const type = language === "en" ? issue.type : issue.typeNp;
      const desc = language === "en" ? issue.description : issue.descriptionNp;
      return (
        type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.reportedOn) - new Date(a.reportedOn);
      }
      return new Date(a.reportedOn) - new Date(b.reportedOn);
    });

  // Calculate counts based on current ward filter
  const getWardFilteredIssues = () => {
    return mockIssues.filter((issue) => {
      if (isSuperAdmin && wardFilter === "all") return true;
      if (isWardAdmin) return issue.wardNumber === userWard;
      if (!isAdmin) return issue.wardNumber === userWard;
      return issue.wardNumber.toString() === wardFilter;
    });
  };

  const wardFilteredIssues = getWardFilteredIssues();

  const filterTabs = [
    { id: "all", label: t.allIssues, count: wardFilteredIssues.length },
    { id: "pending", label: t.pending, count: wardFilteredIssues.filter((i) => i.status === "pending").length },
    { id: "inProgress", label: t.inProgress, count: wardFilteredIssues.filter((i) => i.status === "inProgress").length },
    { id: "resolved", label: t.resolved, count: wardFilteredIssues.filter((i) => i.status === "resolved").length },
    { id: "rejected", label: t.rejected, count: wardFilteredIssues.filter((i) => i.status === "rejected").length },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
          {/* Ward Indicator */}
          {!isSuperAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <MapPin size={16} />
              <span className="font-medium">{t.yourWard}: {userWard}</span>
            </div>
          )}
          {/* Super Admin Ward Filter */}
          {isSuperAdmin && (
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
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
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  filter === tab.id ? "bg-white/20" : "bg-gray-200"
                }`}
              >
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">{t.noIssues}</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const statusStyle = getStatusStyle(issue.status);
            const priorityStyle = getPriorityStyle(issue.priority);
            const isExpanded = expandedIssue === issue.id;

            return (
              <div
                key={issue.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Issue Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => setExpandedIssue(isExpanded ? null : issue.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500 font-mono">{issue.id}</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.icon}
                          {statusStyle.label}
                        </span>
                        {/* Ward Badge */}
                        <span className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 bg-indigo-100 text-indigo-700">
                          <MapPin size={10} />
                          {t.ward} {issue.wardNumber}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {language === "en" ? issue.type : issue.typeNp}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                        {language === "en" ? issue.description : issue.descriptionNp}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {issue.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {issue.reportedOn}
                        </span>
                        <span className={`font-medium ${priorityStyle.color}`}>
                          {t.priority}: {priorityStyle.label}
                        </span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                      {isExpanded ? (
                        <ChevronUp className="text-gray-400" size={20} />
                      ) : (
                        <ChevronDown className="text-gray-400" size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{t.reportedOn}</p>
                        <p className="font-medium text-gray-800">{issue.reportedOn}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{t.lastUpdated}</p>
                        <p className="font-medium text-gray-800">{issue.lastUpdated}</p>
                      </div>
                    </div>

                    {/* Attachments */}
                    {issue.images > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">{t.attachments}</p>
                        <div className="flex items-center gap-2">
                          <Image className="text-gray-400" size={16} />
                          <span className="text-gray-600">
                            {issue.images} {language === "en" ? "image(s)" : "तस्बिर(हरू)"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Admin Response */}
                    {issue.adminResponse && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="text-emerald-600" size={16} />
                          <p className="text-sm font-medium text-gray-700">{t.adminResponse}</p>
                        </div>
                        <p className="text-gray-600">
                          {language === "en" ? issue.adminResponse : issue.adminResponseNp}
                        </p>
                      </div>
                    )}
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

export default IssueHistory;
