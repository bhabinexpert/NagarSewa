import React from "react";
import { useLanguage } from "../../../context/useLanguage";
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
  Calendar,
  MapPin,
  PieChart,
  Activity,
} from "lucide-react";

const analyticsText = {
  en: {
    title: "Analytics Dashboard",
    subtitle: "Track performance metrics and issue resolution statistics",
    overview: "Overview",
    issuesByType: "Issues by Type",
    issuesByStatus: "Issues by Status",
    issuesByWard: "Issues by Ward",
    resolutionTime: "Resolution Time",
    monthlyTrends: "Monthly Trends",
    topIssues: "Top Issue Categories",
    userGrowth: "User Growth",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    change: "Change",
    avgResTime: "Avg. Resolution Time",
    totalReports: "Total Reports",
    resolvedRate: "Resolution Rate",
    activeUsers: "Active Users",
    newUsers: "New Users",
    days: "days",
    issues: "issues",
    users: "users",
  },
  np: {
    title: "विश्लेषण ड्यासबोर्ड",
    subtitle: "प्रदर्शन मेट्रिक्स र समस्या समाधान तथ्याङ्क ट्र्याक गर्नुहोस्",
    overview: "अवलोकन",
    issuesByType: "प्रकार अनुसार समस्याहरू",
    issuesByStatus: "स्थिति अनुसार समस्याहरू",
    issuesByWard: "वडा अनुसार समस्याहरू",
    resolutionTime: "समाधान समय",
    monthlyTrends: "मासिक प्रवृत्तिहरू",
    topIssues: "शीर्ष समस्या श्रेणीहरू",
    userGrowth: "प्रयोगकर्ता वृद्धि",
    thisMonth: "यो महिना",
    lastMonth: "गत महिना",
    change: "परिवर्तन",
    avgResTime: "औसत समाधान समय",
    totalReports: "कुल रिपोर्टहरू",
    resolvedRate: "समाधान दर",
    activeUsers: "सक्रिय प्रयोगकर्ताहरू",
    newUsers: "नयाँ प्रयोगकर्ताहरू",
    days: "दिन",
    issues: "समस्याहरू",
    users: "प्रयोगकर्ताहरू",
  },
};

// Mock analytics data
const analyticsData = {
  overview: {
    totalReports: { value: 156, change: 12, trend: "up" },
    resolvedRate: { value: 78, change: 5, trend: "up" },
    avgResTime: { value: 2.5, change: -0.5, trend: "down" },
    activeUsers: { value: 1250, change: 8, trend: "up" },
  },
  issuesByType: [
    { type: "Road Damage", typeNp: "सडक क्षति", count: 45, percentage: 29 },
    { type: "Water Supply", typeNp: "पानी आपूर्ति", count: 38, percentage: 24 },
    { type: "Street Light", typeNp: "सडक बत्ती", count: 28, percentage: 18 },
    { type: "Garbage", typeNp: "फोहोर", count: 25, percentage: 16 },
    { type: "Drainage", typeNp: "ढल निकास", count: 12, percentage: 8 },
    { type: "Other", typeNp: "अन्य", count: 8, percentage: 5 },
  ],
  issuesByStatus: [
    { status: "Pending", statusNp: "पेन्डिङ", count: 34, color: "yellow" },
    { status: "In Progress", statusNp: "प्रगतिमा", count: 28, color: "blue" },
    { status: "Resolved", statusNp: "समाधान", count: 89, color: "green" },
    { status: "Rejected", statusNp: "अस्वीकृत", count: 5, color: "red" },
  ],
  issuesByWard: [
    { ward: "Ward 3", count: 32 },
    { ward: "Ward 4", count: 28 },
    { ward: "Ward 5", count: 45 },
    { ward: "Ward 6", count: 25 },
    { ward: "Ward 7", count: 18 },
    { ward: "Ward 8", count: 8 },
  ],
  monthlyTrends: [
    { month: "Aug", reports: 85, resolved: 72 },
    { month: "Sep", reports: 92, resolved: 78 },
    { month: "Oct", reports: 110, resolved: 95 },
    { month: "Nov", reports: 128, resolved: 105 },
    { month: "Dec", reports: 145, resolved: 120 },
    { month: "Jan", reports: 156, resolved: 135 },
  ],
};

const AdminAnalytics = () => {
  const { language } = useLanguage();
  const t = analyticsText[language];

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="text-yellow-500" size={16} />;
      case "in progress":
        return <AlertCircle className="text-blue-500" size={16} />;
      case "resolved":
        return <CheckCircle className="text-green-500" size={16} />;
      case "rejected":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <FileText className="text-gray-500" size={16} />;
    }
  };

  // Helper function for status colors - used in status badges
  const _getStatusColor = (color) => {
    switch (color) {
      case "yellow":
        return "bg-yellow-500";
      case "blue":
        return "bg-blue-500";
      case "green":
        return "bg-green-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const maxWardCount = Math.max(...analyticsData.issuesByWard.map((w) => w.count));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="text-blue-600" size={20} />
            </div>
            <span
              className={`flex items-center text-sm ${
                analyticsData.overview.totalReports.trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {analyticsData.overview.totalReports.trend === "up" ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {analyticsData.overview.totalReports.change}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{analyticsData.overview.totalReports.value}</p>
          <p className="text-gray-500 text-sm">{t.totalReports}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <span
              className={`flex items-center text-sm ${
                analyticsData.overview.resolvedRate.trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {analyticsData.overview.resolvedRate.trend === "up" ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {analyticsData.overview.resolvedRate.change}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{analyticsData.overview.resolvedRate.value}%</p>
          <p className="text-gray-500 text-sm">{t.resolvedRate}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={20} />
            </div>
            <span
              className={`flex items-center text-sm ${
                analyticsData.overview.avgResTime.trend === "down" ? "text-green-500" : "text-red-500"
              }`}
            >
              {analyticsData.overview.avgResTime.trend === "down" ? (
                <TrendingDown size={14} />
              ) : (
                <TrendingUp size={14} />
              )}
              {Math.abs(analyticsData.overview.avgResTime.change)} {t.days}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {analyticsData.overview.avgResTime.value} {t.days}
          </p>
          <p className="text-gray-500 text-sm">{t.avgResTime}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={20} />
            </div>
            <span
              className={`flex items-center text-sm ${
                analyticsData.overview.activeUsers.trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {analyticsData.overview.activeUsers.trend === "up" ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              {analyticsData.overview.activeUsers.change}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{analyticsData.overview.activeUsers.value}</p>
          <p className="text-gray-500 text-sm">{t.activeUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Issues by Type */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-gray-800">{t.issuesByType}</h3>
          </div>
          <div className="space-y-3">
            {analyticsData.issuesByType.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">
                    {language === "en" ? item.type : item.typeNp}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-indigo-600 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues by Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-gray-800">{t.issuesByStatus}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {analyticsData.issuesByStatus.map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  item.color === "yellow"
                    ? "bg-yellow-50 border-yellow-500"
                    : item.color === "blue"
                    ? "bg-blue-50 border-blue-500"
                    : item.color === "green"
                    ? "bg-green-50 border-green-500"
                    : "bg-red-50 border-red-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(item.status)}
                  <span className="text-sm text-gray-600">
                    {language === "en" ? item.status : item.statusNp}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{item.count}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Ward */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-gray-800">{t.issuesByWard}</h3>
          </div>
          <div className="space-y-3">
            {analyticsData.issuesByWard.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">{item.ward}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-indigo-500 to-purple-500 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${(item.count / maxWardCount) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-indigo-600" size={20} />
            <h3 className="font-semibold text-gray-800">{t.monthlyTrends}</h3>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {analyticsData.monthlyTrends.map((item, index) => {
              const maxReports = Math.max(...analyticsData.monthlyTrends.map((m) => m.reports));
              const reportHeight = (item.reports / maxReports) * 100;
              const resolvedHeight = (item.resolved / maxReports) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 h-40">
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-indigo-500 rounded-t"
                        style={{ height: `${reportHeight}%` }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-end">
                      <div
                        className="bg-green-500 rounded-t"
                        style={{ height: `${resolvedHeight}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{item.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-indigo-500 rounded" />
              <span className="text-xs text-gray-600">
                {language === "en" ? "Reports" : "रिपोर्टहरू"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs text-gray-600">
                {language === "en" ? "Resolved" : "समाधान"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
