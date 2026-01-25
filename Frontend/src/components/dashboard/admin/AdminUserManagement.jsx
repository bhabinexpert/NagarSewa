import React, { useState } from "react";
import { useLanguage } from "../../../context/useLanguage";
import { useAuth } from "../../../context/useAuth";
import {
  Search,
  Filter,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  UserCheck,
  UserX,
  X,
  Download,
  Loader,
  Ban,
  RotateCcw,
} from "lucide-react";

const userManagementText = {
  en: {
    title: "User Management",
    subtitle: "Manage citizen accounts and KYC verification",
    all: "All Users",
    verified: "Verified",
    pendingKyc: "Pending KYC",
    rejected: "Rejected KYC",
    searchPlaceholder: "Search by name, email, or phone...",
    sortBy: "Sort by",
    newest: "Newest First",
    oldest: "Oldest First",
    viewProfile: "View Profile",
    verifyKyc: "Verify KYC",
    rejectKyc: "Reject KYC",
    citizenshipFront: "Citizenship (Front)",
    citizenshipBack: "Citizenship (Back)",
    personalInfo: "Personal Information",
    kycDocuments: "KYC Documents",
    approveKyc: "Approve KYC",
    rejectReason: "Rejection Reason",
    reasonPlaceholder: "Enter reason for rejection...",
    confirm: "Confirm",
    cancel: "Cancel",
    noUsers: "No users found",
    totalIssues: "Total Issues",
    joinedOn: "Joined on",
    download: "Download",
    kycStatus: "KYC Status",
    verifiedLabel: "Verified",
    pendingLabel: "Pending",
    rejectedLabel: "Rejected",
    notSubmitted: "Not Submitted",
    disableUser: "Disable Account",
    enableUser: "Enable Account",
    disabled: "Disabled",
    disabledUsers: "Disabled",
    disableConfirm: "Are you sure you want to disable this user account?",
    enableConfirm: "Are you sure you want to enable this user account?",
    disableSuccess: "User account has been disabled",
    enableSuccess: "User account has been enabled",
  },
  np: {
    title: "प्रयोगकर्ता व्यवस्थापन",
    subtitle: "नागरिक खाताहरू र KYC प्रमाणीकरण व्यवस्थापन गर्नुहोस्",
    all: "सबै प्रयोगकर्ताहरू",
    verified: "प्रमाणित",
    pendingKyc: "पेन्डिङ KYC",
    rejected: "अस्वीकृत KYC",
    searchPlaceholder: "नाम, इमेल, वा फोन द्वारा खोज्नुहोस्...",
    sortBy: "क्रमबद्ध गर्नुहोस्",
    newest: "नयाँ पहिले",
    oldest: "पुरानो पहिले",
    viewProfile: "प्रोफाइल हेर्नुहोस्",
    verifyKyc: "KYC प्रमाणित गर्नुहोस्",
    rejectKyc: "KYC अस्वीकार गर्नुहोस्",
    citizenshipFront: "नागरिकता (अगाडि)",
    citizenshipBack: "नागरिकता (पछाडि)",
    personalInfo: "व्यक्तिगत जानकारी",
    kycDocuments: "KYC कागजातहरू",
    approveKyc: "KYC स्वीकृत गर्नुहोस्",
    rejectReason: "अस्वीकृतिको कारण",
    reasonPlaceholder: "अस्वीकृतिको कारण प्रविष्ट गर्नुहोस्...",
    confirm: "पुष्टि गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    noUsers: "कुनै प्रयोगकर्ता भेटिएन",
    totalIssues: "कुल समस्याहरू",
    joinedOn: "सामेल भएको मिति",
    download: "डाउनलोड",
    kycStatus: "KYC स्थिति",
    verifiedLabel: "प्रमाणित",
    pendingLabel: "पेन्डिङ",
    rejectedLabel: "अस्वीकृत",
    notSubmitted: "पेश गरिएको छैन",
    disableUser: "खाता अक्षम गर्नुहोस्",
    enableUser: "खाता सक्रिय गर्नुहोस्",
    disabled: "अक्षम",
    disabledUsers: "अक्षम",
    disableConfirm: "के तपाईं यो प्रयोगकर्ता खाता अक्षम गर्न चाहनुहुन्छ?",
    enableConfirm: "के तपाईं यो प्रयोगकर्ता खाता सक्रिय गर्न चाहनुहुन्छ?",
    disableSuccess: "प्रयोगकर्ता खाता अक्षम गरिएको छ",
    enableSuccess: "प्रयोगकर्ता खाता सक्रिय गरिएको छ",
  },
};

// Mock users data
const mockUsers = [
  {
    id: 1,
    name: "Ram Bahadur Thapa",
    email: "ram.bahadur@example.com",
    phone: "+977 9841234567",
    address: "Thamel, Ward 5, Kathmandu",
    dob: "1990-05-15",
    gender: "Male",
    joinedOn: "2024-01-10",
    kycStatus: "pending",
    totalIssues: 5,
    isDisabled: false,
    citizenshipFront: "/placeholder-id-front.jpg",
    citizenshipBack: "/placeholder-id-back.jpg",
  },
  {
    id: 2,
    name: "Sita Sharma",
    email: "sita.sharma@example.com",
    phone: "+977 9851234567",
    address: "Baluwatar, Ward 4, Kathmandu",
    dob: "1985-08-20",
    gender: "Female",
    joinedOn: "2024-01-05",
    kycStatus: "verified",
    totalIssues: 8,
    isDisabled: false,
    citizenshipFront: "/placeholder-id-front.jpg",
    citizenshipBack: "/placeholder-id-back.jpg",
  },
  {
    id: 3,
    name: "Hari Prasad",
    email: "hari.prasad@example.com",
    phone: "+977 9861234567",
    address: "Lazimpat, Ward 3, Kathmandu",
    dob: "1992-03-10",
    gender: "Male",
    joinedOn: "2024-01-15",
    kycStatus: "pending",
    totalIssues: 3,
    isDisabled: false,
    citizenshipFront: "/placeholder-id-front.jpg",
    citizenshipBack: "/placeholder-id-back.jpg",
  },
  {
    id: 4,
    name: "Gita Thapa",
    email: "gita.thapa@example.com",
    phone: "+977 9871234567",
    address: "New Road, Ward 6, Kathmandu",
    dob: "1988-12-25",
    gender: "Female",
    joinedOn: "2024-01-08",
    kycStatus: "rejected",
    totalIssues: 2,
    isDisabled: false,
    rejectionReason: "Blurry citizenship image. Please resubmit.",
  },
  {
    id: 5,
    name: "Shyam Lama",
    email: "shyam.lama@example.com",
    phone: "+977 9881234567",
    address: "Baneshwor, Ward 10, Kathmandu",
    dob: "1995-07-18",
    gender: "Male",
    joinedOn: "2024-01-20",
    kycStatus: "notSubmitted",
    totalIssues: 1,
    isDisabled: false,
  },
  {
    id: 6,
    name: "Krishna Karki",
    email: "krishna.karki@example.com",
    phone: "+977 9891234567",
    address: "Biratnagar, Ward 2",
    dob: "1991-04-22",
    gender: "Male",
    joinedOn: "2024-01-02",
    kycStatus: "verified",
    totalIssues: 4,
    isDisabled: true,
    disabledAt: "2024-02-15",
    disabledReason: "Violation of community guidelines",
  },
];

const AdminUserManagement = () => {
  const { language } = useLanguage();
  const { disableUser, enableUser } = useAuth();
  const t = userManagementText[language];

  const [users, setUsers] = useState(mockUsers);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showEnableModal, setShowEnableModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [disableReason, setDisableReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const getKycStatusStyle = (status) => {
    switch (status) {
      case "verified":
        return { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle size={14} />, label: t.verifiedLabel };
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock size={14} />, label: t.pendingLabel };
      case "rejected":
        return { bg: "bg-red-100", text: "text-red-700", icon: <XCircle size={14} />, label: t.rejectedLabel };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", icon: <Shield size={14} />, label: t.notSubmitted };
    }
  };

  const filteredUsers = users
    .filter((user) => {
      if (filter === "all") return !user.isDisabled;
      if (filter === "verified") return user.kycStatus === "verified" && !user.isDisabled;
      if (filter === "pending") return user.kycStatus === "pending" && !user.isDisabled;
      if (filter === "rejected") return user.kycStatus === "rejected" && !user.isDisabled;
      if (filter === "disabled") return user.isDisabled === true;
      return true;
    })
    .filter((user) => {
      if (!searchQuery) return true;
      return (
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      );
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.joinedOn) - new Date(a.joinedOn);
      return new Date(a.joinedOn) - new Date(b.joinedOn);
    });

  const handleApproveKyc = async (userId) => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUsers(users.map((user) => (user.id === userId ? { ...user, kycStatus: "verified" } : user)));
    setIsProcessing(false);
    setShowKycModal(false);
    setSelectedUser(null);
  };

  const handleRejectKyc = async (userId) => {
    if (!rejectionReason) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUsers(users.map((user) => 
      user.id === userId ? { ...user, kycStatus: "rejected", rejectionReason } : user
    ));
    setIsProcessing(false);
    setShowRejectModal(false);
    setRejectionReason("");
    setSelectedUser(null);
  };

  const handleDisableUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Update local state
    setUsers(users.map((u) => 
      u.id === userId 
        ? { 
            ...u, 
            isDisabled: true, 
            disabledAt: new Date().toISOString().split('T')[0],
            disabledReason: disableReason || "Account disabled by administrator"
          } 
        : u
    ));
    
    // Also add to AuthContext disabled list (for login blocking)
    disableUser(user.email, disableReason || "Account disabled by administrator");
    
    setIsProcessing(false);
    setShowDisableModal(false);
    setDisableReason("");
    setSelectedUser(null);
  };

  const handleEnableUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Update local state
    setUsers(users.map((u) => 
      u.id === userId 
        ? { 
            ...u, 
            isDisabled: false, 
            disabledAt: null,
            disabledReason: null
          } 
        : u
    ));
    
    // Also remove from AuthContext disabled list
    enableUser(user.email);
    
    setIsProcessing(false);
    setShowEnableModal(false);
    setSelectedUser(null);
  };

  const filterTabs = [
    { id: "all", label: t.all, count: users.filter((u) => !u.isDisabled).length },
    { id: "verified", label: t.verified, count: users.filter((u) => u.kycStatus === "verified" && !u.isDisabled).length },
    { id: "pending", label: t.pendingKyc, count: users.filter((u) => u.kycStatus === "pending" && !u.isDisabled).length },
    { id: "rejected", label: t.rejected, count: users.filter((u) => u.kycStatus === "rejected" && !u.isDisabled).length },
    { id: "disabled", label: t.disabledUsers, count: users.filter((u) => u.isDisabled === true).length },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === tab.id
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${filter === tab.id ? "bg-white/20" : "bg-gray-200"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
          </select>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <User className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">{t.noUsers}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const kycStyle = getKycStatusStyle(user.kycStatus);
            const isExpanded = selectedUser === user.id;

            return (
              <div key={user.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* User Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedUser(isExpanded ? null : user.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="text-indigo-600" size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{user.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${kycStyle.bg} ${kycStyle.text}`}>
                            {kycStyle.icon}
                            {kycStyle.label}
                          </span>
                          {user.isDisabled && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 bg-red-100 text-red-700">
                              <Ban size={12} />
                              {t.disabled}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {user.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <p className="text-sm text-gray-500">{t.totalIssues}</p>
                        <p className="font-semibold text-gray-800">{user.totalIssues}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Info */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">{t.personalInfo}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{user.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>DOB: {user.dob}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span>{user.gender}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400" />
                            <span>{t.joinedOn}: {user.joinedOn}</span>
                          </div>
                        </div>
                      </div>

                      {/* KYC Documents */}
                      {user.kycStatus !== "notSubmitted" && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-3">{t.kycDocuments}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="border border-gray-200 rounded-lg p-3 text-center">
                              <FileText className="mx-auto text-gray-400 mb-2" size={24} />
                              <p className="text-xs text-gray-600">{t.citizenshipFront}</p>
                              <button className="mt-2 text-xs text-indigo-600 hover:underline flex items-center gap-1 mx-auto">
                                <Eye size={12} />
                                View
                              </button>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-3 text-center">
                              <FileText className="mx-auto text-gray-400 mb-2" size={24} />
                              <p className="text-xs text-gray-600">{t.citizenshipBack}</p>
                              <button className="mt-2 text-xs text-indigo-600 hover:underline flex items-center gap-1 mx-auto">
                                <Eye size={12} />
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {user.kycStatus === "rejected" && user.rejectionReason && (
                      <div className="mt-4 bg-red-50 rounded-xl p-3">
                        <p className="text-sm font-medium text-red-700 mb-1">{t.rejectReason}</p>
                        <p className="text-sm text-gray-700">{user.rejectionReason}</p>
                      </div>
                    )}

                    {/* Disabled Reason */}
                    {user.isDisabled && user.disabledReason && (
                      <div className="mt-4 bg-gray-100 rounded-xl p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {language === "en" ? "Disabled Reason" : "अक्षम कारण"}
                        </p>
                        <p className="text-sm text-gray-600">{user.disabledReason}</p>
                        {user.disabledAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            {language === "en" ? "Disabled on" : "अक्षम मिति"}: {user.disabledAt}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      {/* KYC Actions */}
                      {user.kycStatus === "pending" && !user.isDisabled && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(user.id);
                              setShowKycModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                          >
                            <UserCheck size={16} />
                            {t.approveKyc}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user.id);
                              setShowRejectModal(true);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                          >
                            <UserX size={16} />
                            {t.rejectKyc}
                          </button>
                        </>
                      )}

                      {/* Disable/Enable Actions */}
                      {user.isDisabled ? (
                        <button
                          onClick={() => {
                            setSelectedUser(user.id);
                            setShowEnableModal(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                          <RotateCcw size={16} />
                          {t.enableUser}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedUser(user.id);
                            setShowDisableModal(true);
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                        >
                          <Ban size={16} />
                          {t.disableUser}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Approve KYC Modal */}
      {showKycModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.approveKyc}</h3>
            <p className="text-gray-500 mb-6">
              {language === "en"
                ? "Are you sure you want to approve this user's KYC verification?"
                : "के तपाईं यस प्रयोगकर्ताको KYC प्रमाणीकरण स्वीकृत गर्न चाहनुहुन्छ?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowKycModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleApproveKyc(selectedUser)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject KYC Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.rejectKyc}</h3>
              <button onClick={() => setShowRejectModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.rejectReason}</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t.reasonPlaceholder}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleRejectKyc(selectedUser)}
                disabled={isProcessing || !rejectionReason}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader className="animate-spin" size={16} /> : <XCircle size={16} />}
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable User Modal */}
      {showDisableModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.disableUser}</h3>
              <button onClick={() => setShowDisableModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="text-red-600" size={32} />
            </div>
            <p className="text-gray-500 text-center mb-4">{t.disableConfirm}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === "en" ? "Reason (optional)" : "कारण (ऐच्छिक)"}
              </label>
              <textarea
                value={disableReason}
                onChange={(e) => setDisableReason(e.target.value)}
                placeholder={language === "en" ? "Enter reason for disabling..." : "अक्षम गर्ने कारण लेख्नुहोस्..."}
                rows={2}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDisableModal(false);
                  setDisableReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDisableUser(selectedUser)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader className="animate-spin" size={16} /> : <Ban size={16} />}
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enable User Modal */}
      {showEnableModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="text-indigo-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t.enableUser}</h3>
            <p className="text-gray-500 mb-6">{t.enableConfirm}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEnableModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleEnableUser(selectedUser)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
