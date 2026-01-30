/**
 * SuperAdminPanel Component
 *
 * Ward admin management panel for Super Admin.
 * Allows creating, viewing, and managing ward administrators
 * for Damak Municipality.
 *
 * @component
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import {
  UserPlus,
  Users,
  Shield,
  Mail,
  Phone,
  MapPin,
  Check,
  X,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  User,
  Lock,
} from "lucide-react";
import { toast } from "react-toastify";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const panelText = {
  en: {
    title: "Ward Admin Management",
    subtitle: "Assign and manage ward administrators for Damak Municipality",
    createAdmin: "Create Ward Admin",
    wardAdmins: "Ward Administrators",
    noAdmins: "No ward admins assigned yet",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter admin's full name",
    email: "Email Address",
    emailPlaceholder: "admin@damak.gov.np",
    phone: "Phone Number",
    phonePlaceholder: "98XXXXXXXX",
    selectWard: "Select Ward",
    wardPlaceholder: "Choose ward to assign",
    password: "Password",
    passwordPlaceholder: "Secure password (min 8 chars)",
    create: "Create Admin",
    creating: "Creating...",
    cancel: "Cancel",
    edit: "Edit",
    deactivate: "Deactivate",
    reactivate: "Reactivate",
    delete: "Delete",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    ward: "Ward",
    assignedOn: "Assigned On",
    actions: "Actions",
    searchPlaceholder: "Search admins...",
    filterByStatus: "Filter by Status",
    all: "All",
    activeOnly: "Active Only",
    inactiveOnly: "Inactive Only",
    wardsWithoutAdmin: "Wards Without Admin",
    confirmDeactivate: "Are you sure you want to deactivate this admin?",
    successCreate: "Ward admin created successfully!",
    successUpdate: "Ward admin updated successfully!",
    successDeactivate: "Ward admin deactivated!",
    successReactivate: "Ward admin reactivated!",
    errorRequired: "Please fill all required fields",
    errorWardAssigned: "This ward already has an active admin",
    errorEmailExists: "This email is already registered",
    totalAdmins: "Total Admins",
    activeAdmins: "Active Admins",
    inactiveAdmins: "Inactive Admins",
    unassignedWards: "Unassigned Wards",
  },
  np: {
    title: "वडा प्रशासक व्यवस्थापन",
    subtitle: "दमक नगरपालिकाका लागि वडा प्रशासकहरू नियुक्त र व्यवस्थापन गर्नुहोस्",
    createAdmin: "वडा प्रशासक सिर्जना गर्नुहोस्",
    wardAdmins: "वडा प्रशासकहरू",
    noAdmins: "अहिलेसम्म कुनै वडा प्रशासक नियुक्त गरिएको छैन",
    fullName: "पुरा नाम",
    fullNamePlaceholder: "प्रशासकको पुरा नाम प्रविष्ट गर्नुहोस्",
    email: "इमेल ठेगाना",
    emailPlaceholder: "admin@damak.gov.np",
    phone: "फोन नम्बर",
    phonePlaceholder: "९८XXXXXXXX",
    selectWard: "वडा छान्नुहोस्",
    wardPlaceholder: "नियुक्त गर्न वडा छान्नुहोस्",
    password: "पासवर्ड",
    passwordPlaceholder: "सुरक्षित पासवर्ड (न्यूनतम ८ अक्षर)",
    create: "प्रशासक सिर्जना गर्नुहोस्",
    creating: "सिर्जना हुँदैछ...",
    cancel: "रद्द गर्नुहोस्",
    edit: "सम्पादन",
    deactivate: "निष्क्रिय गर्नुहोस्",
    reactivate: "पुन: सक्रिय गर्नुहोस्",
    delete: "मेट्नुहोस्",
    status: "स्थिति",
    active: "सक्रिय",
    inactive: "निष्क्रिय",
    ward: "वडा",
    assignedOn: "नियुक्त मिति",
    actions: "कार्यहरू",
    searchPlaceholder: "प्रशासकहरू खोज्नुहोस्...",
    filterByStatus: "स्थिति अनुसार फिल्टर गर्नुहोस्",
    all: "सबै",
    activeOnly: "सक्रिय मात्र",
    inactiveOnly: "निष्क्रिय मात्र",
    wardsWithoutAdmin: "प्रशासक बिनाको वडाहरू",
    confirmDeactivate: "के तपाईं यो प्रशासकलाई निष्क्रिय गर्न चाहनुहुन्छ?",
    successCreate: "वडा प्रशासक सफलतापूर्वक सिर्जना भयो!",
    successUpdate: "वडा प्रशासक सफलतापूर्वक अपडेट भयो!",
    successDeactivate: "वडा प्रशासक निष्क्रिय भयो!",
    successReactivate: "वडा प्रशासक पुन: सक्रिय भयो!",
    errorRequired: "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्",
    errorWardAssigned: "यो वडामा पहिले नै सक्रिय प्रशासक छ",
    errorEmailExists: "यो इमेल पहिले नै दर्ता भइसकेको छ",
    totalAdmins: "कुल प्रशासकहरू",
    activeAdmins: "सक्रिय प्रशासकहरू",
    inactiveAdmins: "निष्क्रिय प्रशासकहरू",
    unassignedWards: "नियुक्त नभएका वडाहरू",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Count active admins from the admin list.
 * @param {Array} adminList - List of ward admins
 * @returns {number} Count of active admins
 */
function countActiveAdmins(adminList) {
  return adminList.filter(function(admin) {
    return admin.isActive;
  }).length;
}

/**
 * Count inactive admins from the admin list.
 * @param {Array} adminList - List of ward admins
 * @returns {number} Count of inactive admins
 */
function countInactiveAdmins(adminList) {
  return adminList.filter(function(admin) {
    return !admin.isActive;
  }).length;
}

/**
 * Filter admins based on search query and status filter.
 * @param {Array} adminList - List of ward admins
 * @param {string} searchQuery - Search text
 * @param {string} statusFilter - Status filter value (all, active, inactive)
 * @returns {Array} Filtered list of admins
 */
function filterAdmins(adminList, searchQuery, statusFilter) {
  return adminList.filter(function(admin) {
    // Check if admin matches search query
    const fullNameLower = admin.fullName.toLowerCase();
    const emailLower = admin.email.toLowerCase();
    const wardString = admin.wardNumber.toString();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      fullNameLower.includes(searchLower) ||
      emailLower.includes(searchLower) ||
      wardString.includes(searchQuery);

    // Check if admin matches status filter
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "active" && admin.isActive) {
      matchesStatus = true;
    } else if (statusFilter === "inactive" && !admin.isActive) {
      matchesStatus = true;
    }

    // Include if both conditions match
    return matchesSearch && matchesStatus;
  });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SuperAdminPanel - Main component for ward admin management.
 * @returns {JSX.Element} The rendered component
 */
function SuperAdminPanel() {
  // ============================================================================
  // HOOKS AND CONTEXT
  // ============================================================================

  const languageContext = useLanguage();
  const language = languageContext.language;
  const t = panelText[language];

  const authContext = useAuth();
  const getWardAdmins = authContext.getWardAdmins;
  const getWardsWithoutAdmin = authContext.getWardsWithoutAdmin;
  const createWardAdmin = authContext.createWardAdmin;
  const deactivateWardAdmin = authContext.deactivateWardAdmin;
  const reactivateWardAdmin = authContext.reactivateWardAdmin;

  // ============================================================================
  // STATE
  // ============================================================================

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    wardNumber: "",
    password: "",
  });

  // ============================================================================
  // DATA
  // ============================================================================

  const wardAdmins = getWardAdmins();
  const wardsWithoutAdmin = getWardsWithoutAdmin();

  // Calculate stats
  const totalAdmins = wardAdmins.length;
  const activeAdmins = countActiveAdmins(wardAdmins);
  const inactiveAdmins = countInactiveAdmins(wardAdmins);

  // Get filtered admins
  const filteredAdmins = filterAdmins(wardAdmins, searchQuery, statusFilter);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle input field changes in the form.
   * @param {Event} e - The input change event
   */
  function handleInputChange(e) {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;

    setFormData(function (previousData) {
      const newData = {
        fullName: previousData.fullName,
        email: previousData.email,
        phone: previousData.phone,
        wardNumber: previousData.wardNumber,
      };
      newData[fieldName] = fieldValue;
      return newData;
    });
  }

  /**
   * Handle creating a new ward admin.
   * Validates form data and submits to the API.
   */
  async function handleCreateAdmin() {
    // Validate required fields including password
    if (!formData.fullName || !formData.email || !formData.wardNumber || !formData.password) {
      toast.error(t.errorRequired, { position: "top-right" });
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long", { position: "top-right" });
      return;
    }

    setIsSubmitting(true);

    // Create the admin data object with password
    const adminData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      wardNumber: parseInt(formData.wardNumber),
      password: formData.password
    };

    try {
      const result = await createWardAdmin(adminData);

      if (result.success) {
        toast.success(t.successCreate, { position: "top-right" });
        // Reset form including password field
        setFormData({ fullName: "", email: "", phone: "", wardNumber: "", password: "" });
        setShowCreateForm(false);
      } else {
        toast.error(result.error, { position: "top-right" });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle deactivating a ward admin.
   * Shows confirmation dialog before deactivating.
   * @param {string} adminId - The ID of the admin to deactivate
   */
  async function handleDeactivate(adminId) {
    const confirmed = window.confirm(t.confirmDeactivate);

    if (confirmed) {
      try {
        const result = await deactivateWardAdmin(adminId);
        if (result.success) {
          toast.success(t.successDeactivate, { position: "top-right" });
        } else {
          toast.error(result.error, { position: "top-right" });
        }
      } catch (error) {
        toast.error("An error occurred. Please try again.", { position: "top-right" });
      }
    }
  }

  /**
   * Handle reactivating a ward admin.
   * @param {string} adminId - The ID of the admin to reactivate
   */
  async function handleReactivate(adminId) {
    try {
      const result = await reactivateWardAdmin(adminId);

      if (result.success) {
        toast.success(t.successReactivate, { position: "top-right" });
      } else {
        toast.error(result.error, { position: "top-right" });
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.", { position: "top-right" });
    }
  }

  /**
   * Open the create admin form.
   */
  function openCreateForm() {
    setShowCreateForm(true);
  }

  /**
   * Close the create admin form.
   */
  function closeCreateForm() {
    setShowCreateForm(false);
  }

  /**
   * Handle search input change.
   * @param {Event} e - The input change event
   */
  function handleSearchChange(e) {
    setSearchQuery(e.target.value);
  }

  /**
   * Handle status filter change.
   * @param {Event} e - The select change event
   */
  function handleStatusFilterChange(e) {
    setStatusFilter(e.target.value);
  }

  // ============================================================================
  // RENDER HELPER FUNCTIONS
  // ============================================================================

  /**
   * Render the ward options for the select dropdown.
   * @returns {Array} Array of option elements
   */
  function renderWardOptions() {
    return wardsWithoutAdmin.map(function(ward) {
      return (
        <option key={ward} value={ward}>
          {t.ward} {ward}
        </option>
      );
    });
  }

  /**
   * Render the wards without admin badges.
   * @returns {Array} Array of span elements
   */
  function renderWardsWithoutAdminBadges() {
    return wardsWithoutAdmin.map(function(ward) {
      return (
        <span
          key={ward}
          className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
        >
          {t.ward} {ward}
        </span>
      );
    });
  }

  /**
   * Render admin table rows.
   * @returns {Array} Array of tr elements
   */
  function renderAdminRows() {
    return filteredAdmins.map(function(admin) {
      // Determine status display
      let statusElement;
      if (admin.isActive) {
        statusElement = (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle size={16} />
            {t.active}
          </span>
        );
      } else {
        statusElement = (
          <span className="flex items-center gap-1 text-red-500 text-sm">
            <X size={16} />
            {t.inactive}
          </span>
        );
      }

      // Determine action button
      let actionButton;
      if (admin.isActive) {
        actionButton = (
          <button
            onClick={function () {
              handleDeactivate(admin.id);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={t.deactivate}
          >
            <X size={18} />
          </button>
        );
      } else {
        actionButton = (
          <button
            onClick={function () {
              handleReactivate(admin.id);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title={t.reactivate}
          >
            <RefreshCw size={18} />
          </button>
        );
      }

      return (
        <tr key={admin.id} className="hover:bg-gray-50">
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="text-indigo-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-800">{admin.fullName}</p>
                <p className="text-sm text-gray-500">{admin.phone}</p>
              </div>
            </div>
          </td>
          <td className="px-4 py-4 text-gray-600">{admin.email}</td>
          <td className="px-4 py-4">
            <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              {t.ward} {admin.wardNumber}
            </span>
          </td>
          <td className="px-4 py-4">{statusElement}</td>
          <td className="px-4 py-4 text-gray-600">{admin.createdAt}</td>
          <td className="px-4 py-4">
            <div className="flex items-center justify-end gap-2">
              {actionButton}
            </div>
          </td>
        </tr>
      );
    });
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Shield className="text-indigo-600" size={28} />
            {t.title}
          </h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus size={20} />
          {t.createAdmin}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.totalAdmins}</p>
              <p className="text-xl font-bold text-gray-800">{totalAdmins}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.activeAdmins}</p>
              <p className="text-xl font-bold text-gray-800">{activeAdmins}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <X className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.inactiveAdmins}</p>
              <p className="text-xl font-bold text-gray-800">{inactiveAdmins}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertCircle className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.unassignedWards}</p>
              <p className="text-xl font-bold text-gray-800">
                {wardsWithoutAdmin.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wards Without Admin */}
      {wardsWithoutAdmin.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-medium text-yellow-800 flex items-center gap-2 mb-2">
            <AlertCircle size={18} />
            {t.wardsWithoutAdmin}
          </h3>
          <div className="flex flex-wrap gap-2">
            {renderWardsWithoutAdminBadges()}
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">{t.createAdmin}</h2>
              <button
                onClick={closeCreateForm}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.fullName} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder={t.fullNamePlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.email} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t.emailPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.phone}
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t.phonePlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Ward Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.selectWard} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <select
                    name="wardNumber"
                    value={formData.wardNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">{t.wardPlaceholder}</option>
                    {renderWardOptions()}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.password} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    minLength="8"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Minimum 8 characters required</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={closeCreateForm}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleCreateAdmin}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    {t.creating}
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {t.create}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">{t.all}</option>
          <option value="active">{t.activeOnly}</option>
          <option value="inactive">{t.inactiveOnly}</option>
        </select>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users size={20} />
            {t.wardAdmins}
          </h2>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users size={48} className="mx-auto mb-3 opacity-30" />
            <p>{t.noAdmins}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.fullName}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.email}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.ward}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.status}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t.assignedOn}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {renderAdminRows()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminPanel;
