/**
 * Professional Issue Card Component for Admin Dashboard
 * Shows complete issue details with images, location, priority, and action buttons
 */

import React, { useState } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Flag,
  Loader,
  Eye,
  MessageSquare,
  Hash,
} from "lucide-react";

// Build a stable base URL from API URL so uploaded files load in all environments.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2026/api";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const VIDEO_EXTENSIONS = /\.(mp4|mov|avi|webm|mkv)$/i;
const BASE64_CHARS_REGEX = /^[A-Za-z0-9+/=\s]+$/;

/**
 * Parse issue attachment field into a clean string array.
 * Supports:
 * - JSON array string: ["...","..."]
 * - PostgreSQL array literal: {"...","..."}
 * - Single string path
 * - Already-parsed array
 */
function parseIssuePhotos(photoField) {
  if (!photoField) return [];

  if (Array.isArray(photoField)) {
    return photoField.flatMap((item) => parseIssuePhotos(item));
  }

  if (typeof photoField === "object" && photoField !== null) {
    // Keep Buffer-like objects as-is so we can convert them to data URLs later.
    if (photoField.type === "Buffer" && Array.isArray(photoField.data)) {
      return [photoField];
    }
    return Object.values(photoField).flatMap((item) => parseIssuePhotos(item));
  }

  if (typeof photoField !== "string") {
    return [photoField];
  }

  const value = photoField.trim();
  if (!value) return [];

  // 1) JSON format (including double-encoded JSON strings)
  try {
    const parsed = JSON.parse(value);
    return parseIssuePhotos(parsed);
  } catch {
    // Continue to alternative parsers below
  }

  // 2) PostgreSQL array literal: {"/a","/b"}
  if (value.startsWith("{") && value.endsWith("}")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(",")
      .map((item) => item.trim().replace(/^"(.*)"$/, "$1"))
      .filter(Boolean);
  }

  // 3) Comma-separated fallback
  if (value.includes(",")) {
    return value
      .split(",")
      .map((item) => item.trim().replace(/^"(.*)"$/, "$1"))
      .filter(Boolean);
  }

  // 4) Single path fallback
  return [value];
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function detectMimeFromBytes(bytes) {
  if (!bytes || bytes.length < 4) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return "image/webp";
  return "image/jpeg";
}

function detectMimeFromBase64(base64Value) {
  const compact = base64Value.replace(/\s/g, "");
  if (compact.startsWith("iVBORw0KGgo")) return "image/png";
  if (compact.startsWith("/9j/")) return "image/jpeg";
  if (compact.startsWith("R0lGOD")) return "image/gif";
  if (compact.startsWith("UklGR")) return "image/webp";
  if (compact.startsWith("AAAAIGZ0eXA") || compact.startsWith("AAAAGGZ0eXA")) return "video/mp4";
  return "image/jpeg";
}

function toDataUrlFromRaw(rawValue) {
  if (!rawValue) return null;

  // Buffer object serialized by JSON (common when binary is read from DB)
  if (typeof rawValue === "object" && rawValue.type === "Buffer" && Array.isArray(rawValue.data)) {
    try {
      const bytes = Uint8Array.from(rawValue.data);
      const mime = detectMimeFromBytes(bytes);
      return `data:${mime};base64,${bytesToBase64(bytes)}`;
    } catch {
      return null;
    }
  }

  if (typeof rawValue !== "string") {
    return null;
  }

  const value = rawValue.trim();
  if (!value) return null;

  // Already a renderable data URI from DB
  if (value.startsWith("data:")) {
    return value;
  }

  // Raw base64 from DB (without data URI prefix)
  const compact = value.replace(/\s/g, "");
  if (compact.length > 120 && BASE64_CHARS_REGEX.test(value)) {
    const mime = detectMimeFromBase64(compact);
    return `data:${mime};base64,${compact}`;
  }

  return null;
}

/**
 * Build multiple URL candidates so media still loads if backend is served
 * from either /uploads or /api/uploads.
 */
function buildMediaCandidates(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return [];

  const cleaned = rawPath.replace(/\\/g, "/").trim();
  if (!cleaned) return [];

  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return [cleaned];
  }

  // If backend accidentally stores filesystem path, extract uploads segment.
  const uploadSegment = cleaned.includes("/uploads/")
    ? cleaned.slice(cleaned.indexOf("/uploads/"))
    : null;

  const normalizedRaw = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  const normalizedUpload = uploadSegment
    ? (uploadSegment.startsWith("/") ? uploadSegment : `/${uploadSegment}`)
    : null;

  // If value is only a filename, assume issues upload folder.
  const filenameOnly = !cleaned.includes("/") ? `/uploads/issues/${cleaned}` : null;

  const possiblePaths = [
    normalizedRaw,
    normalizedUpload,
    filenameOnly,
  ].filter(Boolean);

  const candidates = possiblePaths.flatMap((pathValue) => ([
    `${FILE_BASE_URL}${pathValue}`,
    `${FILE_BASE_URL}/api${pathValue}`,
    `${API_BASE_URL}${pathValue}`,
  ]));

  // Keep order but remove duplicates
  return [...new Set(candidates)];
}

export function IssueCard({ issue, t, isSuperAdmin, onStatusUpdate, onPrioritySet, isSubmitting }) {
  const [expanded, setExpanded] = useState(false);
  const [response, setResponse] = useState("");
  const [priorityNote, setPriorityNote] = useState("");
  const normalizePriority = (value) => {
    if (!value) return "medium";
    const normalized = String(value).toLowerCase();
    if (normalized === "critical") return "urgent";
    return normalized;
  };

  const toApiPriority = (value) => {
    const normalized = normalizePriority(value);
    if (normalized === "low") return "LOW";
    if (normalized === "medium") return "MEDIUM";
    if (normalized === "high") return "HIGH";
    if (normalized === "urgent") return "CRITICAL";
    return String(value || "").toUpperCase();
  };

  const [selectedPriority, setSelectedPriority] = useState(normalizePriority(issue.priority));
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [previewSourceIndex, setPreviewSourceIndex] = useState(0);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status configuration
  const statusConfig = {
    pending: { 
      icon: Clock, 
      color: "text-yellow-800", 
      bg: "bg-yellow-50", 
      border: "border-yellow-300",
      badgeBg: "bg-yellow-500",
      badgeText: "text-white"
    },
    in_progress: { 
      icon: AlertCircle, 
      color: "text-blue-800", 
      bg: "bg-blue-50", 
      border: "border-blue-300",
      badgeBg: "bg-blue-500",
      badgeText: "text-white"
    },
    resolved: { 
      icon: CheckCircle, 
      color: "text-green-800", 
      bg: "bg-green-50", 
      border: "border-green-300",
      badgeBg: "bg-green-500",
      badgeText: "text-white"
    },
    rejected: { 
      icon: XCircle, 
      color: "text-red-800", 
      bg: "bg-red-50", 
      border: "border-red-300",
      badgeBg: "bg-red-500",
      badgeText: "text-white"
    },
  };

  const normalizeStatus = (value) => {
    if (!value) return "pending";
    const normalized = String(value).toLowerCase();
    if (normalized === "inprogress") return "in_progress";
    if (normalized === "in-progress") return "in_progress";
    return normalized;
  };

  const toApiStatus = (value) => {
    const normalized = normalizeStatus(value);
    if (normalized === "pending") return "PENDING";
    if (normalized === "in_progress") return "IN_PROGRESS";
    if (normalized === "resolved") return "RESOLVED";
    if (normalized === "rejected") return "REJECTED";
    return String(value || "").toUpperCase();
  };

  const status = normalizeStatus(issue.status || 'pending');
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  // Priority configuration
  const priorityConfig = {
    low: { color: "text-gray-700", bg: "bg-gray-500", text: "text-white" },
    medium: { color: "text-yellow-700", bg: "bg-yellow-500", text: "text-white" },
    high: { color: "text-orange-700", bg: "bg-orange-500", text: "text-white" },
    urgent: { color: "text-red-700", bg: "bg-red-600", text: "text-white" },
  };

  const priorityKey = normalizePriority(issue.priority || 'medium');
  const priorityStyle = priorityConfig[priorityKey] || priorityConfig.medium;

  const statusLabels = {
    pending: t.pending || 'Pending',
    in_progress: t.inProgress || 'In Progress',
    resolved: t.resolved || 'Resolved',
    rejected: t.rejected || 'Rejected',
  };

  const priorityLabels = {
    low: t.low || 'Low',
    medium: t.medium || 'Medium',
    high: t.high || 'High',
    urgent: t.urgent || 'Urgent',
  };

  // Parse issue attachments and prepare resilient URL candidates.
  const attachments = parseIssuePhotos(issue.photo_url)
    .map((rawValue) => {
      const dbDataUrl = toDataUrlFromRaw(rawValue);
      const sources = dbDataUrl ? [dbDataUrl] : buildMediaCandidates(String(rawValue));
      if (sources.length === 0) return null;
      const primarySource = sources[0] || "";
      const isVideoBySource = primarySource.startsWith("data:video/");
      const isVideoByPath = typeof rawValue === "string" && VIDEO_EXTENSIONS.test(rawValue);
      return {
        rawValue,
        sources,
        isVideo: isVideoBySource || isVideoByPath,
      };
    })
    .filter(Boolean);

  // Handle status update
  const handleStatusUpdate = (newStatus) => {
    setSelectedStatus(newStatus);
    setShowStatusModal(true);
  };

  const submitStatusUpdate = async () => {
    await onStatusUpdate(issue.id, toApiStatus(selectedStatus), response);
    setShowStatusModal(false);
    setResponse("");
  };

  // Handle priority update
  const handlePriorityUpdate = async () => {
    await onPrioritySet(issue.id, toApiPriority(selectedPriority), priorityNote);
    setPriorityNote("");
  };

  return (
    <div className="bg-white rounded-xl shadow-md border-l-4 overflow-hidden transition-all hover:shadow-lg" style={{ borderLeftColor: config.badgeBg.replace('bg-', '#') }}>
      {/* Professional Header */}
      <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${config.badgeBg} ${config.badgeText} shadow-sm flex items-center gap-2`}>
                <StatusIcon size={16} />
                {statusLabels[status]}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${priorityStyle.bg} ${priorityStyle.text} shadow-sm flex items-center gap-2`}>
                <Flag size={16} />
                {priorityLabels[priorityKey]}
              </span>
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-indigo-500 text-white shadow-sm">
                {issue.category || 'General'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Hash size={16} className="text-gray-400" />
                <span className="font-mono text-xs">{issue.id}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin size={16} className="text-gray-400" />
                <span className="font-medium">Ward {issue.ward_number}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-4 p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            {expanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Issue Description */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Issue Description</h3>
          <p className="text-gray-700 leading-relaxed text-base">
            {issue.description || 'No description provided'}
          </p>
        </div>

        {/* Meta Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-50 p-4 rounded-lg">
          {issue.location && (
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                <p className="text-sm text-gray-900 font-medium">{issue.location}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <User size={20} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Reported By</p>
              <p className="text-sm text-gray-900 font-medium">{issue.reporter_name || 'Anonymous'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar size={20} className="text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Reported On</p>
              <p className="text-sm text-gray-900 font-medium">{formatDate(issue.created_at)}</p>
            </div>
          </div>
          {attachments.length > 0 && (
            <div className="flex items-start gap-3">
              <ImageIcon size={20} className="text-indigo-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Attachments</p>
                <p className="text-sm text-gray-900 font-medium">{attachments.length} File(s)</p>
              </div>
            </div>
          )}
        </div>

        {/* Photos Grid */}
        {attachments.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase">Attached Files</h4>
            <div className={`grid ${attachments.length === 1 ? 'grid-cols-1 max-w-md' : attachments.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
              {attachments.map((attachment, idx) => (
                <div 
                  key={idx} 
                  className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group cursor-pointer border-2 border-gray-200 hover:border-indigo-500 transition-all"
                  onClick={() => {
                    setImagePreview(attachment);
                    setPreviewSourceIndex(0);
                  }}
                >
                  {attachment.isVideo ? (
                    <video
                      src={attachment.sources[0]}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      onError={(e) => {
                        const currentIndex = Number(e.currentTarget.dataset.srcIndex || "0");
                        const nextIndex = currentIndex + 1;
                        if (nextIndex < attachment.sources.length) {
                          e.currentTarget.dataset.srcIndex = String(nextIndex);
                          e.currentTarget.src = attachment.sources[nextIndex];
                          e.currentTarget.load();
                          return;
                        }
                        e.currentTarget.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-gray-400 text-sm">Video unavailable</span></div>';
                      }}
                    />
                  ) : (
                    <img
                      src={attachment.sources[0]}
                      alt={`Issue evidence ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const currentIndex = Number(e.currentTarget.dataset.srcIndex || "0");
                        const nextIndex = currentIndex + 1;
                        if (nextIndex < attachment.sources.length) {
                          e.currentTarget.dataset.srcIndex = String(nextIndex);
                          e.currentTarget.src = attachment.sources[nextIndex];
                          return;
                        }
                        e.currentTarget.parentElement.innerHTML = '<div class="flex items-center justify-center h-full"><span class="text-gray-400 text-sm">Image unavailable</span></div>';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                    <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" size={32} />
                  </div>
                  <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    File {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isSuperAdmin && status !== 'resolved' && status !== 'rejected' && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            <h4 className="w-full text-sm font-bold text-gray-900 mb-2 uppercase">Quick Actions</h4>
            {status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <AlertCircle size={18} />
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Reject Issue
                </button>
              </>
            )}
            {status === 'in_progress' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={18} />
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <XCircle size={18} />
                  Reject Issue
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div className="border-t-2 border-gray-200 bg-gray-50 p-6 space-y-4">
          {/* Coordinates */}
          {(issue.latitude && issue.longitude) && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-bold mb-2 flex items-center gap-2">
                <MapPin size={14} />
                GPS Coordinates
              </p>
              <p className="text-sm text-gray-700 font-mono">
                Latitude: {issue.latitude}, Longitude: {issue.longitude}
              </p>
            </div>
          )}

          {/* Admin Response */}
          {issue.admin_response && (
            <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-500 shadow-sm">
              <p className="text-xs text-indigo-700 uppercase font-bold mb-2 flex items-center gap-2">
                <MessageSquare size={14} />
                Admin Response
              </p>
              <p className="text-sm text-indigo-900 leading-relaxed">{issue.admin_response}</p>
            </div>
          )}

          {/* Super Admin Priority Section */}
          {isSuperAdmin && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase flex items-center gap-2">
                <Flag size={16} />
                Set Priority Level
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {['low', 'medium', 'high', 'urgent'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPriority(p)}
                    className={`px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                      selectedPriority === p
                        ? `${priorityConfig[p].bg} ${priorityConfig[p].text} shadow-md scale-105`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {priorityLabels[p]}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Add priority instructions for ward admin..."
                value={priorityNote}
                onChange={(e) => setPriorityNote(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
                rows={3}
              />
              <button
                onClick={handlePriorityUpdate}
                disabled={isSubmitting}
                className="w-full px-5 py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader className="animate-spin" size={18} /> : <Flag size={18} />}
                Set Priority
              </button>
            </div>
          )}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Update Status
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Change issue status to <span className="font-bold text-indigo-600">{statusLabels[selectedStatus]}</span>
            </p>
            <textarea
              placeholder="Enter your response to the citizen (optional)..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitStatusUpdate}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                {isSubmitting && <Loader className="animate-spin" size={16} />}
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setImagePreview(null);
            setPreviewSourceIndex(0);
          }}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => {
                setImagePreview(null);
                setPreviewSourceIndex(0);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-xl font-bold"
            >
              ✕ Close
            </button>
            {imagePreview.isVideo ? (
              <video
                src={imagePreview.sources[previewSourceIndex]}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onError={() => {
                  if (previewSourceIndex + 1 < imagePreview.sources.length) {
                    setPreviewSourceIndex(previewSourceIndex + 1);
                  }
                }}
              />
            ) : (
              <img
                src={imagePreview.sources[previewSourceIndex]}
                alt="Full size preview"
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                onError={() => {
                  if (previewSourceIndex + 1 < imagePreview.sources.length) {
                    setPreviewSourceIndex(previewSourceIndex + 1);
                  }
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
