/**
 * ReportIssue Component
 * 
 * Form for reporting new issues with photo/video upload and location detection.
 * Requires KYC verification before allowing submissions.
 * 
 * @component
 * 
 * BACKEND INTEGRATION:
 * - POST /api/issues - Create new issue report
 *   - Request: FormData with fields: issueType, description, location, priority, media[]
 *   - Response: { success: true, data: { id, ... } }
 * 
 * FORMDATA STRUCTURE:
 * - issueType: string (Road Damage, Water Supply, etc.)
 * - description: string
 * - location: string
 * - latitude: number (optional)
 * - longitude: number (optional)
 * - priority: 'low' | 'medium' | 'high' | 'urgent'
 * - media[]: File[] (images/videos, max 5)
 */

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../../contexts/language/useLanguage";
import { useAuth } from "../../../contexts/auth/useAuth";
import { issuesAPI } from "../../../services/api";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Camera,
  Image,
  X,
  MapPin,
  Send,
  CheckCircle,
  Upload,
  Loader,
  ShieldAlert,
  FileCheck,
} from "lucide-react";

// ============================================================================
// TRANSLATIONS
// ============================================================================

const reportText = {
  en: {
    title: "Report an Issue",
    subtitle: "Help improve your community by reporting problems",
    kycRequired: "KYC Verification Required",
    kycMessage: "Please complete your KYC verification before reporting issues.",
    goToProfile: "Complete KYC Now",
    capturePhoto: "Capture Photo",
    uploadPhoto: "Upload from Gallery",
    issueType: "Issue Type",
    selectType: "Select issue type",
    description: "Description",
    descPlaceholder: "Describe the issue in detail...",
    location: "Location",
    locationPlaceholder: "Enter location or use GPS",
    useCurrentLocation: "Use Current Location",
    priority: "Priority Level",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    submit: "Submit Report",
    submitting: "Submitting...",
    success: "Report submitted successfully!",
    successDesc: "Your report has been submitted and will be reviewed by the authorities.",
    remove: "Remove",
    addPhotos: "Add Photos/Videos",
    required: "Required",
    fillAllFields: "Please fill all required fields",
    uploadError: "Failed to upload. Please try again.",
    cameraError: "Unable to access camera",
    locationError: "Unable to get location",
    issueTypes: ["Road Damage", "Water Supply", "Electricity", "Garbage/Sanitation", "Street Light", "Drainage", "Public Safety", "Other"],
  },
  np: {
    title: "समस्या रिपोर्ट गर्नुहोस्",
    subtitle: "समस्याहरू रिपोर्ट गरेर आफ्नो समुदाय सुधार गर्न मद्दत गर्नुहोस्",
    kycRequired: "KYC प्रमाणीकरण आवश्यक छ",
    kycMessage: "कृपया समस्या रिपोर्ट गर्नु अघि आफ्नो KYC प्रमाणीकरण पूरा गर्नुहोस्।",
    goToProfile: "अहिले KYC पूरा गर्नुहोस्",
    capturePhoto: "फोटो खिच्नुहोस्",
    uploadPhoto: "ग्यालेरीबाट अपलोड गर्नुहोस्",
    issueType: "समस्याको प्रकार",
    selectType: "समस्याको प्रकार चयन गर्नुहोस्",
    description: "विवरण",
    descPlaceholder: "समस्याको विस्तृत विवरण दिनुहोस्...",
    location: "स्थान",
    locationPlaceholder: "स्थान प्रविष्ट गर्नुहोस् वा GPS प्रयोग गर्नुहोस्",
    useCurrentLocation: "हालको स्थान प्रयोग गर्नुहोस्",
    priority: "प्राथमिकता स्तर",
    low: "कम",
    medium: "मध्यम",
    high: "उच्च",
    urgent: "अत्यावश्यक",
    submit: "रिपोर्ट पठाउनुहोस्",
    submitting: "पठाउँदै...",
    success: "रिपोर्ट सफलतापूर्वक पठाइयो!",
    successDesc: "तपाईंको रिपोर्ट पठाइएको छ र अधिकारीहरूद्वारा समीक्षा गरिनेछ।",
    remove: "हटाउनुहोस्",
    addPhotos: "फोटो/भिडियो थप्नुहोस्",
    required: "आवश्यक",
    fillAllFields: "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्",
    uploadError: "अपलोड असफल। कृपया पुन: प्रयास गर्नुहोस्।",
    cameraError: "क्यामेरा पहुँच गर्न असमर्थ",
    locationError: "स्थान प्राप्त गर्न असमर्थ",
    issueTypes: ["सडक क्षति", "पानी आपूर्ति", "बिजुली", "फोहोर/सरसफाई", "सडक बत्ती", "ढल निकास", "सार्वजनिक सुरक्षा", "अन्य"],
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * KYCRequired Component
 * 
 * Displays a message when user hasn't completed KYC verification.
 * Provides a button to navigate to the profile page.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.t - Translation object
 * @param {Function} props.onNavigate - Navigation function
 */
function KYCRequired(props) {
  const t = props.t;
  const onNavigate = props.onNavigate;
  
  /**
   * Handle click on the "Complete KYC" button.
   */
  function handleGoToProfile() {
    if (onNavigate) {
      onNavigate("profile");
    }
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
      <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="text-amber-600" size={40} />
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">{t.kycRequired}</h2>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{t.kycMessage}</p>
      <button 
        onClick={handleGoToProfile} 
        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
      >
        <FileCheck size={18} />
        {t.goToProfile}
      </button>
    </div>
  );
}

/**
 * SuccessScreen Component
 * 
 * Displays a success message after report submission.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.t - Translation object
 */
function SuccessScreen(props) {
  const t = props.t;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="text-green-600" size={40} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.success}</h2>
      <p className="text-gray-500">{t.successDesc}</p>
    </div>
  );
}

/**
 * MediaPreview Component
 * 
 * Displays a grid of uploaded images/videos with remove buttons.
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.media - Array of media objects with id, type, and preview
 * @param {Function} props.onRemove - Function to remove a media item by id
 */
function MediaPreview(props) {
  const media = props.media;
  const onRemove = props.onRemove;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
      {media.map(function(item) {
        // Determine what element to render based on type
        let mediaElement;
        if (item.type === "image") {
          mediaElement = <img src={item.preview} alt="Captured" className="w-full h-32 object-cover" />;
        } else {
          mediaElement = <video src={item.preview} className="w-full h-32 object-cover" />;
        }
        
        return (
          <div key={item.id} className="relative group rounded-xl overflow-hidden">
            {mediaElement}
            <button 
              type="button" 
              onClick={function() { onRemove(item.id); }} 
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/**
 * PrioritySelector Component
 * 
 * Displays a row of priority level buttons (low, medium, high, urgent).
 * Each level has its own color for visual distinction.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.value - Currently selected priority
 * @param {Function} props.onChange - Function to call when priority changes
 * @param {Object} props.t - Translation object
 */
function PrioritySelector(props) {
  const value = props.value;
  const onChange = props.onChange;
  const t = props.t;
  
  // Define priority levels with their colors
  const levels = [
    { value: "low", label: t.low, color: "green" },
    { value: "medium", label: t.medium, color: "yellow" },
    { value: "high", label: t.high, color: "orange" },
    { value: "urgent", label: t.urgent, color: "red" },
  ];

  /**
   * Get the CSS classes for a priority button based on color and selection state.
   * 
   * @param {string} color - The color name (green, yellow, orange, red)
   * @param {boolean} isSelected - Whether this priority is currently selected
   * @returns {string} CSS class string
   */
  function getColorClass(color, isSelected) {
    // If not selected, use gray border
    if (!isSelected) {
      return "border-gray-200 hover:border-gray-300";
    }
    
    // Return the appropriate color class based on priority color
    if (color === "green") {
      return "border-green-500 bg-green-50 text-green-700";
    } else if (color === "yellow") {
      return "border-yellow-500 bg-yellow-50 text-yellow-700";
    } else if (color === "orange") {
      return "border-orange-500 bg-orange-50 text-orange-700";
    } else if (color === "red") {
      return "border-red-500 bg-red-50 text-red-700";
    }
    
    return "border-gray-200";
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {levels.map(function(level) {
        const isSelected = value === level.value;
        const colorClass = getColorClass(level.color, isSelected);
        
        return (
          <button 
            key={level.value} 
            type="button" 
            onClick={function() { onChange(level.value); }} 
            className={"p-3 rounded-xl border-2 transition text-center " + colorClass}
          >
            <span className="font-medium text-sm">{level.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * ReportIssue Component
 * 
 * Main form for reporting civic issues. Allows users to:
 * - Upload photos/videos of issues
 * - Capture photos using device camera
 * - Detect current GPS location
 * - Select issue type and priority
 * - Submit reports to backend
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.onNavigate - Navigation function for page changes
 */
function ReportIssue(props) {
  const onNavigate = props.onNavigate;
  
  // Get language and user context
  const languageContext = useLanguage();
  const language = languageContext.language;
  const authContext = useAuth();
  const currentUser = authContext.currentUser;
  const t = reportText[language];

  // Check if user has completed KYC verification
  let isKycVerified = false;
  if (currentUser && currentUser.kycVerified) {
    isKycVerified = true;
  }

  // ----------------------------------------
  // STATE: Form Data
  // ----------------------------------------
  
  // Store all form field values
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    location: "",
    coordinates: null,
    priority: "medium",
  });
  
  // Store uploaded media files (photos and videos)
  const [media, setMedia] = useState([]);

  // ----------------------------------------
  // STATE: UI Controls
  // ----------------------------------------
  
  // Camera modal visibility
  const [showCamera, setShowCamera] = useState(false);
  
  // Active camera stream
  const [stream, setStream] = useState(null);
  
  // Loading states for various operations
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // ----------------------------------------
  // REFS: DOM Element References
  // ----------------------------------------
  
  // Reference to video element for camera preview
  const videoRef = useRef(null);
  
  // Reference to canvas for capturing photos
  const canvasRef = useRef(null);
  
  // Reference to hidden file input
  const fileInputRef = useRef(null);

  // ----------------------------------------
  // CAMERA FUNCTIONS
  // ----------------------------------------

  /**
   * Start the device camera for photo capture.
   * Requests camera permission and opens camera modal.
   */
  async function startCamera() {
    try {
      setIsLoading(true);
      
      // Request camera access with back camera preference
      const cameraOptions = {
        video: { facingMode: "environment" },
        audio: false
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(cameraOptions);
      
      // Save stream and show camera modal
      setStream(mediaStream);
      setShowCamera(true);
      
    } catch (error) {
      // Show error if camera access fails
      toast.error(t.cameraError, { position: "top-right", autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Stop the camera and close the camera modal.
   * Stops all video tracks to release the camera.
   */
  function stopCamera() {
    // Stop all tracks in the stream
    if (stream) {
      stream.getTracks().forEach(function(track) {
        track.stop();
      });
    }
    
    // Reset camera state
    setStream(null);
    setShowCamera(false);
  }

  /**
   * Effect: Connect camera stream to video element.
   * Runs whenever stream or showCamera changes.
   */
  useEffect(function connectCameraStream() {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, showCamera]);

  /**
   * Capture a photo from the camera preview.
   * Draws current video frame to canvas and saves as file.
   */
  function capturePhoto() {
    // Make sure both video and canvas refs are available
    if (!videoRef.current || !canvasRef.current) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);
    
    // Convert canvas to blob and create file
    canvas.toBlob(
      function(blob) {
        // Create a unique filename with timestamp
        const filename = "photo-" + Date.now() + ".jpg";
        const file = new File([blob], filename, { type: "image/jpeg" });
        
        // Create preview URL for display
        const previewUrl = URL.createObjectURL(blob);
        
        // Add to media list
        const newMediaItem = {
          id: Date.now(),
          type: "image",
          file: file,
          preview: previewUrl
        };
        
        setMedia(function(previousMedia) {
          const updatedMedia = previousMedia.slice();
          updatedMedia.push(newMediaItem);
          return updatedMedia;
        });
      },
      "image/jpeg",
      0.8  // 80% quality
    );
    
    // Close camera after capturing
    stopCamera();
  }

  // ----------------------------------------
  // FILE UPLOAD FUNCTIONS
  // ----------------------------------------

  /**
   * Handle file selection from file input.
   * Adds selected files to media list.
   * 
   * @param {Event} event - File input change event
   */
  function handleFileUpload(event) {
    const files = event.target.files;
    
    // Process each selected file using Array.from and forEach
    Array.from(files).forEach(function(file) {
      // Determine if it's a video or image
      let mediaType = "image";
      if (file.type.startsWith("video")) {
        mediaType = "video";
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Create media item object
      const newMediaItem = {
        id: Date.now() + Math.random(),  // Unique ID
        type: mediaType,
        file: file,
        preview: previewUrl
      };
      
      // Add to media list
      setMedia(function(previousMedia) {
        return previousMedia.concat([newMediaItem]);
      });
    });
  }

  /**
   * Remove a media item from the list.
   * 
   * @param {number} id - ID of media item to remove
   */
  function removeMedia(id) {
    setMedia(function(previousMedia) {
      return previousMedia.filter(function(item) {
        return item.id !== id;
      });
    });
  }

  // ----------------------------------------
  // LOCATION FUNCTIONS
  // ----------------------------------------

  /**
   * Get user's current GPS location.
   * Uses browser's Geolocation API.
   */
  function handleGetCurrentLocation() {
    setGettingLocation(true);
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error(t.locationError, { position: "top-right", autoClose: 3000 });
      setGettingLocation(false);
      return;
    }
    
    // Request current position
    navigator.geolocation.getCurrentPosition(
      // Success callback
      function(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Format location string for display
        const locationString = "Lat: " + latitude.toFixed(4) + ", Long: " + longitude.toFixed(4);
        
        // Update form data with location
        setFormData(function(previousData) {
          return {
            issueType: previousData.issueType,
            description: previousData.description,
            location: locationString,
            coordinates: { latitude: latitude, longitude: longitude },
            priority: previousData.priority
          };
        });
        
        setGettingLocation(false);
      },
      // Error callback
      function(error) {
        toast.error(t.locationError, { position: "top-right", autoClose: 3000 });
        setGettingLocation(false);
      }
    );
  }

  // ----------------------------------------
  // FORM SUBMISSION
  // ----------------------------------------

  /**
   * Handle form submission.
   * Validates fields and sends data to backend.
   * 
   * Backend Endpoint: POST /api/issues
   * 
   * @param {Event} e - Form submit event
   */
  async function handleSubmit(e) {
    // Prevent default form submission (page reload)
    e.preventDefault();
    
    // Step 1: Validate required fields
    if (!formData.issueType || !formData.description || !formData.location) {
      toast.warning(t.fillAllFields, { position: "top-right", autoClose: 3000 });
      return;
    }

    // Step 2: Set submitting state
    setIsSubmitting(true);
    
    try {
      // Step 3: Build FormData object for multipart upload
      const submitData = new FormData();
      
      // Add text fields
      submitData.append("issueType", formData.issueType);
      submitData.append("description", formData.description);
      submitData.append("location", formData.location);
      submitData.append("priority", formData.priority);
      
      // Add coordinates if available
      if (formData.coordinates) {
        submitData.append("latitude", formData.coordinates.latitude);
        submitData.append("longitude", formData.coordinates.longitude);
      }
      
      // Add media files using forEach
      media.forEach(function(item) {
        submitData.append("media", item.file);
      });

      // Step 4: Send to backend API
      await issuesAPI.create(submitData);
      
      // Step 5: Show success screen
      setSubmitted(true);

      // Step 6: Reset form after delay
      setTimeout(function() {
        setSubmitted(false);
        setFormData({
          issueType: "",
          description: "",
          location: "",
          coordinates: null,
          priority: "medium"
        });
        setMedia([]);
      }, 3000);
      
    } catch (error) {
      // Show error message
      toast.error(t.uploadError, { position: "top-right", autoClose: 3000 });
    } finally {
      // Always reset submitting state
      setIsSubmitting(false);
    }
  }

  // ----------------------------------------
  // FORM FIELD UPDATE HELPERS
  // ----------------------------------------

  /**
   * Update a single form field value.
   * 
   * @param {string} fieldName - Name of field to update
   * @param {any} value - New value for the field
   */
  function updateFormField(fieldName, value) {
    setFormData(function(previousData) {
      const newData = {
        issueType: previousData.issueType,
        description: previousData.description,
        location: previousData.location,
        coordinates: previousData.coordinates,
        priority: previousData.priority
      };
      newData[fieldName] = value;
      return newData;
    });
  }

  // ----------------------------------------
  // RENDER: Conditional Screens
  // ----------------------------------------

  // Show KYC required screen if user hasn't verified
  if (!isKycVerified) {
    return (
      <div className="max-w-2xl mx-auto">
        <ToastContainer />
        <KYCRequired t={t} onNavigate={onNavigate} />
      </div>
    );
  }

  // Show success screen after submission
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <ToastContainer />
        <SuccessScreen t={t} />
      </div>
    );
  }

  // ----------------------------------------
  // RENDER: Build Issue Type Options
  // ----------------------------------------
  
  const issueTypeOptions = t.issueTypes.map(function(typeName, index) {
    return (
      <option key={index} value={typeName}>{typeName}</option>
    );
  });

  // ----------------------------------------
  // RENDER: Main Form
  // ----------------------------------------

  return (
    <div className="max-w-2xl mx-auto">
      <ToastContainer />

      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Camera Modal - Fullscreen overlay for taking photos */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Camera header with close button */}
          <div className="flex items-center justify-between p-4 bg-black/50">
            <button onClick={stopCamera} className="text-white p-2">
              <X size={24} />
            </button>
            <span className="text-white font-medium">{t.capturePhoto}</span>
            <div className="w-10" />
          </div>
          
          {/* Video preview */}
          <div className="flex-1 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="max-h-full max-w-full" />
          </div>
          
          {/* Capture button */}
          <div className="p-6 flex justify-center bg-black/50">
            <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <div className="w-14 h-14 border-4 border-gray-300 rounded-full" />
            </button>
          </div>
          
          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Report Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section: Media Upload */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">{t.addPhotos}</h3>
          
          {/* Show media preview if there are uploads */}
          {media.length > 0 && (
            <MediaPreview media={media} onRemove={removeMedia} />
          )}
          
          {/* Upload buttons */}
          <div className="grid grid-cols-2 gap-4">
            {/* Take Photo Button */}
            <button 
              type="button" 
              onClick={startCamera} 
              disabled={isLoading} 
              className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-emerald-300 rounded-xl hover:bg-emerald-50 transition text-emerald-600"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={24} />
              ) : (
                <Camera size={24} />
              )}
              <span className="font-medium">{t.capturePhoto}</span>
            </button>
            
            {/* Upload from Gallery Button */}
            <button 
              type="button" 
              onClick={function() { fileInputRef.current.click(); }} 
              className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition text-blue-600"
            >
              <Image size={24} />
              <span className="font-medium">{t.uploadPhoto}</span>
            </button>
            
            {/* Hidden file input */}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*,video/*" 
              multiple 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </div>
        </div>

        {/* Section: Issue Type Selection */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block font-semibold text-gray-800 mb-3">
            {t.issueType} <span className="text-red-500">*</span>
          </label>
          <select 
            value={formData.issueType} 
            onChange={function(e) { updateFormField("issueType", e.target.value); }} 
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">{t.selectType}</option>
            {issueTypeOptions}
          </select>
        </div>

        {/* Section: Description */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block font-semibold text-gray-800 mb-3">
            {t.description} <span className="text-red-500">*</span>
          </label>
          <textarea 
            value={formData.description} 
            onChange={function(e) { updateFormField("description", e.target.value); }} 
            placeholder={t.descPlaceholder} 
            rows={4} 
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" 
          />
        </div>

        {/* Section: Location */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block font-semibold text-gray-800 mb-3">
            {t.location} <span className="text-red-500">*</span>
          </label>
          
          {/* Location input with GPS button */}
          <div className="flex gap-3">
            <input 
              type="text" 
              value={formData.location} 
              onChange={function(e) { updateFormField("location", e.target.value); }} 
              placeholder={t.locationPlaceholder} 
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent" 
            />
            <button 
              type="button" 
              onClick={handleGetCurrentLocation} 
              disabled={gettingLocation} 
              className="px-4 py-3 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition flex items-center gap-2"
            >
              {gettingLocation ? (
                <Loader className="animate-spin" size={20} />
              ) : (
                <MapPin size={20} />
              )}
            </button>
          </div>
          
          {/* Quick location link */}
          <button 
            type="button" 
            onClick={handleGetCurrentLocation} 
            className="mt-2 text-sm text-emerald-600 hover:underline flex items-center gap-1"
          >
            <MapPin size={14} />
            {t.useCurrentLocation}
          </button>
        </div>

        {/* Section: Priority */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block font-semibold text-gray-800 mb-3">{t.priority}</label>
          <PrioritySelector 
            value={formData.priority} 
            onChange={function(priority) { updateFormField("priority", priority); }} 
            t={t} 
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin" size={20} />
              {t.submitting}
            </>
          ) : (
            <>
              <Send size={20} />
              {t.submit}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ReportIssue;
