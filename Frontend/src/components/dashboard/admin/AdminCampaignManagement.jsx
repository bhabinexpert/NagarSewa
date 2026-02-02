/**
 * AdminCampaignManagement Component
 *
 * Admin interface for managing community campaign requests.
 * Ward admins can approve/reject campaigns for their ward.
 * Super admins can manage all campaigns.
 */

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../../contexts/auth/authConstants";
import { useCampaigns } from "../../../hooks/useData";
import { campaignsAPI } from "../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Users,
  Phone,
  ChevronDown,
  ChevronUp,
  X,
  Loader,
  Megaphone,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Trash2,
  FileText,
} from "lucide-react";


// TRANSLATIONS


const campaignManagementText = {
  en: {
    title: "Campaign Management",
    subtitle: "Review and manage community campaign requests",
    subtitleWardAdmin: "Manage campaign requests from your ward",
    all: "All",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
    searchPlaceholder: "Search by title, category, or requester...",
    filterBy: "Filter by",
    sortBy: "Sort by",
    newest: "Newest First",
    oldest: "Oldest First",
    approve: "Approve",
    reject: "Reject",
    markCompleted: "Mark Completed",
    delete: "Delete",
    addResponse: "Add Response",
    responsePlaceholder: "Enter your response to the requester...",
    rejectionReasonPlaceholder: "Please provide a reason for rejection...",
    submit: "Submit",
    cancel: "Cancel",
    requestedBy: "Requested by",
    requestedOn: "Requested on",
    proposedDate: "Proposed Date",
    proposedLocation: "Location",
    estimatedParticipants: "Est. Participants",
    requirements: "Requirements",
    contactPhone: "Contact",
    description: "Description",
    category: "Category",
    targetWard: "Target Ward",
    adminResponse: "Admin Response",
    rejectionReason: "Rejection Reason",
    statusUpdated: "Campaign status updated successfully",
    campaignDeleted: "Campaign deleted successfully",
    ward: "Ward",
    allWards: "All Wards",
    yourWard: "Your Ward",
    loading: "Loading campaigns...",
    error: "Failed to load campaigns",
    retry: "Retry",
    refresh: "Refresh",
    noResults: "No campaigns found",
    noResultsDesc: "No campaign requests match your current filters.",
    confirmDelete: "Are you sure you want to delete this campaign?",
    viewDetails: "View Details",
    hideDetails: "Hide Details",
    totalCampaigns: "Total Campaigns",
    pendingReview: "Pending Review",
  },
  np: {
    title: "अभियान व्यवस्थापन",
    subtitle: "सामुदायिक अभियान अनुरोधहरू समीक्षा र व्यवस्थापन गर्नुहोस्",
    subtitleWardAdmin: "तपाईंको वडाबाट अभियान अनुरोधहरू व्यवस्थापन गर्नुहोस्",
    all: "सबै",
    pending: "समीक्षामा",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    completed: "सम्पन्न",
    searchPlaceholder: "शीर्षक, वर्ग वा अनुरोधकर्ताद्वारा खोज्नुहोस्...",
    filterBy: "फिल्टर",
    sortBy: "क्रमबद्ध",
    newest: "नयाँ पहिले",
    oldest: "पुरानो पहिले",
    approve: "स्वीकृत गर्नुहोस्",
    reject: "अस्वीकार गर्नुहोस्",
    markCompleted: "सम्पन्न चिन्ह लगाउनुहोस्",
    delete: "मेटाउनुहोस्",
    addResponse: "प्रतिक्रिया थप्नुहोस्",
    responsePlaceholder: "अनुरोधकर्तालाई तपाईंको प्रतिक्रिया प्रविष्ट गर्नुहोस्...",
    rejectionReasonPlaceholder: "कृपया अस्वीकृतिको कारण प्रदान गर्नुहोस्...",
    submit: "पेश गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    requestedBy: "अनुरोधकर्ता",
    requestedOn: "अनुरोध मिति",
    proposedDate: "प्रस्तावित मिति",
    proposedLocation: "स्थान",
    estimatedParticipants: "अनुमानित सहभागी",
    requirements: "आवश्यकताहरू",
    contactPhone: "सम्पर्क",
    description: "विवरण",
    category: "वर्ग",
    targetWard: "लक्षित वडा",
    adminResponse: "प्रशासक प्रतिक्रिया",
    rejectionReason: "अस्वीकृतिको कारण",
    statusUpdated: "अभियानको स्थिति सफलतापूर्वक अद्यावधिक गरियो",
    campaignDeleted: "अभियान सफलतापूर्वक मेटाइयो",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    yourWard: "तपाईंको वडा",
    loading: "अभियानहरू लोड हुँदैछ...",
    error: "अभियानहरू लोड गर्न असफल",
    retry: "पुन: प्रयास",
    refresh: "रिफ्रेश",
    noResults: "कुनै अभियान भेटिएन",
    noResultsDesc: "तपाईंको हालको फिल्टरहरूसँग कुनै अभियान अनुरोध मेल खाँदैन।",
    confirmDelete: "के तपाईं यो अभियान मेटाउन चाहनुहुन्छ?",
    viewDetails: "विवरण हेर्नुहोस्",
    hideDetails: "विवरण लुकाउनुहोस्",
    totalCampaigns: "कुल अभियानहरू",
    pendingReview: "समीक्षामा",
  },
};


// HELPER FUNCTIONS


function getStatusStyle(status) {
  const styles = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200" },
    APPROVED: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    REJECTED: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
    COMPLETED: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  };
  return styles[status] || styles.PENDING;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
}


// CAMPAIGN CARD SUB-COMPONENT


function CampaignCard({ campaign, t, onStatusUpdate, isUpdating }) {
  const [expanded, setExpanded] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'complete'
  const [adminResponse, setAdminResponse] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const statusStyle = getStatusStyle(campaign.status);
  const statusLabels = {
    PENDING: t.pending,
    APPROVED: t.approved,
    REJECTED: t.rejected,
    COMPLETED: t.completed,
  };

  function handleAction(type) {
    setActionType(type);
    setShowResponseModal(true);
    setAdminResponse("");
    setRejectionReason("");
  }

  async function handleSubmitAction() {
    let status;
    let admin_response = adminResponse || null;

    if (actionType === "approve") {
      status = "APPROVED";
    } else if (actionType === "reject") {
      if (!rejectionReason.trim()) {
        toast.error("Please provide a rejection reason");
        return;
      }
      status = "REJECTED";
      admin_response = rejectionReason; // Use rejection reason as response
    } else if (actionType === "complete") {
      status = "COMPLETED";
    }

    await onStatusUpdate(campaign.id, status, admin_response);
    setShowResponseModal(false);
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${statusStyle.border} overflow-hidden`}>
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                {statusLabels[campaign.status]}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {campaign.category}
              </span>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                {t.ward} {campaign.target_ward}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mt-2 text-lg">{campaign.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{campaign.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User size={14} className="text-gray-400" />
            <span>{campaign.requester_name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} className="text-gray-400" />
            <span>{formatDate(campaign.created_at)}</span>
          </div>
          {campaign.proposed_date && (
            <div className="flex items-center gap-1">
              <Clock size={14} className="text-gray-400" />
              <span>{t.proposedDate}: {formatDate(campaign.proposed_date)}</span>
            </div>
          )}
          {campaign.proposed_location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} className="text-gray-400" />
              <span>{campaign.proposed_location}</span>
            </div>
          )}
        </div>

        {/* Action Buttons for Pending Campaigns */}
        {campaign.status === "PENDING" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleAction("approve")}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <ThumbsUp size={16} />
              {t.approve}
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={isUpdating}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <ThumbsDown size={16} />
              {t.reject}
            </button>
          </div>
        )}

        {/* Action Buttons for Approved Campaigns */}
        {campaign.status === "APPROVED" && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleAction("complete")}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <CheckCircle size={16} />
              {t.markCompleted}
            </button>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
          {/* Full Description */}
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">{t.description}</p>
            <p className="text-sm text-gray-700">{campaign.description}</p>
          </div>

          {/* Campaign Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.estimated_participants && (
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-400" />
                <span className="text-sm">
                  <strong>{t.estimatedParticipants}:</strong> {campaign.estimated_participants}
                </span>
              </div>
            )}
            {campaign.contact_phone && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span className="text-sm">
                  <strong>{t.contactPhone}:</strong> {campaign.contact_phone}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span className="text-sm">
                <strong>{t.requestedBy}:</strong> {campaign.requester_name} ({campaign.requester_email})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-sm">
                <strong>{t.requestedOn}:</strong> {formatDateTime(campaign.created_at)}
              </span>
            </div>
          </div>

          {/* Requirements */}
          {campaign.requirements && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">{t.requirements}</p>
              <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                {campaign.requirements}
              </p>
            </div>
          )}

          {/* Admin Response */}
          {campaign.admin_response && (
            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
              <p className="text-xs text-indigo-600 uppercase font-medium mb-1">{t.adminResponse}</p>
              <p className="text-sm text-indigo-800">{campaign.admin_response}</p>
              {campaign.reviewed_by_name && (
                <p className="text-xs text-indigo-500 mt-2">- {campaign.reviewed_by_name}</p>
              )}
            </div>
          )}

          {/* Rejection Reason */}
          {campaign.rejection_reason && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <p className="text-xs text-red-600 uppercase font-medium mb-1">{t.rejectionReason}</p>
              <p className="text-sm text-red-800">{campaign.rejection_reason}</p>
            </div>
          )}
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {actionType === "approve" && t.approve}
                {actionType === "reject" && t.reject}
                {actionType === "complete" && t.markCompleted}
              </h3>
              <button
                onClick={() => setShowResponseModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rejection Reason (required for reject) */}
              {actionType === "reject" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.rejectionReason} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t.rejectionReasonPlaceholder}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
              )}

              {/* Admin Response (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.addResponse}
                </label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder={t.responsePlaceholder}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResponseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                  actionType === "reject" ? "bg-red-600 hover:bg-red-700" :
                  actionType === "approve" ? "bg-green-600 hover:bg-green-700" :
                  "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isUpdating ? <Loader className="animate-spin mx-auto" size={20} /> : t.submit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// MAIN COMPONENT


export default function AdminCampaignManagement({ wardFilter, isSuperAdmin }) {
  const { language } = useLanguage();
  const { DAMAK_TOTAL_WARDS } = useAuth();
  const t = campaignManagementText[language];

  // State
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWard, setSelectedWard] = useState(wardFilter || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isUpdating, setIsUpdating] = useState(false);

  // Build query params
  const queryParams = useMemo(() => {
    const params = { sort: sortOrder };
    if (statusFilter !== "all") params.status = statusFilter;
    if (selectedWard !== "all" && isSuperAdmin) params.ward = selectedWard;
    if (searchQuery) params.search = searchQuery;
    return params;
  }, [statusFilter, selectedWard, searchQuery, sortOrder, isSuperAdmin]);

  // Fetch campaigns
  const { campaigns, total, loading, error, refetch } = useCampaigns(queryParams);

  // Fetch campaigns when component mounts or filters change
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Handlers
  async function handleStatusUpdate(id, status, admin_response) {
    setIsUpdating(true);
    try {
      await campaignsAPI.updateStatus(id, status, admin_response);
      toast.success(t.statusUpdated);
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update campaign status");
    } finally {
      setIsUpdating(false);
    }
  }

  // Stats
  const pendingCount = campaigns.filter(c => c.status === "PENDING").length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone size={28} />
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
        <p className="opacity-90">{isSuperAdmin ? t.subtitle : t.subtitleWardAdmin}</p>
        
        {/* Quick Stats */}
        <div className="flex gap-6 mt-4">
          <div>
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-sm opacity-80">{t.totalCampaigns}</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{pendingCount}</p>
            <p className="text-sm opacity-80">{t.pendingReview}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {["all", "pending", "approved", "rejected", "completed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? t.all : t[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Ward Filter (Super Admin only) */}
        {isSuperAdmin && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{t.allWards}</option>
                {Array.from({ length: DAMAK_TOTAL_WARDS }, (_, i) => i + 1).map((ward) => (
                  <option key={ward} value={ward}>
                    {t.ward} {ward}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">{t.newest}</option>
                <option value="oldest">{t.oldest}</option>
              </select>
            </div>

            <button
              onClick={refetch}
              className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <RefreshCw size={16} />
              {t.refresh}
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-indigo-600" size={32} />
          <span className="ml-2 text-gray-600">{t.loading}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <XCircle className="mx-auto text-red-400 mb-4" size={48} />
          <p className="text-red-600 mb-4">{t.error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && campaigns.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-medium">{t.noResults}</p>
          <p className="text-gray-400 text-sm mt-1">{t.noResultsDesc}</p>
        </div>
      )}

      {/* Campaigns List */}
      {!loading && !error && campaigns.length > 0 && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              t={t}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={isUpdating}
            />
          ))}
        </div>
      )}
    </div>
  );
}
