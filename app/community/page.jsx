"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

const getMediaUrl = (url, fallback = "/images/navaratri-ganesha.jpg") => {
  if (!url || !String(url).trim()) return fallback;
  const trimmed = String(url).trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/uploads/")) return `${API_BASE}${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `${API_BASE}/${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed;
  return `${API_BASE}/${trimmed}`;
};

export default function CommunityPage() {
  // State: Posts & Stories
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeTag, setActiveTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMyPostsOnly, setFilterMyPostsOnly] = useState(false);
  const [filterSavedOnly, setFilterSavedOnly] = useState(false);

  // State: User & Auth
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // State: Saved / Bookmarked Posts & Poll
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [pollVotes, setPollVotes] = useState({
    1: 48, // Mega Blood Donation Camp
    2: 36, // Daily Free Annadanam
    3: 29, // Underprivileged Student Kits
    4: 21, // Green Jagtial Tree Plantation
  });
  const [userVotedOption, setUserVotedOption] = useState(null);

  // State: Create Post Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState("NAVARATRI");
  const [newLocation, setNewLocation] = useState("Hindu Swaraj Youth Pandal, Jagtial");
  const [newTags, setNewTags] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [submittingPost, setSubmittingPost] = useState(false);
  const fileInputRef = useRef(null);

  // State: Comments, Lightbox, Stories Viewer & Reactions
  const [activeCommentsPostId, setActiveCommentsPostId] = useState(null);
  const [postComments, setPostComments] = useState({});
  const [newCommentText, setNewCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [activeStory, setActiveStory] = useState(null);
  const [flyingReactions, setFlyingReactions] = useState({}); // { [postId]: bool }

  // State: Online Members & Live Direct Chat
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [directMsgInput, setDirectMsgInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  // Load User, Saved Posts, Online Members & Feed on Mount
  useEffect(() => {
    checkLoggedInUser();
    loadSavedPostIds();
    fetchStories();
    fetchOnlineMembers();
    fetchPosts();

    // Heartbeat & Online check interval
    const interval = setInterval(() => {
      sendHeartbeat();
      fetchOnlineMembers();
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedCategory, activeTag]);

  const sendHeartbeat = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${API_BASE}/community/heartbeat`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {}
  };

  const fetchOnlineMembers = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/online-members`);
      const json = await res.json();
      if (json.success && json.data) {
        setOnlineMembers(json.data);
      }
    } catch (e) {
      console.warn("Failed to load online members:", e);
    }
  };

  // Web Audio Notification Chime
  const playChatChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  // Open Direct Chat Messenger
  const handleOpenChat = async (targetUser) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    setActiveChatUser(targetUser);
    try {
      const res = await fetch(`${API_BASE}/community/messages/${targetUser.id}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setChatMessages(json.data);
      }
    } catch (e) {
      console.error("Failed to load chat:", e);
    }
  };

  // Send Direct Message
  const handleSendDirectMessage = async (textToSend) => {
    const text = textToSend || directMsgInput;
    if (!text.trim() || !activeChatUser || !currentUser) return;

    setSendingMsg(true);
    playChatChime();

    // Optimistic UI update
    const tempMsg = {
      id: `temp-${Date.now()}`,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      receiver_id: activeChatUser.id,
      receiver_name: activeChatUser.name,
      message_text: text.trim(),
      created_at: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, tempMsg]);
    setDirectMsgInput("");

    try {
      const res = await fetch(`${API_BASE}/community/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          receiver_id: activeChatUser.id,
          receiver_name: activeChatUser.name,
          message_text: text.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setChatMessages((prev) =>
          prev.map((m) => (m.id === tempMsg.id ? json.data : m))
        );
      }
    } catch (e) {
      console.error("Send message error:", e);
    } finally {
      setSendingMsg(false);
    }
  };

  const checkLoggedInUser = () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUser({ ...parsed, role: storedRole || parsed.role || "MEMBER", token });
      } catch (e) {
        setCurrentUser({ name: "Member", role: storedRole || "MEMBER", token });
      }
    }
  };

  const loadSavedPostIds = () => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("hsy_saved_posts") || "[]");
      setSavedPostIds(saved);
    } catch (e) {
      setSavedPostIds([]);
    }
  };

  const handleToggleBookmark = (postId) => {
    let updated;
    if (savedPostIds.includes(postId)) {
      updated = savedPostIds.filter((id) => id !== postId);
    } else {
      updated = [...savedPostIds, postId];
    }
    setSavedPostIds(updated);
    localStorage.setItem("hsy_saved_posts", JSON.stringify(updated));
  };

  const handleVotePoll = (optionId) => {
    if (userVotedOption) return;
    setUserVotedOption(optionId);
    setPollVotes((prev) => ({ ...prev, [optionId]: prev[optionId] + 1 }));
  };

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_BASE}/community/stories`);
      const json = await res.json();
      if (json.success && json.data) {
        setStories(json.data);
      }
    } catch (e) {
      console.warn("Failed to load community stories:", e);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE}/community/posts?page=1&limit=30`;
      if (selectedCategory && selectedCategory !== "ALL") {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      if (activeTag) {
        url += `&tag=${encodeURIComponent(activeTag)}`;
      }
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setPosts(json.data);
      }
    } catch (err) {
      console.error("Failed to load community posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginForm.identifier.trim(),
          password: loginForm.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      setCurrentUser({ ...data.user, role: data.role, token: data.token });
      setShowLoginModal(false);
      setLoginForm({ identifier: "", password: "" });
    } catch (err) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out from Hindu Swaraj Community?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      setCurrentUser(null);
      setShowUserDropdown(false);
    }
  };

  // File Picker & Previews
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files].slice(0, 8));

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews].slice(0, 8));
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Create Post Submit
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newCaption.trim()) {
      alert("Please write a caption or story for your post.");
      return;
    }

    if (!currentUser || !currentUser.token) {
      setShowLoginModal(true);
      return;
    }

    setSubmittingPost(true);

    try {
      const formData = new FormData();
      formData.append("caption", newCaption.trim());
      formData.append("category", newCategory);
      formData.append("location", newLocation.trim());
      formData.append("tags", newTags.trim());

      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const res = await fetch(`${API_BASE}/community/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      // Prepend newly created post
      setPosts((prev) => [data.data, ...prev]);
      setShowCreateModal(false);
      setNewCaption("");
      setSelectedFiles([]);
      setPreviewUrls([]);
      setNewTags("");
    } catch (err) {
      alert("Error posting seva moment: " + err.message);
    } finally {
      setSubmittingPost(false);
    }
  };

  // Like / Reaction Toggle
  const handleToggleLike = async (post) => {
    // Trigger flying animation
    setFlyingReactions((prev) => ({ ...prev, [post.id]: true }));
    setTimeout(() => {
      setFlyingReactions((prev) => ({ ...prev, [post.id]: false }));
    }, 700);

    try {
      const res = await fetch(`${API_BASE}/community/posts/${post.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser?.id || null }),
      });

      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, likes_count: data.likes_count } : p))
        );
      }
    } catch (e) {
      console.error("Failed to toggle like:", e);
    }
  };

  // Comments Toggle & Fetch
  const handleToggleComments = async (postId) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);

    if (!postComments[postId]) {
      try {
        const res = await fetch(`${API_BASE}/community/posts/${postId}/comments`);
        const json = await res.json();
        if (json.success) {
          setPostComments((prev) => ({ ...prev, [postId]: json.data || [] }));
        }
      } catch (e) {
        console.error("Failed to load comments:", e);
      }
    }
  };

  // Submit Comment
  const handleAddComment = async (postId) => {
    if (!newCommentText.trim()) return;

    setCommentLoading(true);
    try {
      const res = await fetch(`${API_BASE}/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment_text: newCommentText.trim(),
          author_name: currentUser ? currentUser.name : "Devotee / Volunteer",
          user_id: currentUser ? currentUser.id : null,
          author_role: currentUser ? currentUser.role : "MEMBER",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPostComments((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.data],
        }));
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p))
        );
        setNewCommentText("");
      }
    } catch (err) {
      console.error("Comment submit error:", err);
    } finally {
      setCommentLoading(false);
    }
  };

  // Admin Delete Post
  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

    if (!currentUser || !currentUser.token) {
      alert("Please login with admin privileges to delete.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/community/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      alert("🗑️ Post removed successfully.");
    } catch (err) {
      alert("Error deleting post: " + err.message);
    }
  };

  // Admin Pin Post
  const handlePinPost = async (postId) => {
    if (!currentUser || !currentUser.token) return;

    try {
      const res = await fetch(`${API_BASE}/community/posts/${postId}/pin`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, is_pinned: data.data.is_pinned } : p))
        );
      }
    } catch (err) {
      console.error("Pin error:", err);
    }
  };

  // Share to WhatsApp
  const handleSharePostWhatsApp = (post) => {
    const postUrl = `${window.location.origin}/community#post-${post.id}`;
    const text = `🚩 *${post.author_name}* shared a Seva Moment on *Hindu Swaraj Community Feed*!\n\n"${post.caption.substring(0, 140)}..."\n\n📍 ${post.location}\n📸 View Photos & Reactions here:\n${postUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const isAdmin = currentUser && ["SUPER_ADMIN", "PRESIDENT", "VICE_PRESIDENT", "GENERAL_SECRETARY"].includes(currentUser.role);

  return (
    <div className={styles.communityContainer}>
      {/* ================= 1. HEADER BAR ================= */}
      <header className={styles.communityHeader}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brandGroup}>
            <Image
              src="/images/logo_v2.png"
              alt="Hindu Swaraj Logo"
              width={42}
              height={42}
              className={styles.brandLogo}
            />
            <div>
              <div className={styles.brandTitle}>
                HSY Community <span className={styles.brandBadge}>LIVE</span>
              </div>
              <div className={styles.brandSub}>Youth Seva, Festival Moments &amp; Darshan Feed</div>
            </div>
          </Link>

          {/* Live Search Bar */}
          <div className={styles.headerSearchWrap}>
            <span className={styles.headerSearchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search posts, devotees, #tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.headerSearchInput}
            />
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.createPostBtn}
              onClick={() => {
                if (currentUser) {
                  setShowCreateModal(true);
                } else {
                  setShowLoginModal(true);
                }
              }}
            >
              <span>📸</span>
              <span>Share Moment</span>
            </button>

            {currentUser ? (
              <div className={styles.profileDropdownContainer}>
                <div
                  className={styles.userProfileClickable}
                  onClick={() => setShowUserDropdown((prev) => !prev)}
                >
                  <Image
                    src={currentUser.photo_url || "/images/leader-president.png"}
                    alt={currentUser.name}
                    width={32}
                    height={32}
                    className={styles.userAvatarTiny}
                  />
                  <span>{currentUser.name.split(" ")[0]}</span>
                  <span style={{ fontSize: "0.68rem" }}>▼</span>
                </div>

                {/* Profile Dropdown Menu with Logout */}
                {showUserDropdown && (
                  <div className={styles.userDropdownMenu}>
                    <div className={styles.dropdownUserHeader}>
                      <div className={styles.dropdownUserName}>{currentUser.name}</div>
                      <div className={styles.dropdownUserRole}>
                        {currentUser.role === "PRESIDENT" ? "👑 PRESIDENT" : currentUser.role === "SUPER_ADMIN" ? "🛡️ SUPER ADMIN" : "🤝 ACTIVE MEMBER"}
                      </div>
                    </div>

                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setFilterMyPostsOnly((prev) => !prev);
                        setFilterSavedOnly(false);
                        setShowUserDropdown(false);
                      }}
                    >
                      <span>📸</span>
                      <span>{filterMyPostsOnly ? "Show All Posts" : "My Uploaded Moments"}</span>
                    </button>

                    <button
                      className={styles.dropdownItem}
                      onClick={() => {
                        setFilterSavedOnly((prev) => !prev);
                        setFilterMyPostsOnly(false);
                        setShowUserDropdown(false);
                      }}
                    >
                      <span>🔖</span>
                      <span>Saved Moments ({savedPostIds.length})</span>
                    </button>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className={styles.dropdownItem}
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <span>⚙️</span>
                        <span>Super Admin Portal</span>
                      </Link>
                    )}

                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownLogoutBtn}`}
                      onClick={handleLogout}
                    >
                      <span>🚪</span>
                      <span>Logout Account</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className={styles.loginHeaderBtn}
                onClick={() => setShowLoginModal(true)}
              >
                🔐 Member Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN 3-COLUMN LAYOUT ================= */}
      <div className={styles.mainLayout}>
        {/* LEFT SIDEBAR: PROFILE & QUICK NAVIGATION */}
        <aside className={styles.leftSidebar}>
          <div className={styles.sideCard}>
            {currentUser ? (
              <div className={styles.profileSideHeader}>
                <Image
                  src={currentUser.photo_url || "/images/leader-president.png"}
                  alt={currentUser.name}
                  width={72}
                  height={72}
                  className={styles.profileSideAvatar}
                />
                <h3 className={styles.profileSideName}>{currentUser.name}</h3>
                <span className={styles.profileRoleBadge}>
                  {currentUser.role === "PRESIDENT" ? "👑 PRESIDENT" : currentUser.role === "SUPER_ADMIN" ? "🛡️ SUPER ADMIN" : "🤝 ACTIVE MEMBER"}
                </span>

                {/* Explicit Logout Button in Sidebar */}
                <button
                  className={styles.sidebarLogoutBtn}
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  <span>Logout from HSY</span>
                </button>
              </div>
            ) : (
              <div className={styles.profileSideHeader}>
                <Image
                  src="/images/logo_v2.png"
                  alt="Hindu Swaraj"
                  width={72}
                  height={72}
                  className={styles.profileSideAvatar}
                />
                <h3 className={styles.profileSideName}>Hindu Swaraj Youth</h3>
                <p style={{ fontSize: "0.76rem", color: "#94a3b8", margin: "4px 0 12px" }}>
                  Join as volunteer or login to share your seva photos &amp; connect!
                </p>
                <button
                  className={styles.loginHeaderBtn}
                  style={{ width: "100%", padding: "8px 0" }}
                  onClick={() => setShowLoginModal(true)}
                >
                  🔐 Login to Share
                </button>
              </div>
            )}

            <div className={styles.navLinksList}>
              <Link href="/" className={styles.navLinkItem}>
                <span>🏠</span>
                <span>HSY Homepage</span>
              </Link>
              <Link href="/navaratri" className={styles.navLinkItem}>
                <span>🛕</span>
                <span>Vinayaka Navaratri</span>
              </Link>
              <Link href="/aapadbandhava" className={styles.navLinkItem}>
                <span>🚨</span>
                <span>Aapadbandhava Seva</span>
              </Link>
              <Link href="/blood-donation" className={styles.navLinkItem}>
                <span>🩸</span>
                <span>Blood Donation Desk</span>
              </Link>
              <Link href="/volunteer" className={styles.navLinkItem}>
                <span>🤝</span>
                <span>Join Volunteer Force</span>
              </Link>
              {isAdmin && (
                <Link href="/admin" className={styles.navLinkItem} style={{ color: "#ffd700" }}>
                  <span>⚙️</span>
                  <span>Super Admin Portal</span>
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER STREAM: STORIES + COMPOSER + FEED */}
        <main>
          {/* Top Stories / Highlights Reel */}
          <div className={styles.storiesBar}>
            {/* Add Story Button */}
            <div
              className={styles.storyItem}
              onClick={() => {
                if (currentUser) setShowCreateModal(true);
                else setShowLoginModal(true);
              }}
            >
              <div className={styles.storyAddCircle}>+</div>
              <span className={styles.storyAuthorText}>Add Story</span>
            </div>

            {stories.map((s) => (
              <div
                key={s.id}
                className={styles.storyItem}
                onClick={() => setActiveStory(s)}
              >
                <div className={styles.storyRing}>
                  <img
                    src={getMediaUrl(s.media_url)}
                    alt={s.title}
                    className={styles.storyImage}
                  />
                </div>
                <span className={styles.storyAuthorText}>{s.title}</span>
              </div>
            ))}
          </div>

          {/* Quick Composer Box */}
          <div className={styles.composerCard}>
            <div className={styles.composerTopRow}>
              <Image
                src={currentUser?.photo_url || "/images/leader-president.png"}
                alt="Avatar"
                width={44}
                height={44}
                className={styles.composerAvatar}
              />
              <div
                className={styles.composerFakeInput}
                onClick={() => {
                  if (currentUser) setShowCreateModal(true);
                  else setShowLoginModal(true);
                }}
              >
                {currentUser
                  ? `What's happening in Jagtial seva today, ${currentUser.name.split(" ")[0]}?`
                  : "Share your festival darshan, blood seva, or youth moments..."}
              </div>
            </div>

            <div className={styles.composerActionsRow}>
              <button
                className={styles.composerActionBtn}
                onClick={() => {
                  if (currentUser) setShowCreateModal(true);
                  else setShowLoginModal(true);
                }}
              >
                <span style={{ color: "#10b981", fontSize: "1.1rem" }}>📸</span>
                <span>Photos / Gallery</span>
              </button>
              <button
                className={styles.composerActionBtn}
                onClick={() => {
                  setSelectedCategory("NAVARATRI");
                  if (currentUser) setShowCreateModal(true);
                  else setShowLoginModal(true);
                }}
              >
                <span style={{ color: "#f59e0b", fontSize: "1.1rem" }}>🛕</span>
                <span>Festival Darshan</span>
              </button>
              <button
                className={styles.composerActionBtn}
                onClick={() => {
                  setSelectedCategory("BLOOD_SEVA");
                  if (currentUser) setShowCreateModal(true);
                  else setShowLoginModal(true);
                }}
              >
                <span style={{ color: "#ef4444", fontSize: "1.1rem" }}>🩸</span>
                <span>Blood Camp</span>
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className={styles.filterPillsRow}>
            {[
              { id: "ALL", label: "🔥 All Moments" },
              { id: "NAVARATRI", label: "🛕 Navaratri Utsav" },
              { id: "BLOOD_SEVA", label: "🩸 Blood Seva" },
              { id: "EMERGENCY", label: "🚨 Aapadbandhava" },
              { id: "YOUTH", label: "💪 Yuva Shakti" },
            ].map((cat) => (
              <button
                key={cat.id}
                className={`${styles.filterPill} ${selectedCategory === cat.id && !filterSavedOnly && !filterMyPostsOnly ? styles.filterPillActive : ""}`}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setActiveTag("");
                  setFilterSavedOnly(false);
                  setFilterMyPostsOnly(false);
                }}
              >
                {cat.label}
              </button>
            ))}

            {/* Saved Moments Filter */}
            <button
              className={`${styles.filterPill} ${filterSavedOnly ? styles.filterPillActive : ""}`}
              onClick={() => {
                setFilterSavedOnly((prev) => !prev);
                setFilterMyPostsOnly(false);
              }}
            >
              🔖 Saved Moments ({savedPostIds.length})
            </button>

            {/* My Posts Filter */}
            {currentUser && (
              <button
                className={`${styles.filterPill} ${filterMyPostsOnly ? styles.filterPillActive : ""}`}
                onClick={() => {
                  setFilterMyPostsOnly((prev) => !prev);
                  setFilterSavedOnly(false);
                }}
              >
                👤 My Posts
              </button>
            )}
          </div>

          {/* Feed Posts List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#ffd700" }}>
              <div style={{ fontSize: "2rem", marginBottom: "10px", animation: "spin 1s linear infinite" }}>🔄</div>
              <div>Loading HSY Community Seva Feed...</div>
            </div>
          ) : (() => {
            let displayPosts = posts;
            if (filterSavedOnly) {
              displayPosts = displayPosts.filter((p) => savedPostIds.includes(p.id));
            }
            if (filterMyPostsOnly && currentUser) {
              displayPosts = displayPosts.filter(
                (p) => p.user_id === currentUser.id || p.author_username === currentUser.username
              );
            }
            if (searchTerm.trim()) {
              const term = searchTerm.toLowerCase();
              displayPosts = displayPosts.filter(
                (p) =>
                  p.caption?.toLowerCase().includes(term) ||
                  p.author_name?.toLowerCase().includes(term) ||
                  p.location?.toLowerCase().includes(term) ||
                  p.tags?.some((t) => t.toLowerCase().includes(term))
              );
            }

            if (displayPosts.length === 0) {
              return (
                <div style={{ textAlign: "center", padding: "50px 20px", background: "#0f1523", borderRadius: "18px", border: "1px dashed rgba(255,179,0,0.3)" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>📸</div>
                  <h3 style={{ color: "#ffd700", margin: "0 0 6px" }}>No Seva Posts Found</h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.88rem", marginBottom: "16px" }}>
                    {filterSavedOnly ? "You have not bookmarked any moments yet. Click 🔖 to save favorite posts!" : "Be the first to share photos and updates from Jagtial!"}
                  </p>
                  <button
                    className={styles.createPostBtn}
                    style={{ margin: "0 auto" }}
                    onClick={() => {
                      if (currentUser) setShowCreateModal(true);
                      else setShowLoginModal(true);
                    }}
                  >
                    📸 Share First Moment
                  </button>
                </div>
              );
            }

            return displayPosts.map((post) => (
              <article key={post.id} className={styles.postCard} id={`post-${post.id}`}>
                {/* Pinned Ribbon */}
                {post.is_pinned && (
                  <div className={styles.pinnedBadgeBar}>
                    <span>📌</span>
                    <span>PINNED OFFICIAL SEVA MOMENT</span>
                  </div>
                )}

                {/* Post Header */}
                <div className={styles.postHeader}>
                  <div className={styles.postAuthorGroup}>
                    <img
                      src={getMediaUrl(post.author_avatar, "/images/leader-president.png")}
                      alt={post.author_name}
                      className={styles.postAvatar}
                    />
                    <div className={styles.authorMeta}>
                      <div className={styles.authorNameRow}>
                        <span className={styles.authorName}>{post.author_name}</span>
                        {post.author_role && (
                          <span
                            className={`${styles.roleBadgeSmall} ${
                              post.author_role === "PRESIDENT"
                                ? styles.rolePresident
                                : post.author_role.includes("EC") || post.author_role.includes("SECRETARY")
                                ? styles.roleEcMember
                                : styles.roleVolunteer
                            }`}
                          >
                            {post.author_role.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className={styles.postMetaSub}>
                        <span>📍 {post.location || "Jagtial"}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Header Actions (Bookmark, Pin, Delete) */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      className={styles.postMenuBtn}
                      onClick={() => handleToggleBookmark(post.id)}
                      title={savedPostIds.includes(post.id) ? "Remove Bookmark" : "Save Moment"}
                      style={{ color: savedPostIds.includes(post.id) ? "#ffd700" : "#94a3b8" }}
                    >
                      {savedPostIds.includes(post.id) ? "🔖" : "🏷️"}
                    </button>

                    {isAdmin && (
                      <button
                        className={styles.postMenuBtn}
                        onClick={() => handlePinPost(post.id)}
                        title={post.is_pinned ? "Unpin Post" : "Pin Post to Top"}
                      >
                        📌
                      </button>
                    )}
                    {(isAdmin || (currentUser && currentUser.id === post.user_id)) && (
                      <button
                        className={styles.postMenuBtn}
                        onClick={() => handleDeletePost(post.id)}
                        title="Delete Post"
                        style={{ color: "#f87171" }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* Caption Content */}
                <div className={styles.postContent}>
                  <p className={styles.captionText}>{post.caption}</p>

                  {/* Hashtags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className={styles.tagPillsRow}>
                      {post.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className={styles.hashtagItem}
                          onClick={() => {
                            setActiveTag(t);
                            setSelectedCategory("ALL");
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Media Container (Single / Multi) */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div
                    className={styles.mediaContainer}
                    onDoubleClick={() => handleToggleLike(post)}
                  >
                    {/* Flying Reaction Pop */}
                    {flyingReactions[post.id] && (
                      <div className={styles.flyingReaction}>🚩</div>
                    )}

                    {post.media_urls.length === 1 ? (
                      <img
                        src={getMediaUrl(post.media_urls[0])}
                        alt="Seva Moment"
                        className={styles.singlePostImage}
                        onClick={() => setLightboxImage(getMediaUrl(post.media_urls[0]))}
                      />
                    ) : post.media_urls.length === 2 ? (
                      <div className={styles.multiMediaGrid2}>
                        {post.media_urls.map((img, i) => (
                          <img
                            key={i}
                            src={getMediaUrl(img)}
                            alt={`Media ${i}`}
                            className={styles.multiGridImg}
                            onClick={() => setLightboxImage(getMediaUrl(img))}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className={styles.multiMediaGrid3}>
                        {post.media_urls.slice(0, 3).map((img, i) => (
                          <img
                            key={i}
                            src={getMediaUrl(img)}
                            alt={`Media ${i}`}
                            className={styles.multiGridImg}
                            onClick={() => setLightboxImage(getMediaUrl(img))}
                          />
                        ))}
                      </div>
                    )}

                    {post.media_urls.length > 1 && (
                      <div className={styles.mediaCountBadge}>
                        📸 {post.media_urls.length} Photos
                      </div>
                    )}
                  </div>
                )}

                {/* Engagement Bar (Like, Comment, Share) */}
                <div className={styles.postEngagementBar}>
                  <div className={styles.actionButtonGroup}>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnLiked}`}
                      onClick={() => handleToggleLike(post)}
                    >
                      <span style={{ fontSize: "1.15rem" }}>🚩</span>
                      <span>{post.likes_count || 0} Jai Shree Ram</span>
                    </button>

                    <button
                      className={styles.actionBtn}
                      onClick={() => handleToggleComments(post.id)}
                    >
                      <span style={{ fontSize: "1.15rem" }}>💬</span>
                      <span>{post.comments_count || 0} Comments</span>
                    </button>
                  </div>

                  <button
                    className={styles.shareWhatsAppBtn}
                    onClick={() => handleSharePostWhatsApp(post)}
                  >
                    <span>📲</span>
                    <span>Share on WhatsApp</span>
                  </button>
                </div>

                {/* Comments Section Drawer */}
                {activeCommentsPostId === post.id && (
                  <div className={styles.commentsSection}>
                    <div className={styles.commentsList}>
                      {postComments[post.id] && postComments[post.id].length > 0 ? (
                        postComments[post.id].map((c) => (
                          <div key={c.id} className={styles.commentItem}>
                            <img
                              src={getMediaUrl(c.author_avatar, "/images/leader-president.png")}
                              alt={c.author_name}
                              className={styles.commentAvatar}
                            />
                            <div className={styles.commentBubble}>
                              <div className={styles.commentAuthor}>{c.author_name}</div>
                              <div className={styles.commentText}>{c.comment_text}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.82rem", padding: "10px" }}>
                          No comments yet. Write the first auspicious blessing! 🚩
                        </div>
                      )}
                    </div>

                    {/* Add Comment Input */}
                    <div className={styles.commentInputRow}>
                      <input
                        type="text"
                        placeholder="Write a comment or Jai Bappa blessing..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                        className={styles.commentInput}
                      />
                      <button
                        disabled={commentLoading || !newCommentText.trim()}
                        className={styles.commentSendBtn}
                        onClick={() => handleAddComment(post.id)}
                      >
                        {commentLoading ? "..." : "Send"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ));
          })()}
        </main>

        {/* RIGHT SIDEBAR: TRENDING & SEVA HEROES & POLL */}
        <aside className={styles.rightSidebar}>
          {/* Trending Hashtags */}
          <div className={styles.sideCard}>
            <div className={styles.sideHeaderTitle}>
              <span>🔥</span>
              <span>Trending Seva Hashtags</span>
            </div>

            <div className={styles.trendingTagsList}>
              {[
                { tag: "VinayakaNavaratri2026", count: "128 Posts" },
                { tag: "MahaAnnadanam", count: "86 Posts" },
                { tag: "BloodDonationJagtial", count: "54 Posts" },
                { tag: "AapadbandhavaSeva", count: "42 Posts" },
                { tag: "YuvaShakti", count: "39 Posts" },
                { tag: "HinduSwaraj", count: "95 Posts" },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className={styles.trendingTagRow}
                  onClick={() => {
                    setActiveTag(t.tag);
                    setSelectedCategory("ALL");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <div>
                    <div className={styles.trendingTagName}>#{t.tag}</div>
                    <div className={styles.trendingTagCount}>{t.count}</div>
                  </div>
                  <span style={{ color: "#ffd700", fontSize: "0.85rem" }}>↗</span>
                </div>
              ))}
            </div>
          </div>

          {/* Online Members & Seva Heroes Roster */}
          <div className={styles.onlineMembersCard}>
            <div className={styles.sideHeaderTitle} style={{ color: "#10b981", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>🟢</span>
                <span>Active Members ({onlineMembers.length})</span>
              </div>
              <span style={{ fontSize: "0.68rem", color: "#6ee7b7", background: "rgba(16,185,129,0.2)", padding: "2px 8px", borderRadius: "10px" }}>
                LIVE
              </span>
            </div>

            <div className={styles.onlineMembersList}>
              {onlineMembers.length === 0 ? (
                <div style={{ fontSize: "0.78rem", color: "#94a3b8", textAlign: "center", padding: "12px" }}>
                  No other members currently active.
                </div>
              ) : (
                onlineMembers.map((member) => (
                  <div key={member.id} className={styles.onlineMemberRow}>
                    <div className={styles.onlineAvatarWrap}>
                      <img
                        src={getMediaUrl(member.avatar, "/images/leader-president.png")}
                        alt={member.name}
                        className={styles.onlineAvatarImg}
                      />
                      <div className={styles.onlineDotPulse}></div>
                    </div>

                    <div className={styles.onlineMemberInfo}>
                      <div className={styles.onlineMemberName}>{member.name}</div>
                      <div className={styles.onlineMemberStatus}>
                        {member.role === "PRESIDENT" ? "👑 President" : member.role.includes("SECRETARY") ? "🛡️ Executive" : "🤝 Member"}
                      </div>
                    </div>

                    <button
                      className={styles.onlineMiniActionBtn}
                      onClick={() => handleOpenChat(member)}
                      title={`Message ${member.name}`}
                      style={{ width: "auto", padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "700" }}
                    >
                      💬 Chat
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Interactive Youth Seva Poll */}
          <div className={styles.pollCard}>
            <div className={styles.sideHeaderTitle} style={{ color: "#38bdf8" }}>
              <span>🗳️</span>
              <span>Youth Seva Poll of the Week</span>
            </div>
            <p className={styles.pollQuestion}>
              Which community initiative should HSY expand next in Jagtial district?
            </p>
            <div className={styles.pollOptionsList}>
              {[
                { id: 1, label: "🩸 Mega Blood Donation Camp" },
                { id: 2, label: "🍲 Daily Free Annadanam Desk" },
                { id: 3, label: "📚 Student Kits & Scholarships" },
                { id: 4, label: "🌳 Green Jagtial Tree Drive" },
              ].map((opt) => {
                const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);
                const percent = Math.round((pollVotes[opt.id] / totalVotes) * 100) || 0;
                return (
                  <button
                    key={opt.id}
                    className={styles.pollOptionBtn}
                    onClick={() => handleVotePoll(opt.id)}
                  >
                    {userVotedOption && (
                      <div
                        className={styles.pollProgressFill}
                        style={{ width: `${percent}%` }}
                      ></div>
                    )}
                    <div className={styles.pollOptionTextRow}>
                      <span>{opt.label}</span>
                      {userVotedOption && (
                        <span style={{ fontWeight: "900", color: "#ffd700" }}>{percent}%</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {userVotedOption && (
              <div style={{ fontSize: "0.74rem", color: "#34d399", marginTop: "10px", textAlign: "center", fontWeight: "700" }}>
                ✓ Thank you for voting! Your voice shapes Jagtial seva. 🚩
              </div>
            )}
          </div>

          {/* Emergency Seva Direct Card */}
          <div className={styles.sideCard} style={{ marginTop: "20px", background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 21, 35, 0.95) 100%)", borderColor: "rgba(239, 68, 68, 0.4)" }}>
            <div className={styles.sideHeaderTitle} style={{ color: "#fca5a5" }}>
              <span>🚨</span>
              <span>Aapadbandhava Helpline</span>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: 1.5, margin: "0 0 12px" }}>
              Know someone in urgent need of hospital aid or emergency blood in Jagtial?
            </p>
            <Link
              href="/aapadbandhava"
              className={styles.createPostBtn}
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "#fff", justifyContent: "center", width: "100%" }}
            >
              🚑 Submit Emergency Case
            </Link>
          </div>
        </aside>
      </div>

      {/* ================= FLOATING SEVA MESSENGER DRAWER ================= */}
      {activeChatUser && (
        <div className={styles.floatingMessengerDock}>
          <div className={styles.messengerHeaderBar}>
            <div className={styles.messengerHeaderUser}>
              <img
                src={getMediaUrl(activeChatUser.avatar, "/images/leader-president.png")}
                alt={activeChatUser.name}
                className={styles.messengerHeaderAvatar}
              />
              <div>
                <div className={styles.messengerHeaderName}>{activeChatUser.name}</div>
                <div className={styles.messengerHeaderRole}>🟢 Online • Direct Connect</div>
              </div>
            </div>

            <button
              className={styles.messengerHeaderActionBtn}
              onClick={() => setActiveChatUser(null)}
              title="Close Chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Thread */}
          <div className={styles.messengerMessagesBox}>
            {chatMessages.map((msg, i) => {
              const isMe = currentUser && msg.sender_id === currentUser.id;
              return (
                <div key={i} className={isMe ? styles.chatBubbleMe : styles.chatBubbleThem}>
                  {!isMe && (
                    <div style={{ fontSize: "0.68rem", color: "#ffd700", fontWeight: "800", marginBottom: "2px" }}>
                      {msg.sender_name}
                    </div>
                  )}
                  <div>{msg.message_text}</div>
                  <div style={{ fontSize: "0.62rem", opacity: 0.7, textAlign: isMe ? "right" : "left", marginTop: "4px" }}>
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Seva Chips */}
          <div className={styles.quickSevaChipsBar}>
            {[
              "🚩 Jai Shree Ram!",
              "🙏 Pranam Anna",
              "🩸 Blood Donor Needed",
              "🛕 Navaratri Duty Update",
              "🍲 Annadanam Status?",
            ].map((chip, idx) => (
              <button
                key={idx}
                className={styles.quickSevaChip}
                onClick={() => handleSendDirectMessage(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input */}
          <div className={styles.chatInputArea}>
            <input
              type="text"
              placeholder="Type message to member..."
              value={directMsgInput}
              onChange={(e) => setDirectMsgInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendDirectMessage();
              }}
              className={styles.chatInputElem}
            />
            <button
              disabled={sendingMsg || !directMsgInput.trim()}
              className={styles.chatSendActionBtn}
              onClick={() => handleSendDirectMessage()}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* ================= 3. CREATE POST MODAL ================= */}
      {showCreateModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>📸 Share a Seva Moment / Photo</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              {/* Category selector */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
                {[
                  { id: "NAVARATRI", label: "🛕 Navaratri Utsav" },
                  { id: "BLOOD_SEVA", label: "🩸 Blood Seva" },
                  { id: "EMERGENCY", label: "🚨 Aapadbandhava" },
                  { id: "YOUTH", label: "💪 Yuva Shakti" },
                  { id: "GENERAL", label: "🚩 General" },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.filterPill} ${newCategory === c.id ? styles.filterPillActive : ""}`}
                    onClick={() => setNewCategory(c.id)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Caption */}
              <textarea
                required
                placeholder="Write about your festival darshan, seva experience, or youth message... (Use #hashtags to trend!)"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                className={styles.textareaCaption}
              ></textarea>

              {/* Location & Tags input */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                <input
                  type="text"
                  placeholder="📍 Location (e.g. Jagtial Pandal)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "10px 14px", borderRadius: "10px", fontSize: "0.85rem" }}
                />
                <input
                  type="text"
                  placeholder="🏷️ Tags (comma separated)"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "10px 14px", borderRadius: "10px", fontSize: "0.85rem" }}
                />
              </div>

              {/* Photo Upload Area */}
              <div
                className={styles.photosUploadBox}
                onClick={() => fileInputRef.current?.click()}
              >
                <span style={{ fontSize: "2rem", display: "block", marginBottom: "6px" }}>📷</span>
                <div style={{ color: "#ffd700", fontWeight: "800", fontSize: "0.92rem" }}>
                  Click to select photos from device
                </div>
                <div style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "4px" }}>
                  Supports multiple HD images (.jpg, .png, .webp) up to 25MB
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>

              {/* Preview Grid */}
              {previewUrls.length > 0 && (
                <div className={styles.photoPreviewGrid}>
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className={styles.previewThumbWrap}>
                      <img src={url} alt={`Preview ${idx}`} className={styles.previewThumbImg} />
                      <button
                        type="button"
                        className={styles.removeThumbBtn}
                        onClick={() => removeSelectedFile(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingPost}
                className={styles.modalSubmitBtn}
              >
                {submittingPost ? "Publishing Seva Moment..." : "🚀 Publish to Community Feed"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= 4. MEMBER / VOLUNTEER LOGIN MODAL ================= */}
      {showLoginModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowLoginModal(false)}>
          <div className={styles.modalContent} style={{ maxWidth: "420px" }} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>🔐 Member &amp; Volunteer Access</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowLoginModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: "0 0 16px" }}>
              Please enter your Hindu Swaraj Youth credentials to post seva updates &amp; photos.
            </p>

            {loginError && (
              <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#fca5a5", padding: "8px 12px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "14px" }}>
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "0.78rem", color: "#fed7aa", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  Association ID / Username / Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mukesh@hsy.org or username"
                  value={loginForm.identifier}
                  onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "10px 14px", borderRadius: "10px", fontSize: "0.88rem" }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ fontSize: "0.78rem", color: "#fed7aa", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", padding: "10px 14px", borderRadius: "10px", fontSize: "0.88rem" }}
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className={styles.modalSubmitBtn}
              >
                {loginLoading ? "Authenticating..." : "🔑 Login to Post"}
              </button>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Link
                  href="/volunteer"
                  style={{ color: "#ffd700", fontSize: "0.82rem", fontWeight: "700", textDecoration: "none" }}
                  onClick={() => setShowLoginModal(false)}
                >
                  Not registered yet? Join as a Seva Volunteer ↗
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 5. FULL-SCREEN LIGHTBOX ZOOM ================= */}
      {lightboxImage && (
        <div className={styles.modalBackdrop} onClick={() => setLightboxImage(null)}>
          <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }}>
            <button
              className={styles.closeModalBtn}
              style={{ position: "absolute", top: "-40px", right: "0" }}
              onClick={() => setLightboxImage(null)}
            >
              ✕
            </button>
            <img
              src={lightboxImage}
              alt="Zoomed Seva Moment"
              style={{ maxWidth: "100%", maxHeight: "85vh", objectFit: "contain", borderRadius: "12px", border: "2px solid #ffd700" }}
            />
          </div>
        </div>
      )}

      {/* ================= 6. FULL-SCREEN STORY VIEWER ================= */}
      {activeStory && (
        <div className={styles.modalBackdrop} onClick={() => setActiveStory(null)}>
          <div
            style={{ position: "relative", width: "100%", maxWidth: "420px", height: "80vh", background: "#000", borderRadius: "20px", overflow: "hidden", border: "2px solid #ffd700" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Story Top Progress */}
            <div style={{ position: "absolute", top: "12px", left: "12px", right: "12px", height: "3px", background: "rgba(255,255,255,0.3)", borderRadius: "2px", zIndex: 10 }}>
              <div style={{ height: "100%", background: "#ffd700", width: "100%", borderRadius: "2px", animation: "storyTimer 6s linear" }}></div>
            </div>

            {/* Author info */}
            <div style={{ position: "absolute", top: "24px", left: "16px", display: "flex", alignItems: "center", gap: "10px", zIndex: 10 }}>
              <img
                src={getMediaUrl(activeStory.author_avatar)}
                alt={activeStory.author_name}
                style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #ffd700" }}
              />
              <div>
                <div style={{ color: "#fff", fontWeight: "900", fontSize: "0.9rem" }}>{activeStory.author_name}</div>
                <div style={{ color: "#fed7aa", fontSize: "0.75rem" }}>{activeStory.title}</div>
              </div>
            </div>

            <button
              className={styles.closeModalBtn}
              style={{ position: "absolute", top: "20px", right: "16px", zIndex: 10 }}
              onClick={() => setActiveStory(null)}
            >
              ✕
            </button>

            <img
              src={getMediaUrl(activeStory.media_url)}
              alt="Story"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
