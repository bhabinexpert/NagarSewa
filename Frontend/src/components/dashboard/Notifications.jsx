import React, { useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Calendar,
  Clock,
  Trash2,
  CheckCheck,
  Filter,
  MessageSquare,
  Megaphone,
  FileText,
} from "lucide-react";

const notificationText = {
  en: {
    title: "Notifications",
    subtitle: "Stay updated with important announcements and issue updates",
    all: "All",
    unread: "Unread",
    announcements: "Announcements",
    updates: "Issue Updates",
    markAllRead: "Mark all as read",
    noNotifications: "No notifications",
    noNotificationsDesc: "You're all caught up! Check back later for updates.",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    from: "From",
    deleteAll: "Delete All",
    readMore: "Read More",
  },
  np: {
    title: "सूचनाहरू",
    subtitle: "महत्त्वपूर्ण घोषणाहरू र समस्या अद्यावधिकहरूसँग अद्यावधिक रहनुहोस्",
    all: "सबै",
    unread: "नपढेको",
    announcements: "घोषणाहरू",
    updates: "समस्या अद्यावधिकहरू",
    markAllRead: "सबै पढेको भनी चिन्ह लगाउनुहोस्",
    noNotifications: "कुनै सूचनाहरू छैनन्",
    noNotificationsDesc: "तपाईंले सबै समात्नुभएको छ! अद्यावधिकहरूको लागि पछि जाँच गर्नुहोस्।",
    today: "आज",
    yesterday: "हिजो",
    earlier: "पहिले",
    from: "बाट",
    deleteAll: "सबै मेट्नुहोस्",
    readMore: "थप पढ्नुहोस्",
  },
};

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "update",
    title: "Issue Status Updated",
    titleNp: "समस्या स्थिति अद्यावधिक",
    message: "Your road damage report (ISS-2024-001) has been assigned to a repair team. Expected completion: 3 days.",
    messageNp: "तपाईंको सडक क्षति रिपोर्ट (ISS-2024-001) मर्मत टोलीलाई तोकिएको छ। अपेक्षित समापन: 3 दिन।",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    from: "Ward 5 Office",
  },
  {
    id: 2,
    type: "announcement",
    title: "Water Supply Schedule Change",
    titleNp: "पानी आपूर्ति तालिका परिवर्तन",
    message: "Due to maintenance work, water supply will be available from 6 AM to 10 AM and 5 PM to 8 PM starting from tomorrow.",
    messageNp: "मर्मत कार्यको कारण, भोलिदेखि बिहान 6 देखि 10 बजे र साँझ 5 देखि 8 बजेसम्म पानी आपूर्ति उपलब्ध हुनेछ।",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isRead: false,
    from: "Kathmandu Metropolitan City",
  },
  {
    id: 3,
    type: "update",
    title: "Issue Resolved",
    titleNp: "समस्या समाधान भयो",
    message: "Your water supply issue (ISS-2024-002) has been resolved. Pipeline has been repaired successfully.",
    messageNp: "तपाईंको पानी आपूर्ति समस्या (ISS-2024-002) समाधान भएको छ। पाइपलाइन सफलतापूर्वक मर्मत गरिएको छ।",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    from: "Water Supply Department",
  },
  {
    id: 4,
    type: "announcement",
    title: "Community Meeting Announcement",
    titleNp: "सामुदायिक बैठक घोषणा",
    message: "Ward 5 community meeting scheduled for January 28, 2024 at 3 PM. Topics: Road development, sanitation improvement.",
    messageNp: "वडा 5 सामुदायिक बैठक जनवरी 28, 2024 को दिउँसो 3 बजे तय गरिएको छ। विषयहरू: सडक विकास, सरसफाई सुधार।",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: true,
    from: "Ward 5 Office",
  },
  {
    id: 5,
    type: "announcement",
    title: "New Garbage Collection Schedule",
    titleNp: "नयाँ फोहोर संकलन तालिका",
    message: "Starting next week, garbage collection will be done on Monday, Wednesday, and Friday at 7 AM.",
    messageNp: "अर्को हप्तादेखि, फोहोर संकलन सोमबार, बुधबार र शुक्रबार बिहान 7 बजे गरिनेछ।",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isRead: true,
    from: "Sanitation Department",
  },
];

const Notifications = () => {
  const { language } = useLanguage();
  const t = notificationText[language];

  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState("all");
  const [expandedNotification, setExpandedNotification] = useState(null);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return language === "en" ? `${minutes} min ago` : `${minutes} मिनेट अगाडि`;
    } else if (hours < 24) {
      return language === "en" ? `${hours} hours ago` : `${hours} घण्टा अगाडि`;
    } else if (days === 1) {
      return language === "en" ? "Yesterday" : "हिजो";
    } else {
      return language === "en" ? `${days} days ago` : `${days} दिन अगाडि`;
    }
  };

  const getGroupLabel = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const days = Math.floor(diff / 86400000);

    if (days === 0) return t.today;
    if (days === 1) return t.yesterday;
    return t.earlier;
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.isRead;
    if (filter === "announcements") return n.type === "announcement";
    if (filter === "updates") return n.type === "update";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const label = getGroupLabel(notification.timestamp);
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(notification);
    return groups;
  }, {});

  const getNotificationIcon = (type) => {
    switch (type) {
      case "announcement":
        return <Megaphone className="text-blue-600" size={20} />;
      case "update":
        return <FileText className="text-emerald-600" size={20} />;
      default:
        return <Bell className="text-gray-600" size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: t.all },
              { id: "unread", label: t.unread },
              { id: "announcements", label: t.announcements },
              { id: "updates", label: t.updates },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === tab.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              <CheckCheck size={16} />
              {t.markAllRead}
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Bell className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noNotifications}</h3>
          <p className="text-gray-500">{t.noNotificationsDesc}</p>
        </div>
      ) : (
        Object.entries(groupedNotifications).map(([group, items]) => (
          <div key={group} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">{group}</h3>
            <div className="space-y-3">
              {items.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition ${
                    !notification.isRead ? "border-l-4 border-l-emerald-500" : ""
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    setExpandedNotification(
                      expandedNotification === notification.id ? null : notification.id
                    );
                  }}
                >
                  <div className="p-4 cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          notification.type === "announcement"
                            ? "bg-blue-100"
                            : "bg-emerald-100"
                        }`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4
                            className={`font-semibold ${
                              !notification.isRead ? "text-gray-900" : "text-gray-700"
                            }`}
                          >
                            {language === "en" ? notification.title : notification.titleNp}
                          </h4>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                          )}
                        </div>
                        <p
                          className={`text-sm ${
                            expandedNotification === notification.id
                              ? ""
                              : "line-clamp-2"
                          } ${!notification.isRead ? "text-gray-700" : "text-gray-500"}`}
                        >
                          {language === "en" ? notification.message : notification.messageNp}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {getTimeAgo(notification.timestamp)}
                            </span>
                            <span>
                              {t.from}: {notification.from}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
