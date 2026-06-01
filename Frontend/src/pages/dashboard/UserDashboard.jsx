import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/language/useLanguage";
import { useAuth } from "../../contexts/auth/useAuth";
import { useIssues } from "../../hooks/useData";
import {
  Camera,
  Image,
  User,
  FileText,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Newspaper,
  History,
  Shield,
  Upload,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Megaphone,
  BadgeCheck,
} from "lucide-react";
import ReportIssue from "../../components/dashboard/user/ReportIssue";
import UserProfile from "../../components/dashboard/user/UserProfile";
import MyHistory from "../../components/dashboard/user/MyHistory";
import NewsFeed from "../../components/dashboard/user/NewsFeed";
import RequestCampaign from "../../components/dashboard/user/RequestCampaign";
import { useNavigate } from "react-router-dom";

// ============================================================
// TEXT TRANSLATIONS
// Contains all text content in English and Nepali
// ============================================================
const dashboardText = {
  en: {
    brand: "NagarSewa",
    welcome: "Welcome back",
    dashboard: "Dashboard",
    reportIssue: "Report Issue",
    requestCampaign: "Request Campaign",
    profile: "Profile & KYC",
    history: "My History",
    newsFeed: "News Feed",
    settings: "Settings",
    logout: "Logout",
    quickStats: "Quick Stats",
    totalReports: "Total Reports",
    pending: "Pending",
    resolved: "Resolved",
    inProgress: "In Progress",
  },
  np: {
    brand: "नगरसेवा",
    welcome: "पुन: स्वागत छ",
    dashboard: "ड्यासबोर्ड",
    reportIssue: "समस्या रिपोर्ट",
    requestCampaign: "अभियान अनुरोध",
    profile: "प्रोफाइल र KYC",
    history: "मेरो इतिहास",
    newsFeed: "समाचार फिड",
    settings: "सेटिङहरू",
    logout: "लग आउट",
    quickStats: "द्रुत तथ्याङ्क",
    totalReports: "कुल रिपोर्टहरू",
    pending: "पेन्डिङ",
    resolved: "समाधान भएको",
    inProgress: "प्रगतिमा",
  },
};

// ============================================================
// USER DASHBOARD COMPONENT
// Main dashboard for regular users (citizens)
// ============================================================

/**
 * UserDashboard Component
 * Main dashboard interface for citizen users.
 * Provides access to issue reporting, profile, history, and notifications.
 * @returns {JSX.Element} The user dashboard page
 */
function UserDashboard() {
  // ============================================================
  // HOOKS AND CONTEXT
  // ============================================================
  const languageContext = useLanguage();
  const language = languageContext.language;
  const toggleLanguage = languageContext.toggleLanguage;
  
  const authContext = useAuth();
  const currentUser = authContext.currentUser;
  const logout = authContext.logout;
  const navigate = useNavigate();
  
  const t = dashboardText[language];
  
  // ============================================================
  // STATE VARIABLES
  // ============================================================
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ============================================================
  // REAL USER DATA FROM AUTH CONTEXT
  // ============================================================
  const user = {
    name: currentUser?.fullName || "User",
    email: currentUser?.email || "",
    avatar: null,
    location: `${currentUser?.jurisdiction?.municipality || "Damak"}, Ward ${currentUser?.wardNumber || "N/A"}`,
    isVerified: currentUser?.kycVerified || false,
  };

  // ============================================================
  // REAL STATS FROM API
  // ============================================================
  const { issues, refetch: refetchIssues } = useIssues({ user_id: currentUser?.id });
  
  const stats = {
    totalReports: issues.length || 0,
    pending: issues.filter(i => i.status === 'pending' || i.status === 'PENDING').length || 0,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'RESOLVED').length || 0,
    inProgress: issues.filter(i => i.status === 'in_progress' || i.status === 'IN_PROGRESS').length || 0,
  };
  
  // Refetch issues when switching to dashboard tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      refetchIssues();
    }
  }, [activeTab, refetchIssues]);

  // ============================================================
  // MENU ITEMS
  // ============================================================
  const menuItems = [
    { id: "dashboard", icon: Home, label: t.dashboard },
    { id: "report", icon: Camera, label: t.reportIssue },
    { id: "campaign", icon: Megaphone, label: t.requestCampaign },
    { id: "profile", icon: User, label: t.profile },
    { id: "history", icon: History, label: t.history },
    { id: "newsfeed", icon: Newspaper, label: t.newsFeed },
  ];

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  /**
   * Handle tab change.
   * @param {string} tabId - The ID of the tab to switch to
   */
  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  }

  /**
   * Toggle sidebar visibility.
   */
  function toggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  /**
   * Toggle mobile menu visibility.
   */
  function toggleMobileMenu() {
    setMobileMenuOpen(!mobileMenuOpen);
  }

  /**
   * Close mobile menu.
   */
  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  /**
   * Log out the user and clear session before redirect.
   */
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // ============================================================
  // CONTENT RENDERING
  // ============================================================

  /**
   * Render the appropriate content based on active tab.
   * @returns {JSX.Element} The content component for the active tab
   */
  function renderContent() {
    if (activeTab === "report") {
      return <ReportIssue onNavigate={handleTabChange} onIssueSubmitted={refetchIssues} />;
    }
    if (activeTab === "campaign") {
      return <RequestCampaign />;
    }
    if (activeTab === "profile") {
      return <UserProfile />;
    }
    if (activeTab === "history") {
      return <MyHistory />;
    }
    if (activeTab === "newsfeed") {
      return <NewsFeed />;
    }
    // Default to dashboard home
    return renderDashboardHome();
  }

  /**
   * Render navigation menu items.
   * @returns {JSX.Element[]} Array of menu button elements
   */
  function renderMenuItems() {
    return menuItems.map(function(item) {
      const IconComponent = item.icon;
      
      let buttonClass = "hover:bg-gray-100 text-gray-600";
      if (activeTab === item.id) {
        buttonClass = "bg-emerald-100 text-emerald-700";
      }
      
      return (
        <button
          key={item.id}
          onClick={function() { handleTabChange(item.id); }}
          className={"w-full flex items-center gap-3 px-4 py-3 rounded-xl transition " + buttonClass}
        >
          <IconComponent size={20} />
          {sidebarOpen && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </button>
      );
    });
  }

  /**
   * Get current tab label for header.
   * @returns {string} The label of the current tab
   */
  function getCurrentTabLabel() {
    const foundItem = menuItems.find(function(item) {
      return item.id === activeTab;
    });
    return foundItem ? foundItem.label : t.dashboard;
  }

  /**
   * Render the dashboard home content with stats and quick actions.
   * @returns {JSX.Element} The dashboard home layout
   */
  function renderDashboardHome() {
    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            {t.welcome}, {user.name}! 👋
            {user.isVerified && (
              <BadgeCheck size={24} className="text-white drop-shadow-lg" title="KYC Verified" />
            )}
          </h2>
          <p className="opacity-90 flex items-center gap-2">
            <MapPin size={16} />
            {user.location}
          </p>
          {!user.isVerified && (
            <div className="mt-4 bg-white/20 rounded-lg p-3 flex items-center gap-3">
              <Shield size={20} />
              <span className="text-sm">
                {language === "en"
                  ? "Complete your KYC verification to unlock all features"
                  : "सबै सुविधाहरू अनलक गर्न आफ्नो KYC प्रमाणीकरण पूरा गर्नुहोस्"}
              </span>
              <button
                onClick={function() { handleTabChange("profile"); }}
                className="ml-auto bg-white text-emerald-600 px-4 py-1 rounded-lg text-sm font-medium hover:bg-emerald-50 transition"
              >
                {language === "en" ? "Verify Now" : "अहिले प्रमाणित गर्नुहोस्"}
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.quickStats}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <FileText className="text-emerald-500" size={24} />
                <span className="text-2xl font-bold text-gray-800">{stats.totalReports}</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">{t.totalReports}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <Clock className="text-yellow-500" size={24} />
                <span className="text-2xl font-bold text-gray-800">{stats.pending}</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">{t.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <AlertCircle className="text-blue-500" size={24} />
                <span className="text-2xl font-bold text-gray-800">{stats.inProgress}</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">{t.inProgress}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <CheckCircle className="text-green-500" size={24} />
                <span className="text-2xl font-bold text-gray-800">{stats.resolved}</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">{t.resolved}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === "en" ? "Quick Actions" : "द्रुत कार्यहरू"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={function() { handleTabChange("report"); }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group text-left"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition">
                <Camera className="text-emerald-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800">
                {language === "en" ? "Report New Issue" : "नयाँ समस्या रिपोर्ट गर्नुहोस्"}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                {language === "en"
                  ? "Capture or upload photos of issues"
                  : "समस्याहरूको फोटो क्याप्चर वा अपलोड गर्नुहोस्"}
              </p>
            </button>
            <button
              onClick={function() { handleTabChange("history"); }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group text-left"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition">
                <History className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800">
                {language === "en" ? "View My Reports" : "मेरो रिपोर्टहरू हेर्नुहोस्"}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                {language === "en"
                  ? "Track status of your submissions"
                  : "तपाईंको सबमिशनहरूको स्थिति ट्र्याक गर्नुहोस्"}
              </p>
            </button>
            <button
              onClick={function() { handleTabChange("newsfeed"); }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition group text-left"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition">
                <Newspaper className="text-purple-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-800">
                {language === "en" ? "Community Feed" : "समुदाय फिड"}
              </h4>
              <p className="text-gray-500 text-sm mt-1">
                {language === "en"
                  ? "See reports from your area"
                  : "तपाईंको क्षेत्रबाट रिपोर्टहरू हेर्नुहोस्"}
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <img 
            src="/nagarsewalogo.jpeg" 
            alt="NagarSewa" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-bold text-emerald-600 text-xl">{t.brand}</span>
        </div>
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded-lg"
        >
          {language === "en" ? "नेपाली" : "English"}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={"fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 " +
          (mobileMenuOpen ? "translate-x-0" : "-translate-x-full") +
          " lg:translate-x-0 " +
          (sidebarOpen ? "w-64" : "w-20")}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img 
              src="/nagarsewalogo.jpeg" 
              alt="NagarSewa Logo" 
              className="w-10 h-10 rounded-lg object-cover shadow-sm"
            />
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-emerald-600 text-xl">{t.brand}</h1>
                <p className="text-xs text-gray-500">
                  {language === "en" ? "Citizen Portal" : "नागरिक पोर्टल"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="text-emerald-600" size={20} />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {renderMenuItems()}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-600 mb-2"
          >
            <Settings size={20} />
            {sidebarOpen && <span>{language === "en" ? "नेपाली" : "English"}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={"transition-all duration-300 " +
          (sidebarOpen ? "lg:ml-64" : "lg:ml-20") +
          " pt-16 lg:pt-0"}
      >
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between bg-white shadow-sm px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              {getCurrentTabLabel()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition"
            >
              {language === "en" ? "नेपाली" : "English"}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

export default UserDashboard;
