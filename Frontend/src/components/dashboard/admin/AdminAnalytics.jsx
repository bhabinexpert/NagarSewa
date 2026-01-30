// AdminAnalytics Component

import React from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAnalytics } from "../../../hooks/useData";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader,
} from "lucide-react";


// TRANSLATIONS


const analyticsText = {
  en: {
    title: "Analytics Dashboard",
    subtitle: "Track performance metrics and issue resolution statistics",
    overview: "Overview",
    issuesByType: "Issues by Type",
    issuesByStatus: "Issues by Status",
    issuesByWard: "Issues by Ward",
    monthlyTrends: "Monthly Trends",
    thisMonth: "This Month",
    change: "Change",
    avgResTime: "Avg. Resolution Time",
    totalReports: "Total Reports",
    resolvedRate: "Resolution Rate",
    activeUsers: "Active Users",
    days: "days",
    issues: "issues",
    users: "users",
    loading: "Loading analytics...",
    error: "Failed to load analytics",
    retry: "Retry",
    noData: "No analytics data available",
    reports: "Reports",
    resolved: "Resolved",
  },
  np: {
    title: "विश्लेषण ड्यासबोर्ड",
    subtitle: "प्रदर्शन मेट्रिक्स र समस्या समाधान तथ्याङ्क ट्र्याक गर्नुहोस्",
    overview: "अवलोकन",
    issuesByType: "प्रकार अनुसार समस्याहरू",
    issuesByStatus: "स्थिति अनुसार समस्याहरू",
    issuesByWard: "वडा अनुसार समस्याहरू",
    monthlyTrends: "मासिक प्रवृत्तिहरू",
    thisMonth: "यो महिना",
    change: "परिवर्तन",
    avgResTime: "औसत समाधान समय",
    totalReports: "कुल रिपोर्टहरू",
    resolvedRate: "समाधान दर",
    activeUsers: "सक्रिय प्रयोगकर्ताहरू",
    days: "दिन",
    issues: "समस्याहरू",
    users: "प्रयोगकर्ताहरू",
    loading: "विश्लेषण लोड हुँदैछ...",
    error: "विश्लेषण लोड गर्न असफल",
    retry: "पुन: प्रयास",
    noData: "कुनै विश्लेषण डेटा उपलब्ध छैन",
    reports: "रिपोर्टहरू",
    resolved: "समाधान",
  },
};


// HELPER FUNCTIONS


/**
 * Get status icon component based on status string.
 * @param {string} status - The status type
 * @returns {JSX.Element} Icon component
 */
function getStatusIcon(status) {
  const statusLower = status ? status.toLowerCase() : "";

  if (statusLower === "pending") {
    return <Clock className="text-yellow-500" size={16} />;
  } else if (statusLower === "in progress") {
    return <AlertCircle className="text-blue-500" size={16} />;
  } else if (statusLower === "resolved") {
    return <CheckCircle className="text-green-500" size={16} />;
  } else if (statusLower === "rejected") {
    return <XCircle className="text-red-500" size={16} />;
  } else {
    return <FileText className="text-gray-500" size={16} />;
  }
}

/**
 * Get status bar color class based on color string.
 * @param {string} color - The color name
 * @returns {string} CSS class for the color
 */
function getStatusBarColor(color) {
  if (color === "yellow") {
    return "bg-yellow-500";
  } else if (color === "blue") {
    return "bg-blue-500";
  } else if (color === "green") {
    return "bg-green-500";
  } else if (color === "red") {
    return "bg-red-500";
  } else {
    return "bg-gray-500";
  }
}


// SUB-COMPONENTS


/**
 * Loading state component.
 * @param {Object} props - Component props
 * @param {Object} props.t - Translation object
 * @returns {JSX.Element} Loading state element
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
 * Stat card component for overview metrics.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Stat card element
 */
function StatCard(props) {
  const Icon = props.icon;
  const iconBg = props.iconBg;
  const title = props.title;
  const value = props.value;
  const unit = props.unit;
  const change = props.change;
  const trend = props.trend;

  // Render trend indicator
  let trendElement = null;
  if (change !== undefined) {
    let trendClass = "flex items-center gap-1 text-sm ";
    if (trend === "up") {
      trendClass = trendClass + "text-green-600";
    } else {
      trendClass = trendClass + "text-red-600";
    }

    let trendIcon;
    if (trend === "up") {
      trendIcon = <TrendingUp size={16} />;
    } else {
      trendIcon = <TrendingDown size={16} />;
    }

    trendElement = (
      <div className={trendClass}>
        {trendIcon}
        {Math.abs(change)}%
      </div>
    );
  }

  // Render unit if provided
  let unitElement = null;
  if (unit) {
    unitElement = <span className="text-lg font-normal text-gray-500 ml-1">{unit}</span>;
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={"p-3 rounded-xl " + iconBg}>
          <Icon className="text-white" size={24} />
        </div>
        {trendElement}
      </div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value}
        {unitElement}
      </p>
    </div>
  );
}

/**
 * Simple bar chart component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Bar chart element
 */
function SimpleBarChart(props) {
  const data = props.data;
  const labelKey = props.labelKey;
  const valueKey = props.valueKey;
  const labelKeyNp = props.labelKeyNp;
  const language = props.language;
  const maxValueProp = props.maxValue;

  // Find max value using reduce
  let maxValue = maxValueProp;
  if (!maxValue) {
    maxValue = data.reduce(function(max, item) {
      return item[valueKey] > max ? item[valueKey] : max;
    }, 0);
  }

  // Render bars using map
  const bars = data.map(function(item, index) {
    // Determine label text based on language
    let labelText;
    if (language === "np" && item[labelKeyNp]) {
      labelText = item[labelKeyNp];
    } else {
      labelText = item[labelKey];
    }

    // Calculate bar width percentage
    const widthPercent = (item[valueKey] / maxValue) * 100;

    return (
      <div key={index}>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">{labelText}</span>
          <span className="font-medium text-gray-800">{item[valueKey]}</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: widthPercent + "%" }}
          />
        </div>
      </div>
    );
  });

  return <div className="space-y-3">{bars}</div>;
}

/**
 * Status distribution component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Status distribution element
 */
function StatusDistribution(props) {
  const data = props.data;
  const language = props.language;

  // Calculate total using reduce
  const total = data.reduce(function(sum, item) {
    return sum + item.count;
  }, 0);

  // Render status bars using map
  const statusBars = data.map(function(item, index) {
    // Determine label text based on language
    let labelText;
    if (language === "np" && item.statusNp) {
      labelText = item.statusNp;
    } else {
      labelText = item.status;
    }

    // Calculate width percentage
    const widthPercent = (item.count / total) * 100;

    // Get color class
    const colorClass = getStatusBarColor(item.color);

    return (
      <div key={index} className="flex items-center gap-3">
        {getStatusIcon(item.status)}
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">{labelText}</span>
            <span className="font-medium text-gray-800">{item.count}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={"h-full rounded-full " + colorClass}
              style={{ width: widthPercent + "%" }}
            />
          </div>
        </div>
      </div>
    );
  });

  return <div className="space-y-4">{statusBars}</div>;
}

/**
 * Trend chart component.
 * @param {Object} props - Component props
 * @returns {JSX.Element} Trend chart element
 */
function TrendChart(props) {
  const data = props.data;
  const t = props.t;

  // Find max reports value using reduce
  const maxReports = data.reduce(function(max, item) {
    return item.reports > max ? item.reports : max;
  }, 0);

  // Render bars using map
  const bars = data.map(function(item, index) {
    // Calculate heights
    const reportsHeight = (item.reports / maxReports) * 100;
    const resolvedHeight = (item.resolved / maxReports) * 100;

    return (
      <div key={index} className="flex-1 flex flex-col items-center gap-1">
        <div className="w-full flex gap-1 justify-center items-end h-24">
          <div
            className="w-3 bg-emerald-500 rounded-t"
            style={{ height: reportsHeight + "%" }}
          />
          <div
            className="w-3 bg-blue-500 rounded-t"
            style={{ height: resolvedHeight + "%" }}
          />
        </div>
        <span className="text-xs text-gray-500">{item.month}</span>
      </div>
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-sm mb-2">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-emerald-500 rounded" />
          {t.reports}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-500 rounded" />
          {t.resolved}
        </span>
      </div>
      <div className="flex items-end gap-2 h-32">{bars}</div>
    </div>
  );
}


// MAIN COMPONENT


/**
 * AdminAnalytics - Main component for analytics dashboard.
 * @returns {JSX.Element} The rendered component
 */
function AdminAnalytics() {
 
  // HOOKS AND CONTEXT


  const languageContext = useLanguage();
  const language = languageContext.language;
  const t = analyticsText[language];

  // Fetch analytics data from API
  const analyticsData = useAnalytics();
  const analytics = analyticsData.analytics;
  const loading = analyticsData.loading;
  const error = analyticsData.error;
  const refetch = analyticsData.refetch;

  
  // CONDITIONAL RENDERS
 

  // Loading state
  if (loading) {
    return <LoadingState t={t} />;
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
        <p className="text-gray-700 font-medium mb-2">{t.error}</p>
        <button onClick={refetch} className="text-emerald-600 hover:underline">
          {t.retry}
        </button>
      </div>
    );
  }

  // No data state
  if (!analytics) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
        <p className="text-gray-500">{t.noData}</p>
      </div>
    );
  }

  
  // DATA EXTRACTION
 

  const overview = analytics.overview;
  const issuesByType = analytics.issuesByType;
  const issuesByStatus = analytics.issuesByStatus;
  const issuesByWard = analytics.issuesByWard;
  const monthlyTrends = analytics.monthlyTrends;

 
  // RENDER
  

  // Render overview stats cards
  let overviewSection = null;
  if (overview) {
    // Extract overview values with defaults
    let totalReportsValue = 0;
    let totalReportsChange;
    let totalReportsTrend;
    if (overview.totalReports) {
      totalReportsValue = overview.totalReports.value || 0;
      totalReportsChange = overview.totalReports.change;
      totalReportsTrend = overview.totalReports.trend;
    }

    let resolvedRateValue = 0;
    let resolvedRateChange;
    let resolvedRateTrend;
    if (overview.resolvedRate) {
      resolvedRateValue = overview.resolvedRate.value || 0;
      resolvedRateChange = overview.resolvedRate.change;
      resolvedRateTrend = overview.resolvedRate.trend;
    }

    let avgResTimeValue = 0;
    let avgResTimeChange;
    let avgResTimeTrend;
    if (overview.avgResTime) {
      avgResTimeValue = overview.avgResTime.value || 0;
      avgResTimeChange = overview.avgResTime.change;
      // Invert trend for resolution time (lower is better)
      if (overview.avgResTime.trend === "down") {
        avgResTimeTrend = "up";
      } else {
        avgResTimeTrend = "down";
      }
    }

    let activeUsersValue = 0;
    let activeUsersChange;
    let activeUsersTrend;
    if (overview.activeUsers) {
      activeUsersValue = overview.activeUsers.value || 0;
      activeUsersChange = overview.activeUsers.change;
      activeUsersTrend = overview.activeUsers.trend;
    }

    overviewSection = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          iconBg="bg-blue-500"
          title={t.totalReports}
          value={totalReportsValue}
          change={totalReportsChange}
          trend={totalReportsTrend}
        />
        <StatCard
          icon={CheckCircle}
          iconBg="bg-green-500"
          title={t.resolvedRate}
          value={resolvedRateValue}
          unit="%"
          change={resolvedRateChange}
          trend={resolvedRateTrend}
        />
        <StatCard
          icon={Clock}
          iconBg="bg-orange-500"
          title={t.avgResTime}
          value={avgResTimeValue}
          unit={t.days}
          change={avgResTimeChange}
          trend={avgResTimeTrend}
        />
        <StatCard
          icon={Users}
          iconBg="bg-purple-500"
          title={t.activeUsers}
          value={activeUsersValue}
          change={activeUsersChange}
          trend={activeUsersTrend}
        />
      </div>
    );
  }

  // Render issues by type chart
  let issuesByTypeSection = null;
  if (issuesByType && issuesByType.length > 0) {
    issuesByTypeSection = (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.issuesByType}</h3>
        <SimpleBarChart
          data={issuesByType}
          labelKey="type"
          labelKeyNp="typeNp"
          valueKey="count"
          language={language}
        />
      </div>
    );
  }

  // Render issues by status chart
  let issuesByStatusSection = null;
  if (issuesByStatus && issuesByStatus.length > 0) {
    issuesByStatusSection = (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.issuesByStatus}</h3>
        <StatusDistribution data={issuesByStatus} language={language} />
      </div>
    );
  }

  // Render issues by ward chart
  let issuesByWardSection = null;
  if (issuesByWard && issuesByWard.length > 0) {
    issuesByWardSection = (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.issuesByWard}</h3>
        <SimpleBarChart
          data={issuesByWard}
          labelKey="ward"
          valueKey="count"
          language={language}
        />
      </div>
    );
  }

  // Render monthly trends chart
  let monthlyTrendsSection = null;
  if (monthlyTrends && monthlyTrends.length > 0) {
    monthlyTrendsSection = (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.monthlyTrends}</h3>
        <TrendChart data={monthlyTrends} t={t} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Overview Stats */}
      {overviewSection}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {issuesByTypeSection}
        {issuesByStatusSection}
        {issuesByWardSection}
        {monthlyTrendsSection}
      </div>
    </div>
  );
}

export default AdminAnalytics;
