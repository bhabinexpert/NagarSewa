/**
 * RequestCampaign Component
 * 
 * Form for users to request community campaigns.
 * Requires KYC verification before allowing submissions.
 * 
 * @component
 * 
 * BACKEND INTEGRATION:
 * - POST /api/campaigns - Create new campaign request
 *   - Request: { title, description, category, targetWard, proposedDate, proposedLocation, ... }
 *   - Response: { success: true, data: { id, ... } }
 */

import React, { useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import { useAuth } from "../../context/useAuth";
import { campaignsAPI } from "../../services/api";
import { useCampaigns } from "../../hooks/useData";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Megaphone,
  Send,
  CheckCircle,
  Loader,
  ShieldAlert,
  FileCheck,
  Calendar,
  MapPin,
  Users,
  Phone,
  FileText,
  Clock,
  XCircle,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const campaignText = {
  en: {
    title: "Request a Campaign",
    subtitle: "Propose community initiatives for your ward",
    kycRequired: "KYC Verification Required",
    kycMessage: "Please complete your KYC verification before requesting campaigns.",
    goToProfile: "Complete KYC Now",
    campaignTitle: "Campaign Title",
    titlePlaceholder: "Enter a descriptive title for your campaign",
    description: "Description",
    descPlaceholder: "Describe your campaign goals, activities, and expected outcomes...",
    category: "Category",
    selectCategory: "Select campaign category",
    targetWard: "Target Ward",
    selectWard: "Select ward",
    proposedDate: "Proposed Date",
    proposedLocation: "Proposed Location",
    locationPlaceholder: "Enter the location for the campaign",
    estimatedParticipants: "Estimated Participants",
    participantsPlaceholder: "Expected number of participants",
    requirements: "Requirements/Resources Needed",
    requirementsPlaceholder: "List any resources, permissions, or support needed...",
    contactPhone: "Contact Phone",
    phonePlaceholder: "Contact number for coordination",
    submit: "Submit Campaign Request",
    submitting: "Submitting...",
    success: "Campaign request submitted successfully!",
    successDesc: "Your campaign proposal will be reviewed by the ward administration.",
    required: "Required",
    fillAllFields: "Please fill all required fields",
    categories: [
      "Community Clean-up",
      "Health Awareness",
      "Education Program",
      "Environmental Conservation",
      "Cultural Event",
      "Sports & Recreation",
      "Infrastructure Development",
      "Social Welfare",
      "Skill Development",
      "Other"
    ],
    myCampaigns: "My Campaign Requests",
    noCampaigns: "No campaign requests yet",
    noCampaignsDesc: "Submit your first campaign proposal above.",
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
    viewDetails: "View Details",
    adminResponse: "Admin Response",
    rejectionReason: "Rejection Reason",
    loading: "Loading campaigns...",
    error: "Failed to load campaigns",
    retry: "Retry",
    refresh: "Refresh",
    ward: "Ward",
  },
  np: {
    title: "अभियान अनुरोध गर्नुहोस्",
    subtitle: "तपाईंको वडाको लागि सामुदायिक पहलहरू प्रस्ताव गर्नुहोस्",
    kycRequired: "KYC प्रमाणीकरण आवश्यक छ",
    kycMessage: "कृपया अभियान अनुरोध गर्नु अघि आफ्नो KYC प्रमाणीकरण पूरा गर्नुहोस्।",
    goToProfile: "अहिले KYC पूरा गर्नुहोस्",
    campaignTitle: "अभियानको शीर्षक",
    titlePlaceholder: "तपाईंको अभियानको लागि वर्णनात्मक शीर्षक प्रविष्ट गर्नुहोस्",
    description: "विवरण",
    descPlaceholder: "तपाईंको अभियानको लक्ष्य, गतिविधिहरू र अपेक्षित परिणामहरू वर्णन गर्नुहोस्...",
    category: "वर्ग",
    selectCategory: "अभियान वर्ग चयन गर्नुहोस्",
    targetWard: "लक्षित वडा",
    selectWard: "वडा चयन गर्नुहोस्",
    proposedDate: "प्रस्तावित मिति",
    proposedLocation: "प्रस्तावित स्थान",
    locationPlaceholder: "अभियानको लागि स्थान प्रविष्ट गर्नुहोस्",
    estimatedParticipants: "अनुमानित सहभागीहरू",
    participantsPlaceholder: "अपेक्षित सहभागी संख्या",
    requirements: "आवश्यकताहरू/स्रोतहरू",
    requirementsPlaceholder: "कुनै पनि स्रोत, अनुमति वा सहयोग सूचीबद्ध गर्नुहोस्...",
    contactPhone: "सम्पर्क फोन",
    phonePlaceholder: "समन्वयको लागि सम्पर्क नम्बर",
    submit: "अभियान अनुरोध पेश गर्नुहोस्",
    submitting: "पेश गर्दै...",
    success: "अभियान अनुरोध सफलतापूर्वक पेश गरियो!",
    successDesc: "तपाईंको अभियान प्रस्ताव वडा प्रशासनद्वारा समीक्षा गरिनेछ।",
    required: "आवश्यक",
    fillAllFields: "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्",
    categories: [
      "सामुदायिक सरसफाई",
      "स्वास्थ्य जागरण",
      "शिक्षा कार्यक्रम",
      "वातावरण संरक्षण",
      "सांस्कृतिक कार्यक्रम",
      "खेलकुद र मनोरञ्जन",
      "पूर्वाधार विकास",
      "सामाजिक कल्याण",
      "सीप विकास",
      "अन्य"
    ],
    myCampaigns: "मेरो अभियान अनुरोधहरू",
    noCampaigns: "अहिलेसम्म कुनै अभियान अनुरोध छैन",
    noCampaignsDesc: "माथि आफ्नो पहिलो अभियान प्रस्ताव पेश गर्नुहोस्।",
    pending: "समीक्षामा",
    approved: "स्वीकृत",
    rejected: "अस्वीकृत",
    completed: "सम्पन्न",
    viewDetails: "विवरण हेर्नुहोस्",
    adminResponse: "प्रशासक प्रतिक्रिया",
    rejectionReason: "अस्वीकृतिको कारण",
    loading: "अभियानहरू लोड हुँदैछ...",
    error: "अभियानहरू लोड गर्न असफल",
    retry: "पुन: प्रयास",
    refresh: "रिफ्रेश",
    ward: "वडा",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status styling for campaign status badge
 */
function getStatusStyle(status) {
  const styles = {
    PENDING: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
    APPROVED: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
    REJECTED: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    COMPLETED: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
  };
  return styles[status] || styles.PENDING;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

// ============================================================================
// CAMPAIGN CARD SUB-COMPONENT
// ============================================================================

function CampaignCard({ campaign, t }) {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = getStatusStyle(campaign.status);
  const StatusIcon = statusStyle.icon;
  
  const statusLabels = {
    PENDING: t.pending,
    APPROVED: t.approved,
    REJECTED: t.rejected,
    COMPLETED: t.completed,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{campaign.title}</h4>
            <p className="text-sm text-gray-500 mt-1">
              {campaign.category} • {t.ward} {campaign.target_ward}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}>
            <StatusIcon size={12} />
            {statusLabels[campaign.status]}
          </div>
        </div>
        
        {/* Campaign Info */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
          {campaign.proposed_date && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(campaign.proposed_date)}
            </div>
          )}
          {campaign.proposed_location && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {campaign.proposed_location}
            </div>
          )}
          {campaign.estimated_participants && (
            <div className="flex items-center gap-1">
              <Users size={14} />
              {campaign.estimated_participants} participants
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
          <div className="px-4 pb-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">{t.description}</p>
              <p className="text-sm text-gray-700">{campaign.description}</p>
            </div>
            
            {campaign.requirements && (
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">{t.requirements}</p>
                <p className="text-sm text-gray-700">{campaign.requirements}</p>
              </div>
            )}
            
            {campaign.admin_response && (
              <div className="bg-indigo-50 rounded-lg p-3">
                <p className="text-xs text-indigo-600 uppercase mb-1">{t.adminResponse}</p>
                <p className="text-sm text-indigo-800">{campaign.admin_response}</p>
              </div>
            )}
            
            {campaign.rejection_reason && (
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs text-red-600 uppercase mb-1">{t.rejectionReason}</p>
                <p className="text-sm text-red-800">{campaign.rejection_reason}</p>
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

export default function RequestCampaign() {
  // Hooks
  const { language } = useLanguage();
  const { currentUser, getUserWard, DAMAK_TOTAL_WARDS } = useAuth();
  const t = campaignText[language];
  
  // Load user's campaigns
  const { campaigns, loading: campaignsLoading, error: campaignsError, refetch } = useCampaigns();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    targetWard: getUserWard() || "",
    proposedDate: "",
    proposedLocation: "",
    estimatedParticipants: "",
    requirements: "",
    contactPhone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check KYC status
  const isKycVerified = currentUser?.kycStatus === "VERIFIED";

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.category || !formData.targetWard) {
      toast.error(t.fillAllFields);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await campaignsAPI.create(formData);
      
      setSubmitSuccess(true);
      toast.success(t.success);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        targetWard: getUserWard() || "",
        proposedDate: "",
        proposedLocation: "",
        estimatedParticipants: "",
        requirements: "",
        contactPhone: "",
      });
      
      // Refresh campaigns list
      refetch();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
      
    } catch (error) {
      toast.error(error.message || "Failed to submit campaign request");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ============================================================================
  // RENDER: KYC NOT VERIFIED
  // ============================================================================

  if (!isKycVerified) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="text-yellow-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t.kycRequired}</h2>
          <p className="text-gray-600 mb-6">{t.kycMessage}</p>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-flex items-center gap-2">
            <FileCheck size={18} />
            {t.goToProfile}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN FORM
  // ============================================================================

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Megaphone size={28} />
          <h1 className="text-2xl font-bold">{t.title}</h1>
        </div>
        <p className="opacity-90">{t.subtitle}</p>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-medium text-green-800">{t.success}</h3>
            <p className="text-sm text-green-700 mt-1">{t.successDesc}</p>
          </div>
        </div>
      )}

      {/* Campaign Request Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.campaignTitle} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={t.titlePlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Category and Target Ward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.category} <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              >
                <option value="">{t.selectCategory}</option>
                {t.categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.targetWard} <span className="text-red-500">*</span>
              </label>
              <select
                name="targetWard"
                value={formData.targetWard}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              >
                <option value="">{t.selectWard}</option>
                {Array.from({ length: DAMAK_TOTAL_WARDS }, (_, i) => i + 1).map(ward => (
                  <option key={ward} value={ward}>{t.ward} {ward}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.description} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t.descPlaceholder}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              required
            />
          </div>

          {/* Proposed Date and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.proposedDate}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="date"
                  name="proposedDate"
                  value={formData.proposedDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.proposedLocation}
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="proposedLocation"
                  value={formData.proposedLocation}
                  onChange={handleInputChange}
                  placeholder={t.locationPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Participants and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.estimatedParticipants}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="number"
                  name="estimatedParticipants"
                  value={formData.estimatedParticipants}
                  onChange={handleInputChange}
                  placeholder={t.participantsPlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.contactPhone}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  placeholder={t.phonePlaceholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.requirements}
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              placeholder={t.requirementsPlaceholder}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="animate-spin" size={20} />
                {t.submitting}
              </>
            ) : (
              <>
                <Send size={20} />
                {t.submit}
              </>
            )}
          </button>
        </form>
      </div>

      {/* My Campaign Requests */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">{t.myCampaigns}</h2>
          <button
            onClick={refetch}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={t.refresh}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Loading State */}
        {campaignsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-indigo-600" size={32} />
            <span className="ml-2 text-gray-600">{t.loading}</span>
          </div>
        )}

        {/* Error State */}
        {campaignsError && (
          <div className="text-center py-12">
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
        {!campaignsLoading && !campaignsError && campaigns.length === 0 && (
          <div className="text-center py-12">
            <Megaphone className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">{t.noCampaigns}</p>
            <p className="text-gray-400 text-sm mt-1">{t.noCampaignsDesc}</p>
          </div>
        )}

        {/* Campaigns List */}
        {!campaignsLoading && !campaignsError && campaigns.length > 0 && (
          <div className="space-y-4">
            {campaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
