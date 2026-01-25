import React, { useState } from "react";
import { useLanguage } from "../../../context/useLanguage";
import { useAuth } from "../../../context/useAuth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Megaphone,
  Send,
  Users,
  MapPin,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  Clock,
  Trash2,
  Edit,
  Eye,
  Loader,
  Zap,
  Target,
} from "lucide-react";
import { DAMAK_TOTAL_WARDS } from "../../../context/authConstants";

const broadcastText = {
  en: {
    title: "Notification Broadcast",
    subtitle: "Send important announcements to citizens",
    subtitleWardAdmin: "Send announcements to your ward citizens",
    newBroadcast: "New Broadcast",
    recentBroadcasts: "Recent Broadcasts",
    messageTitle: "Title",
    titlePlaceholder: "Enter notification title...",
    message: "Message",
    messagePlaceholder: "Enter your announcement message...",
    targetAudience: "Target Audience",
    allWards: "All Wards",
    specificWard: "Specific Ward",
    myWard: "My Ward",
    selectWard: "Select Ward",
    ward: "Ward",
    verifiedOnly: "Verified Users Only",
    notificationType: "Notification Type",
    announcement: "Announcement",
    alert: "Alert",
    info: "Information",
    urgentIssue: "Urgent Issue Resolution",
    schedule: "Schedule",
    sendNow: "Send Now",
    scheduleLater: "Schedule for Later",
    scheduleDate: "Schedule Date & Time",
    send: "Send Broadcast",
    sending: "Sending...",
    preview: "Preview",
    cancel: "Cancel",
    success: "Broadcast sent successfully!",
    history: "Broadcast History",
    noHistory: "No broadcasts yet",
    sentTo: "Sent to",
    citizens: "citizens",
    viewDetails: "View Details",
    delete: "Delete",
    edit: "Edit",
    status: "Status",
    sent: "Sent",
    scheduled: "Scheduled",
    draft: "Draft",
    issueReference: "Related Issue",
    issueReferencePlaceholder: "Enter issue ID or title...",
    quickAction: "Quick Action Notice",
    quickActionDesc: "Send urgent notice to ward admin about an issue",
  },
  np: {
    title: "सूचना प्रसारण",
    subtitle: "नागरिकहरूलाई महत्त्वपूर्ण घोषणाहरू पठाउनुहोस्",
    subtitleWardAdmin: "तपाईंको वडाका नागरिकहरूलाई घोषणाहरू पठाउनुहोस्",
    newBroadcast: "नयाँ प्रसारण",
    recentBroadcasts: "हालका प्रसारणहरू",
    messageTitle: "शीर्षक",
    titlePlaceholder: "सूचना शीर्षक प्रविष्ट गर्नुहोस्...",
    message: "सन्देश",
    messagePlaceholder: "तपाईंको घोषणा सन्देश प्रविष्ट गर्नुहोस्...",
    targetAudience: "लक्षित दर्शक",
    allWards: "सबै वडाहरू",
    specificWard: "विशेष वडा",
    myWard: "मेरो वडा",
    selectWard: "वडा छान्नुहोस्",
    ward: "वडा",
    verifiedOnly: "प्रमाणित प्रयोगकर्ताहरू मात्र",
    notificationType: "सूचनाको प्रकार",
    announcement: "घोषणा",
    alert: "सतर्कता",
    info: "जानकारी",
    urgentIssue: "तत्काल समस्या समाधान",
    schedule: "तालिका",
    sendNow: "अहिले पठाउनुहोस्",
    scheduleLater: "पछि तालिका बनाउनुहोस्",
    scheduleDate: "तालिका मिति र समय",
    send: "प्रसारण पठाउनुहोस्",
    sending: "पठाउँदै...",
    preview: "पूर्वावलोकन",
    cancel: "रद्द गर्नुहोस्",
    success: "प्रसारण सफलतापूर्वक पठाइयो!",
    history: "प्रसारण इतिहास",
    noHistory: "अहिलेसम्म कुनै प्रसारण छैन",
    sentTo: "पठाइयो",
    citizens: "नागरिकहरू",
    viewDetails: "विवरण हेर्नुहोस्",
    delete: "मेट्नुहोस्",
    edit: "सम्पादन गर्नुहोस्",
    status: "स्थिति",
    sent: "पठाइयो",
    scheduled: "तालिकाबद्ध",
    draft: "ड्राफ्ट",
    issueReference: "सम्बन्धित समस्या",
    issueReferencePlaceholder: "समस्या ID वा शीर्षक प्रविष्ट गर्नुहोस्...",
    quickAction: "द्रुत कार्य सूचना",
    quickActionDesc: "समस्याको बारेमा वडा प्रशासकलाई तत्काल सूचना पठाउनुहोस्",
  },
};

// Mock broadcast history with ward info
const mockBroadcasts = [
  {
    id: 1,
    title: "Water Supply Schedule Change",
    titleNp: "पानी आपूर्ति तालिका परिवर्तन",
    message: "Due to maintenance work, water supply will be available from 6 AM to 10 AM.",
    messageNp: "मर्मत कार्यको कारण, बिहान 6 देखि 10 बजेसम्म पानी आपूर्ति उपलब्ध हुनेछ।",
    type: "announcement",
    audience: "all",
    wardNumber: null, // null = all wards
    sentTo: 1250,
    sentAt: "2024-01-20 10:30 AM",
    status: "sent",
    sentBy: "super_admin",
  },
  {
    id: 2,
    title: "Community Meeting Notice",
    titleNp: "सामुदायिक बैठक सूचना",
    message: "Ward 5 community meeting scheduled for January 28 at 3 PM.",
    messageNp: "वडा 5 सामुदायिक बैठक जनवरी 28 को दिउँसो 3 बजे तय गरिएको छ।",
    type: "info",
    audience: "ward",
    wardNumber: 5,
    sentTo: 320,
    sentAt: "2024-01-18 02:00 PM",
    status: "sent",
    sentBy: "ward_admin",
  },
  {
    id: 3,
    title: "Road Construction Alert",
    titleNp: "सडक निर्माण सतर्कता",
    message: "Road construction will begin from Feb 1. Expect traffic diversions.",
    messageNp: "फेब्रुअरी 1 देखि सडक निर्माण सुरु हुनेछ। ट्राफिक डाइभर्सनको अपेक्षा गर्नुहोस्।",
    type: "alert",
    audience: "all",
    wardNumber: null,
    sentTo: 1250,
    scheduledFor: "2024-01-25 09:00 AM",
    status: "scheduled",
    sentBy: "super_admin",
  },
  {
    id: 4,
    title: "Urgent: Resolve Pothole Issue",
    titleNp: "तत्काल: खाल्डो समस्या समाधान गर्नुहोस्",
    message: "Please prioritize the pothole issue reported at Main Road, Ward 1. Issue ID: #ISS-001",
    messageNp: "कृपया वडा १ मुख्य सडकमा रिपोर्ट गरिएको खाल्डो समस्यालाई प्राथमिकता दिनुहोस्। समस्या ID: #ISS-001",
    type: "urgent",
    audience: "ward_admin",
    wardNumber: 1,
    sentTo: 1,
    sentAt: "2024-01-22 11:00 AM",
    status: "sent",
    sentBy: "super_admin",
    issueReference: "#ISS-001",
  },
];

const AdminNotificationBroadcast = () => {
  const { language } = useLanguage();
  const { isSuperAdmin, getUserWard } = useAuth();
  const t = broadcastText[language];
  
  const userWard = getUserWard();
  const _isSuperAdmin = isSuperAdmin();

  // Filter broadcasts based on role
  const getFilteredBroadcasts = () => {
    if (_isSuperAdmin) {
      return mockBroadcasts; // Super admin sees all
    }
    // Ward admin sees only their ward broadcasts + all-ward broadcasts
    return mockBroadcasts.filter(
      (b) => b.wardNumber === null || b.wardNumber === userWard
    );
  };

  const [broadcasts, setBroadcasts] = useState(getFilteredBroadcasts());
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    audience: _isSuperAdmin ? "all" : "ward",
    targetWard: _isSuperAdmin ? "" : userWard,
    type: "announcement",
    scheduleType: "now",
    scheduledDate: "",
    issueReference: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Preview functionality can be added later
  // const [showPreview, setShowPreview] = useState(false);

  const getTypeIcon = (type) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="text-blue-600" size={20} />;
      case "alert":
        return <AlertTriangle className="text-red-600" size={20} />;
      case "info":
        return <Info className="text-green-600" size={20} />;
      case "urgent":
        return <Zap className="text-orange-600" size={20} />;
      default:
        return <Bell className="text-gray-600" size={20} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "announcement":
        return "bg-blue-100 text-blue-700";
      case "alert":
        return "bg-red-100 text-red-700";
      case "info":
        return "bg-green-100 text-green-700";
      case "urgent":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.warning(language === "en" ? "Please fill all required fields" : "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्", { position: "top-right", autoClose: 3000 });
      return;
    }

    // Validate ward selection for specific ward audience
    if (formData.audience === "ward" && !formData.targetWard) {
      toast.warning(language === "en" ? "Please select a ward" : "कृपया वडा छान्नुहोस्", { position: "top-right", autoClose: 3000 });
      return;
    }

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Determine ward number
    let wardNumber = null;
    if (formData.audience === "ward") {
      wardNumber = _isSuperAdmin ? parseInt(formData.targetWard) : userWard;
    } else if (formData.audience === "ward_admin") {
      wardNumber = parseInt(formData.targetWard);
    }

    const newBroadcast = {
      id: Date.now(),
      title: formData.title,
      titleNp: formData.title,
      message: formData.message,
      messageNp: formData.message,
      type: formData.type,
      audience: formData.audience,
      wardNumber: wardNumber,
      sentTo: formData.audience === "all" ? 1250 : formData.audience === "ward_admin" ? 1 : 320,
      sentAt: new Date().toLocaleString(),
      status: formData.scheduleType === "now" ? "sent" : "scheduled",
      scheduledFor: formData.scheduleType === "later" ? formData.scheduledDate : null,
      sentBy: _isSuperAdmin ? "super_admin" : "ward_admin",
      issueReference: formData.issueReference || null,
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setIsSending(false);
    setShowSuccess(true);
    setFormData({
      title: "",
      message: "",
      audience: _isSuperAdmin ? "all" : "ward",
      targetWard: _isSuperAdmin ? "" : userWard,
      type: "announcement",
      scheduleType: "now",
      scheduledDate: "",
      issueReference: "",
    });

    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = (id) => {
    setBroadcasts(broadcasts.filter((b) => b.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <ToastContainer />
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">
          {_isSuperAdmin ? t.subtitle : t.subtitleWardAdmin}
        </p>
        {!_isSuperAdmin && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
            <MapPin size={14} />
            {t.ward} {userWard}
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-100 border border-green-200 text-green-700 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle size={20} />
          <span>{t.success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Broadcast Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Megaphone size={20} className="text-indigo-600" />
            {t.newBroadcast}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.messageTitle} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t.titlePlaceholder}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.message} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t.messagePlaceholder}
                rows={4}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Target Audience - Different for Super Admin vs Ward Admin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.targetAudience}
              </label>
              
              {_isSuperAdmin ? (
                // Super Admin: Can choose all wards, specific ward, or send to ward admin
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "all", label: t.allWards, icon: Users },
                      { value: "ward", label: t.specificWard, icon: MapPin },
                      { value: "ward_admin", label: t.quickAction, icon: Zap },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, audience: option.value, targetWard: "" })}
                        className={`p-3 rounded-xl border-2 transition text-center ${
                          formData.audience === option.value
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <option.icon className="mx-auto mb-1" size={20} />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Ward Selection for specific ward or ward admin */}
                  {(formData.audience === "ward" || formData.audience === "ward_admin") && (
                    <div>
                      <select
                        value={formData.targetWard}
                        onChange={(e) => setFormData({ ...formData, targetWard: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">{t.selectWard}</option>
                        {Array.from({ length: DAMAK_TOTAL_WARDS }, (_, i) => i + 1).map((ward) => (
                          <option key={ward} value={ward}>
                            {t.ward} {ward}
                          </option>
                        ))}
                      </select>
                      {formData.audience === "ward_admin" && (
                        <p className="text-xs text-gray-500 mt-1">{t.quickActionDesc}</p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Ward Admin: Can only send to their ward
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <MapPin className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{t.myWard}</p>
                      <p className="text-sm text-gray-500">{t.ward} {userWard} {language === "en" ? "citizens only" : "नागरिकहरू मात्र"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Issue Reference - Only for urgent/ward_admin notifications */}
            {formData.audience === "ward_admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.issueReference}
                </label>
                <input
                  type="text"
                  value={formData.issueReference}
                  onChange={(e) => setFormData({ ...formData, issueReference: e.target.value })}
                  placeholder={t.issueReferencePlaceholder}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.notificationType}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "announcement", label: t.announcement, icon: Megaphone, color: "blue" },
                  { value: "alert", label: t.alert, icon: AlertTriangle, color: "red" },
                  { value: "info", label: t.info, icon: Info, color: "green" },
                  { value: "urgent", label: t.urgentIssue, icon: Zap, color: "orange" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: option.value })}
                    className={`p-2 rounded-xl border-2 transition text-center ${
                      formData.type === option.value
                        ? option.color === "blue"
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : option.color === "red"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : option.color === "orange"
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <option.icon className="mx-auto mb-1" size={18} />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.schedule}
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, scheduleType: "now" })}
                  className={`p-3 rounded-xl border-2 transition ${
                    formData.scheduleType === "now"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Send className="mx-auto mb-1" size={20} />
                  <span className="text-sm font-medium">{t.sendNow}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, scheduleType: "later" })}
                  className={`p-3 rounded-xl border-2 transition ${
                    formData.scheduleType === "later"
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Calendar className="mx-auto mb-1" size={20} />
                  <span className="text-sm font-medium">{t.scheduleLater}</span>
                </button>
              </div>
              {formData.scheduleType === "later" && (
                <input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  {t.sending}
                </>
              ) : (
                <>
                  <Send size={20} />
                  {t.send}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">{t.history}</h3>

          {getFilteredBroadcasts().length === 0 ? (
            <div className="text-center py-8">
              <Bell className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500">{t.noHistory}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {getFilteredBroadcasts().map((broadcast) => (
                <div
                  key={broadcast.id}
                  className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(broadcast.type)}`}>
                        {getTypeIcon(broadcast.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {language === "en" ? broadcast.title : broadcast.titleNp}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              broadcast.status === "sent"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {broadcast.status === "sent" ? t.sent : t.scheduled}
                          </span>
                          {/* Ward Badge */}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                            <MapPin size={10} />
                            {broadcast.wardNumber === "all" 
                              ? t.allWards 
                              : `${t.ward} ${broadcast.wardNumber}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(broadcast.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {language === "en" ? broadcast.message : broadcast.messageNp}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {t.sentTo} {broadcast.sentTo} {t.citizens}
                      </span>
                      {broadcast.sentBy && (
                        <span className="text-gray-400">
                          {language === "en" ? "by" : "द्वारा"} {broadcast.sentBy}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {broadcast.sentAt || broadcast.scheduledFor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationBroadcast;
