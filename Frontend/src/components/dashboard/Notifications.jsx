/**
 * Notifications Component
 * 
 * Displays user notifications including announcements and issue updates.
 * Supports filtering, marking as read, and deletion.
 * 
 * @component
 * 
 * BACKEND INTEGRATION:
 * - GET /api/notifications - Fetches user notifications
 * - PATCH /api/notifications/:id/read - Mark notification as read
 * - PATCH /api/notifications/read-all - Mark all as read
 * - DELETE /api/notifications/:id - Delete notification
 * 
 * REQUIRED RESPONSE FORMAT:
 * {
 *   success: true,
 *   data: [{
 *     id: number,
 *     type: 'update' | 'announcement',
 *     title: string,
 *     titleNp: string,
 *     message: string,
 *     messageNp: string,
 *     timestamp: string (ISO date),
 *     isRead: boolean,
 *     from: string
 *   }]
 * }
 */

import React, { useState, useMemo } from "react";
import { useLanguage } from "../../context/useLanguage";
import { useNotifications } from "../../hooks/useData";
import { notificationsAPI } from "../../services/api";
import {
  Bell,
  Clock,
  Trash2,
  CheckCheck,
  MessageSquare,
  Megaphone,
  FileText,
  Loader,
  AlertCircle,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

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
    loading: "Loading notifications...",
    error: "Failed to load notifications",
    retry: "Retry",
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
    loading: "सूचनाहरू लोड हुँदैछ...",
    error: "सूचनाहरू लोड गर्न असफल",
    retry: "पुन: प्रयास",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate how long ago a timestamp occurred and return a human-readable string.
 * 
 * @param {string} timestamp - ISO date string
 * @param {string} language - Current language ('en' or 'np')
 * @returns {string} Human-readable time ago string
 */
function getTimeAgo(timestamp, language) {
  // Get current time
  const now = new Date();
  
  // Calculate difference in milliseconds
  const notificationTime = new Date(timestamp);
  const differenceMs = now - notificationTime;
  
  // Convert to different time units
  const minutes = Math.floor(differenceMs / 60000);
  const hours = Math.floor(differenceMs / 3600000);
  const days = Math.floor(differenceMs / 86400000);

  // Return appropriate string based on how long ago
  if (minutes < 60) {
    if (language === "en") {
      return minutes + " min ago";
    } else {
      return minutes + " मिनेट अगाडि";
    }
  } else if (hours < 24) {
    if (language === "en") {
      return hours + " hours ago";
    } else {
      return hours + " घण्टा अगाडि";
    }
  } else if (days === 1) {
    if (language === "en") {
      return "Yesterday";
    } else {
      return "हिजो";
    }
  } else {
    if (language === "en") {
      return days + " days ago";
    } else {
      return days + " दिन अगाडि";
    }
  }
}

/**
 * Get the group label for date-based grouping (Today, Yesterday, Earlier).
 * 
 * @param {string} timestamp - ISO date string
 * @param {Object} t - Translation object
 * @returns {string} Group label
 */
function getGroupLabel(timestamp, t) {
  // Calculate days difference
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const differenceMs = now - notificationTime;
  const days = Math.floor(differenceMs / 86400000);
  
  // Return appropriate label
  if (days === 0) {
    return t.today;
  } else if (days === 1) {
    return t.yesterday;
  } else {
    return t.earlier;
  }
}

/**
 * Get the appropriate icon component based on notification type.
 * 
 * @param {string} type - The notification type ('announcement' or 'update')
 * @returns {JSX.Element} Icon component
 */
function getNotificationIcon(type) {
  if (type === "announcement") {
    return <Megaphone className="text-blue-600" size={20} />;
  } else {
    return <FileText className="text-emerald-600" size={20} />;
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * NotificationCard Component
 * 
 * Displays a single notification with title, message, time, and delete button.
 * Unread notifications have a green left border.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.notification - The notification data
 * @param {string} props.language - Current language
 * @param {Object} props.t - Translation object
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.isExpanded - Whether this card is expanded
 * @param {Function} props.onToggle - Toggle expand/collapse
 */
function NotificationCard(props) {
  // Destructure props
  const notification = props.notification;
  const language = props.language;
  const t = props.t;
  const onDelete = props.onDelete;
  const isExpanded = props.isExpanded;
  const onToggle = props.onToggle;
  
  // Determine text content based on language
  const title = language === "en" ? notification.title : notification.titleNp;
  const message = language === "en" ? notification.message : notification.messageNp;
  
  // Calculate time ago
  const timeAgo = getTimeAgo(notification.timestamp, language);
  
  // Determine if notification is unread
  const isUnread = !notification.isRead;
  
  // Build CSS classes
  let cardClass = "bg-white rounded-xl shadow-sm overflow-hidden transition ";
  if (isUnread) {
    cardClass = cardClass + "border-l-4 border-l-emerald-500";
  }
  
  let titleClass = "font-semibold ";
  if (isUnread) {
    titleClass = titleClass + "text-gray-900";
  } else {
    titleClass = titleClass + "text-gray-700";
  }
  
  let messageClass = "text-sm ";
  if (!isExpanded) {
    messageClass = messageClass + "line-clamp-2 ";
  }
  if (isUnread) {
    messageClass = messageClass + "text-gray-700";
  } else {
    messageClass = messageClass + "text-gray-500";
  }
  
  // Get icon background class
  let iconBgClass = "p-2 rounded-lg ";
  if (notification.type === "announcement") {
    iconBgClass = iconBgClass + "bg-blue-100";
  } else {
    iconBgClass = iconBgClass + "bg-emerald-100";
  }
  
  /**
   * Handle delete button click.
   * Stops propagation to prevent card toggle.
   */
  function handleDeleteClick(event) {
    event.stopPropagation();
    onDelete(notification.id);
  }

  return (
    <div className={cardClass} onClick={onToggle}>
      <div className="p-4 cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Notification Icon */}
          <div className={iconBgClass}>
            {getNotificationIcon(notification.type)}
          </div>
          
          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-1">
              <h4 className={titleClass}>{title}</h4>
              {isUnread && <span className="w-2 h-2 bg-emerald-500 rounded-full" />}
            </div>
            
            {/* Message */}
            <p className={messageClass}>{message}</p>
            
            {/* Footer Row - Time, From, Delete */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {timeAgo}
                </span>
                <span>{t.from}: {notification.from}</span>
              </div>
              
              {/* Delete Button */}
              <button 
                onClick={handleDeleteClick} 
                className="p-1 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * LoadingState Component
 */
function LoadingState(props) {
  const t = props.t;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <Loader className="mx-auto text-emerald-500 animate-spin mb-4" size={48} />
      <p className="text-gray-500">{t.loading}</p>
    </div>
  );
}

/**
 * ErrorState Component
 */
function ErrorState(props) {
  const t = props.t;
  const onRetry = props.onRetry;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
      <p className="text-gray-700 font-medium mb-2">{t.error}</p>
      <button onClick={onRetry} className="text-emerald-600 hover:underline">{t.retry}</button>
    </div>
  );
}

/**
 * EmptyState Component
 */
function EmptyState(props) {
  const t = props.t;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <Bell className="mx-auto text-gray-300 mb-4" size={48} />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noNotifications}</h3>
      <p className="text-gray-500">{t.noNotificationsDesc}</p>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Notifications Component
 * 
 * The main component that displays user notifications.
 * Shows announcements and issue updates with filtering options.
 * 
 * Features:
 * - Filter by type (all, unread, announcements, updates)
 * - Mark individual notifications as read
 * - Mark all as read
 * - Delete notifications
 * - Group by date (Today, Yesterday, Earlier)
 */
function Notifications() {
  // -------------------------------------------------------------------------
  // HOOKS AND CONTEXT
  // -------------------------------------------------------------------------
  
  const { language } = useLanguage();
  const t = notificationText[language];

  // -------------------------------------------------------------------------
  // STATE VARIABLES
  // -------------------------------------------------------------------------
  
  // Current filter selection
  const [filter, setFilter] = useState("all");
  
  // ID of currently expanded notification (null if none)
  const [expandedNotification, setExpandedNotification] = useState(null);
  
  // Local copy of notifications (for optimistic updates)
  const [localNotifications, setLocalNotifications] = useState([]);

  // -------------------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------------------
  
  const { 
    notifications: apiNotifications, 
    unreadCount, 
    loading, 
    error, 
    refetch 
  } = useNotifications();

  // -------------------------------------------------------------------------
  // SYNC LOCAL STATE WITH API DATA
  // -------------------------------------------------------------------------
  
  // When API data changes, update local state
  React.useEffect(function() {
    if (apiNotifications.length > 0) {
      setLocalNotifications(apiNotifications);
    }
  }, [apiNotifications]);

  // -------------------------------------------------------------------------
  // FILTERED NOTIFICATIONS
  // -------------------------------------------------------------------------
  
  // Filter notifications based on current filter selection
  const filteredNotifications = useMemo(function() {
    const filtered = [];
    
    for (let i = 0; i < localNotifications.length; i++) {
      const notification = localNotifications[i];
      
      // Check if notification matches current filter
      let shouldInclude = false;
      
      if (filter === "all") {
        shouldInclude = true;
      } else if (filter === "unread") {
        shouldInclude = !notification.isRead;
      } else if (filter === "announcements") {
        shouldInclude = notification.type === "announcement";
      } else if (filter === "updates") {
        shouldInclude = notification.type === "update";
      }
      
      if (shouldInclude) {
        filtered.push(notification);
      }
    }
    
    return filtered;
  }, [localNotifications, filter]);

  // -------------------------------------------------------------------------
  // GROUPED NOTIFICATIONS
  // -------------------------------------------------------------------------
  
  // Group filtered notifications by date (Today, Yesterday, Earlier)
  const groupedNotifications = useMemo(function() {
    const groups = {};
    
    for (let i = 0; i < filteredNotifications.length; i++) {
      const notification = filteredNotifications[i];
      const label = getGroupLabel(notification.timestamp, t);
      
      // Create group if it doesn't exist
      if (!groups[label]) {
        groups[label] = [];
      }
      
      // Add notification to group
      groups[label].push(notification);
    }
    
    return groups;
  }, [filteredNotifications, t]);

  // -------------------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------------------
  
  /**
   * Mark a single notification as read.
   * Updates local state immediately (optimistic update) then syncs with API.
   */
  async function handleMarkRead(id) {
    // Update local state immediately
    const updatedNotifications = [];
    for (let i = 0; i < localNotifications.length; i++) {
      const notification = localNotifications[i];
      if (notification.id === id) {
        // Create a new object with isRead set to true
        const updatedNotification = {
          ...notification,
          isRead: true
        };
        updatedNotifications.push(updatedNotification);
      } else {
        updatedNotifications.push(notification);
      }
    }
    setLocalNotifications(updatedNotifications);
    
    // Sync with API
    try {
      await notificationsAPI.markAsRead(id);
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

  /**
   * Mark all notifications as read.
   */
  async function handleMarkAllRead() {
    // Update local state immediately
    const updatedNotifications = [];
    for (let i = 0; i < localNotifications.length; i++) {
      const notification = localNotifications[i];
      const updatedNotification = {
        ...notification,
        isRead: true
      };
      updatedNotifications.push(updatedNotification);
    }
    setLocalNotifications(updatedNotifications);
    
    // Sync with API
    try {
      await notificationsAPI.markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  /**
   * Delete a notification.
   */
  async function handleDelete(id) {
    // Remove from local state immediately
    const updatedNotifications = [];
    for (let i = 0; i < localNotifications.length; i++) {
      const notification = localNotifications[i];
      if (notification.id !== id) {
        updatedNotifications.push(notification);
      }
    }
    setLocalNotifications(updatedNotifications);
    
    // Sync with API
    try {
      await notificationsAPI.delete(id);
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  }

  /**
   * Toggle notification expand/collapse and mark as read.
   */
  function handleToggle(id) {
    // Mark as read when expanded
    handleMarkRead(id);
    
    // Toggle expand state
    if (expandedNotification === id) {
      setExpandedNotification(null);
    } else {
      setExpandedNotification(id);
    }
  }

  // -------------------------------------------------------------------------
  // FILTER TABS CONFIGURATION
  // -------------------------------------------------------------------------
  
  const filterTabs = [
    { id: "all", label: t.all },
    { id: "unread", label: t.unread },
    { id: "announcements", label: t.announcements },
    { id: "updates", label: t.updates },
  ];

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
          
          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Filter Tabs Section */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map(function(tab) {
              let buttonClass = "px-4 py-2 rounded-lg font-medium transition ";
              if (filter === tab.id) {
                buttonClass = buttonClass + "bg-emerald-600 text-white";
              } else {
                buttonClass = buttonClass + "bg-gray-100 text-gray-600 hover:bg-gray-200";
              }
              
              return (
                <button 
                  key={tab.id} 
                  onClick={function() { setFilter(tab.id); }} 
                  className={buttonClass}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          {/* Mark All Read Button */}
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead} 
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              <CheckCheck size={16} />
              {t.markAllRead}
            </button>
          )}
        </div>
      </div>

      {/* Notifications List Section */}
      {renderNotificationsList()}
    </div>
  );
  
  /**
   * Helper function to render the notifications list.
   */
  function renderNotificationsList() {
    // Show loading state
    if (loading) {
      return <LoadingState t={t} />;
    }
    
    // Show error state
    if (error) {
      return <ErrorState t={t} onRetry={refetch} />;
    }
    
    // Show empty state
    if (filteredNotifications.length === 0) {
      return <EmptyState t={t} />;
    }
    
    // Render grouped notifications
    const groupElements = [];
    const groupKeys = Object.keys(groupedNotifications);
    
    for (let i = 0; i < groupKeys.length; i++) {
      const groupLabel = groupKeys[i];
      const groupItems = groupedNotifications[groupLabel];
      
      // Create notification cards for this group
      const notificationCards = [];
      for (let j = 0; j < groupItems.length; j++) {
        const notification = groupItems[j];
        notificationCards.push(
          <NotificationCard
            key={notification.id}
            notification={notification}
            language={language}
            t={t}
            onDelete={handleDelete}
            isExpanded={expandedNotification === notification.id}
            onToggle={function() { handleToggle(notification.id); }}
          />
        );
      }
      
      // Create group element
      groupElements.push(
        <div key={groupLabel} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 px-2">{groupLabel}</h3>
          <div className="space-y-3">{notificationCards}</div>
        </div>
      );
    }
    
    return groupElements;
  }
}

export default Notifications;
