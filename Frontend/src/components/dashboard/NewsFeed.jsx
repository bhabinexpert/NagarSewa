import React, { useState } from "react";
import { useLanguage } from "../../context/useLanguage";
import { useAuth } from "../../context/useAuth";
import { DAMAK_TOTAL_WARDS, ROLES } from "../../context/authConstants";
import {
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  MessageSquare,
  Share2,
  Filter,
  Search,
  Image,
  User,
  XCircle,
  TrendingUp,
  RefreshCw,
  Megaphone,
  Building,
} from "lucide-react";

const newsFeedText = {
  en: {
    title: "Community News Feed",
    subtitle: "Track all reports and programs from your area",
    all: "All Posts",
    issues: "Issues",
    programs: "Programs",
    notices: "Notices",
    resolvedFilter: "Resolved",
    searchPlaceholder: "Search posts...",
    filterByArea: "Filter by Area",
    allAreas: "All Areas",
    postedBy: "Posted by",
    likes: "Likes",
    comments: "Comments",
    share: "Share",
    noResults: "No posts found",
    loading: "Loading...",
    refresh: "Refresh",
    trending: "Trending in your area",
    recentUpdates: "Recent Updates",
    status: "Status",
    pending: "Pending",
    inProgress: "In Progress",
    resolvedStatus: "Resolved",
    rejected: "Rejected",
    ward: "Ward",
    fromMunicipality: "From Municipality",
    yourWard: "Your Ward",
    allWards: "All Wards",
  },
  np: {
    title: "समुदाय समाचार फिड",
    subtitle: "तपाईंको क्षेत्रबाट सबै रिपोर्टहरू र कार्यक्रमहरू ट्र्याक गर्नुहोस्",
    all: "सबै पोस्टहरू",
    issues: "समस्याहरू",
    programs: "कार्यक्रमहरू",
    notices: "सूचनाहरू",
    resolvedFilter: "समाधान भएको",
    searchPlaceholder: "पोस्टहरू खोज्नुहोस्...",
    filterByArea: "क्षेत्र अनुसार फिल्टर गर्नुहोस्",
    allAreas: "सबै क्षेत्रहरू",
    postedBy: "पोस्ट गर्ने",
    likes: "मन पराउनुहोस्",
    comments: "टिप्पणीहरू",
    share: "साझा गर्नुहोस्",
    noResults: "कुनै पोस्टहरू भेटिएन",
    loading: "लोड हुँदैछ...",
    refresh: "रिफ्रेश",
    trending: "तपाईंको क्षेत्रमा ट्रेन्डिङ",
    recentUpdates: "हालका अद्यावधिकहरू",
    status: "स्थिति",
    pending: "पेन्डिङ",
    inProgress: "प्रगतिमा",
    resolvedStatus: "समाधान भएको",
    rejected: "अस्वीकृत",
    ward: "वडा",
    fromMunicipality: "नगरपालिकाबाट",
    yourWard: "तपाईंको वडा",
    allWards: "सबै वडाहरू",
  },
};

// Mock community feed data with ward numbers
const mockFeedData = [
  {
    id: 1,
    type: "issue",
    wardNumber: 5,
    author: "Sita Sharma",
    authorAvatar: null,
    title: "Broken Water Pipeline in Main Road",
    titleNp: "मुख्य सडकमा भाँचिएको पानी पाइपलाइन",
    description: "Water leaking from main pipeline near the school. Wasting a lot of water daily. Immediate repair needed.",
    descriptionNp: "स्कूल नजिक मुख्य पाइपलाइनबाट पानी चुहावट। दैनिक धेरै पानी खेर जाँदैछ। तत्काल मर्मत आवश्यक।",
    location: "Ward 5, Damak",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "inProgress",
    likes: 45,
    comments: 12,
    hasImage: true,
    adminResponse: "Repair team dispatched. Work in progress.",
    adminResponseNp: "मर्मत टोली पठाइएको। काम प्रगतिमा।",
  },
  {
    id: 2,
    type: "notice",
    wardNumber: "all", // From super admin - visible to all
    author: "Damak Municipality",
    authorAvatar: null,
    title: "Municipal Tax Payment Deadline Extended",
    titleNp: "नगरपालिका कर भुक्तानी म्याद थप",
    description: "The deadline for annual municipal tax payment has been extended to March 31. All residents are requested to pay before the deadline.",
    descriptionNp: "वार्षिक नगरपालिका कर भुक्तानी को म्याद मार्च 31 सम्म थप गरिएको छ। सबै बासिन्दाहरूलाई म्याद अघि भुक्तानी गर्न अनुरोध।",
    location: "All Wards",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: null,
    likes: 89,
    comments: 23,
    hasImage: false,
  },
  {
    id: 3,
    type: "program",
    wardNumber: 5,
    author: "Ward 5 Office",
    authorAvatar: null,
    title: "Free Health Camp - January 30",
    titleNp: "निःशुल्क स्वास्थ्य शिविर - जनवरी 30",
    description: "Free health checkup camp organized by ward office. Services include general checkup, eye test, and dental consultation.",
    descriptionNp: "वडा कार्यालयद्वारा आयोजित निःशुल्क स्वास्थ्य जाँच शिविर। सेवाहरूमा सामान्य जाँच, आँखा जाँच, र दन्त परामर्श समावेश छ।",
    location: "Ward 5 Community Hall",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: null,
    likes: 128,
    comments: 34,
    hasImage: true,
  },
  {
    id: 4,
    type: "issue",
    wardNumber: 3,
    author: "Ram Kumar",
    authorAvatar: null,
    title: "Street Light Not Working",
    titleNp: "सडक बत्ती काम गरिरहेको छैन",
    description: "Street light at the corner of main chowk has been not working for 2 weeks. Very dark and unsafe at night.",
    descriptionNp: "मुख्य चोकको कुनामा सडक बत्ती २ हप्तादेखि काम गरिरहेको छैन। राती धेरै अँध्यारो र असुरक्षित।",
    location: "Ward 3, Damak",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "resolved",
    likes: 23,
    comments: 8,
    hasImage: false,
    adminResponse: "Fixed on 24th January. Thank you for reporting.",
    adminResponseNp: "24 जनवरीमा मर्मत गरियो। रिपोर्ट गर्नुभएकोमा धन्यवाद।",
  },
  {
    id: 5,
    type: "issue",
    wardNumber: 5,
    author: "Gita Thapa",
    authorAvatar: null,
    title: "Garbage Pile Up in Street Corner",
    titleNp: "सडक कुनामा फोहोर जम्मा",
    description: "Garbage has been piling up for days. Creating health hazards and bad smell in the neighborhood.",
    descriptionNp: "दिनौंदेखि फोहोर जम्मा भइरहेको छ। छिमेकमा स्वास्थ्य जोखिम र नराम्रो गन्ध उत्पन्न गर्दैछ।",
    location: "Ward 5, Damak",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "pending",
    likes: 67,
    comments: 25,
    hasImage: true,
  },
  {
    id: 6,
    type: "notice",
    wardNumber: 3,
    author: "Ward 3 Admin",
    authorAvatar: null,
    title: "Ward 3 Road Maintenance Notice",
    titleNp: "वडा 3 सडक मर्मत सूचना",
    description: "Road maintenance work in Ward 3 will be conducted from Feb 1-5. Expect minor traffic disruptions.",
    descriptionNp: "वडा 3 मा सडक मर्मत कार्य फेब्रुअरी 1-5 सम्म हुनेछ। केही ट्राफिक अवरोध हुन सक्छ।",
    location: "Ward 3",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: null,
    likes: 34,
    comments: 12,
    hasImage: false,
  },
  {
    id: 7,
    type: "program",
    wardNumber: "all",
    author: "Damak Municipality",
    authorAvatar: null,
    title: "Tree Plantation Campaign",
    titleNp: "वृक्षारोपण अभियान",
    description: "Municipality-wide tree plantation campaign on Environment Day. All wards are requested to participate.",
    descriptionNp: "वातावरण दिवसमा नगरपालिका व्यापी वृक्षारोपण अभियान। सबै वडाहरूलाई सहभागी हुन अनुरोध।",
    location: "All Wards",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: null,
    likes: 156,
    comments: 42,
    hasImage: true,
  },
];

const NewsFeed = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = newsFeedText[language];

  // Get user's ward - for regular users this filters content
  const userWard = user?.ward || 5; // Default to ward 5 for demo
  const isAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.WARD_ADMIN;

  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [wardFilter, setWardFilter] = useState(isAdmin ? "all" : userWard.toString());
  const [likedPosts, setLikedPosts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return language === "en" ? `${minutes}m ago` : `${minutes} मिनेट अगाडि`;
    } else if (hours < 24) {
      return language === "en" ? `${hours}h ago` : `${hours} घण्टा अगाडि`;
    } else {
      return language === "en" ? `${days}d ago` : `${days} दिन अगाडि`;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: <Clock size={14} />,
          label: t.pending,
        };
      case "inProgress":
        return {
          bg: "bg-blue-100",
          text: "text-blue-700",
          icon: <AlertCircle size={14} />,
          label: t.inProgress,
        };
      case "resolved":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: <CheckCircle size={14} />,
          label: t.resolvedStatus,
        };
      case "rejected":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: <XCircle size={14} />,
          label: t.rejected,
        };
      default:
        return null;
    }
  };

  const handleLike = (postId) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const filteredFeed = mockFeedData
    // First, filter by ward visibility
    .filter((post) => {
      // Posts with wardNumber === "all" are visible to everyone (from super admin)
      if (post.wardNumber === "all") return true;
      
      // For regular users: only show posts from their ward
      if (!isAdmin) {
        return post.wardNumber === userWard;
      }
      
      // For admins with ward filter
      if (wardFilter === "all") return true;
      return post.wardNumber.toString() === wardFilter;
    })
    .filter((post) => {
      if (filter === "all") return true;
      if (filter === "issues") return post.type === "issue";
      if (filter === "programs") return post.type === "program";
      if (filter === "notices") return post.type === "notice";
      if (filter === "resolved") return post.status === "resolved";
      return true;
    })
    .filter((post) => {
      if (!searchQuery) return true;
      const title = language === "en" ? post.title : post.titleNp;
      const desc = language === "en" ? post.description : post.descriptionNp;
      return (
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp); // Sort by newest first

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
            <p className="text-gray-500">{t.subtitle}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition"
          >
            <RefreshCw className={`${isRefreshing ? "animate-spin" : ""}`} size={20} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: t.all },
            { id: "issues", label: t.issues },
            { id: "programs", label: t.programs },
            { id: "notices", label: t.notices },
            { id: "resolved", label: t.resolvedFilter },
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {/* Ward Filter - Only for admins */}
          {isAdmin && (
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t.allWards}</option>
              {Array.from({ length: DAMAK_TOTAL_WARDS }, (_, i) => i + 1).map((ward) => (
                <option key={ward} value={ward}>
                  {t.ward} {ward}
                </option>
              ))}
            </select>
          )}
          {/* Show current ward indicator for regular users */}
          {!isAdmin && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <MapPin size={16} />
              <span className="font-medium">{t.yourWard}: {userWard}</span>
            </div>
          )}
        </div>
      </div>

      {/* Trending Section */}
      <div className="bg-linear-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-2 text-white mb-3">
          <TrendingUp size={20} />
          <span className="font-semibold">{t.trending}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {mockFeedData
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 3)
            .map((post) => (
              <div
                key={post.id}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-3 min-w-[200px] text-white"
              >
                <p className="font-medium text-sm line-clamp-2">
                  {language === "en" ? post.title : post.titleNp}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs opacity-80">
                  <ThumbsUp size={12} />
                  <span>{post.likes}</span>
                  <MessageSquare size={12} className="ml-2" />
                  <span>{post.comments}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Feed */}
      {filteredFeed.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <Search className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">{t.noResults}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeed.map((post) => {
            const statusStyle = post.status ? getStatusStyle(post.status) : null;
            const isLiked = likedPosts.includes(post.id);

            return (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Post Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="text-emerald-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{post.author}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{getTimeAgo(post.timestamp)}</span>
                          <span>•</span>
                          <MapPin size={12} />
                          <span>{post.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Ward Badge */}
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full flex items-center gap-1">
                        <MapPin size={10} />
                        {post.wardNumber === "all" 
                          ? t.allWards 
                          : `${t.ward} ${post.wardNumber}`}
                      </span>
                      {post.type === "program" && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          {language === "en" ? "Program" : "कार्यक्रम"}
                        </span>
                      )}
                      {post.type === "notice" && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                          <Megaphone size={12} />
                          {language === "en" ? "Notice" : "सूचना"}
                        </span>
                      )}
                      {statusStyle && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.icon}
                          {statusStyle.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {language === "en" ? post.title : post.titleNp}
                  </h3>
                  <p className="text-gray-600">
                    {language === "en" ? post.description : post.descriptionNp}
                  </p>

                  {/* Image Placeholder */}
                  {post.hasImage && (
                    <div className="mt-4 bg-gray-100 rounded-xl h-48 flex items-center justify-center">
                      <Image className="text-gray-300" size={48} />
                    </div>
                  )}

                  {/* Admin Response */}
                  {post.adminResponse && (
                    <div className="mt-4 bg-emerald-50 rounded-xl p-3 border-l-4 border-emerald-500">
                      <p className="text-xs font-medium text-emerald-700 mb-1">
                        {language === "en" ? "Official Response" : "आधिकारिक प्रतिक्रिया"}
                      </p>
                      <p className="text-sm text-gray-700">
                        {language === "en" ? post.adminResponse : post.adminResponseNp}
                      </p>
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition ${
                        isLiked
                          ? "bg-emerald-100 text-emerald-600"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      <ThumbsUp size={18} className={isLiked ? "fill-current" : ""} />
                      <span className="text-sm font-medium">
                        {post.likes + (isLiked ? 1 : 0)}
                      </span>
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                      <MessageSquare size={18} />
                      <span className="text-sm font-medium">{post.comments}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 text-gray-600 transition">
                    <Share2 size={18} />
                    <span className="text-sm">{t.share}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
