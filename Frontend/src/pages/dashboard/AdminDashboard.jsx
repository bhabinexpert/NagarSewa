import React, { useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import { useAuth } from "../../context/useAuth";
import {
  Home,
  Users,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  BarChart3,
  Map,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  MessageSquare,
  UserCheck,
  UserX,
  Megaphone,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  UserPlus,
} from "lucide-react";
import AdminUserManagement from "../../components/dashboard/admin/AdminUserManagement";
import AdminNotificationBroadcast from "../../components/dashboard/admin/AdminNotificationBroadcast";
import AdminAnalytics from "../../components/dashboard/admin/AdminAnalytics";
import AdminCampaignManagement from "../../components/dashboard/admin/AdminCampaignManagement";
import SuperAdminPanel from "../../components/dashboard/admin/SuperAdminPanel";
import WardAdminIssues from "../../components/dashboard/admin/WardAdminIssues";
import SuperAdminIssues from "../../components/dashboard/admin/SuperAdminIssues";
import { Link, useNavigate } from "react-router-dom";

// ============================================================
// TEXT TRANSLATIONS
// Contains all text content in English and Nepali
// ============================================================
const adminDashboardText = {
  en: {
    brand: "NagarSewa",
    admin: "Admin Panel",
    superAdmin: "Super Admin",
    wardAdmin: "Ward Admin",
    welcome: "Welcome back",
    dashboard: "Dashboard",
    wardManagement: "Ward Admins",
    issues: "Issue Management",
    campaigns: "Campaign Requests",
    users: "User Management",
    notifications: "Broadcast",
    analytics: "Analytics",
    settings: "Settings",
    logout: "Logout",
    overview: "Overview",
    totalIssues: "Total Issues",
    pendingIssues: "Pending",
    resolvedIssues: "Resolved",
    totalUsers: "Total Users",
    verifiedUsers: "Verified Users",
    pendingKyc: "Pending KYC",
    recentIssues: "Recent Issues",
    quickActions: "Quick Actions",
    viewAll: "View All",
    todayStats: "Today's Stats",
    newReports: "New Reports",
    closedToday: "Closed Today",
    averageResTime: "Avg. Resolution Time",
    ward: "Ward",
    allWards: "All Wards",
    filterByWard: "Filter by Ward",
  },
  np: {
    brand: "नगरसेवा",
    admin: "प्रशासक प्यानल",
    superAdmin: "सुपर प्रशासक",
    wardAdmin: "वडा प्रशासक",
    welcome: "पुन: स्वागत छ",
    dashboard: "ड्यासबोर्ड",
    wardManagement: "वडा प्रशासकहरू",
    issues: "समस्या व्यवस्थापन",
    campaigns: "अभियान अनुरोधहरू",
    users: "प्रयोगकर्ता व्यवस्थापन",
    notifications: "प्रसारण",
    analytics: "विश्लेषण",
    settings: "सेटिङहरू",
    logout: "लग आउट",
    overview: "अवलोकन",
    totalIssues: "कुल समस्याहरू",
    pendingIssues: "पेन्डिङ",
    resolvedIssues: "समाधान भएको",
    totalUsers: "कुल प्रयोगकर्ताहरू",
    verifiedUsers: "प्रमाणित प्रयोगकर्ताहरू",
    pendingKyc: "पेन्डिङ KYC",
    recentIssues: "हालका समस्याहरू",
    quickActions: "द्रुत कार्यहरू",
    viewAll: "सबै हेर्नुहोस्",
    todayStats: "आजको तथ्याङ्क",
    newReports: "नयाँ रिपोर्टहरू",
    closedToday: "आज बन्द",
    averageResTime: "औसत समाधान समय",
    ward: "वडा",
    allWards: "सबै वडाहरू",
    filterByWard: "वडा अनुसार फिल्टर",
  },
};

// ============================================================
// ADMIN DASHBOARD COMPONENT
// Main dashboard for admin users (Super Admin and Ward Admin)
// ============================================================

/**
 * AdminDashboard Component
 * Main dashboard interface for administrators.
 * Provides access to issue management, user management, analytics, etc.
 * @returns {JSX.Element} The admin dashboard page
 */
function AdminDashboard() {
  // ============================================================
  // HOOKS AND CONTEXT
  // ============================================================
  const languageContext = useLanguage();
  const language = languageContext.language;
  const toggleLanguage = languageContext.toggleLanguage;
  
  const authContext = useAuth();
  const currentUser = authContext.currentUser;
  const isSuperAdmin = authContext.isSuperAdmin;
  const isWardAdmin = authContext.isWardAdmin;
  const logout = authContext.logout;
  const getUserWard = authContext.getUserWard;
  const DAMAK_TOTAL_WARDS = authContext.DAMAK_TOTAL_WARDS;
  
  const navigate = useNavigate();
  const t = adminDashboardText[language];
  
  // ============================================================
  // STATE VARIABLES
  // ============================================================
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wardFilter, setWardFilter] = useState("all"); // For super admin filtering

  // ============================================================
  // ADMIN INFO
  // ============================================================
  
  // Build admin info object
  let adminName = "Admin User";
  if (currentUser && currentUser.fullName) {
    adminName = currentUser.fullName;
  }
  
  let adminRole = t.wardAdmin;
  if (isSuperAdmin()) {
    adminRole = t.superAdmin;
  }
  
  let adminWard = "Damak Municipality";
  if (isWardAdmin()) {
    adminWard = t.ward + " " + getUserWard() + ", Damak";
  }
  
  const admin = {
    name: adminName,
    role: adminRole,
    ward: adminWard,
  };

  // ============================================================
  // MOCK DATA
  // ============================================================
  
  // Mock stats
  const stats = {
    totalIssues: 156,
    pending: 34,
    inProgress: 28,
    resolved: 89,
    rejected: 5,
    totalUsers: 1250,
    verifiedUsers: 980,
    pendingKyc: 45,
    newToday: 8,
    closedToday: 5,
    avgResolutionTime: "2.5 days",
  };

  // ============================================================
  // MENU ITEMS
  // Different menu items for super admin vs ward admin
  // ============================================================
  
  /**
   * Build menu items based on admin type.
   * @returns {Array} Array of menu item objects
   */
  function buildMenuItems() {
    const items = [];
    
    // Dashboard - available to all
    items.push({ id: "dashboard", icon: Home, label: t.dashboard });
    
    // Ward Management - only for super admin
    if (isSuperAdmin()) {
      items.push({ id: "wardManagement", icon: UserPlus, label: t.wardManagement });
    }
    
    // Issues - available to all with badge
    items.push({ id: "issues", icon: FileText, label: t.issues, badge: stats.pending });
    
    // Campaigns - available to all
    items.push({ id: "campaigns", icon: Megaphone, label: t.campaigns });
    
    // Users - available to all with badge
    items.push({ id: "users", icon: Users, label: t.users, badge: stats.pendingKyc });
    
    // Notifications - available to all
    items.push({ id: "notifications", icon: Bell, label: t.notifications });
    
    // Analytics - available to all
    items.push({ id: "analytics", icon: BarChart3, label: t.analytics });
    
    return items;
  }
  
  const menuItems = buildMenuItems();

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  /**
   * Handle user logout.
   * Logs out the user and redirects to login page.
   */
  function handleLogout() {
    logout();
    navigate("/login");
  }

  /**
   * Handle tab change.
   * @param {string} tabId - The ID of the tab to switch to
   */
  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  }

  /**
   * Handle ward filter change.
   * @param {Event} event - The select change event
   */
  function handleWardFilterChange(event) {
    setWardFilter(event.target.value);
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

  // ============================================================
  // CONTENT RENDERING
  // ============================================================

  /**
   * Render the appropriate content based on active tab.
   * @returns {JSX.Element} The content component for the active tab
   */
  function renderContent() {
    if (activeTab === "wardManagement") {
      if (isSuperAdmin()) {
        return <SuperAdminPanel />;
      } else {
        return renderDashboardHome();
      }
    }
    
    if (activeTab === "issues") {
      if (isSuperAdmin()) {
        return <SuperAdminIssues />;
      } else {
        return <WardAdminIssues />;
      }
    }
    
    if (activeTab === "campaigns") {
      return <AdminCampaignManagement wardFilter={wardFilter} isSuperAdmin={isSuperAdmin()} />;
    }
    
    if (activeTab === "users") {
      return <AdminUserManagement wardFilter={wardFilter} isSuperAdmin={isSuperAdmin()} />;
    }
    
    if (activeTab === "notifications") {
      return <AdminNotificationBroadcast />;
    }
    
    if (activeTab === "analytics") {
      return <AdminAnalytics wardFilter={wardFilter} isSuperAdmin={isSuperAdmin()} />;
    }
    
    // Default to dashboard home
    return renderDashboardHome();
  }

  /**
   * Build ward filter options for super admin.
   * @returns {JSX.Element[]} Array of option elements
   */
  function renderWardFilterOptions() {
    const options = [];
    
    // Add "All Wards" option
    options.push(
      <option key="all" value="all" className="text-gray-800">{t.allWards}</option>
    );
    
    // Add individual ward options
    for (let ward = 1; ward <= DAMAK_TOTAL_WARDS; ward++) {
      options.push(
        <option key={ward} value={ward} className="text-gray-800">
          {t.ward} {ward}
        </option>
      );
    }
    
    return options;
  }

  /**
   * Get status indicator class based on issue status.
   * @param {string} status - The issue status
   * @returns {string} CSS class for the indicator
   */
  function getStatusIndicatorClass(status) {
    if (status === "pending") {
      return "bg-yellow-500";
    }
    if (status === "inProgress") {
      return "bg-blue-500";
    }
    return "bg-green-500";
  }

  /**
   * Get status badge class based on issue status.
   * @param {string} status - The issue status
   * @returns {string} CSS class for the badge
   */
  function getStatusBadgeClass(status) {
    if (status === "pending") {
      return "bg-yellow-100 text-yellow-700";
    }
    if (status === "inProgress") {
      return "bg-blue-100 text-blue-700";
    }
    return "bg-green-100 text-green-700";
  }

  /**
   * Render the dashboard home content.
   * @returns {JSX.Element} The dashboard home layout
   */
  function renderDashboardHome() {
    // Sample recent issues data
    const recentIssues = [
      { id: "ISS-001", type: "Road Damage", status: "pending", time: "2h ago" },
      { id: "ISS-002", type: "Water Supply", status: "inProgress", time: "5h ago" },
      { id: "ISS-003", type: "Street Light", status: "resolved", time: "1d ago" },
    ];

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.welcome}, {admin.name} 👋</h2>
              <p className="opacity-90">{admin.role} • {admin.ward}</p>
            </div>
            {/* Ward Filter for Super Admin */}
            {isSuperAdmin() && (
              <div className="flex items-center gap-2">
                <label className="text-white/80 text-sm">{t.filterByWard}:</label>
                <select
                  value={wardFilter}
                  onChange={handleWardFilterChange}
                  className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {renderWardFilterOptions()}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.overview}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <span className="flex items-center text-green-500 text-sm">
                  <ArrowUp size={14} />
                  12%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalIssues}</p>
              <p className="text-gray-500 text-sm">{t.totalIssues}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="text-yellow-600" size={20} />
                </div>
                <span className="flex items-center text-red-500 text-sm">
                  <ArrowUp size={14} />
                  5%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              <p className="text-gray-500 text-sm">{t.pendingIssues}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="text-green-600" size={20} />
                </div>
                <span className="flex items-center text-green-500 text-sm">
                  <ArrowUp size={14} />
                  18%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
              <p className="text-gray-500 text-sm">{t.resolvedIssues}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="text-purple-600" size={20} />
                </div>
                <span className="flex items-center text-green-500 text-sm">
                  <ArrowUp size={14} />
                  8%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              <p className="text-gray-500 text-sm">{t.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.newReports}</p>
                <p className="text-2xl font-bold text-gray-800">{stats.newToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.closedToday}</p>
                <p className="text-2xl font-bold text-gray-800">{stats.closedToday}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{t.averageResTime}</p>
                <p className="text-2xl font-bold text-gray-800">{stats.avgResolutionTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.quickActions}</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={function() { handleTabChange("issues"); }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition group text-left"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-yellow-200 transition">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <p className="font-semibold text-gray-800">
                {language === "en" ? "Pending Issues" : "पेन्डिङ समस्याहरू"}
              </p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </button>
            <button
              onClick={function() { handleTabChange("users"); }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition group text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition">
                <Shield className="text-purple-600" size={20} />
              </div>
              <p className="font-semibold text-gray-800">
                {language === "en" ? "Pending KYC" : "पेन्डिङ KYC"}
              </p>
              <p className="text-2xl font-bold text-purple-600">{stats.pendingKyc}</p>
            </button>
            <button
              onClick={function() { handleTabChange("notifications"); }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition group text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition">
                <Megaphone className="text-blue-600" size={20} />
              </div>
              <p className="font-semibold text-gray-800">
                {language === "en" ? "Send Broadcast" : "प्रसारण पठाउनुहोस्"}
              </p>
              <p className="text-sm text-gray-500">
                {language === "en" ? "Notify citizens" : "नागरिकहरूलाई सूचित गर्नुहोस्"}
              </p>
            </button>
            <button
              onClick={function() { handleTabChange("analytics"); }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition group text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition">
                <BarChart3 className="text-green-600" size={20} />
              </div>
              <p className="font-semibold text-gray-800">
                {language === "en" ? "View Analytics" : "विश्लेषण हेर्नुहोस्"}
              </p>
              <p className="text-sm text-gray-500">
                {language === "en" ? "Performance reports" : "प्रदर्शन रिपोर्टहरू"}
              </p>
            </button>
          </div>
        </div>

        {/* Recent Issues Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">{t.recentIssues}</h3>
            <button
              onClick={function() { handleTabChange("issues"); }}
              className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
            >
              {t.viewAll}
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {renderRecentIssues(recentIssues)}
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render recent issues list.
   * @param {Array} issues - Array of issue objects
   * @returns {JSX.Element[]} Array of issue row elements
   */
  function renderRecentIssues(issues) {
    const issueElements = [];
    
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const indicatorClass = getStatusIndicatorClass(issue.status);
      const badgeClass = getStatusBadgeClass(issue.status);
      
      issueElements.push(
        <div key={issue.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={"w-2 h-2 rounded-full " + indicatorClass} />
            <div>
              <p className="font-medium text-gray-800">{issue.type}</p>
              <p className="text-sm text-gray-500">{issue.id}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={"px-2 py-1 rounded-full text-xs font-medium " + badgeClass}>
              {issue.status}
            </span>
            <p className="text-xs text-gray-400 mt-1">{issue.time}</p>
          </div>
        </div>
      );
    }
    
    return issueElements;
  }

  /**
   * Render navigation menu items.
   * @returns {JSX.Element[]} Array of menu button elements
   */
  function renderMenuItems() {
    const menuElements = [];
    
    for (let i = 0; i < menuItems.length; i++) {
      const item = menuItems[i];
      const IconComponent = item.icon;
      
      let buttonClass = "hover:bg-indigo-800 text-indigo-200";
      let badgeClass = "bg-red-500 text-white";
      
      if (activeTab === item.id) {
        buttonClass = "bg-white text-indigo-600";
        badgeClass = "bg-indigo-100 text-indigo-600";
      }
      
      menuElements.push(
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
                <span className={"text-xs px-2 py-0.5 rounded-full " + badgeClass}>
                  {item.badge}
                </span>
              )}
            </>
          )}
        </button>
      );
    }
    
    return menuElements;
  }

  /**
   * Get current tab label for header.
   * @returns {string} The label of the current tab
   */
  function getCurrentTabLabel() {
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].id === activeTab) {
        return menuItems[i].label;
      }
    }
    return t.dashboard;
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
            src="/nagarsewa.jpg" 
            alt="NagarSewa" 
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-bold text-indigo-600 text-xl">{t.brand}</span>
        </div>
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg"
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
        className={"fixed top-0 left-0 h-full bg-indigo-900 shadow-lg z-50 transition-transform duration-300 " +
          (mobileMenuOpen ? "translate-x-0" : "-translate-x-full") +
          " lg:translate-x-0 " +
          (sidebarOpen ? "w-64" : "w-20")}
      >
        {/* Logo */}
        <div className="p-6 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <img 
              src="/nagarsewa.jpg" 
              alt="NagarSewa Logo" 
              className="w-10 h-10 rounded-lg object-cover shadow-sm bg-white p-0.5"
            />
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-white text-xl">{t.brand}</h1>
                <p className="text-xs text-indigo-300">{t.admin}</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{admin.name}</p>
                <p className="text-xs text-indigo-300 truncate">{admin.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {renderMenuItems()}
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-800">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-indigo-800 text-indigo-200 mb-2"
          >
            <Settings size={20} />
            {sidebarOpen && <span>{language === "en" ? "नेपाली" : "English"}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-600 text-red-300"
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
              className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition"
            >
              {language === "en" ? "नेपाली" : "English"}
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

export default AdminDashboard;
