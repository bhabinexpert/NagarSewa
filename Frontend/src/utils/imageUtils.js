/**
 * Comprehensive Image URL Normalization Utility
 * Handles various image formats: data URLs, base64, Buffer objects, and file paths
 * Supports all dashboards: admin, user, feed, and KYC documents
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2026/api";
const FILE_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");
const BASE64_CHARS_REGEX = /^[A-Za-z0-9+/=\s]+$/;

/**
 * Detect MIME type from binary data
 * @param {Uint8Array} bytes - Binary data
 * @returns {string} MIME type
 */
export function detectMimeFromBytes(bytes) {
  if (!bytes || bytes.length < 4) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "image/jpeg";
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return "image/gif";
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) return "image/webp";
  return "image/jpeg";
}

/**
 * Detect MIME type from base64 string
 * @param {string} base64Value - Base64 string
 * @returns {string} MIME type
 */
export function detectMimeFromBase64(base64Value) {
  const compact = base64Value.replace(/\s/g, "");
  if (compact.startsWith("iVBORw0KGgo")) return "image/png";
  if (compact.startsWith("/9j/")) return "image/jpeg";
  if (compact.startsWith("R0lGOD")) return "image/gif";
  if (compact.startsWith("UklGR")) return "image/webp";
  if (compact.startsWith("AAAAIGZ0eXA") || compact.startsWith("AAAAGGZ0eXA")) return "video/mp4";
  return "image/jpeg";
}

/**
 * Convert bytes to base64 string
 * @param {Uint8Array} bytes - Binary data
 * @returns {string} Base64 string
 */
export function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Main image URL normalization function - handles all image formats
 * Used by: KYC documents, feed, admin dashboard, issue cards
 *
 * @param {*} value - Raw image value (Buffer object, base64 string, URL path, etc.)
 * @returns {string|null} Normalized URL that can be used in <img src> or null if invalid
 */
export function normalizeImageUrl(value) {
  if (!value) return null;

  // Handle Buffer objects from database
  if (typeof value === "object" && value.type === "Buffer" && Array.isArray(value.data)) {
    try {
      const bytes = Uint8Array.from(value.data);
      const mime = detectMimeFromBytes(bytes);
      return `data:${mime};base64,${bytesToBase64(bytes)}`;
    } catch {
      return null;
    }
  }

  const text = String(value).trim();
  if (!text) return null;

  // Already a data URL
  if (text.startsWith("data:")) return text;

  // Already an absolute URL
  if (text.startsWith("http://") || text.startsWith("https://")) return text;

  // Check if it's a base64 string (raw base64 without data URI prefix)
  const compact = text.replace(/\s/g, "");
  if (compact.length > 120 && BASE64_CHARS_REGEX.test(text)) {
    const mime = detectMimeFromBase64(compact);
    return `data:${mime};base64,${compact}`;
  }

  // Handle file path - ensure single slash between base URL and path
  const normalizedPath = text.replace(/\\/g, "/");
  const cleanBase = FILE_BASE_URL.endsWith("/") ? FILE_BASE_URL.slice(0, -1) : FILE_BASE_URL;
  const cleanPath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Convert raw image value to data URL
 * @param {*} rawValue - Raw image value (Buffer, base64, etc.)
 * @returns {string|null} Data URL or null if invalid
 */
export function toDataUrlFromRaw(rawValue) {
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
 * Build multiple URL candidates for media fallback
 * Useful when backend might serve from different paths
 *
 * @param {string} rawPath - Raw file path or URL
 * @returns {string[]} Array of URL candidates to try
 */
export function buildMediaCandidates(rawPath) {
  if (!rawPath || typeof rawPath !== "string") return [];

  const cleaned = rawPath.replace(/\\/g, "/").trim();
  if (!cleaned) return [];

  // Already absolute URL
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return [cleaned];
  }

  // Extract uploads segment if full path was stored
  const uploadSegment = cleaned.includes("/uploads/")
    ? cleaned.slice(cleaned.indexOf("/uploads/"))
    : null;

  const normalizedRaw = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  const normalizedUpload = uploadSegment
    ? (uploadSegment.startsWith("/") ? uploadSegment : `/${uploadSegment}`)
    : null;

  // Assume issues folder for filename-only paths
  const filenameOnly = !cleaned.includes("/") ? `/uploads/issues/${cleaned}` : null;

  const possiblePaths = [
    normalizedRaw,
    normalizedUpload,
    filenameOnly,
  ].filter(Boolean);

  // Build candidates with proper URL concatenation (no double slashes)
  const cleanBase = FILE_BASE_URL.endsWith("/") ? FILE_BASE_URL.slice(0, -1) : FILE_BASE_URL;
  const candidates = possiblePaths.flatMap((pathValue) => {
    const cleanPath = pathValue.startsWith("/") ? pathValue : `/${pathValue}`;
    return [
      `${cleanBase}${cleanPath}`,
      `${cleanBase}/api${cleanPath}`,
      `${API_BASE_URL}${cleanPath}`,
    ];
  });

  // Remove duplicates while preserving order
  return [...new Set(candidates)];
}

/**
 * Create a multi-source image with fallback URLs
 * Useful for admin dashboard where we want multiple URL attempts
 *
 * @param {string} imagePath - Primary image path
 * @returns {Object} Object with sources array for fallback loading
 */
export function createMediaSource(imagePath) {
  const candidates = buildMediaCandidates(imagePath);
  if (candidates.length === 0) {
    // Try normalizing as single URL
    const normalized = normalizeImageUrl(imagePath);
    return { sources: normalized ? [normalized] : [] };
  }
  return { sources: candidates };
}
