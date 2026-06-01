/**
 * UserProfile Component
 * 
 * Displays and manages user profile information and KYC verification.
 * Allows editing personal info and uploading citizenship documents.
 * 
 * @component
 * 
 * BACKEND INTEGRATION:
 * - GET /api/users/:id - Fetch user profile
 * - PATCH /api/users/:id - Update user profile
 * - PATCH /api/users/:id/kyc - Submit KYC documents
 * 
 * KYC DOCUMENT UPLOAD:
 * FormData with: citizenshipFront (File), citizenshipBack (File)
 * 
 * RESPONSE FORMAT:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     fullName: string,
 *     email: string,
 *     phone: string,
 *     address: string,
 *     dob: string,
 *     gender: 'male' | 'female' | 'other',
 *     ward: string,
 *     municipality: string,
 *     province: string,
 *     profilePhoto: string (URL),
 *     kycStatus: 'notSubmitted' | 'pending' | 'verified' | 'rejected'
 *   }
 * }
 */

import React, { useState, useRef } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { usersAPI } from "../../../services/api";
import { resizeImageToDataUrl } from "../../../utils/imageResize";
import { normalizeImageUrl } from "../../../utils/imageUtils";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
  Eye,
  RefreshCw,
  Loader,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

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
    resubmitKyc: "Resubmit Documents",
    submitting: "Submitting...",
    kycSuccess: "KYC documents submitted successfully!",
    kycPendingMsg: "Your documents are being reviewed. This usually takes 24-48 hours.",
    kycVerifiedMsg: "Your identity has been verified. You have full access to all features.",
    kycRejectedMsg: "Your documents were rejected. Please resubmit with clear images.",
    kycUpdateMsg: "You can update your documents and resubmit them for review.",
    uploadPhoto: "Upload Photo",
    changePhoto: "Change Photo",
    photoSaved: "Profile photo updated!",
    submittedDocuments: "Submitted Documents",
    viewDocument: "View",
    updateDocuments: "Update Documents",
    updateNotice: "Updating your documents will reset your status to pending until an admin re-verifies them.",
    documentUnavailable: "Preview unavailable",
    loading: "Loading profile...",
    error: "Failed to load profile",
    retry: "Retry",
    saveSuccess: "Profile updated successfully!",
    saveError: "Failed to update profile",
    uploadBothSides: "Please upload both sides of citizenship",
    alreadyPending: "Your KYC documents are already under review. Please wait for admin approval.",
    alreadyVerified: "Your KYC is already verified. No need to submit again.",
    selectFiles: "Please select both citizenship documents before submitting.",
    verificationSubmitted: "Verification Submitted Successfully!",
    pendingReviewNotice: "Your documents are now being reviewed by our team. This typically takes 24-48 hours. You will be notified once the verification is complete.",
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
    resubmitKyc: "कागजात पुन: पेश गर्नुहोस्",
    submitting: "पेश गर्दै...",
    kycSuccess: "KYC कागजातहरू सफलतापूर्वक पेश गरियो!",
    kycPendingMsg: "तपाईंको कागजातहरू समीक्षा भइरहेको छ। यो सामान्यतया 24-48 घण्टा लाग्छ।",
    kycVerifiedMsg: "तपाईंको पहिचान प्रमाणित भएको छ। तपाईंसँग सबै सुविधाहरूमा पूर्ण पहुँच छ।",
    kycRejectedMsg: "तपाईंको कागजातहरू अस्वीकार गरियो। कृपया स्पष्ट छविहरूसहित पुन: पेश गर्नुहोस्।",
    kycUpdateMsg: "तपाईं आफ्नो कागजातहरू अपडेट गर्न र पुन: पेश गर्न सक्नुहुन्छ।",
    uploadPhoto: "फोटो अपलोड गर्नुहोस्",
    changePhoto: "फोटो परिवर्तन गर्नुहोस्",
    photoSaved: "प्रोफाइल फोटो अपडेट भयो!",
    submittedDocuments: "पेश गरिएका कागजातहरू",
    viewDocument: "हेर्नुहोस्",
    updateDocuments: "कागजात अपडेट गर्नुहोस्",
    updateNotice: "कागजात अपडेट गर्दा प्रशासकले पुन: प्रमाणित नगरेसम्म तपाईंको स्थिति पेन्डिङमा फर्किनेछ।",
    documentUnavailable: "पूर्वावलोकन उपलब्ध छैन",
    loading: "प्रोफाइल लोड हुँदैछ...",
    error: "प्रोफाइल लोड गर्न असफल",
    retry: "पुन: प्रयास",
    saveSuccess: "प्रोफाइल सफलतापूर्वक अद्यावधिक भयो!",
    saveError: "प्रोफाइल अद्यावधिक गर्न असफल",
    uploadBothSides: "कृपया नागरिकताको दुवै पक्ष अपलोड गर्नुहोस्",
    alreadyPending: "तपाईंको KYC कागजातहरू पहिले नै समीक्षाधीन छन्। कृपया प्रशासक अनुमोदनको लागि पर्खनुहोस्।",
    alreadyVerified: "तपाईंको KYC पहिले नै प्रमाणित छ। फेरि पेश गर्न आवश्यक छैन।",
    selectFiles: "कृपया पेश गर्नु अघि दुवै नागरिकता कागजातहरू चयन गर्नुहोस्।",
    verificationSubmitted: "प्रमाणीकरण सफलतापूर्वक पेश गरियो!",
    pendingReviewNotice: "तपाईंको कागजातहरू अहिले हाम्रो टोलीद्वारा समीक्षा भइरहेको छ। यो सामान्यतया 24-48 घण्टा लाग्छ। प्रमाणीकरण पूरा भएपछि तपाईंलाई सूचित गरिनेछ।",
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get styling for KYC verification status badge.
 * 
 * Returns color classes, icon component, label text, and status message
 * based on the current KYC verification status.
 * 
 * @param {string} status - Current KYC status ('verified', 'pending', 'rejected', 'notSubmitted')
 * @param {Object} t - Translation object
 * @returns {Object} Style configuration with color, icon, label, and message
 */
function getStatusStyle(status, t) {
  // Define all possible status styles
  if (status === "verified") {
    return {
      color: "text-green-600 bg-green-100",
      icon: CheckCircle,
      label: t.verified,
      message: t.kycVerifiedMsg
    };
  } else if (status === "pending") {
    return {
      color: "text-yellow-600 bg-yellow-100",
      icon: Loader,
      label: t.pending,
      message: t.kycPendingMsg
    };
  } else if (status === "rejected") {
    return {
      color: "text-red-600 bg-red-100",
      icon: X,
      label: t.rejected,
      message: t.kycRejectedMsg
    };
  } else {
    // Default: not submitted
    return {
      color: "text-gray-600 bg-gray-100",
      icon: AlertCircle,
      label: t.notSubmitted,
      message: ""
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS FOR DATE FORMATTING
// ============================================================================

/**
 * Format date for display - extract just the date part from ISO string
 * @param {string} dateString - ISO date string or YYYY-MM-DD
 * @returns {string} Formatted date (YYYY-MM-DD)
 */
function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  // If it's an ISO string, extract the date part
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * ProfilePhoto Component
 * 
 * Displays user's profile photo with upload functionality.
 * Shows a camera icon button when in editing mode.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.photo - URL of the profile photo
 * @param {boolean} props.isEditing - Whether profile is in edit mode
 * @param {Function} props.onUpload - Function to handle photo upload
 * @param {Object} props.t - Translation object
 */
function ProfilePhoto(props) {
  const photo = props.photo;
  const onUpload = props.onUpload;
  const isBusy = props.isBusy;
  const t = props.t;

  // Reference to hidden file input
  const photoRef = useRef(null);

  /**
   * Open file picker when camera button is clicked.
   */
  function handleButtonClick() {
    if (photoRef.current) {
      photoRef.current.click();
    }
  }

  // Determine what to show inside the photo circle
  let photoContent;
  if (isBusy) {
    photoContent = <Loader className="text-emerald-600 animate-spin" size={40} />;
  } else if (photo) {
    photoContent = <img src={photo} alt="Profile" className="w-full h-full object-cover" />;
  } else {
    photoContent = <User className="text-emerald-600" size={48} />;
  }

  // Determine button text for upload link
  const uploadText = photo ? t.changePhoto : t.uploadPhoto;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Photo Circle */}
        <div className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden ring-2 ring-emerald-100">
          {photoContent}
        </div>

        {/* Camera Button - always available */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={isBusy}
          className="absolute bottom-0 right-0 p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition shadow disabled:opacity-50"
          aria-label={uploadText}
          title={uploadText}
        >
          <Camera size={16} />
        </button>

        {/* Hidden File Input */}
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
        />
      </div>

      {/* Upload / Change link - always available */}
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isBusy}
        className="mt-3 text-sm text-emerald-600 hover:underline disabled:opacity-50"
      >
        {uploadText}
      </button>
    </div>
  );
}

/**
 * KYCUploadBox Component
 * 
 * A clickable upload box for KYC citizenship documents.
 * Shows uploaded image preview or upload prompt.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.label - Label text for the upload box
 * @param {string} props.document - Base64 or URL of uploaded document image
 * @param {Function} props.onUpload - Function to handle file selection
 * @param {Object} props.inputRef - React ref for the hidden file input
 */
function KYCUploadBox(props) {
  const label = props.label;
  const document = props.document;
  const onUpload = props.onUpload;

  // Ref for the hidden file input, owned by this component.
  const inputRef = useRef(null);

  /**
   * Open file picker when box is clicked.
   */
  function handleBoxClick() {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }
  
  // Determine what to display inside the box
  let boxContent;
  if (document) {
    // Show uploaded document preview
    boxContent = (
      <img src={document} alt={label} className="w-full h-32 object-cover rounded-lg" />
    );
  } else {
    // Show upload prompt
    boxContent = (
      <>
        <Upload className="mx-auto text-gray-400 mb-2" size={32} />
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </>
    );
  }
  
  return (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition cursor-pointer" 
      onClick={handleBoxClick}
    >
      {boxContent}
      
      {/* Hidden File Input */}
      <input 
        ref={inputRef} 
        type="file" 
        accept="image/*,.pdf" 
        className="hidden" 
        onChange={onUpload} 
      />
    </div>
  );
}

/**
 * SubmittedDocument Component
 *
 * Read-only preview of an already-submitted KYC document with a button to
 * open the image full-size in the viewer.
 *
 * @param {Object} props - Component properties
 * @param {string} props.label - Document label (front/back)
 * @param {string|null} props.url - Renderable image URL (or null if missing)
 * @param {Function} props.onView - Called with the URL to open the viewer
 * @param {Object} props.t - Translation object
 */
function SubmittedDocument(props) {
  const label = props.label;
  const url = props.url;
  const onView = props.onView;
  const t = props.t;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </div>
      {url ? (
        <button
          type="button"
          onClick={function() { onView(url); }}
          className="group relative block w-full"
        >
          <img src={url} alt={label} className="w-full h-40 object-cover" />
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="flex items-center gap-1 text-white text-sm font-medium">
              <Eye size={16} />
              {t.viewDocument}
            </span>
          </span>
        </button>
      ) : (
        <div className="h-40 flex items-center justify-center text-sm text-gray-400">
          {t.documentUnavailable}
        </div>
      )}
    </div>
  );
}

/**
 * LoadingState Component
 *
 * Displays a loading spinner while profile data is being fetched.
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UserProfile Component
 * 
 * Main component for displaying and managing user profile information.
 * Handles personal info editing and KYC document submission.
 * 
 * Features:
 * - View and edit personal information
 * - Upload profile photo
 * - Submit KYC documents (citizenship front and back)
 * - View KYC verification status
 */
function UserProfile() {
  // Get language and auth context
  const languageContext = useLanguage();
  const language = languageContext.language;
  const authContext = useAuth();
  const currentUser = authContext.currentUser;
  const verifyKyc = authContext.verifyKyc;
  const isKycVerified = authContext.isKycVerified;
  const refreshUser = authContext.refreshUser;
  const t = profileText[language];

  // Use current user from AuthContext
  const user = currentUser;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch fresh user data on mount to ensure we have all fields
  React.useEffect(function fetchFreshUserData() {
    async function refreshUserData() {
      if (currentUser && currentUser.id) {
        // Check if we're missing critical fields
        const missingFields = !currentUser.fullName || !currentUser.gender || !currentUser.address;
        
        if (missingFields) {
          setLoading(true);
          try {
            await refreshUser();
          } catch (err) {
            console.error('Failed to fetch user data:', err);
            setError('Failed to load profile data');
          } finally {
            setLoading(false);
          }
        }
      }
    }
    refreshUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // ----------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------
  
  // Whether profile is in edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Whether a save/submit operation is in progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track if KYC was just submitted successfully
  const [kycSubmitted, setKycSubmitted] = useState(false);

  // Whether the user is replacing already-submitted KYC documents
  const [kycUpdating, setKycUpdating] = useState(false);

  // Whether a profile photo is currently being saved (quick upload)
  const [photoSaving, setPhotoSaving] = useState(false);

  // Document currently open in the full-size viewer (data URL/URL) or null
  const [viewerImage, setViewerImage] = useState(null);

  // Temporary storage for edited profile data
  const [editData, setEditData] = useState({});
  
  // Preview URLs for KYC document images
  const [kycDocuments, setKycDocuments] = useState({
    citizenshipFront: null,
    citizenshipBack: null
  });
  
  // Actual file objects for KYC upload
  const [kycFiles, setKycFiles] = useState({
    citizenshipFront: null,
    citizenshipBack: null
  });

  // ----------------------------------------
  // EFFECTS
  // ----------------------------------------
  
  /**
   * Effect: Sync editData with user data when user changes.
   * This ensures editData has the latest user info.
   */
  React.useEffect(function syncEditData() {
    if (user) {
      // Map dateOfBirth to dob for compatibility with form fields
      // Format date to YYYY-MM-DD for date input
      const dobValue = user.dateOfBirth || user.dob;
      const formattedDob = formatDateForDisplay(dobValue);
      
      setEditData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        dob: formattedDob,
        gender: user.gender,
        dateOfBirth: formattedDob,
        wardNumber: user.wardNumber,
        profilePhoto: user.profilePhoto
      });
    }
  }, [user]);

  // ----------------------------------------
  // PROFILE EDITING HANDLERS
  // ----------------------------------------

  /**
   * Start editing mode.
   * Copies current user data to editData for modification.
   */
  function handleEdit() {
    // Create a copy of user data for editing
    const userCopy = {};
    if (user) {
      const dobValue = user.dateOfBirth || user.dob;
      const formattedDob = formatDateForDisplay(dobValue);
      
      userCopy.fullName = user.fullName;
      userCopy.email = user.email;
      userCopy.phone = user.phone;
      userCopy.address = user.address;
      userCopy.dob = formattedDob;
      userCopy.gender = user.gender;
      userCopy.wardNumber = user.wardNumber;
      userCopy.dateOfBirth = formattedDob;
      userCopy.profilePhoto = user.profilePhoto;
    }
    setEditData(userCopy);
    setIsEditing(true);
  }

  /**
   * Cancel editing mode.
   * Reverts editData back to original user data.
   */
  function handleCancel() {
    // Restore original user data
    const userCopy = {};
    if (user) {
      const dobValue = user.dateOfBirth || user.dob;
      const formattedDob = formatDateForDisplay(dobValue);
      
      userCopy.fullName = user.fullName;
      userCopy.email = user.email;
      userCopy.phone = user.phone;
      userCopy.address = user.address;
      userCopy.dob = formattedDob;
      userCopy.gender = user.gender;
      userCopy.dateOfBirth = formattedDob;
      userCopy.profilePhoto = user.profilePhoto;
    }
    setEditData(userCopy);
    setIsEditing(false);
  }

  /**
   * Save profile changes to backend.
   * Backend: PATCH /api/users/:id
   */
  async function handleSave() {
    setIsSubmitting(true);
    
    try {
      // Prepare update data with snake_case for backend
      const updateData = {
        full_name: editData.fullName,
        phone: editData.phone,
        address: editData.address,
        gender: editData.gender,
        date_of_birth: editData.dob || editData.dateOfBirth,
        profile_photo: editData.profilePhoto || null
      };
      
      console.log('Sending update data:', updateData);
      
      // Send update request to backend
      const response = await usersAPI.updateProfile(currentUser.id, updateData);
      
      console.log('Update response received:', response);
      console.log('Response data:', response.data);
      
      // Update auth context immediately with the fresh data from backend
      if (response && response.data) {
        console.log('Updating auth context with:', response.data);
        authContext.updateProfile(response.data);
        
        // Format the DOB from response
        const formattedDob = formatDateForDisplay(response.data.dateOfBirth);
        
        // Force a re-render by updating local user reference
        setEditData({
          fullName: response.data.fullName,
          email: response.data.email,
          phone: response.data.phone,
          address: response.data.address,
          dob: formattedDob,
          gender: response.data.gender,
          dateOfBirth: formattedDob,
          wardNumber: response.data.wardNumber,
          profilePhoto: response.data.profilePhoto
        });
      }
      
      // Show success message
      toast.success(t.saveSuccess, { position: "top-right", autoClose: 3000 });
      
      // Exit editing mode - the UI will update from updated currentUser
      setIsEditing(false);
      
    } catch (error) {
      // Show error message with details
      console.error('Profile update error:', error);
      const errorMsg = error.message || t.saveError;
      toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handle profile photo file selection.  /**
   * Handle profile photo file selection.
   * Reads the file and updates editData with base64 preview.
   * 
   * @param {Event} e - File input change event
   */
  async function handleProfilePhotoUpload(e) {
    const file = e.target.files[0];
    // Reset the input so selecting the same file again still fires onChange
    e.target.value = "";
    if (!file) return;

    let dataUrl;
    try {
      // Downscale to a small JPEG data URL (stored in the DB)
      dataUrl = await resizeImageToDataUrl(file, 256, 0.8);
    } catch (err) {
      toast.error(err.message || "Could not process the image.", { position: "top-right", autoClose: 3000 });
      return;
    }

    // While editing, just stage the photo; it's saved with the rest on "Save".
    if (isEditing) {
      setEditData(function (prev) {
        return { ...prev, profilePhoto: dataUrl };
      });
      return;
    }

    // Outside edit mode, save the photo immediately for a one-click experience.
    setPhotoSaving(true);
    try {
      const response = await usersAPI.updateProfile(currentUser.id, { profile_photo: dataUrl });
      if (response && response.data) {
        authContext.updateProfile(response.data);
      }
      toast.success(t.photoSaved, { position: "top-right", autoClose: 2500 });
    } catch (err) {
      toast.error(err.message || t.saveError, { position: "top-right", autoClose: 3000 });
    } finally {
      setPhotoSaving(false);
    }
  }

  /**
   * Handle KYC document file selection.
   * Stores both the file and a preview URL.
   * 
   * @param {string} field - Which document ('citizenshipFront' or 'citizenshipBack')
   * @param {Event} e - File input change event
   */
  async function handleKycUpload(field, e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    try {
      // Downscale to a legible JPEG data URL stored in the DB (no disk files).
      const dataUrl = await resizeImageToDataUrl(file, 1280, 0.85);
      // The base64 string is both the preview and the upload payload.
      setKycFiles(function (prev) {
        return { ...prev, [field]: dataUrl };
      });
      setKycDocuments(function (prev) {
        return { ...prev, [field]: dataUrl };
      });
    } catch (err) {
      toast.error(err.message || "Could not process the image.", { position: "top-right", autoClose: 3000 });
    }
  }

  /**
   * Submit KYC documents to backend for verification.
   * Backend: POST /api/users/:id/kyc (initial submission)
   * Backend: PATCH /api/users/:id/kyc (resubmission for rejected)
   */
  async function handleSubmitKyc(e) {
    // Prevent default form submission if triggered from a form
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // An update/resubmission happens for rejected docs or when the user
    // explicitly chose to replace already-submitted/verified documents.
    const isResubmission = kycStatus === "rejected" || kycUpdating;

    // For a brand-new submission both sides are required; for a resubmission
    // the user may replace just one side.
    if (isResubmission) {
      if (!kycFiles.citizenshipFront && !kycFiles.citizenshipBack) {
        toast.warning(t.selectFiles, { position: "top-right", autoClose: 3000 });
        return;
      }
    } else {
      if (!kycFiles.citizenshipFront || !kycFiles.citizenshipBack) {
        toast.warning(t.selectFiles, { position: "top-right", autoClose: 3000 });
        return;
      }
    }

    // Ensure user ID is available
    if (!user || !user.id) {
      toast.error("User not found. Please refresh the page.", { position: "top-right", autoClose: 3000 });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send only the provided base64 documents as JSON.
      const payload = {};
      if (kycFiles.citizenshipFront) payload.citizenshipFront = kycFiles.citizenshipFront;
      if (kycFiles.citizenshipBack) payload.citizenshipBack = kycFiles.citizenshipBack;

      if (isResubmission) {
        // PATCH to replace documents — backend resets status to PENDING.
        await usersAPI.updateKYC(user.id, payload);
      } else {
        // POST for the initial submission.
        await usersAPI.submitKYC(user.id, payload);
      }

      // Clear the staged documents after successful submission
      setKycFiles({
        citizenshipFront: null,
        citizenshipBack: null
      });
      setKycDocuments({
        citizenshipFront: null,
        citizenshipBack: null
      });
      setKycUpdating(false);

      // Mark KYC as submitted to immediately update UI
      setKycSubmitted(true);

      // Update auth context KYC status if available
      if (verifyKyc) {
        verifyKyc();
      }

      // Show success message with detailed info
      toast.success(t.verificationSubmitted, {
        position: "top-right",
        autoClose: 5000,
        style: { minWidth: '350px' }
      });

      // Show pending review notice
      setTimeout(() => {
        toast.info(t.pendingReviewNotice, {
          position: "top-right",
          autoClose: 6000,
          style: { minWidth: '350px' }
        });
      }, 500);

      // Refresh user data from backend
      try {
        await refreshUser();
      } catch (refreshError) {
        console.error('Failed to refresh user data:', refreshError);
      }

    } catch (error) {
      console.error('KYC submission error:', error);
      toast.error(error.message || t.saveError, { position: "top-right", autoClose: 4000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Update a single field in editData.
   * 
   * @param {string} fieldName - Name of the field to update
   * @param {string} value - New value for the field
   */
  function updateEditField(fieldName, value) {
    const newEditData = {
      fullName: editData.fullName,
      email: editData.email,
      phone: editData.phone,
      address: editData.address,
      dob: editData.dob,
      gender: editData.gender,
      dateOfBirth: editData.dateOfBirth,
      profilePhoto: editData.profilePhoto
    };
    newEditData[fieldName] = value;
    setEditData(newEditData);
  }

  // ----------------------------------------
  // COMPUTE KYC STATUS
  // ----------------------------------------
  
  // Determine current KYC status
  let kycStatus = "notSubmitted";
  
  // If KYC was just submitted, show pending status immediately
  if (kycSubmitted) {
    kycStatus = "pending";
  } else if (user && user.kycStatus) {
    // Normalize to lowercase for comparison (backend returns UPPERCASE)
    kycStatus = user.kycStatus.toLowerCase();
  } else if (isKycVerified && isKycVerified()) {
    kycStatus = "verified";
  }
  
  // Get status styling
  const statusStyle = getStatusStyle(kycStatus, t);
  const StatusIcon = statusStyle.icon;

  // Previously submitted documents saved on the user record (for viewing)
  const savedDocs = (user && user.kycDocuments) || {};
  const savedFrontUrl = normalizeImageUrl(savedDocs.citizenshipFront);
  const savedBackUrl = normalizeImageUrl(savedDocs.citizenshipBack);
  const hasSavedDocs = Boolean(savedFrontUrl || savedBackUrl);

  // Show the upload boxes for: first-time submission, rejected resubmission,
  // or when the user explicitly chose to update verified/pending documents.
  const showUploadBoxes =
    kycStatus === "notSubmitted" || kycStatus === "rejected" || kycUpdating;

  // Offer an "Update Documents" action once docs exist and aren't being edited.
  const canUpdateDocs =
    (kycStatus === "verified" || kycStatus === "pending") && !kycUpdating;

  // ----------------------------------------
  // RENDER: Loading State
  // ----------------------------------------
  
  if (loading) {
    return <LoadingState t={t} />;
  }

  // ----------------------------------------
  // RENDER: Error State
  // ----------------------------------------
  
  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
        <p className="text-gray-700 font-medium mb-2">{t.error}</p>
        <button onClick={() => window.location.reload()} className="text-emerald-600 hover:underline">
          {t.retry}
        </button>
      </div>
    );
  }

  // ----------------------------------------
  // RENDER: Determine Display Data
  // ----------------------------------------
  
  // Use editData when editing, otherwise use user data
  let displayData = {};
  if (isEditing) {
    displayData = editData;
  } else if (user) {
    displayData = user;
  }

  // ----------------------------------------
  // RENDER: Determine Status Message Background
  // ----------------------------------------
  
  let statusMessageBg = "bg-red-50";
  let statusMessageTextColor = "text-red-700";
  if (kycStatus === "verified") {
    statusMessageBg = "bg-green-50";
    statusMessageTextColor = "text-green-700";
  } else if (kycStatus === "pending") {
    statusMessageBg = "bg-yellow-50";
    statusMessageTextColor = "text-yellow-700";
  }

  // ----------------------------------------
  // RENDER: Main Profile UI
  // ----------------------------------------

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer />

      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Profile Photo */}
          <ProfilePhoto
            photo={displayData.profilePhoto}
            onUpload={handleProfilePhotoUpload}
            isBusy={photoSaving}
            t={t}
          />

          <div className="flex-1">
            {/* Section Header with Edit/Save Buttons */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t.personalInfo}</h3>
              
              {/* Show Edit button when not editing */}
              {!isEditing && (
                <button 
                  onClick={handleEdit} 
                  className="flex items-center gap-2 px-4 py-2 text-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-50 transition"
                >
                  <Edit size={16} />
                  {t.edit}
                </button>
              )}
              
              {/* Show Cancel and Save buttons when editing */}
              {isEditing && (
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
                    disabled={isSubmitting} 
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    {t.save}
                  </button>
                </div>
              )}
            </div>

            {/* Personal Information Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t.fullName}</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editData.fullName || ""} 
                    onChange={function(e) { updateEditField("fullName", e.target.value); }} 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    {displayData.fullName || "-"}
                  </p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t.email}</label>
                <p className="text-gray-800 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {displayData.email || "-"}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t.phone}</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={editData.phone || ""} 
                    onChange={function(e) { updateEditField("phone", e.target.value); }} 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    {displayData.phone || "-"}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t.dob}</label>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={formatDateForDisplay(editData.dob || editData.dateOfBirth) || ""} 
                    onChange={function(e) { updateEditField("dob", e.target.value); }} 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    {formatDateForDisplay(displayData.dob || displayData.dateOfBirth) || "-"}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t.gender}</label>
                {isEditing ? (
                  <select 
                    value={editData.gender || ""} 
                    onChange={function(e) { updateEditField("gender", e.target.value); }} 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">{t.gender}</option>
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                ) : (
                  <p className="text-gray-800 capitalize">
                    {displayData.gender ? (
                      displayData.gender === 'male' ? t.male :
                      displayData.gender === 'female' ? t.female : t.other
                    ) : "-"}
                  </p>
                )}
              </div>

              {/* Ward Number (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t.ward}</label>
                <p className="text-gray-800 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  {displayData.wardNumber || "-"}
                </p>
              </div>

              {/* Municipality (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">{t.municipality}</label>
                <p className="text-gray-800">
                  {displayData.jurisdiction?.municipality || "Damak"}
                </p>
              </div>

              {/* Address (Full Width - Editable) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">{t.address}</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editData.address || ""} 
                    onChange={function(e) { updateEditField("address", e.target.value); }} 
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500" 
                    placeholder="Enter your full address"
                  />
                ) : (
                  <p className="text-gray-800 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {displayData.address || "-"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Verification Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {/* Section Header with Status Badge */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">{t.kycVerification}</h3>
          <span className={"flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium " + statusStyle.color}>
            {kycStatus === "pending" ? (
              <StatusIcon size={16} className="animate-spin" />
            ) : (
              <StatusIcon size={16} />
            )}
            {statusStyle.label}
          </span>
        </div>

        {/* Status Message */}
        {statusStyle.message && (
          <div className={"p-4 rounded-xl mb-6 " + statusMessageBg}>
            <p className={"text-sm " + statusMessageTextColor}>
              {statusStyle.message}
            </p>
            {kycStatus === "rejected" && (
              <p className={"text-sm " + statusMessageTextColor + " mt-2"}>
                {t.kycUpdateMsg}
              </p>
            )}
          </div>
        )}

        {/* Submitted documents (view) - shown when docs exist and not re-uploading */}
        {hasSavedDocs && !showUploadBoxes && (
          <>
            <p className="text-sm font-medium text-gray-700 mb-3">{t.submittedDocuments}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <SubmittedDocument label={t.citizenshipFront} url={savedFrontUrl} onView={setViewerImage} t={t} />
              <SubmittedDocument label={t.citizenshipBack} url={savedBackUrl} onView={setViewerImage} t={t} />
            </div>
          </>
        )}

        {/* Update action - always available once verified/pending, even if the
            saved documents can't be previewed (e.g. legacy uploads). */}
        {canUpdateDocs && (
          <button
            type="button"
            onClick={function() { setKycUpdating(true); }}
            className="w-full py-3 border border-emerald-600 text-emerald-700 rounded-xl font-medium hover:bg-emerald-50 transition flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            {t.updateDocuments}
          </button>
        )}

        {/* Document Upload - first submission, rejected resubmission, or update */}
        {showUploadBoxes && (
          <>
            {/* Notice when replacing already-submitted documents */}
            {kycUpdating && (
              <div className="p-3 rounded-xl mb-4 bg-amber-50 border border-amber-100">
                <p className="text-sm text-amber-700">{t.updateNotice}</p>
              </div>
            )}

            {/* Upload Boxes for Citizenship Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <KYCUploadBox
                label={t.citizenshipFront}
                document={kycDocuments.citizenshipFront || (kycUpdating ? savedFrontUrl : null)}
                onUpload={function(e) { handleKycUpload("citizenshipFront", e); }}
              />
              <KYCUploadBox
                label={t.citizenshipBack}
                document={kycDocuments.citizenshipBack || (kycUpdating ? savedBackUrl : null)}
                onUpload={function(e) { handleKycUpload("citizenshipBack", e); }}
              />
            </div>

            {/* File Type Information */}
            <p className="text-xs text-gray-500 text-center mb-4">{t.fileTypes}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Cancel update and go back to the document view */}
              {kycUpdating && (
                <button
                  type="button"
                  onClick={function() {
                    setKycUpdating(false);
                    setKycDocuments({ citizenshipFront: null, citizenshipBack: null });
                    setKycFiles({ citizenshipFront: null, citizenshipBack: null });
                  }}
                  className="sm:w-40 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <X size={18} />
                  {t.cancel}
                </button>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitKyc}
                disabled={
                  isSubmitting ||
                  ((kycStatus === "rejected" || kycUpdating)
                    ? !(kycFiles.citizenshipFront || kycFiles.citizenshipBack)
                    : !(kycFiles.citizenshipFront && kycFiles.citizenshipBack))
                }
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    {t.submitting}
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    {(kycStatus === "rejected" || kycUpdating) ? t.resubmitKyc : t.submitKyc}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Full-size document viewer */}
      {viewerImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={function() { setViewerImage(null); }}
        >
          <button
            type="button"
            onClick={function() { setViewerImage(null); }}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-gray-800 hover:bg-white"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <img
            src={viewerImage}
            alt="Document"
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
            onClick={function(e) { e.stopPropagation(); }}
          />
        </div>
      )}
    </div>
  );
}

export default UserProfile;
