/**
 * NewsFeed Component
 * 
 * Displays community news feed including issues, programs, and notices.
 * Supports filtering by type and ward.
 * 
 * @component
 * 
 * BACKEND INTEGRATION:
 * - GET /api/feed - Fetches community feed
 * 
 * REQUIRED RESPONSE FORMAT:
 * {
 *   success: true,
 *   data: [{
 *     id: number,
 *     type: 'issue' | 'program' | 'notice',
 *     author: string,
 *     title: string,
 *     titleNp: string,
 *     description: string,
 *     descriptionNp: string,
 *     location: string,
 *     wardNumber: number | 'all',
 *     timestamp: string (ISO date),
 *     status?: 'pending' | 'inProgress' | 'resolved' | 'rejected',
 *     hasImage: boolean,
 *     adminResponse?: string,
 *     adminResponseNp?: string
 *   }]
 * }
 */

import React, { useState, useMemo, useEffect } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../../contexts/auth/authConstants";
import { useFeed } from "../../../hooks/useData";
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Image,
  User,
  XCircle,
  RefreshCw,
  Megaphone,
  Loader,
  FileText,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2026/api";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const BASE64_CHARS_REGEX = /^[A-Za-z0-9+/=\s]+$/;

// ============================================================================
// TRANSLATIONS
// ============================================================================

const newsFeedText = {
  en: {
    title: "Community News Feed",
    subtitle: "Track all reports, campaigns, and programs from your area",
    all: "All Posts",
    issues: "Issues",
    campaigns: "Campaigns",
    programs: "Programs",
    notices: "Notices",
    searchPlaceholder: "Search posts...",
    noResults: "No posts found",
    noResultsDesc: "Community updates will appear here.",
    loading: "Loading feed...",
    error: "Failed to load feed",
    retry: "Retry",
    refresh: "Refresh",
    pending: "Pending",
    inProgress: "In Progress",
    resolvedStatus: "Resolved",
    rejected: "Rejected",
    approved: "Approved",
    completed: "Completed",
    ward: "Ward",
    allWards: "All Wards",
    yourWard: "Your Ward",
  },
  np: {
    title: "समुदाय समाचार फिड",
    subtitle: "तपाईंको क्षेत्रबाट सबै रिपोर्टहरू, अभियानहरू र कार्यक्रमहरू ट्र्याक गर्नुहोस्",
    all: "सबै पोस्टहरू",
    issues: "समस्याहरू",
    campaigns: "अभियानहरू",
    programs: "कार्यक्रमहरू",
    notices: "सूचनाहरू",
    searchPlaceholder: "पोस्टहरू खोज्नुहोस्...",
    noResults: "कुनै पोस्टहरू भेटिएन",
    noResultsDesc: "समुदाय अपडेटहरू यहाँ देखिनेछ।",
    loading: "फिड लोड हुँदैछ...",
    error: "फिड लोड गर्न असफल",
    retry: "पुन: प्रयास",
    refresh: "रिफ्रेश",
    pending: "पेन्डिङ",
    inProgress: "प्रगतिमा",
    resolvedStatus: "समाधान भएको",
    rejected: "अस्वीकृत",
    approved: "स्वीकृत",
    completed: "सम्पन्न",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    yourWard: "तपाईंको वडा",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate how long ago a timestamp occurred and return a human-readable string.
 * 
 * Examples:
 *   - 5 minutes ago
 *   - 3 hours ago
 *   - 2 days ago
 * 
 * @param {string} timestamp - ISO date string (e.g., "2024-01-15T10:30:00Z")
 * @param {string} language - Current language ('en' or 'np')
 * @returns {string} Human-readable time ago string
 */
function getTimeAgo(timestamp, language) {
  // Get current time
  const now = new Date();
  
  // Calculate difference in milliseconds
  const postTime = new Date(timestamp);
  const differenceMs = now - postTime;
  
  // Convert to different time units
  const minutes = Math.floor(differenceMs / 60000);      // 60,000 ms = 1 minute
  const hours = Math.floor(differenceMs / 3600000);      // 3,600,000 ms = 1 hour
  const days = Math.floor(differenceMs / 86400000);      // 86,400,000 ms = 1 day

  // Return appropriate string based on how long ago
  if (minutes < 60) {
    // Less than an hour ago - show minutes
    if (language === "en") {
      return minutes + "m ago";
    } else {
      return minutes + " मिनेट अगाडि";
    }
  } else if (hours < 24) {
    // Less than a day ago - show hours
    if (language === "en") {
      return hours + "h ago";
    } else {
      return hours + " घण्टा अगाडि";
    }
  } else {
    // More than a day ago - show days
    if (language === "en") {
      return days + "d ago";
    } else {
      return days + " दिन अगाडि";
    }
  }
}

/**
 * Get styling configuration for an issue status badge.
 * 
 * @param {string} status - The status ('pending', 'inProgress', 'resolved', 'rejected')
 * @param {Object} t - Translation object
 * @returns {Object|null} Style object or null if no status
 */
function getStatusStyle(status, t) {
  // Define all possible status styles (includes issue and campaign statuses)
  const styles = {
    pending: { 
      bg: "bg-yellow-100", 
      text: "text-yellow-700", 
      icon: Clock, 
      label: t.pending 
    },
    PENDING: { 
      bg: "bg-yellow-100", 
      text: "text-yellow-700", 
      icon: Clock, 
      label: t.pending 
    },
    inProgress: { 
      bg: "bg-blue-100", 
      text: "text-blue-700", 
      icon: AlertCircle, 
      label: t.inProgress 
    },
    resolved: { 
      bg: "bg-green-100", 
      text: "text-green-700", 
      icon: CheckCircle, 
      label: t.resolvedStatus 
    },
    rejected: { 
      bg: "bg-red-100", 
      text: "text-red-700", 
      icon: XCircle, 
      label: t.rejected 
    },
    REJECTED: { 
      bg: "bg-red-100", 
      text: "text-red-700", 
      icon: XCircle, 
      label: t.rejected 
    },
    approved: { 
      bg: "bg-green-100", 
      text: "text-green-700", 
      icon: CheckCircle, 
      label: t.approved 
    },
    APPROVED: { 
      bg: "bg-green-100", 
      text: "text-green-700", 
      icon: CheckCircle, 
      label: t.approved 
    },
    completed: { 
      bg: "bg-blue-100", 
      text: "text-blue-700", 
      icon: CheckCircle, 
      label: t.completed 
    },
    COMPLETED: { 
      bg: "bg-blue-100", 
      text: "text-blue-700", 
      icon: CheckCircle, 
      label: t.completed 
    },
  };
  
  // Return matching style or null if status not found
  const matchedStyle = styles[status];
  if (matchedStyle) {
    return matchedStyle;
  }
  return null;
}

/**
 * Get styling configuration for a post type badge.
 * 
 * Post types:
 * - issue: Red - reported problems
 * - program: Blue - community events/programs
 * - notice: Purple - official announcements
 * 
 * @param {string} type - The post type ('issue', 'program', 'notice')
 * @returns {Object} Style object with bg, text, and icon properties
 */
function getTypeStyle(type) {
  // Define all possible type styles
  const styles = {
    issue: { 
      bg: "bg-red-100", 
      text: "text-red-700", 
      icon: AlertCircle 
    },
    campaign: { 
      bg: "bg-green-100", 
      text: "text-green-700", 
      icon: Megaphone 
    },
    program: { 
      bg: "bg-blue-100", 
      text: "text-blue-700", 
      icon: Megaphone 
    },
    notice: { 
      bg: "bg-purple-100", 
      text: "text-purple-700", 
      icon: FileText 
    },
  };
  
  // Return matching style or default gray style
  const matchedStyle = styles[type];
  if (matchedStyle) {
    return matchedStyle;
  }
  
  // Default fallback
  const defaultStyle = { 
    bg: "bg-gray-100", 
    text: "text-gray-700", 
    icon: FileText 
  };
  return defaultStyle;
}

/**
 * Convert DB photo values to a browser-safe image URL.
 * Supports data URLs, raw base64 strings, and path-based uploads.
 */
function getFeedImageUrl(rawValue) {
  if (!rawValue) return null;

  if (typeof rawValue === "object" && rawValue.type === "Buffer" && Array.isArray(rawValue.data)) {
    try {
      const bytes = Uint8Array.from(rawValue.data);
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.slice(i, i + chunkSize));
      }
      return `data:image/jpeg;base64,${btoa(binary)}`;
    } catch {
      return null;
    }
  }

  const value = String(rawValue).trim();
  if (!value) return null;

  if (value.startsWith("data:")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;

  const compact = value.replace(/\s/g, "");
  if (compact.length > 120 && BASE64_CHARS_REGEX.test(value)) {
    return `data:image/jpeg;base64,${compact}`;
  }

  const normalizedPath = value.replace(/\\/g, "/").startsWith("/")
    ? value.replace(/\\/g, "/")
    : `/${value.replace(/\\/g, "/")}`;

  return `${FILE_BASE_URL}${normalizedPath}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * FeedCard Component
 * 
 * Displays a single post in the news feed (issue, program, or notice).
 * Shows author, time, content, status, image placeholder, and admin response.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.post - The post data object
 * @param {string} props.language - Current language ('en' or 'np')
 * @param {Object} props.t - Translation object
 */
function FeedCard(props) {
  // Destructure props
  const post = props.post;
  const language = props.language;
  const t = props.t;
  
  // Get styling for the post type (issue/program/notice)
  const typeStyle = getTypeStyle(post.type);
  
  // Get styling for the status (only for issues)
  let statusStyle = null;
  if (post.status) {
    statusStyle = getStatusStyle(post.status, t);
  }
  
  // Get the icon component for the post type
  const TypeIcon = typeStyle.icon;
  
  // Determine text content based on language
  const title = language === "en" ? post.title : post.titleNp;
  const description = language === "en" ? post.description : post.descriptionNp;
  const adminResponse = language === "en" ? post.adminResponse : post.adminResponseNp;
  
  // Calculate time ago string
  const timeAgo = getTimeAgo(post.timestamp, language);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header - Author info and time */}
      <div className="flex items-start gap-4 mb-4">
        {/* Author Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="text-gray-500" size={20} />
        </div>
        
        {/* Author Name, Time, Type Badge, and Ward */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-800">{post.author}</p>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* Post Type Badge */}
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
              <TypeIcon size={10} className="inline mr-1" />
              {post.type}
            </span>
            
            {/* Ward Badge (only if not 'all') */}
            {post.wardNumber !== "all" && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={10} />{t.ward} {post.wardNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      {/* Status Badge (only for issues) */}
      {statusStyle && (
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${statusStyle.bg} ${statusStyle.text} mb-4`}>
          <statusStyle.icon size={14} />
          {statusStyle.label}
        </div>
      )}

      {/* Show issue image when available */}
      {post.hasImage && post.imageUrl && (
        <div className="mb-4 bg-gray-100 rounded-xl overflow-hidden">
          <img
            src={getFeedImageUrl(post.imageUrl)}
            alt="Issue attachment"
            className="w-full h-52 object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              if (e.currentTarget.parentElement) {
                e.currentTarget.parentElement.innerHTML = '<div class="h-52 flex items-center justify-center text-gray-500 text-sm">Image unavailable</div>';
              }
            }}
          />
        </div>
      )}

      {/* Admin Response Section (shown if admin has responded) */}
      {post.adminResponse && (
        <div className="bg-emerald-50 rounded-xl p-3 border-l-4 border-emerald-500">
          <p className="text-sm text-emerald-800">{adminResponse}</p>
        </div>
      )}
    </div>
  );
}

/**
 * LoadingState Component
 * 
 * Displays a loading spinner while the feed is being fetched.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.t - Translation object
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
 * 
 * Displays an error message with a retry button.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.t - Translation object
 * @param {Function} props.onRetry - Function to call when retry is clicked
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
 * 
 * Displays a message when there are no posts in the feed.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.t - Translation object
 * @param {string} props.wardFilter - Current ward filter
 * @param {Object} props.currentUser - Current user object
 * @param {string} props.language - Current language
 */
function EmptyState(props) {
  const t = props.t;
  const wardFilter = props.wardFilter;
  const currentUser = props.currentUser;
  const language = props.language;
  
  // Create contextual message based on ward filter
  let message = t.noResultsDesc;
  if (wardFilter !== "all" && currentUser?.wardNumber) {
    message = language === "np" 
      ? `वडा ${wardFilter} मा अहिलेसम्म कुनै पोस्टहरू छैनन्। तपाईंको समुदायको रिपोर्टहरू र अपडेटहरू यहाँ देखिनेछन्।`
      : `No posts yet in Ward ${wardFilter}. Reports and updates from your community will appear here.`;
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
      <FileText className="mx-auto text-gray-300 mb-4" size={48} />
      <p className="text-gray-700 font-medium mb-2">{t.noResults}</p>
      <p className="text-gray-500 text-sm">{message}</p>
      <div className="mt-6 text-sm text-gray-400">
        {language === "np" ? (
          <p>यो क्षेत्रमा समस्या रिपोर्ट गर्नुहोस् र तपाईं पहिलो हुनुहोस्!</p>
        ) : (
          <p>Be the first to report an issue in this area!</p>
        )}
      </div>
    </div>
  );
}


// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * NewsFeed Component
 * 
 * The main component that displays the community news feed.
 * Shows issues, programs, and notices from the community.
 * 
 * Features:
 * - Filter by type (all, issues, programs, notices)
 * - Search posts by text
 * - Ward filter (admin only)
 * - Pull to refresh
 */
function NewsFeed() {
  // -------------------------------------------------------------------------
  // HOOKS AND CONTEXT
  // -------------------------------------------------------------------------
  
  // Get language settings
  const { language } = useLanguage();
  
  // Get current user
  const { currentUser } = useAuth();
  
  // Get translations
  const t = newsFeedText[language];

  // -------------------------------------------------------------------------
  // USER INFO
  // -------------------------------------------------------------------------
  
  // Get user's ward number from currentUser
  let userWard = 5;
  if (currentUser && currentUser.wardNumber) {
    userWard = currentUser.wardNumber;
  }
  
  // Check if user is an admin (can see all wards)
  let isAdmin = false;
  if (currentUser && (currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === ROLES.WARD_ADMIN)) {
    isAdmin = true;
  }

  // -------------------------------------------------------------------------
  // STATE VARIABLES
  // -------------------------------------------------------------------------
  
  // Current filter selection ('all', 'issues', 'campaigns', 'programs', 'notices')
  const [filter, setFilter] = useState("all");
  
  // Search query text
  const [searchQuery, setSearchQuery] = useState("");
  
  // Ward filter (admin can change, regular users see only their ward)
  const [wardFilter, setWardFilter] = useState(
    isAdmin ? "all" : userWard.toString()
  );

  // -------------------------------------------------------------------------
  // EFFECTS
  // -------------------------------------------------------------------------
  
  // Update ward filter when currentUser loads or changes
  useEffect(() => {
    if (currentUser) {
      const isUserAdmin = currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === ROLES.WARD_ADMIN;
      if (!isUserAdmin && currentUser.wardNumber) {
        setWardFilter(currentUser.wardNumber.toString());
      }
    }
  }, [currentUser]);

  // -------------------------------------------------------------------------
  // API PARAMETERS
  // -------------------------------------------------------------------------
  
  // Build API parameters from current state
  const apiParams = useMemo(function() {
    const params = {};
    
    // Add type filter if not 'all'
    if (filter !== "all") {
      params.type = filter;
    }
    
    // Add ward filter if not 'all'
    if (wardFilter !== "all") {
      params.ward = wardFilter;
    }
    
    // Add search query if not empty
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    return params;
  }, [filter, wardFilter, searchQuery]);

  // -------------------------------------------------------------------------
  // DATA FETCHING
  // -------------------------------------------------------------------------
  
  // Fetch feed from API
  const { feed, loading, error, refetch } = useFeed(apiParams);

  // Log for debugging
  useEffect(() => {
    if (error) {
      console.error('Feed error:', error);
    }
    if (feed) {
      console.log('Feed data received:', feed);
    }
  }, [error, feed]);

  // Fetch feed when component mounts or filters change
  useEffect(() => {
    refetch();
  }, [refetch]);

  // -------------------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------------------
  
  /**
   * Handle clicking the refresh button.
   */
  function handleRefresh() {
    refetch();
  }

  // -------------------------------------------------------------------------
  // FILTER TABS CONFIGURATION
  // -------------------------------------------------------------------------
  
  const filterTabs = [
    { id: "all", label: t.all },
    { id: "issues", label: t.issues },
    { id: "campaigns", label: t.campaigns },
    { id: "programs", label: t.programs },
    { id: "notices", label: t.notices },
  ];

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
          
          {/* Refresh Button */}
          <button 
            onClick={handleRefresh} 
            disabled={loading} 
            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {filterTabs.map(function(tab) {
            // Determine button styling based on whether this tab is active
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

        {/* Search and Ward Filter */}
        <div className="flex gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery} 
              onChange={function(e) { setSearchQuery(e.target.value); }} 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500" 
            />
          </div>
          
          {/* Ward Filter (admin only) */}
          {isAdmin && (
            <WardSelector 
              wardFilter={wardFilter} 
              setWardFilter={setWardFilter} 
              t={t} 
            />
          )}
        </div>
      </div>

      {/* Feed List Section */}
      <div className="space-y-4">
        {renderFeedList()}
      </div>
    </div>
  );
  
  /**
   * Helper function to render the feed list based on current state.
   */
  function renderFeedList() {
    // Show loading state while fetching
    if (loading) {
      return <LoadingState t={t} />;
    }
    
    // Show error state if fetch failed
    if (error) {
      return <ErrorState t={t} onRetry={refetch} />;
    }
    
    // Show empty state if no posts
    if (feed.length === 0) {
      return <EmptyState t={t} wardFilter={wardFilter} currentUser={currentUser} language={language} />;
    }
    
    // Render the list of feed cards using map
    return feed.map(function(post) {
      return (
        <FeedCard 
          key={post.id} 
          post={post} 
          language={language} 
          t={t} 
        />
      );
    });
  }
}

/**
 * WardSelector Component
 * 
 * Dropdown for admins to filter by ward.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.wardFilter - Current ward filter value
 * @param {Function} props.setWardFilter - Function to update ward filter
 * @param {Object} props.t - Translation object
 */
function WardSelector(props) {
  const wardFilter = props.wardFilter;
  const setWardFilter = props.setWardFilter;
  const t = props.t;
  
  // Build ward options using Array.from and map
  const wardOptions = Array.from({ length: DAMAK_TOTAL_WARDS }, function(_, index) {
    const ward = index + 1;
    return (
      <option key={ward} value={ward}>{t.ward} {ward}</option>
    );
  });
  
  return (
    <select 
      value={wardFilter} 
      onChange={function(e) { setWardFilter(e.target.value); }} 
      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
    >
      <option value="all">{t.allWards}</option>
      {wardOptions}
    </select>
  );
}

export default NewsFeed;
