import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../../context/useLanguage";
import {
  Camera,
  Image,
  X,
  MapPin,
  Send,
  AlertCircle,
  CheckCircle,
  Upload,
  Video,
  Loader,
  RotateCcw,
  ZoomIn,
} from "lucide-react";

const reportText = {
  en: {
    title: "Report an Issue",
    subtitle: "Help improve your community by reporting problems",
    capturePhoto: "Capture Photo",
    uploadPhoto: "Upload from Gallery",
    recordVideo: "Record Video",
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
    retake: "Retake",
    remove: "Remove",
    preview: "Preview",
    issueTypes: [
      "Road Damage",
      "Water Supply",
      "Electricity",
      "Garbage/Sanitation",
      "Street Light",
      "Drainage",
      "Public Safety",
      "Other",
    ],
  },
  np: {
    title: "समस्या रिपोर्ट गर्नुहोस्",
    subtitle: "समस्याहरू रिपोर्ट गरेर आफ्नो समुदाय सुधार गर्न मद्दत गर्नुहोस्",
    capturePhoto: "फोटो खिच्नुहोस्",
    uploadPhoto: "ग्यालेरीबाट अपलोड गर्नुहोस्",
    recordVideo: "भिडियो रेकर्ड गर्नुहोस्",
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
    retake: "पुन: खिच्नुहोस्",
    remove: "हटाउनुहोस्",
    preview: "पूर्वावलोकन",
    issueTypes: [
      "सडक क्षति",
      "पानी आपूर्ति",
      "बिजुली",
      "फोहोर/सरसफाई",
      "सडक बत्ती",
      "ढल निकास",
      "सार्वजनिक सुरक्षा",
      "अन्य",
    ],
  },
};

const ReportIssue = () => {
  const { language } = useLanguage();
  const t = reportText[language];

  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    location: "",
    priority: "medium",
    media: [],
  });

  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      setIsLoading(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert(language === "en" ? "Unable to access camera" : "क्यामेरा पहुँच गर्न असमर्थ");
    } finally {
      setIsLoading(false);
    }
  };

  // Set video source when stream is available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, showCamera]);

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setFormData((prev) => ({
        ...prev,
        media: [...prev.media, { type: "image", data: imageData, id: Date.now() }],
      }));
      stopCamera();
    }
  };

  // Handle file upload from gallery
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          media: [
            ...prev.media,
            {
              type: file.type.startsWith("video") ? "video" : "image",
              data: reader.result,
              id: Date.now() + Math.random(),
              name: file.name,
            },
          ],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove media
  const removeMedia = (id) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((m) => m.id !== id),
    }));
  };

  // Get current location
  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you'd reverse geocode this
          setFormData((prev) => ({
            ...prev,
            location: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`,
            coordinates: { latitude, longitude },
          }));
          setGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
          alert(language === "en" ? "Unable to get location" : "स्थान प्राप्त गर्न असमर्थ");
        }
      );
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.issueType || !formData.description || !formData.location) {
      alert(language === "en" ? "Please fill all required fields" : "कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setSubmitted(true);

    // Reset after showing success
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        issueType: "",
        description: "",
        location: "",
        priority: "medium",
        media: [],
      });
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.success}</h2>
        <p className="text-gray-500">
          {language === "en"
            ? "Your report has been submitted and will be reviewed by the authorities."
            : "तपाईंको रिपोर्ट पठाइएको छ र अधिकारीहरूद्वारा समीक्षा गरिनेछ।"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.title}</h2>
        <p className="text-gray-500">{t.subtitle}</p>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50">
            <button onClick={stopCamera} className="text-white p-2">
              <X size={24} />
            </button>
            <span className="text-white font-medium">{t.capturePhoto}</span>
            <div className="w-10" />
          </div>
          <div className="flex-1 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-h-full max-w-full"
            />
          </div>
          <div className="p-6 flex justify-center bg-black/50">
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <div className="w-14 h-14 border-4 border-gray-300 rounded-full" />
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Media Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {language === "en" ? "Add Photos/Videos" : "फोटो/भिडियो थप्नुहोस्"}
          </h3>

          {/* Media Preview */}
          {formData.media.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {formData.media.map((media) => (
                <div key={media.id} className="relative group rounded-xl overflow-hidden">
                  {media.type === "image" ? (
                    <img
                      src={media.data}
                      alt="Captured"
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <video
                      src={media.data}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(media.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Buttons */}
          <div className="grid grid-cols-2 gap-4">
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition text-blue-600"
            >
              <Image size={24} />
              <span className="font-medium">{t.uploadPhoto}</span>
            </button>
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

        {/* Issue Type */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block font-semibold text-gray-800 mb-3">
            {t.issueType} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">{t.selectType}</option>
            {t.issueTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block font-semibold text-gray-800 mb-3">
            {t.description} <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={t.descPlaceholder}
            rows={4}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block font-semibold text-gray-800 mb-3">
            {t.location} <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t.locationPlaceholder}
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
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
          <button
            type="button"
            onClick={getCurrentLocation}
            className="mt-2 text-sm text-emerald-600 hover:underline flex items-center gap-1"
          >
            <MapPin size={14} />
            {t.useCurrentLocation}
          </button>
        </div>

        {/* Priority */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <label className="block font-semibold text-gray-800 mb-3">{t.priority}</label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { value: "low", label: t.low, color: "green" },
              { value: "medium", label: t.medium, color: "yellow" },
              { value: "high", label: t.high, color: "orange" },
              { value: "urgent", label: t.urgent, color: "red" },
            ].map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: level.value })}
                className={`p-3 rounded-xl border-2 transition text-center ${
                  formData.priority === level.value
                    ? level.color === "green"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : level.color === "yellow"
                      ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : level.color === "orange"
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="font-medium text-sm">{level.label}</span>
              </button>
            ))}
          </div>
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
};

export default ReportIssue;
