/**
 * AdminProfile Component
 * 
 * Profile management page for admin users (Super Admin and Ward Admin).
 * Allows admins to view and update their profile information and change password.
 */

import React, { useState } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { adminAPI } from "../../../services/api";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Save,
  Eye,
  EyeOff,
  Edit,
  X,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const profileText = {
  en: {
    title: "My Profile",
    subtitle: "Manage your account information",
    personalInfo: "Personal Information",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    role: "Role",
    ward: "Ward",
    municipality: "Municipality",
    superAdmin: "Super Administrator",
    wardAdmin: "Ward Administrator",
    editProfile: "Edit Profile",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    updatePassword: "Update Password",
    successProfile: "Profile updated successfully!",
    successPassword: "Password changed successfully!",
    errorRequired: "Please fill all required fields",
    errorPasswordMismatch: "New passwords do not match",
    errorPasswordShort: "Password must be at least 8 characters",
    errorCurrentPassword: "Current password is incorrect",
  },
  np: {
    title: "मेरो प्रोफाइल",
    subtitle: "आफ्नो खाता जानकारी व्यवस्थापन गर्नुहोस्",
    personalInfo: "व्यक्तिगत जानकारी",
    fullName: "पुरा नाम",
    email: "इमेल ठेगाना",
    phone: "फोन नम्बर",
    role: "भूमिका",
    ward: "वडा",
    municipality: "नगरपालिका",
    superAdmin: "सुपर प्रशासक",
    wardAdmin: "वडा प्रशासक",
    editProfile: "प्रोफाइल सम्पादन गर्नुहोस्",
    saveChanges: "परिवर्तनहरू सेभ गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    changePassword: "पासवर्ड परिवर्तन गर्नुहोस्",
    currentPassword: "हालको पासवर्ड",
    newPassword: "नयाँ पासवर्ड",
    confirmPassword: "नयाँ पासवर्ड पुष्टि गर्नुहोस्",
    updatePassword: "पासवर्ड अपडेट गर्नुहोस्",
    successProfile: "प्रोफाइल सफलतापूर्वक अपडेट भयो!",
    successPassword: "पासवर्ड सफलतापूर्वक परिवर्तन भयो!",
    errorRequired: "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्",
    errorPasswordMismatch: "नयाँ पासवर्डहरू मेल खाँदैनन्",
    errorPasswordShort: "पासवर्ड कम्तिमा ८ अक्षरको हुनुपर्छ",
    errorCurrentPassword: "हालको पासवर्ड गलत छ",
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function AdminProfile() {
  const { language } = useLanguage();
  const { currentUser, isSuperAdmin, updateProfile } = useAuth();
  const t = profileText[language];

  // ============================================================================
  // STATE
  // ============================================================================

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: currentUser?.fullName || currentUser?.full_name || "",
    phone: currentUser?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  function handleProfileChange(e) {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleProfileSubmit() {
    if (!profileData.fullName) {
      toast.error(t.errorRequired, { position: "top-right" });
      return;
    }

    setIsSubmitting(true);

    try {
      await adminAPI.updateProfile({
        full_name: profileData.fullName,
        phone: profileData.phone,
      });

      // Update context
      updateProfile({
        fullName: profileData.fullName,
        phone: profileData.phone,
      });

      toast.success(t.successProfile, { position: "top-right" });
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || "Failed to update profile", {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordSubmit() {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error(t.errorRequired, { position: "top-right" });
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t.errorPasswordShort, { position: "top-right" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.errorPasswordMismatch, { position: "top-right" });
      return;
    }

    setIsSubmitting(true);

    try {
      await adminAPI.changePassword({
        currentPassword,
        newPassword,
      });

      toast.success(t.successPassword, { position: "top-right" });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangingPassword(false);
    } catch (error) {
      toast.error(error.message || "Failed to change password", {
        position: "top-right",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function cancelEdit() {
    setProfileData({
      fullName: currentUser?.fullName || currentUser?.full_name || "",
      phone: currentUser?.phone || "",
    });
    setIsEditing(false);
  }

  function cancelPasswordChange() {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const roleDisplay = isSuperAdmin() ? t.superAdmin : t.wardAdmin;
  const wardDisplay = currentUser?.wardNumber
    ? `${t.ward} ${currentUser.wardNumber}`
    : "All Wards";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t.title}</h1>
        <p className="text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="text-indigo-600" size={24} />
            {t.personalInfo}
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
              <Edit size={18} />
              {t.editProfile}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.fullName}
            </label>
            {isEditing ? (
              <input
                type="text"
                name="fullName"
                value={profileData.fullName}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-800 font-medium">{currentUser?.fullName || currentUser?.full_name}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.email}
            </label>
            <div className="flex items-center gap-2 text-gray-500">
              <Mail size={18} />
              <p>{currentUser?.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.phone}
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <div className="flex items-center gap-2 text-gray-800">
                <Phone size={18} />
                <p>{currentUser?.phone || "Not provided"}</p>
              </div>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.role}
            </label>
            <div className="flex items-center gap-2">
              <Shield className="text-indigo-600" size={18} />
              <p className="text-gray-800 font-medium">{roleDisplay}</p>
            </div>
          </div>

          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.ward}
            </label>
            <div className="flex items-center gap-2">
              <MapPin className="text-gray-600" size={18} />
              <p className="text-gray-800">{wardDisplay}, Damak</p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleProfileSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save size={18} />
                {t.saveChanges}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Lock className="text-indigo-600" size={24} />
            {t.changePassword}
          </h2>
          {!isChangingPassword && (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
              <Edit size={18} />
              {t.changePassword}
            </button>
          )}
        </div>

        {isChangingPassword && (
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.currentPassword}
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.newPassword}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={cancelPasswordChange}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t.cancel}
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <Lock size={18} />
                {t.updatePassword}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default AdminProfile;
