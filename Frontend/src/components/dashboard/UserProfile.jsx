import React, { useState, useRef } from "react";
import { useLanguage } from "../../context/useLanguage";
import { useAuth } from "../../context/useAuth";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  Camera,
  Edit,
  Save,
  X,
  FileText,
  Eye,
  Loader,
} from "lucide-react";

const profileText = {
  en: {
    title: "Profile & KYC Verification",
    subtitle: "Manage your personal information and verify your identity",
    personalInfo: "Personal Information",
    kycVerification: "KYC Verification",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Address",
    dob: "Date of Birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    ward: "Ward Number",
    municipality: "Municipality",
    province: "Province",
    edit: "Edit Profile",
    save: "Save Changes",
    cancel: "Cancel",
    citizenshipFront: "Citizenship Card (Front)",
    citizenshipBack: "Citizenship Card (Back)",
    uploadInstruction: "Click to upload or drag and drop",
    fileTypes: "PNG, JPG or PDF (max. 5MB)",
    verificationStatus: "Verification Status",
    pending: "Pending Review",
    verified: "Verified",
    notSubmitted: "Not Submitted",
    rejected: "Rejected",
    submitKyc: "Submit for Verification",
    submitting: "Submitting...",
    kycSuccess: "KYC documents submitted successfully!",
    kycPendingMsg: "Your documents are being reviewed. This usually takes 24-48 hours.",
    kycVerifiedMsg: "Your identity has been verified. You have full access to all features.",
    kycRejectedMsg: "Your documents were rejected. Please resubmit with clear images.",
    photoId: "Photo ID",
    uploadPhoto: "Upload Photo",
    changePhoto: "Change Photo",
  },
  np: {
    title: "प्रोफाइल र KYC प्रमाणीकरण",
    subtitle: "आफ्नो व्यक्तिगत जानकारी व्यवस्थापन गर्नुहोस् र आफ्नो पहिचान प्रमाणित गर्नुहोस्",
    personalInfo: "व्यक्तिगत जानकारी",
    kycVerification: "KYC प्रमाणीकरण",
    fullName: "पूरा नाम",
    email: "इमेल ठेगाना",
    phone: "फोन नम्बर",
    address: "ठेगाना",
    dob: "जन्म मिति",
    gender: "लिङ्ग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    ward: "वडा नम्बर",
    municipality: "नगरपालिका",
    province: "प्रदेश",
    edit: "प्रोफाइल सम्पादन",
    save: "परिवर्तनहरू सुरक्षित गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    citizenshipFront: "नागरिकता कार्ड (अगाडि)",
    citizenshipBack: "नागरिकता कार्ड (पछाडि)",
    uploadInstruction: "अपलोड गर्न क्लिक गर्नुहोस् वा ड्र्याग र ड्रप गर्नुहोस्",
    fileTypes: "PNG, JPG वा PDF (अधिकतम 5MB)",
    verificationStatus: "प्रमाणीकरण स्थिति",
    pending: "समीक्षा पर्खँदै",
    verified: "प्रमाणित",
    notSubmitted: "पेश गरिएको छैन",
    rejected: "अस्वीकृत",
    submitKyc: "प्रमाणीकरणको लागि पेश गर्नुहोस्",
    submitting: "पेश गर्दै...",
    kycSuccess: "KYC कागजातहरू सफलतापूर्वक पेश गरियो!",
    kycPendingMsg: "तपाईंको कागजातहरू समीक्षा भइरहेको छ। यो सामान्यतया 24-48 घण्टा लाग्छ।",
    kycVerifiedMsg: "तपाईंको पहिचान प्रमाणित भएको छ। तपाईंसँग सबै सुविधाहरूमा पूर्ण पहुँच छ।",
    kycRejectedMsg: "तपाईंको कागजातहरू अस्वीकार गरियो। कृपया स्पष्ट छविहरूसहित पुन: पेश गर्नुहोस्।",
    photoId: "फोटो ID",
    uploadPhoto: "फोटो अपलोड गर्नुहोस्",
    changePhoto: "फोटो परिवर्तन गर्नुहोस्",
  },
};

const UserProfile = () => {
  const { language } = useLanguage();
  const { verifyKyc, isKycVerified } = useAuth();
  const t = profileText[language];

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use auth context for KYC status
  const [kycStatus, setKycStatus] = useState(isKycVerified() ? "verified" : "notSubmitted");

  const [userData, setUserData] = useState({
    fullName: "Ram Bahadur Thapa",
    email: "ram.bahadur@example.com",
    phone: "+977 9841234567",
    address: "Thamel, Kathmandu",
    dob: "1990-05-15",
    gender: "male",
    ward: "5",
    municipality: "Kathmandu Metropolitan City",
    province: "Bagmati",
    profilePhoto: null,
  });

  const [kycDocuments, setKycDocuments] = useState({
    citizenshipFront: null,
    citizenshipBack: null,
  });

  const [editData, setEditData] = useState({ ...userData });

  const profilePhotoRef = useRef(null);
  const citizenshipFrontRef = useRef(null);
  const citizenshipBackRef = useRef(null);

  const handleEdit = () => {
    setEditData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setUserData({ ...editData });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ ...userData });
    setIsEditing(false);
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKycUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setKycDocuments({ ...kycDocuments, [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitKyc = async () => {
    if (!kycDocuments.citizenshipFront || !kycDocuments.citizenshipBack) {
      alert(language === "en" ? "Please upload both sides of citizenship" : "कृपया नागरिकताको दुवै पक्ष अपलोड गर्नुहोस्");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // For demo: directly verify KYC
    const result = verifyKyc();
    if (result.success) {
      setKycStatus("verified");
    } else {
      setKycStatus("pending");
    }
    setIsSubmitting(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle size={20} />;
      case "pending":
        return <Loader size={20} className="animate-spin" />;
      case "rejected":
        return <X size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Profile Photo & Basic Info Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                {(isEditing ? editData.profilePhoto : userData.profilePhoto) ? (
                  <img
                    src={isEditing ? editData.profilePhoto : userData.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-emerald-600" size={48} />
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => profilePhotoRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition"
                >
                  <Camera size={16} />
                </button>
              )}
              <input
                ref={profilePhotoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoUpload}
              />
            </div>
            {isEditing && (
              <button
                onClick={() => profilePhotoRef.current?.click()}
                className="mt-3 text-sm text-emerald-600 hover:underline"
              >
                {userData.profilePhoto ? t.changePhoto : t.uploadPhoto}
              </button>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.personalInfo}</h3>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                >
                  <Edit size={16} />
                  {t.edit}
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <X size={16} />
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <Save size={16} />
                    {t.save}
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t.fullName}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.fullName}
                    onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    {userData.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t.email}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    {userData.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t.phone}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    {userData.phone}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t.dob}
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.dob}
                    onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {userData.dob}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t.gender}
                </label>
                {isEditing ? (
                  <select
                    value={editData.gender}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                ) : (
                  <p className="text-gray-800 capitalize">{t[userData.gender]}</p>
                )}
              </div>

              {/* Ward */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t.ward}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.ward}
                    onChange={(e) => setEditData({ ...editData, ward: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-gray-800">Ward {userData.ward}</p>
                )}
              </div>

              {/* Municipality */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t.municipality}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.municipality}
                    onChange={(e) => setEditData({ ...editData, municipality: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {userData.municipality}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {t.address}
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-800">{userData.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Verification Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-emerald-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">{t.kycVerification}</h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(kycStatus)}`}>
            {getStatusIcon(kycStatus)}
            <span className="font-medium">
              {kycStatus === "verified"
                ? t.verified
                : kycStatus === "pending"
                ? t.pending
                : kycStatus === "rejected"
                ? t.rejected
                : t.notSubmitted}
            </span>
          </div>
        </div>

        {/* Status Message */}
        {kycStatus !== "notSubmitted" && (
          <div
            className={`p-4 rounded-xl mb-6 ${
              kycStatus === "verified"
                ? "bg-green-50 text-green-700"
                : kycStatus === "pending"
                ? "bg-yellow-50 text-yellow-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {kycStatus === "verified"
              ? t.kycVerifiedMsg
              : kycStatus === "pending"
              ? t.kycPendingMsg
              : t.kycRejectedMsg}
          </div>
        )}

        {/* Upload Section - Only show if not verified */}
        {kycStatus !== "verified" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Citizenship Front */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.citizenshipFront}
                </label>
                <div
                  onClick={() => citizenshipFrontRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    kycDocuments.citizenshipFront
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {kycDocuments.citizenshipFront ? (
                    <div className="relative">
                      <img
                        src={kycDocuments.citizenshipFront}
                        alt="Citizenship Front"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setKycDocuments({ ...kycDocuments, citizenshipFront: null });
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-600">{t.uploadInstruction}</p>
                      <p className="text-xs text-gray-400 mt-1">{t.fileTypes}</p>
                    </>
                  )}
                </div>
                <input
                  ref={citizenshipFrontRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleKycUpload("citizenshipFront", e)}
                />
              </div>

              {/* Citizenship Back */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.citizenshipBack}
                </label>
                <div
                  onClick={() => citizenshipBackRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                    kycDocuments.citizenshipBack
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
                  }`}
                >
                  {kycDocuments.citizenshipBack ? (
                    <div className="relative">
                      <img
                        src={kycDocuments.citizenshipBack}
                        alt="Citizenship Back"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setKycDocuments({ ...kycDocuments, citizenshipBack: null });
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-600">{t.uploadInstruction}</p>
                      <p className="text-xs text-gray-400 mt-1">{t.fileTypes}</p>
                    </>
                  )}
                </div>
                <input
                  ref={citizenshipBackRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleKycUpload("citizenshipBack", e)}
                />
              </div>
            </div>

            {/* Submit Button */}
            {kycStatus !== "pending" && (
              <button
                onClick={handleSubmitKyc}
                disabled={isSubmitting || !kycDocuments.citizenshipFront || !kycDocuments.citizenshipBack}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    {t.submitKyc}
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
