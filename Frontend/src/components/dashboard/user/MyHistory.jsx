/**
 * MyHistory Component
 * 
 * Combined view of user's issue reports and campaign requests.
 * Shows both types of requests with filtering and status tracking.
 * 
 * @component
 */

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { useIssues, useCampaigns } from "../../../hooks/useData";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  Loader,
  Megaphone,
  FileText,
  Users,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const historyText = {
  en: {
    title: "My History",
    subtitle: "Track all your reports and campaign requests",
    allItems: "All Items",
    issues: "Issue Reports",
    campaigns: "Campaign Requests",
    searchPlaceholder: "Search...",
    newest: "Newest First",
    oldest: "Oldest First",
    noItems: "No history found",
    noItemsDesc: "Your reports and campaign requests will appear here.",
    status: "Status",
    reportedOn: "Reported On",
    submittedOn: "Submitted On",
    lastUpdated: "Last Updated",
    location: "Location",
    priority: "Priority",
    adminResponse: "Admin Response",
    description: "Description",
    requirements: "Requirements",
    rejectionReason: "Rejection Reason",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    ward: "Ward",
    loading: "Loading history...",
    error: "Failed to load history",
    retry: "Retry",
    viewDetails: "View Details",
    pending: "Pending",
    inProgress: "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
    approved: "Approved",
    completed: "Completed",
    proposedDate: "Proposed Date",
    estimatedParticipants: "Estimated Participants",
  },
  np: {
    title: "मेरो इतिहास",
    subtitle: "तपाईंका सबै रिपोर्टहरू र अभियान अनुरोधहरू ट्र्याक गर्नुहोस्",
    allItems: "सबै वस्तुहरू",
    issues: "समस्या रिपोर्टहरू",
    campaigns: "अभियान अनुरोधहरू",
    searchPlaceholder: "खोज्नुहोस्...",
    newest: "नयाँ पहिले",
    oldest: "पुरानो पहिले",
    noItems: "कुनै इतिहास फेला परेन",
    noItemsDesc: "तपाईंका रिपोर्टहरू र अभियान अनुरोधहरू यहाँ देखिनेछ।",
    status: "स्थिति",
    reportedOn: "रिपोर्ट गरिएको",
    submittedOn: "पेश गरिएको",
    lastUpdated: "अन्तिम अपडेट",
    location: "स्थान",
    priority: "प्राथमिकता",
    adminResponse: "प्रशासकको प्रतिक्रिया",
    description: "विवरण",
    requirements: "आवश्यकताहरू",
    rejectionReason: "अस्वीकृतिको कारण",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    urgent: "तत्काल",
    ward: "वडा",
    loading: "इतिहास लोड हुँदैछ...",
    error: "इतिहास लोड गर्न असफल",
    retry: "पुन: प्रयास",
    viewDetails: "विवरण हेर्नुहोस्",
    pending: "पेन्डिङ",
    inProgress: "प्रगतिमा",
    resolved: "समाधान भएको",
    rejected: "अस्वीकृत",
    approved: "स्वीकृत",
    completed: "पूरा भएको",
    proposedDate: "प्रस्तावित मिति",
    estimatedParticipants: "अनुमानित सहभागीहरू",
  },
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

function HistoryCard({ item, type, language }) {
  const [expanded, setExpanded] = useState(false);
  const t = historyText[language];

  const isIssue = type === 'issue';
  const isCampaign = type === 'campaign';

  // Status styling
  const statusConfig = {
    pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
    in_progress: { icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
    resolved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    completed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
  };

  const status = item.status?.toLowerCase() || 'pending';
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const statusLabels = {
    pending: t.pending,
    in_progress: t.inProgress,
    resolved: t.resolved,
    rejected: t.rejected,
    approved: t.approved,
    completed: t.completed,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isIssue ? (
                <FileText className="text-indigo-600" size={18} />
              ) : (
                <Megaphone className="text-purple-600" size={18} />
              )}
              <span className="text-xs font-medium text-gray-500 uppercase">
                {isIssue ? t.issues.slice(0, -1) : t.campaigns.slice(0, -1)}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900">
              {isIssue ? item.category : item.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.bg} ${config.color}`}>
            <StatusIcon size={12} />
            {statusLabels[status] || status}
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
          {item.location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {item.location}
            </div>
          )}
          {(item.ward_number || item.target_ward) && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {t.ward} {item.ward_number || item.target_ward}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(item.created_at)}
          </div>
          {isIssue && item.priority && (
            <div className={`flex items-center gap-1 font-medium ${
              item.priority === 'urgent' || item.priority === 'URGENT' ? 'text-red-600' :
              item.priority === 'high' || item.priority === 'HIGH' ? 'text-orange-600' :
              item.priority === 'medium' || item.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-gray-600'
            }`}>
              {t[item.priority?.toLowerCase()] || item.priority}
            </div>
          )}
          {isCampaign && item.estimated_participants && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              {item.estimated_participants}
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50 flex items-center justify-center gap-1"
        >
          {t.viewDetails}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">{t.description}</p>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>

            {isCampaign && item.requirements && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">{t.requirements}</p>
                <p className="text-sm text-gray-700">{item.requirements}</p>
              </div>
            )}

            {isCampaign && item.proposed_date && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">{t.proposedDate}</p>
                <p className="text-sm text-gray-700">{formatDate(item.proposed_date)}</p>
              </div>
            )}

            {item.admin_response && (
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-xs text-indigo-600 uppercase mb-1">{t.adminResponse}</p>
                <p className="text-sm text-indigo-800">{item.admin_response}</p>
              </div>
            )}

            {item.rejection_reason && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600 uppercase mb-1">{t.rejectionReason}</p>
                <p className="text-sm text-red-800">{item.rejection_reason}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MyHistory() {
  const { language } = useLanguage();
  const { currentUser } = useAuth();
  const t = historyText[language];

  // State
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  // Fetch data - filter by current user
  const { issues, loading: issuesLoading, error: issuesError, refetch: refetchIssues } = useIssues({ user_id: currentUser?.id });
  const { campaigns, loading: campaignsLoading, error: campaignsError, refetch: refetchCampaigns } = useCampaigns({ user_id: currentUser?.id });

  const loading = issuesLoading || campaignsLoading;
  const error = issuesError || campaignsError;

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (currentUser?.id) {
      refetchIssues();
      refetchCampaigns();
    }
  }, [currentUser?.id, refetchIssues, refetchCampaigns]);

  // Combine and filter items
  const allItems = useMemo(() => {
    let items = [];

    if (filter === "all" || filter === "issues") {
      items = [...items, ...issues.map(issue => ({ ...issue, type: 'issue' }))];
    }

    if (filter === "all" || filter === "campaigns") {
      items = [...items, ...campaigns.map(campaign => ({ ...campaign, type: 'campaign' }))];
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        (item.category?.toLowerCase().includes(query)) ||
        (item.title?.toLowerCase().includes(query)) ||
        (item.description?.toLowerCase().includes(query)) ||
        (item.location?.toLowerCase().includes(query))
      );
    }

    // Sort
    items.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return items;
  }, [issues, campaigns, filter, searchQuery, sortOrder]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-indigo-600" size={40} />
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-gray-900 font-semibold mb-2">{t.error}</p>
          <button
            onClick={() => {
              refetchIssues();
              refetchCampaigns();
            }}
            className="text-indigo-600 hover:text-indigo-700"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <p className="text-gray-600 mt-1">{t.subtitle}</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.allItems}
            </button>
            <button
              onClick={() => setFilter("issues")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "issues"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.issues}
            </button>
            <button
              onClick={() => setFilter("campaigns")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "campaigns"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t.campaigns}
            </button>
          </div>

          {/* Sort */}
          <div className="flex gap-2 ml-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">{t.newest}</option>
              <option value="oldest">{t.oldest}</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Items List */}
      {allItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noItems}</h3>
          <p className="text-gray-600">{t.noItemsDesc}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {allItems.map((item) => (
            <HistoryCard key={`${item.type}-${item.id}`} item={item} type={item.type} language={language} />
          ))}
        </div>
      )}
    </div>
  );
}
