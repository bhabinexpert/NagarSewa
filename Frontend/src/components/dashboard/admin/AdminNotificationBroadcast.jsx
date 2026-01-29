/**
 * AdminNotificationBroadcast Component
 *
 * Admin interface for creating and managing broadcast notifications.
 * Supports targeting specific wards, scheduling broadcasts, and viewing history.
 *
 * @component
 *
 * BACKEND INTEGRATION:
 * - GET /api/broadcasts - List broadcast history
 *   Query params: page, limit, type, status
 *
 * - POST /api/broadcasts - Create new broadcast
 *   Body: { title, message, titleNp?, messageNp?, type, targetAudience, targetWard?, scheduledFor? }
 *
 * - DELETE /api/broadcasts/:id - Delete a broadcast
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../../contexts/auth/authConstants";
import { useBroadcasts } from "../../../hooks/useData";
import { broadcastsAPI } from "../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Send,
  Bell,
  Clock,
  Calendar,
  Users,
  MapPin,
  AlertTriangle,
  Info,
  CheckCircle,
  Megaphone,
  Trash2,
  X,
  Loader,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const broadcastText = {
  en: {
    title: "Notification Broadcast",
    subtitle: "Send announcements and updates to citizens",
    newBroadcast: "New Broadcast",
    broadcastHistory: "Broadcast History",
    titleLabel: "Title (English)",
    titleNpLabel: "Title (Nepali)",
    messageLabel: "Message (English)",
    messageNpLabel: "Message (Nepali)",
    titlePlaceholder: "Enter announcement title...",
    messagePlaceholder: "Enter your message to citizens...",
    type: "Notification Type",
    general: "General",
    urgent: "Urgent",
    event: "Event",
    maintenance: "Maintenance",
    targetAudience: "Target Audience",
    allCitizens: "All Citizens",
    specificWard: "Specific Ward",
    selectWard: "Select Ward",
    ward: "Ward",
    schedule: "Schedule",
    sendNow: "Send Immediately",
    scheduleLater: "Schedule for Later",
    scheduleDate: "Scheduled Date & Time",
    preview: "Preview",
    send: "Send Broadcast",
    sending: "Sending...",
    cancel: "Cancel",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this broadcast?",
    sentAt: "Sent at",
    scheduledFor: "Scheduled for",
    recipients: "Recipients",
    status: "Status",
    sent: "Sent",
    scheduled: "Scheduled",
    draft: "Draft",
    noHistory: "No broadcasts yet",
    broadcastSent: "Broadcast sent successfully",
    broadcastScheduled: "Broadcast scheduled successfully",
    broadcastDeleted: "Broadcast deleted successfully",
    error: "Something went wrong",
    loading: "Loading broadcasts...",
    allWards: "All Wards",
    yourWard: "Your Ward",
    wardAdmin: "Ward Admin",
    superAdmin: "Super Admin",
    typeGeneral: "General Announcement",
    typeUrgent: "Urgent Alert",
    typeEvent: "Event Notice",
    typeMaintenance: "Maintenance Notice",
  },
  np: {
    title: "सूचना प्रसारण",
    subtitle: "नागरिकहरूलाई घोषणा र अपडेटहरू पठाउनुहोस्",
    newBroadcast: "नयाँ प्रसारण",
    broadcastHistory: "प्रसारण इतिहास",
    titleLabel: "शीर्षक (अंग्रेजी)",
    titleNpLabel: "शीर्षक (नेपाली)",
    messageLabel: "सन्देश (अंग्रेजी)",
    messageNpLabel: "सन्देश (नेपाली)",
    titlePlaceholder: "घोषणा शीर्षक प्रविष्ट गर्नुहोस्...",
    messagePlaceholder: "नागरिकहरूलाई तपाईंको सन्देश प्रविष्ट गर्नुहोस्...",
    type: "सूचना प्रकार",
    general: "सामान्य",
    urgent: "अत्यावश्यक",
    event: "कार्यक्रम",
    maintenance: "मर्मत",
    targetAudience: "लक्षित दर्शक",
    allCitizens: "सबै नागरिकहरू",
    specificWard: "विशेष वडा",
    selectWard: "वडा चयन गर्नुहोस्",
    ward: "वडा",
    schedule: "तालिका",
    sendNow: "तुरुन्तै पठाउनुहोस्",
    scheduleLater: "पछि तालिका बनाउनुहोस्",
    scheduleDate: "तालिका मिति र समय",
    preview: "पूर्वावलोकन",
    send: "प्रसारण पठाउनुहोस्",
    sending: "पठाउँदैछ...",
    cancel: "रद्द गर्नुहोस्",
    delete: "मेटाउनुहोस्",
    confirmDelete: "के तपाईं यो प्रसारण मेटाउन निश्चित हुनुहुन्छ?",
    sentAt: "पठाइएको समय",
    scheduledFor: "तालिका गरिएको",
    recipients: "प्राप्तकर्ताहरू",
    status: "स्थिति",
    sent: "पठाइयो",
    scheduled: "तालिकाबद्ध",
    draft: "मस्यौदा",
    noHistory: "कुनै प्रसारण छैन",
    broadcastSent: "प्रसारण सफलतापूर्वक पठाइयो",
    broadcastScheduled: "प्रसारण सफलतापूर्वक तालिकाबद्ध गरियो",
    broadcastDeleted: "प्रसारण सफलतापूर्वक मेटाइयो",
    error: "केही गलत भयो",
    loading: "प्रसारणहरू लोड हुँदैछ...",
    allWards: "सबै वडाहरू",
    yourWard: "तपाईंको वडा",
    wardAdmin: "वडा प्रशासक",
    superAdmin: "सुपर प्रशासक",
    typeGeneral: "सामान्य घोषणा",
    typeUrgent: "अत्यावश्यक चेतावनी",
    typeEvent: "कार्यक्रम सूचना",
    typeMaintenance: "मर्मत सूचना",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get icon for broadcast type.
 * @param {string} type - The broadcast type
 * @returns {JSX.Element} Icon component
 */
function getTypeIcon(type) {
  if (type === "urgent") {
    return <AlertTriangle className="text-red-500" size={18} />;
  } else if (type === "event") {
    return <Calendar className="text-purple-500" size={18} />;
  } else if (type === "maintenance") {
    return <Info className="text-orange-500" size={18} />;
  } else {
    return <Megaphone className="text-blue-500" size={18} />;
  }
}

/**
 * Get color classes for broadcast type.
 * @param {string} type - The broadcast type
 * @returns {string} CSS classes
 */
function getTypeColor(type) {
  if (type === "urgent") {
    return "text-red-700 bg-red-100";
  } else if (type === "event") {
    return "text-purple-700 bg-purple-100";
  } else if (type === "maintenance") {
    return "text-orange-700 bg-orange-100";
  } else {
    return "text-blue-700 bg-blue-100";
  }
}

/**
 * Get status color classes.
 * @param {string} status - The broadcast status
 * @returns {string} CSS classes
 */
function getStatusColor(status) {
  if (status === "sent") {
    return "text-green-700 bg-green-100";
  } else if (status === "scheduled") {
    return "text-yellow-700 bg-yellow-100";
  } else {
    return "text-gray-700 bg-gray-100";
  }
}

/**
 * Format date for display.
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Broadcast form component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Form element
 */
function BroadcastForm(props) {
  const t = props.t;
  const isSuperAdmin = props.isSuperAdmin;
  const userWard = props.userWard;
  const onSubmit = props.onSubmit;
  const isSubmitting = props.isSubmitting;

  // Form state
  const [title, setTitle] = useState("");
  const [titleNp, setTitleNp] = useState("");
  const [message, setMessage] = useState("");
  const [messageNp, setMessageNp] = useState("");
  const [type, setType] = useState("general");
  const [targetAudience, setTargetAudience] = useState("all");
  const [targetWard, setTargetWard] = useState("");
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle title input change.
   * @param {Event} e - Input event
   */
  function handleTitleChange(e) {
    setTitle(e.target.value);
  }

  /**
   * Handle Nepali title input change.
   * @param {Event} e - Input event
   */
  function handleTitleNpChange(e) {
    setTitleNp(e.target.value);
  }

  /**
   * Handle message input change.
   * @param {Event} e - Input event
   */
  function handleMessageChange(e) {
    setMessage(e.target.value);
  }

  /**
   * Handle Nepali message input change.
   * @param {Event} e - Input event
   */
  function handleMessageNpChange(e) {
    setMessageNp(e.target.value);
  }

  /**
   * Handle type selection.
   * @param {string} selectedType - Selected type
   */
  function handleTypeSelect(selectedType) {
    setType(selectedType);
  }

  /**
   * Handle target audience change.
   * @param {Event} e - Select event
   */
  function handleAudienceChange(e) {
    setTargetAudience(e.target.value);
    if (e.target.value === "all") {
      setTargetWard("");
    }
  }

  /**
   * Handle target ward change.
   * @param {Event} e - Select event
   */
  function handleWardChange(e) {
    setTargetWard(e.target.value);
  }

  /**
   * Handle schedule type change.
   * @param {Event} e - Radio event
   */
  function handleScheduleTypeChange(e) {
    setScheduleType(e.target.value);
    if (e.target.value === "now") {
      setScheduledDate("");
    }
  }

  /**
   * Handle scheduled date change.
   * @param {Event} e - Input event
   */
  function handleScheduledDateChange(e) {
    setScheduledDate(e.target.value);
  }

  /**
   * Toggle preview display.
   */
  function handleTogglePreview() {
    setShowPreview(!showPreview);
  }

  /**
   * Handle form submission.
   * @param {Event} e - Form event
   */
  function handleSubmit(e) {
    e.preventDefault();

    // Build broadcast data
    const broadcastData = {
      title: title,
      message: message,
      type: type,
      targetAudience: targetAudience,
    };

    if (titleNp) {
      broadcastData.titleNp = titleNp;
    }
    if (messageNp) {
      broadcastData.messageNp = messageNp;
    }
    if (targetAudience === "ward" && targetWard) {
      broadcastData.targetWard = targetWard;
    }
    if (scheduleType === "later" && scheduledDate) {
      broadcastData.scheduledFor = scheduledDate;
    }

    // For ward admin, auto-set target ward
    if (!isSuperAdmin && userWard) {
      broadcastData.targetAudience = "ward";
      broadcastData.targetWard = userWard;
    }

    onSubmit(broadcastData);

    // Reset form
    setTitle("");
    setTitleNp("");
    setMessage("");
    setMessageNp("");
    setType("general");
    setTargetAudience("all");
    setTargetWard("");
    setScheduleType("now");
    setScheduledDate("");
    setShowPreview(false);
  }

  /**
   * Render type selection buttons.
   * @returns {Array} Array of button elements
   */
  function renderTypeButtons() {
    const types = ["general", "urgent", "event", "maintenance"];

    return types.map(function(typeValue) {
      let buttonClass =
        "flex items-center gap-2 px-4 py-2 rounded-lg border transition ";
      if (type === typeValue) {
        buttonClass = buttonClass + "border-emerald-500 bg-emerald-50";
      } else {
        buttonClass = buttonClass + "border-gray-200 hover:border-gray-300";
      }

      return (
        <button
          key={typeValue}
          type="button"
          onClick={function () {
            handleTypeSelect(typeValue);
          }}
          className={buttonClass}
        >
          {getTypeIcon(typeValue)}
          <span className="text-sm font-medium">{t[typeValue]}</span>
        </button>
      );
    });
  }

  /**
   * Render ward options.
   * @returns {Array} Array of option elements
   */
  function renderWardOptions() {
    return Array.from({ length: DAMAK_TOTAL_WARDS }, function(_, index) {
      const ward = index + 1;
      return (
        <option key={ward} value={ward}>
          {t.ward} {ward}
        </option>
      );
    });
  }

  // Render audience section (super admin only)
  let audienceSection = null;
  if (isSuperAdmin) {
    let wardSelectElement = null;
    if (targetAudience === "ward") {
      wardSelectElement = (
        <select
          value={targetWard}
          onChange={handleWardChange}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">{t.selectWard}</option>
          {renderWardOptions()}
        </select>
      );
    }

    audienceSection = (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t.targetAudience}
        </label>
        <div className="flex gap-4">
          <select
            value={targetAudience}
            onChange={handleAudienceChange}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t.allCitizens}</option>
            <option value="ward">{t.specificWard}</option>
          </select>
          {wardSelectElement}
        </div>
      </div>
    );
  }

  // Render preview section
  let previewSection = null;
  if (showPreview) {
    previewSection = (
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <div className="flex items-center gap-2 mb-3">
          {getTypeIcon(type)}
          <h4 className="font-medium text-gray-800">{title || "Untitled"}</h4>
        </div>
        <p className="text-gray-600 text-sm">{message || "No message"}</p>
        {titleNp && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="font-medium text-gray-800">{titleNp}</h4>
            <p className="text-gray-600 text-sm mt-1">{messageNp}</p>
          </div>
        )}
      </div>
    );
  }

  // Render schedule section
  let scheduleDateInput = null;
  if (scheduleType === "later") {
    scheduleDateInput = (
      <input
        type="datetime-local"
        value={scheduledDate}
        onChange={handleScheduledDateChange}
        className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
      />
    );
  }

  // Check if form is valid
  let isFormValid = false;
  if (title && message) {
    if (scheduleType === "later") {
      if (scheduledDate) {
        isFormValid = true;
      }
    } else {
      isFormValid = true;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.titleLabel} *
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder={t.titlePlaceholder}
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.titleNpLabel}
          </label>
          <input
            type="text"
            value={titleNp}
            onChange={handleTitleNpChange}
            placeholder={t.titlePlaceholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Message Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.messageLabel} *
          </label>
          <textarea
            value={message}
            onChange={handleMessageChange}
            placeholder={t.messagePlaceholder}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.messageNpLabel}
          </label>
          <textarea
            value={messageNp}
            onChange={handleMessageNpChange}
            placeholder={t.messagePlaceholder}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">{t.type}</label>
        <div className="flex flex-wrap gap-3">{renderTypeButtons()}</div>
      </div>

      {/* Target Audience (Super Admin only) */}
      {audienceSection}

      {/* Schedule */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">{t.schedule}</label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="schedule"
              value="now"
              checked={scheduleType === "now"}
              onChange={handleScheduleTypeChange}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm">{t.sendNow}</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="schedule"
              value="later"
              checked={scheduleType === "later"}
              onChange={handleScheduleTypeChange}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm">{t.scheduleLater}</span>
          </label>
          {scheduleDateInput}
        </div>
      </div>

      {/* Preview Toggle */}
      <button
        type="button"
        onClick={handleTogglePreview}
        className="flex items-center gap-2 text-emerald-600 hover:underline text-sm"
      >
        {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {t.preview}
      </button>

      {previewSection}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <Loader className="animate-spin" size={18} />
        ) : (
          <Send size={18} />
        )}
        {isSubmitting ? t.sending : t.send}
      </button>
    </form>
  );
}

/**
 * Broadcast history item component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} History item element
 */
function BroadcastHistoryItem(props) {
  const broadcast = props.broadcast;
  const t = props.t;
  const language = props.language;
  const onDelete = props.onDelete;
  const isDeleting = props.isDeleting;

  // Determine display title based on language
  let displayTitle;
  if (language === "np" && broadcast.titleNp) {
    displayTitle = broadcast.titleNp;
  } else {
    displayTitle = broadcast.title;
  }

  // Determine display message based on language
  let displayMessage;
  if (language === "np" && broadcast.messageNp) {
    displayMessage = broadcast.messageNp;
  } else {
    displayMessage = broadcast.message;
  }

  // Determine audience text
  let audienceText;
  if (broadcast.targetAudience === "all") {
    audienceText = t.allCitizens;
  } else if (broadcast.targetWard) {
    audienceText = t.ward + " " + broadcast.targetWard;
  } else {
    audienceText = t.allCitizens;
  }

  // Determine status text
  let statusText = t[broadcast.status];
  if (!statusText) {
    statusText = broadcast.status;
  }

  // Determine type label
  let typeLabel = t["type" + broadcast.type.charAt(0).toUpperCase() + broadcast.type.slice(1)];
  if (!typeLabel) {
    typeLabel = t[broadcast.type];
  }

  /**
   * Handle delete click.
   */
  function handleDelete() {
    if (window.confirm(t.confirmDelete)) {
      onDelete(broadcast.id);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {getTypeIcon(broadcast.type)}
          <div className="flex-1">
            <h4 className="font-medium text-gray-800">{displayTitle}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{displayMessage}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {audienceText}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {broadcast.status === "scheduled" ? t.scheduledFor : t.sentAt}:{" "}
                {formatDate(broadcast.scheduledFor || broadcast.sentAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={"px-2 py-1 rounded-full text-xs font-medium " + getTypeColor(broadcast.type)}>
            {typeLabel}
          </span>
          <span className={"px-2 py-1 rounded-full text-xs font-medium " + getStatusColor(broadcast.status)}>
            {statusText}
          </span>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
            title={t.delete}
          >
            {isDeleting ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * AdminNotificationBroadcast - Main broadcast management component.
 * @returns {JSX.Element} The rendered component
 */
function AdminNotificationBroadcast() {
  // ============================================================================
  // HOOKS AND CONTEXT
  // ============================================================================

  const languageContext = useLanguage();
  const language = languageContext.language;
  const t = broadcastText[language];

  const authContext = useAuth();
  const currentUser = authContext.currentUser;

  // Determine user role
  let isSuperAdmin = false;
  if (currentUser && currentUser.role === ROLES.SUPER_ADMIN) {
    isSuperAdmin = true;
  }

  let userWard = null;
  if (currentUser) {
    userWard = currentUser.wardNumber;
  }

  // ============================================================================
  // STATE
  // ============================================================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const broadcastsData = useBroadcasts();
  const broadcasts = broadcastsData.broadcasts;
  const loading = broadcastsData.loading;
  const error = broadcastsData.error;
  const refetch = broadcastsData.refetch;

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle broadcast form submission.
   * @param {Object} broadcastData - The broadcast data to send
   */
  async function handleSubmitBroadcast(broadcastData) {
    setIsSubmitting(true);

    try {
      // Backend: POST /api/broadcasts
      await broadcastsAPI.create(broadcastData);

      let successMessage;
      if (broadcastData.scheduledFor) {
        successMessage = t.broadcastScheduled;
      } else {
        successMessage = t.broadcastSent;
      }

      toast.success(successMessage, { position: "top-right", autoClose: 3000 });
      refetch();
    } catch (err) {
      let errorMessage = t.error;
      if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle broadcast deletion.
   * @param {string} broadcastId - ID of broadcast to delete
   */
  async function handleDeleteBroadcast(broadcastId) {
    setDeletingId(broadcastId);

    try {
      // Backend: DELETE /api/broadcasts/:id
      await broadcastsAPI.delete(broadcastId);
      toast.success(t.broadcastDeleted, { position: "top-right", autoClose: 3000 });
      refetch();
    } catch (err) {
      let errorMessage = t.error;
      if (err.message) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { position: "top-right", autoClose: 3000 });
    } finally {
      setDeletingId(null);
    }
  }

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  /**
   * Render broadcast history items.
   * @returns {Array|JSX.Element} Array of history items or empty state
   */
  function renderBroadcastHistory() {
    if (loading) {
      return (
        <div className="text-center py-8">
          <Loader className="mx-auto animate-spin text-emerald-500" size={32} />
          <p className="text-gray-500 mt-2">{t.loading}</p>
        </div>
      );
    }

    if (!broadcasts || broadcasts.length === 0) {
      return (
        <div className="text-center py-8">
          <Bell className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-2">{t.noHistory}</p>
        </div>
      );
    }

    const items = broadcasts.map(function(broadcast) {
      return (
        <BroadcastHistoryItem
          key={broadcast.id}
          broadcast={broadcast}
          t={t}
          language={language}
          onDelete={handleDeleteBroadcast}
          isDeleting={deletingId === broadcast.id}
        />
      );
    });

    return <div className="space-y-4">{items}</div>;
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  // Determine role display text
  let roleText;
  if (isSuperAdmin) {
    roleText = t.superAdmin;
  } else {
    roleText = t.wardAdmin;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            {roleText}
          </span>
        </div>
      </div>

      {/* New Broadcast Form */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Megaphone size={20} />
          {t.newBroadcast}
        </h3>
        <BroadcastForm
          t={t}
          isSuperAdmin={isSuperAdmin}
          userWard={userWard}
          onSubmit={handleSubmitBroadcast}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Broadcast History */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Clock size={20} />
          {t.broadcastHistory}
        </h3>
        {renderBroadcastHistory()}
      </div>
    </div>
  );
}

export default AdminNotificationBroadcast;
