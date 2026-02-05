import React, { useEffect, useMemo, useState } from "react";
import { Send, Megaphone, AlertCircle, RefreshCw, Bell } from "lucide-react";
import { broadcastsAPI } from "../../../services/api";
import { useAuth } from "../../../contexts/auth/useAuth";

function AdminBroadcasts() {
  const { isSuperAdmin, isWardAdmin, getUserWard, currentUser } = useAuth();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [broadcasts, setBroadcasts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [newCount, setNewCount] = useState(0);

  const wardLabel = isWardAdmin() ? `Ward ${getUserWard()}` : "All Wards";
  const storageKey = useMemo(() => {
    const id = currentUser?.id || "anonymous";
    return `broadcasts_last_seen_${id}`;
  }, [currentUser?.id]);

  async function loadBroadcasts() {
    setLoading(true);
    setError("");
    try {
      const response = await broadcastsAPI.getAdmin();
      const items = response?.data?.broadcasts || [];
      setBroadcasts(items);
      const lastSeen = parseInt(localStorage.getItem(storageKey) || "0", 10);
      const unseen = items.filter((item) => new Date(item.createdAt).getTime() > lastSeen).length;
      setNewCount(unseen);
    } catch (err) {
      const message = err?.message || "Failed to load broadcasts";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function markViewed(items) {
    const latest = items[0]?.createdAt ? new Date(items[0].createdAt).getTime() : Date.now();
    localStorage.setItem(storageKey, String(latest));
    setNewCount(0);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await broadcastsAPI.send({ title, message });
      setTitle("");
      setMessage("");
      setSuccess("Broadcast sent successfully");
      await loadBroadcasts();
    } catch (err) {
      const message = err?.message || "Failed to send broadcast";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadBroadcasts();
  }, []);

  useEffect(() => {
    if (!loading && broadcasts.length > 0 && newCount > 0) {
      markViewed(broadcasts);
    }
  }, [loading, broadcasts, newCount]);

  const filteredBroadcasts = useMemo(() => {
    if (filter === "municipal") {
      return broadcasts.filter((item) => item.level === "municipal");
    }
    if (filter === "ward") {
      return broadcasts.filter((item) => item.level === "ward");
    }
    return broadcasts;
  }, [broadcasts, filter]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="text-indigo-600" size={22} />
          <h2 className="text-lg font-semibold text-gray-800">Send Broadcast</h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {isSuperAdmin()
            ? "Your notice will be visible to all users and admins."
            : `Your notice will be visible to users in ${wardLabel}.`}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Broadcast title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Write your announcement here..."
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-emerald-600">{success}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
          >
            <Send size={16} />
            {submitting ? "Sending..." : "Send Broadcast"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="text-indigo-600" size={20} />
              {newCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {newCount}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Notice History</h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => markViewed(broadcasts)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Mark viewed
            </button>
            <button
              onClick={loadBroadcasts}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
              aria-label="Refresh"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { id: "all", label: "All" },
            { id: "municipal", label: "Municipal Level" },
            { id: "ward", label: "Ward Level" },
          ].map((item) => {
            const isActive = filter === item.id;
            const buttonClass = isActive
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200";
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${buttonClass}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading notices...</div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="text-sm text-gray-500">No notices available.</div>
        ) : (
          <div className="space-y-4">
            {filteredBroadcasts.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-800">{item.title}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        item.level === "municipal"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {item.level === "municipal" ? "Municipal" : `Ward ${item.targetWard}`}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                  {item.message}
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  Sent by {item.senderName || "Super Admin"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBroadcasts;
