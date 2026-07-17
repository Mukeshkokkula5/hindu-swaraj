"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import "./admin.css";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Dashboard state
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Expanded tab states for horizontal navbar
  const [complaints, setComplaints] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [pwState, setPwState] = useState({ current: "", new: "", confirm: "" });
  const [pwMessage, setPwMessage] = useState("");

  const [reportMonth, setReportMonth] = useState("Jul");
  const [reportYear, setReportYear] = useState("2026");

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    dateTime: "",
    desc: "",
    link: "",
  });

  const [newComplaint, setNewComplaint] = useState({
    subject: "",
    desc: "",
    comment: "",
  });

  // Form states
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    role: "MEMBER",
    phone: "",
    status: "ACTIVE",
  });
  const [editingMember, setEditingMember] = useState(null);
  const [newExpense, setNewExpense] = useState({
    title: "",
    category: "",
    desc: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    status: "PENDING",
    fund_id: "",
  });
  const [newDonation, setNewDonation] = useState({
    title: "",
    category: "",
    fund_id: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  // Data states (using localstorage backings with high quality defaults)
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [funds, setFunds] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [newFund, setNewFund] = useState({
    name: "",
    type: "MONTHLY",
    amount: "",
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFunds: 0,
    totalExpenses: 0,
    pendingComplaints: 0,
  });

  const totalFundsBalance = funds.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

  const getMonthlyCashflowData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      last6Months.push({
        name: months[idx],
        monthNum: idx + 1,
        income: 0,
        expense: 0,
        cumulative: 0,
      });
    }
    
    contributions.forEach((c) => {
      if (c.status === "APPROVED") {
        const date = new Date(c.created_at || c.receipt_date);
        const mNum = date.getMonth() + 1;
        const match = last6Months.find((x) => x.monthNum === mNum);
        if (match) {
          match.income += Number(c.amount || 0);
        }
      }
    });

    expenses.forEach((e) => {
      if (e.status === "APPROVED") {
        const date = new Date(e.expense_date || e.created_at);
        const mNum = date.getMonth() + 1;
        const match = last6Months.find((x) => x.monthNum === mNum);
        if (match) {
          match.expense += Number(e.amount || 0);
        }
      }
    });

    let runningBalance = 0;
    last6Months.forEach((m) => {
      runningBalance += (m.income - m.expense);
      m.cumulative = runningBalance;
    });

    return last6Months;
  };

  const monthlyCashflowData = getMonthlyCashflowData();
  const maxCashflowVal = Math.max(...monthlyCashflowData.map((m) => m.cumulative), 10000);

  const cashflowPoints = monthlyCashflowData.map((m, idx) => {
    const x = 40 + idx * (340 / 5);
    const y = 120 - (Math.max(0, m.cumulative) / maxCashflowVal) * 110;
    return { x, y, label: m.name, val: m.cumulative };
  });

  let cashflowLinePath = "";
  let cashflowAreaPath = "";
  if (cashflowPoints.length > 0) {
    cashflowLinePath = `M ${cashflowPoints[0].x} ${cashflowPoints[0].y} ` + cashflowPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
    cashflowAreaPath = `${cashflowLinePath} L ${cashflowPoints[cashflowPoints.length - 1].x} 120 L ${cashflowPoints[0].x} 120 Z`;
  }

  // Default values
  const defaultMembers = [];

  const defaultExpenses = [];

  const defaultLogs = [];

  const API_BASE_URL = "http://localhost:4000";

  const fetchAPI = async (path, options = {}) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 401 || errData.error === "Invalid or expired token" || errData.error === "jwt expired") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_auth");
        }
        setIsAuthenticated(false);
      }
      throw new Error(errData.error || "API request failed");
    }
    return response.json();
  };

  const loadAllData = async () => {
    try {
      const fetchedMembers = await fetchAPI("/members");
      setMembers(
        fetchedMembers.map((m) => ({
          id: m.member_id || m.id,
          dbId: m.id,
          name: m.name,
          email: m.personal_email,
          role: m.role,
          phone: m.phone,
          status: m.active ? "ACTIVE" : "INACTIVE",
        })),
      );
    } catch (err) {
      console.warn("Failed to fetch members from backend:", err.message);
      const local = localStorage.getItem("admin_members");
      if (local) setMembers(JSON.parse(local));
    }

    try {
      const fetchedExpenses = await fetchAPI("/expenses");
      setExpenses(
        fetchedExpenses.map((e) => ({
          id: e.id,
          title: e.title,
          category: e.category || "GENERAL",
          desc: e.description || "",
          amount: Number(e.amount),
          date: e.expense_date ? e.expense_date.split("T")[0] : new Date(e.created_at).toISOString().split("T")[0],
          status: e.status,
          fund_id: e.fund_id,
        }))
      );
    } catch (err) {
      console.warn("Failed to fetch expenses from backend:", err.message);
      const local = localStorage.getItem("admin_expenses");
      if (local) setExpenses(JSON.parse(local));
    }

    try {
      const fetchedFunds = await fetchAPI("/funds");
      setFunds(
        fetchedFunds.map((f) => ({
          id: f.id,
          name: f.fund_name,
          fund_name: f.fund_name,
          type: f.fund_type,
          amount: Number(f.base_amount || 0),
          balance: Number(f.balance || 0),
          totalCollection: Number(f.total_collection || 0),
          status: f.status,
        }))
      );
    } catch (err) {
      console.warn("Failed to fetch funds from backend:", err.message);
      const local = localStorage.getItem("admin_funds");
      if (local) setFunds(JSON.parse(local));
    }

    try {
      const fetchedMeetings = await fetchAPI("/meetings");
      setMeetings(fetchedMeetings);
    } catch (err) {
      console.warn("Failed to fetch meetings from backend:", err.message);
      const local = localStorage.getItem("admin_meetings");
      if (local) setMeetings(JSON.parse(local));
    }

    try {
      const fetchedComplaints = await fetchAPI("/complaints/all").catch(() =>
        fetchAPI("/complaints/my")
      );
      setComplaints(fetchedComplaints);
    } catch (err) {
      console.warn("Failed to fetch complaints from backend:", err.message);
      const local = localStorage.getItem("admin_complaints");
      if (local) setComplaints(JSON.parse(local));
    }

    try {
      const fetchedSuggestions = await fetchAPI("/suggestions/all").catch(() =>
        fetchAPI("/suggestions/my")
      );
      setSuggestions(fetchedSuggestions.data || fetchedSuggestions);
    } catch (err) {
      console.warn("Failed to fetch suggestions from backend:", err.message);
      const local = localStorage.getItem("admin_suggestions");
      if (local) setSuggestions(JSON.parse(local));
    }

    try {
      const fetchedLogs = await fetchAPI("/admin/audit-logs");
      if (Array.isArray(fetchedLogs)) {
        setAuditLogs(fetchedLogs.map(log => ({
          id: log.id,
          text: `${log.action} performed on ${log.entity}`,
          time: new Date(log.created_at).toLocaleString()
        })));
      }
    } catch (err) {
      console.warn("Failed to fetch logs from backend:", err.message);
      const local = localStorage.getItem("admin_logs");
      if (local) setAuditLogs(JSON.parse(local));
    }

    try {
      const fetchedConts = await fetchAPI("/contributions/all");
      setContributions(fetchedConts);
    } catch (err) {
      console.warn("Failed to fetch contributions from backend:", err.message);
    }

    try {
      const fetchedDonations = await fetchAPI("/contributions/admin-list");
      setDonations(fetchedDonations);
    } catch (err) {
      console.warn("Failed to fetch donations from backend:", err.message);
      const local = localStorage.getItem("admin_donations");
      if (local) setDonations(JSON.parse(local));
    }

    try {
      const summaryRes = await fetchAPI("/dashboard/admin-summary");
      if (summaryRes.success && summaryRes.data) {
        setStats({
          totalMembers: summaryRes.data.total_members,
          approvedReceipts: summaryRes.data.approved_receipts,
          totalCollection: summaryRes.data.total_collection,
          cancelledReceipts: summaryRes.data.cancelled_receipts,
        });
      }
    } catch (err) {
      console.warn("Failed to fetch dashboard summary:", err.message);
    }
  };

  useEffect(() => {
    const checkTokenValidity = async () => {
      const auth = localStorage.getItem("admin_auth");
      const token = localStorage.getItem("admin_token");
      if (auth === "true" && token) {
        try {
          const userData = await fetchAPI("/auth/me");
          setIsAuthenticated(true);
          setUserRole(userData.role || "");
          loadAllData();
        } catch (err) {
          console.warn("Session expired or invalid, logging out:", err.message);
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_auth");
          setIsAuthenticated(false);
          setUserRole("");
        }
      } else {
        setIsAuthenticated(false);
        setUserRole("");
      }
    };
    checkTokenValidity();
  }, []);

  // Update dynamic stats
  useEffect(() => {
    const totalExp = expenses.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );
    setStats((prev) => ({
      ...prev,
      totalMembers: members.length,
      totalExpenses: totalExp,
    }));
  }, [members, expenses]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await fetchAPI("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_auth", "true");
      localStorage.setItem("admin_role", data.role || "");
      setIsAuthenticated(true);
      setUserRole(data.role || "");
      setLoginError("");
      loadAllData();
    } catch (err) {
      console.warn(
        "Backend login failed, falling back to local simulation:",
        err.message,
      );
      if (username.toLowerCase() === "admin" && password === "admin123") {
        setIsAuthenticated(true);
        setUserRole("SUPER_ADMIN");
        localStorage.setItem("admin_auth", "true");
        localStorage.setItem("admin_role", "SUPER_ADMIN");
        setLoginError("");
        loadAllData();
      } else {
        setLoginError("Invalid credentials.");
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole("");
    localStorage.removeItem("admin_auth");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_role");
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;

    if (editingMember) {
      try {
        await fetchAPI(`/members/${editingMember.dbId}`, {
          method: "PUT",
          body: JSON.stringify({
            name: newMember.name,
            personal_email: newMember.email,
            phone: newMember.phone,
            address: "Jagtial, Telangana",
            role: newMember.role,
            active: newMember.status === "ACTIVE",
          }),
        });
        loadAllData();
      } catch (err) {
        console.warn("Failed to update member in database, fallback local update:", err.message);
        const updated = members.map((m) =>
          m.id === editingMember.id ? { ...m, ...newMember } : m,
        );
        setMembers(updated);
        localStorage.setItem("admin_members", JSON.stringify(updated));
      }
      setEditingMember(null);
    } else {
      // Generate formatted member ID: HSY/JGTL/2026/XXXX
      let maxNum = 0;
      members.forEach((m) => {
        if (typeof m.id === "string" && m.id.startsWith("HSY/JGTL/2026/")) {
          const parts = m.id.split("/");
          const num = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      const paddedIndex = String(nextNum).padStart(4, "0");
      const formattedId = `HSY/JGTL/2026/${paddedIndex}`;

      const memberObj = {
        id: formattedId,
        ...newMember,
      };

      try {
        const usernameGenerated = `${newMember.name.toLowerCase().replace(/\s+/g, "")}@hsy.org`;
        await fetchAPI("/members", {
          method: "POST",
          body: JSON.stringify({
            member_id: formattedId,
            name: newMember.name,
            association_id: usernameGenerated,
            personal_email: newMember.email || `${usernameGenerated}`,
            phone: newMember.phone,
            address: "Jagtial, Telangana",
            role: newMember.role,
            password: "password123",
          }),
        });
        loadAllData();
      } catch (err) {
        console.warn(
          "Failed to store member in database, saving locally:",
          err.message,
        );
        const updated = [memberObj, ...members];
        setMembers(updated);
        localStorage.setItem("admin_members", JSON.stringify(updated));
      }
    }

    // Reset Form
    setNewMember({
      name: "",
      email: "",
      role: "MEMBER",
      phone: "",
      status: "ACTIVE",
    });
    setShowMemberModal(false);
  };

  const handleAddFund = async (e) => {
    e.preventDefault();
    if (!newFund.name || !newFund.amount) return;
    const fundObj = {
      id: Date.now(),
      name: newFund.name,
      type: newFund.type,
      amount: Number(newFund.amount),
      totalCollection: 0,
      status: "ACTIVE",
    };

    try {
      await fetchAPI("/funds", {
        method: "POST",
        body: JSON.stringify({
          fund_name: newFund.name,
          fund_type: newFund.type,
          description: `Base Amount: ${newFund.amount}`,
          base_amount: Number(newFund.amount),
        }),
      });
      loadAllData();
      setNewFund({ name: "", type: "MONTHLY", amount: "" });
    } catch (err) {
      console.warn(
        "Failed to store fund in database, saving locally:",
        err.message
      );
      const updated = [...funds, fundObj];
      setFunds(updated);
      localStorage.setItem("admin_funds", JSON.stringify(updated));
      setNewFund({ name: "", type: "MONTHLY", amount: "" });

      // Log activity locally
      const newLog = {
        id: Date.now(),
        text: `Admin created a new fund (Local Only): ${newFund.name} (${newFund.type})`,
        time: "Just now",
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.dateTime) return;
    const meetingObj = {
      id: Date.now(),
      title: newMeeting.title,
      date: newMeeting.dateTime.split("T")[0],
      time: newMeeting.dateTime.split("T")[1] || "18:00",
      desc: newMeeting.desc,
      link: newMeeting.link,
      venue: newMeeting.link || "Online",
    };
    setMeetings([...meetings, meetingObj]);
    setNewMeeting({ title: "", dateTime: "", desc: "", link: "" });
    // Log activity
    const newLog = {
      id: Date.now(),
      text: `Admin scheduled a new meeting: ${meetingObj.title}`,
      time: "Just now",
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleCreateComplaint = (e) => {
    e.preventDefault();
    if (!newComplaint.subject || !newComplaint.desc) return;
    const complaintObj = {
      id: Date.now(),
      name: "Super Admin",
      title: newComplaint.subject,
      desc: newComplaint.desc,
      comment: newComplaint.comment,
      date: new Date().toISOString().split("T")[0],
      status: "PENDING",
    };
    setComplaints([...complaints, complaintObj]);
    setNewComplaint({ subject: "", desc: "", comment: "" });
    // Log activity
    const newLog = {
      id: Date.now(),
      text: `Admin submitted a complaint: ${complaintObj.title}`,
      time: "Just now",
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  const handleDeleteFund = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this fund? This will also remove related ledger entries and contributions."
      )
    ) {
      return;
    }
    try {
      await fetchAPI(`/funds/${id}`, {
        method: "DELETE",
      });
      loadAllData();
    } catch (err) {
      console.warn(
        "Failed to delete fund from database, deleting locally:",
        err.message
      );
      const updated = funds.filter((f) => f.id !== id);
      setFunds(updated);
      localStorage.setItem("admin_funds", JSON.stringify(updated));
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (
      !newExpense.title ||
      !newExpense.amount ||
      !newExpense.expense_date ||
      !newExpense.fund_id
    ) {
      alert("Please fill in all required fields (*).");
      return;
    }

    try {
      await fetchAPI("/expenses", {
        method: "POST",
        body: JSON.stringify({
          title: newExpense.title,
          category: newExpense.category || "GENERAL",
          description: newExpense.desc || "",
          amount: Number(newExpense.amount),
          expense_date: newExpense.expense_date,
          fund_id: Number(newExpense.fund_id),
        }),
      });
      loadAllData();
    } catch (err) {
      console.warn(
        "Failed to store expense in database, saving locally:",
        err.message
      );
      const expenseObj = {
        id: Date.now(),
        title: newExpense.title,
        category: newExpense.category || "GENERAL",
        desc: newExpense.desc,
        amount: Number(newExpense.amount),
        date: newExpense.expense_date,
        status: "PENDING",
        fund_id: newExpense.fund_id,
      };

      const updated = [expenseObj, ...expenses];
      setExpenses(updated);
      localStorage.setItem("admin_expenses", JSON.stringify(updated));
    }

    // Reset Form
    setNewExpense({
      title: "",
      category: "",
      desc: "",
      amount: "",
      expense_date: new Date().toISOString().split("T")[0],
      status: "PENDING",
      fund_id: "",
    });
    setShowExpenseModal(false);
  };

  const handleApproveExpense = async (id) => {
    if (
      !confirm(
        "Are you sure you want to approve this expense? This will debit the corresponding fund balance."
      )
    ) {
      return;
    }
    try {
      await fetchAPI(`/expenses/${id}/approve`, {
        method: "PUT",
      });
      loadAllData();
    } catch (err) {
      console.warn(
        "Failed to approve expense in database, falling back locally:",
        err.message
      );
      const updated = expenses.map((e) => {
        if (e.id === id) {
          return { ...e, status: "APPROVED" };
        }
        return e;
      });
      setExpenses(updated);
      localStorage.setItem("admin_expenses", JSON.stringify(updated));
    }
  };

  const handleCancelExpense = async (id) => {
    const reason = prompt("Please enter the reason for cancelling this expense:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Reason is required to cancel an expense.");
      return;
    }
    try {
      await fetchAPI(`/expenses/${id}/cancel`, {
        method: "PUT",
        body: JSON.stringify({ reason }),
      });
      loadAllData();
    } catch (err) {
      console.warn(
        "Failed to cancel expense in database, falling back locally:",
        err.message
      );
      const updated = expenses.map((e) => {
        if (e.id === id) {
          return { ...e, status: "CANCELLED" };
        }
        return e;
      });
      setExpenses(updated);
      localStorage.setItem("admin_expenses", JSON.stringify(updated));
    }
  };

  const handleAddDonation = async (e) => {
    e.preventDefault();
    if (!newDonation.title || !newDonation.amount || !newDonation.date || !newDonation.fund_id) {
      alert("Please fill in all required fields (*).");
      return;
    }

    try {
      await fetchAPI("/contributions/admin", {
        method: "POST",
        body: JSON.stringify({
          title: newDonation.title,
          category: newDonation.category || "DONATION",
          fund_id: Number(newDonation.fund_id),
          amount: Number(newDonation.amount),
          receipt_date: newDonation.date,
          description: newDonation.description || "",
        }),
      });
      loadAllData();
    } catch (err) {
      console.warn("Failed to store donation in database, saving locally:", err.message);
      const selectedFund = funds.find(f => f.id === Number(newDonation.fund_id));
      const donationObj = {
        id: Date.now(),
        date: newDonation.date,
        title: newDonation.title,
        category: newDonation.category || "DONATION",
        fund_name: selectedFund ? selectedFund.name : "Unknown Fund",
        amount: Number(newDonation.amount),
        desc: newDonation.description,
        status: "PENDING",
      };

      const updated = [donationObj, ...donations];
      setDonations(updated);
      localStorage.setItem("admin_donations", JSON.stringify(updated));
    }

    // Reset Form
    setNewDonation({
      title: "",
      category: "",
      fund_id: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
    setShowDonationModal(false);
  };

  const handleApproveDonation = async (item) => {
    if (
      !confirm(
        `Are you sure you want to approve this donation of ₹${Number(
          item.amount
        ).toLocaleString()}? This will credit the fund balance.`
      )
    ) {
      return;
    }
    const isMember = item.category === "MEMBER";
    const endpoint = isMember
      ? `/treasurer/approve-member/${item.id}`
      : `/treasurer/approve-public/${item.id}`;

    try {
      await fetchAPI(endpoint, {
        method: "PATCH",
      });
      loadAllData();
    } catch (err) {
      console.warn(
        "Failed to approve donation in database, falling back locally:",
        err.message
      );
      const updated = donations.map((d) => {
        if (d.id === item.id) {
          return { ...d, status: "APPROVED" };
        }
        return d;
      });
      setDonations(updated);
      localStorage.setItem("admin_donations", JSON.stringify(updated));

      const updatedFunds = funds.map((f) => {
        if (f.name === item.fund_name) {
          return {
            ...f,
            amount: Number(f.amount || 0),
            balance: Number(f.balance || 0) + Number(item.amount),
            totalCollection: Number(f.totalCollection || 0) + Number(item.amount),
          };
        }
        return f;
      });
      setFunds(updatedFunds);
      localStorage.setItem("admin_funds", JSON.stringify(updatedFunds));
    }
  };

  const handleRejectDonation = async (item) => {
    const reason = prompt("Please enter the reason for rejecting this donation:");
    if (reason === null) return;
    if (!reason.trim()) {
      alert("Reason is required to reject a donation.");
      return;
    }
    const isMember = item.category === "MEMBER";
    const endpoint = isMember
      ? `/treasurer/reject-member/${item.id}`
      : `/treasurer/reject-public/${item.id}`;

    try {
      await fetchAPI(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      loadAllData();
    } catch (err) {
      console.warn(
        "Failed to reject donation in database, falling back locally:",
        err.message
      );
      const updated = donations.map((d) => {
        if (d.id === item.id) {
          return { ...d, status: "REJECTED" };
        }
        return d;
      });
      setDonations(updated);
      localStorage.setItem("admin_donations", JSON.stringify(updated));
    }
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (pwState.new !== pwState.confirm) {
      setPwMessage("❌ New password and confirm password do not match.");
      return;
    }
    if (pwState.current !== "admin123") {
      setPwMessage("❌ Current password is incorrect.");
      return;
    }
    setPwMessage("✅ Password updated successfully! (Mock update)");
    setPwState({ current: "", new: "", confirm: "" });
  };

  if (!isAuthenticated) {
    return (
      <div className="loginScreen">
        <div className="loginContainer">
          {/* Left Side: Brand Panel */}
          <div className="loginBrandSide">
            <div className="brandGlow1"></div>
            <div className="brandGlow2"></div>
            <div className="brandContent">
              <div className="brandLogoWrap">
                <Image
                  src="/images/logo_v2.png"
                  alt="Logo"
                  width={110}
                  height={110}
                  className="brandLogoImg"
                />
              </div>
              <h2 className="brandTitle">HINDU SWARAJ</h2>
              <p className="brandSubtitle">Youth Welfare Association</p>

              <div className="quoteBox">
                <p className="quoteLine">
                  "स्वराज्य हा माझा जन्मसिद्ध हक्क आहे आणि तो मी मिळवणारच"
                </p>
                <span className="quoteAuthor">- छत्रपती शिवाजी महाराज</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form Panel */}
          <div className="loginFormSide">
            <form className="loginFormCard" onSubmit={handleLogin}>
              <div className="formHeader">
                <h3 className="formTitle">Welcome Back</h3>
                <p className="formSubtitle">
                  Enter credentials to access the Control Center
                </p>
              </div>

              {loginError && <div className="errorMsg">{loginError}</div>}

              <div className="formGroup">
                <label className="formLabel">Username</label>
                <div className="inputWrapper">
                  <span className="inputIcon">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="inputField"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="formGroup">
                <label className="formLabel">Password</label>
                <div className="inputWrapper">
                  <span className="inputIcon">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type="password"
                    className="inputField"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="loginBtn">
                Sign In
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adminPage">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebarHeader">
          <Image
            src="/images/logo_v2.png"
            alt="Logo"
            width={48}
            height={48}
            style={{ borderRadius: "50%" }}
          />
          <div>
            <span className="sidebarTitle">HINDU SWARAJ</span>
            <div className="sidebarBrandSub">CONTROL CENTER</div>
          </div>
        </div>

        <nav className="navMenu">
          <button
            className={`navItem ${activeTab === "overview" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Dashboard
          </button>
          <button
            className={`navItem ${activeTab === "members" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>
          <button
            className={`navItem ${activeTab === "funds" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("funds")}
          >
            Funds
          </button>
          <button
            className={`navItem ${activeTab === "donations" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("donations")}
          >
            Donations
          </button>
          <button
            className={`navItem ${activeTab === "expenses" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("expenses")}
          >
            Expenses
          </button>
          <button
            className={`navItem ${activeTab === "reports" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
          <button
            className={`navItem ${activeTab === "meetings" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("meetings")}
          >
            Meetings
          </button>
          <button
            className={`navItem ${activeTab === "complaints" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("complaints")}
          >
            Complaints
          </button>
          <button
            className={`navItem ${activeTab === "suggestions" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("suggestions")}
          >
            Suggestions
          </button>
          <button
            className={`navItem ${activeTab === "logs" ? "navItemActive" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            Audit Logs
          </button>

          <button className="logoutBtn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </aside>

      {/* Main Panel Content */}
      <main
        className="mainContent"
        style={{
          flex: 1,
          padding: "40px",
          overflowY: "auto",
          maxHeight: "100vh",
        }}
      >
        {activeTab === "overview" && (
          <>
            <div className="welcomeSection" style={{ marginBottom: "24px" }}>
              <h2
                className="welcomeTitle"
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "800",
                  color: "#1e293b",
                }}
              >
                Welcome,{" "}
                <span style={{ color: "#2563eb" }}>Super Admin 👋</span>
              </h2>
              <p
                className="welcomeSubtitle"
                style={{
                  color: "#64748b",
                  fontSize: "0.88rem",
                  marginTop: "4px",
                }}
              >
                Admin Dashboard
              </p>
            </div>

            {/* Metric Cards Grid */}
            <div className="screenshotStatsGrid">
              <div
                className="screenshotStatCard"
                style={{ borderLeft: "4px solid var(--maroon)" }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="screenshotStatLabel">Total Members</span>
                  <span className="screenshotStatValue">{members.length}</span>
                </div>
                <div
                  style={{
                    color: "var(--maroon)",
                    background: "rgba(128, 10, 13, 0.05)",
                    padding: "10px",
                    borderRadius: "50%",
                    display: "flex",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <div
                className="screenshotStatCard"
                style={{ borderLeft: "4px solid var(--saffron)" }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="screenshotStatLabel">Approved Receipts</span>
                  <span className="screenshotStatValue">{stats.approvedReceipts || 0}</span>
                </div>
                <div
                  style={{
                    color: "var(--saffron)",
                    background: "rgba(216, 88, 24, 0.05)",
                    padding: "10px",
                    borderRadius: "50%",
                    display: "flex",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <div
                className="screenshotStatCard"
                style={{ borderLeft: "4px solid var(--gold)" }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="screenshotStatLabel">Total Collection</span>
                  <span className="screenshotStatValue">₹{(stats.totalCollection || 0).toLocaleString()}</span>
                </div>
                <div
                  style={{
                    color: "var(--gold)",
                    background: "rgba(212, 160, 23, 0.05)",
                    padding: "10px",
                    borderRadius: "50%",
                    display: "flex",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </div>
              <div
                className="screenshotStatsGrid"
                style={{ display: "contents" }}
              >
                <div
                  className="screenshotStatCard"
                  style={{ borderLeft: "4px solid #64748b" }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span className="screenshotStatLabel">
                      Cancelled Receipts
                    </span>
                    <span className="screenshotStatValue">{stats.cancelledReceipts || 0}</span>
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      background: "rgba(100, 116, 139, 0.05)",
                      padding: "10px",
                      borderRadius: "50%",
                      display: "flex",
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 💰 Fund Balances Section */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                  }}
                >
                  💰 Fund Balances
                </h3>
              </div>
              <div
                className="fundBalancesList"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "16px",
                }}
              >
                {funds.map((item, idx) => {
                  const colors = [
                    { bg: "rgba(128, 10, 13, 0.03)", border: "rgba(128, 10, 13, 0.08)" },
                    { bg: "rgba(216, 88, 24, 0.03)", border: "rgba(216, 88, 24, 0.08)" },
                    { bg: "rgba(212, 160, 23, 0.03)", border: "rgba(212, 160, 23, 0.08)" }
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: "16px",
                        background: color.bg,
                        borderRadius: "8px",
                        border: `1px solid ${color.border}`,
                      }}
                    >
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.fund_name}
                      </div>
                      <div
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: "800",
                          color: "var(--navy)",
                          marginTop: "4px",
                        }}
                      >
                        ₹{Number(item.balance || 0).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two Column Section for Cashflow and Fund-wise Balance */}
            <div className="dashboardGrid" style={{ marginBottom: "24px" }}>
              <div className="panelCard">
                <div
                  className="panelHeader"
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    className="panelTitle"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "700",
                      textTransform: "none",
                      color: "#1e293b",
                    }}
                  >
                    📊 Monthly Cashflow
                  </h3>
                </div>
                <div
                  className="monthlyCashflowChart"
                  style={{
                    width: "100%",
                    height: "180px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    viewBox="0 0 400 150"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <defs>
                      <linearGradient
                        id="chartGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--saffron)"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--saffron)"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>
                    <line
                      x1="40"
                      y1="10"
                      x2="380"
                      y2="10"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="40"
                      y1="37.5"
                      x2="380"
                      y2="37.5"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="40"
                      y1="65"
                      x2="380"
                      y2="65"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="40"
                      y1="92.5"
                      x2="380"
                      y2="92.5"
                      stroke="#f1f5f9"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="40"
                      y1="10"
                      x2="40"
                      y2="120"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <line
                      x1="40"
                      y1="120"
                      x2="380"
                      y2="120"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <path
                      d={cashflowAreaPath}
                      fill="url(#chartGradient)"
                    />
                    <path
                      d={cashflowLinePath}
                      fill="none"
                      stroke="var(--saffron)"
                      strokeWidth="3"
                    />
                    {cashflowPoints.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="3"
                        fill="var(--maroon)"
                      />
                    ))}
                    {cashflowPoints.length > 0 && (
                      <>
                        <circle
                          cx={cashflowPoints[cashflowPoints.length - 1].x}
                          cy={cashflowPoints[cashflowPoints.length - 1].y}
                          r="5"
                          fill="var(--maroon)"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        <line
                          x1={cashflowPoints[cashflowPoints.length - 1].x}
                          y1={cashflowPoints[cashflowPoints.length - 1].y}
                          x2={cashflowPoints[cashflowPoints.length - 1].x}
                          y2="120"
                          stroke="var(--maroon)"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      </>
                    )}
                    <text
                      x="25"
                      y="15"
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                    >
                      {Math.round(maxCashflowVal / 1000)}k
                    </text>
                    <text
                      x="25"
                      y="42.5"
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                    >
                      {Math.round((maxCashflowVal * 0.75) / 1000)}k
                    </text>
                    <text
                      x="25"
                      y="70"
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                    >
                      {Math.round((maxCashflowVal * 0.5) / 1000)}k
                    </text>
                    <text
                      x="25"
                      y="97.5"
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                    >
                      {Math.round((maxCashflowVal * 0.25) / 1000)}k
                    </text>
                    <text
                      x="25"
                      y="125"
                      fill="#64748b"
                      fontSize="9"
                      textAnchor="end"
                    >
                      0
                    </text>
                    {cashflowPoints.map((p, idx) => (
                      <text
                        key={idx}
                        x={p.x}
                        y="138"
                        fill="#64748b"
                        fontSize="9"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        {p.label}
                      </text>
                    ))}
                  </svg>
                </div>
              </div>

              <div className="panelCard">
                <div
                  className="panelHeader"
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    className="panelTitle"
                    style={{
                      fontSize: "1rem",
                      fontWeight: "700",
                      textTransform: "none",
                      color: "#1e293b",
                    }}
                  >
                    💼 Fund-wise Balance
                  </h3>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {funds.map((item, idx) => {
                    const balanceVal = Number(item.balance || 0);
                    const pct = totalFundsBalance > 0 ? Math.round((balanceVal / totalFundsBalance) * 100) : 0;
                    const barColors = ["var(--maroon)", "var(--saffron)", "var(--gold)"];
                    const barColor = barColors[idx % barColors.length];
                    return (
                      <div key={item.id}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "0.82rem",
                            fontWeight: "600",
                            marginBottom: "4px",
                            color: "var(--navy)",
                          }}
                        >
                          <span>{item.fund_name}</span>
                          <span>{pct}%</span>
                        </div>
                        <div
                          style={{
                            height: "6px",
                            background: "#f1f5f9",
                            borderRadius: "3px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: barColor,
                              borderRadius: "3px",
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Announcements Panel */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                  }}
                >
                  📢 Latest Announcements
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontSize: "1.2rem" }}>📢</div>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: "700",
                        color: "var(--navy)",
                      }}
                    >
                      Tree Plantation Drive 2026
                    </h4>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      Sapling plantation campaign is scheduled on July 22nd at
                      Aravind Nagar Central Ground.
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontSize: "1.2rem" }}>🎉</div>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: "700",
                        color: "var(--navy)",
                      }}
                    >
                      Blood Donation Camp Successful
                    </h4>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      Over 150 volunteers registered and donated successfully
                      during the community campaign.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contributions Panel */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                  }}
                >
                  📰 Recent Contributions
                </h3>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>👤</span>
                    <div>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          color: "var(--navy)",
                        }}
                      >
                        Ramesh Goud
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        Contributed to Youth Event Fund
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontWeight: "700",
                      color: "#10b981",
                      fontSize: "0.9rem",
                    }}
                  >
                    +₹15,000
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem" }}>👤</span>
                    <div>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: "700",
                          color: "var(--navy)",
                        }}
                      >
                        Suresh Kumar
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                        Contributed to Sapling Plantation Fund
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontWeight: "700",
                      color: "#10b981",
                      fontSize: "0.9rem",
                    }}
                  >
                    +₹8,000
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "members" && (
          <>
            <div className="contentHeader">
              <h2 className="pageTitle">Active Committee Members</h2>
              <button
                className="addBtn"
                onClick={() => {
                  setEditingMember(null);
                  setNewMember({
                    name: "",
                    email: "",
                    role: "MEMBER",
                    phone: "",
                    status: "ACTIVE",
                  });
                  setShowMemberModal(true);
                }}
              >
                + Register Member
              </button>
            </div>

            <div className="panelCard">
              <div className="tableContainer">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th style={{ textAlign: "center" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: "700", color: "var(--navy)" }}>
                          {item.id}
                        </td>
                        <td style={{ fontWeight: "600" }}>{item.name}</td>
                        <td
                          style={{ fontWeight: "600", color: "var(--maroon)" }}
                        >
                          {item.role}
                        </td>
                        <td>{item.phone}</td>
                        <td>
                          <span className="badge badgeSuccess">
                            {item.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMember(item);
                              setNewMember({
                                name: item.name,
                                email: item.email || "",
                                role: item.role,
                                phone: item.phone,
                                status: item.status,
                              });
                              setShowMemberModal(true);
                            }}
                            style={{ background: "none", border: "none", color: "#2563eb", fontWeight: "700", cursor: "pointer", fontSize: "0.82rem" }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "funds" && (
          <>
            <div className="contentHeader">
              <h2
                className="pageTitle"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#1e293b",
                }}
              >
                Fund Management
              </h2>
            </div>

            {/* Quick Metrics Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>💼</span>
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    Total Created Funds
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "800",
                      color: "var(--navy)",
                      marginTop: "2px",
                    }}
                  >
                    {funds.length}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #f1f5f9",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                }}
              >
                <span style={{ fontSize: "1.5rem" }}>💰</span>
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    Combined Collections
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: "800",
                      color: "#10b981",
                      marginTop: "2px",
                    }}
                  >
                    ₹
                    {funds
                      .reduce((acc, f) => acc + f.totalCollection, 0)
                      .toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Create Fund Creator Form Panel */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ➕ Create New Fund Category
                </h3>
              </div>
              <form
                onSubmit={handleAddFund}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr auto",
                  gap: "16px",
                  alignItems: "end",
                }}
              >
                <div className="formGroup" style={{ marginBottom: "0" }}>
                  <label
                    className="formLabel"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      color: "var(--navy)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Fund Name
                  </label>
                  <input
                    type="text"
                    className="inputField"
                    value={newFund.name}
                    onChange={(e) =>
                      setNewFund({ ...newFund, name: e.target.value })
                    }
                    placeholder="e.g. Temple Festival Fund"
                    required
                  />
                </div>

                <div className="formGroup" style={{ marginBottom: "0" }}>
                  <label
                    className="formLabel"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      color: "var(--navy)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Billing Period
                  </label>
                  <select
                    className="inputField"
                    value={newFund.type}
                    onChange={(e) =>
                      setNewFund({ ...newFund, type: e.target.value })
                    }
                    style={{ appearance: "none", background: "#ffffff" }}
                  >
                    <option value="MONTHLY">MONTHLY</option>
                    <option value="ONE_TIME">ONE_TIME</option>
                    <option value="ANNUALLY">ANNUALLY</option>
                  </select>
                </div>

                <div className="formGroup" style={{ marginBottom: "0" }}>
                  <label
                    className="formLabel"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      color: "var(--navy)",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    Base Amount (INR)
                  </label>
                  <input
                    type="number"
                    className="inputField"
                    value={newFund.amount}
                    onChange={(e) =>
                      setNewFund({ ...newFund, amount: e.target.value })
                    }
                    placeholder="Base Amount"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="addBtn"
                  style={{
                    padding: "12px 32px",
                    borderRadius: "8px",
                    fontWeight: "700",
                  }}
                >
                  Add Fund
                </button>
              </form>
            </div>

            {/* Funds Table */}
            <div className="panelCard">
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                  }}
                >
                  Registered Fund Lists
                </h3>
              </div>
              <div className="tableContainer">
                {funds.length === 0 ? (
                  <p
                    style={{
                      padding: "20px",
                      color: "#64748b",
                      fontSize: "0.88rem",
                      textAlign: "center",
                    }}
                  >
                    No funds registered. Create a fund to get started.
                  </p>
                ) : (
                  <table className="adminTable">
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th>TYPE</th>
                        <th>BASE AMOUNT</th>
                        <th>TOTAL COLLECTION</th>
                        <th>STATUS</th>
                        <th style={{ textAlign: "center" }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funds.map((fund) => (
                        <tr key={fund.id}>
                          <td
                            style={{ fontWeight: "700", color: "var(--navy)" }}
                          >
                            {fund.name}
                          </td>
                          <td>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                background:
                                  fund.type === "MONTHLY"
                                    ? "rgba(139, 92, 246, 0.1)"
                                    : fund.type === "ONE_TIME"
                                      ? "rgba(245, 158, 11, 0.1)"
                                      : "rgba(16, 185, 129, 0.1)",
                                color:
                                  fund.type === "MONTHLY"
                                    ? "#6d28d9"
                                    : fund.type === "ONE_TIME"
                                      ? "#d97706"
                                      : "#047857",
                              }}
                            >
                              {fund.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: "700" }}>
                            ₹{fund.amount.toLocaleString()}
                          </td>
                          <td style={{ fontWeight: "700", color: "#10b981" }}>
                            ₹{fund.totalCollection.toLocaleString()}
                          </td>
                          <td>
                            <span className="badge badgeSuccess">
                              {fund.status}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteFund(fund.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                fontWeight: "700",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "reports" && (
          <>
            <div className="contentHeader">
              <h2
                className="pageTitle"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                📊 Reports
              </h2>
            </div>

            {/* Filter Selection Row */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <select
                  className="inputField"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  style={{
                    width: "150px",
                    appearance: "none",
                    background: "#ffffff",
                  }}
                >
                  <option value="Jan">Jan</option>
                  <option value="Feb">Feb</option>
                  <option value="Mar">Mar</option>
                  <option value="Apr">Apr</option>
                  <option value="May">May</option>
                  <option value="Jun">Jun</option>
                  <option value="Jul">Jul</option>
                  <option value="Aug">Aug</option>
                  <option value="Sep">Sep</option>
                  <option value="Oct">Oct</option>
                  <option value="Nov">Nov</option>
                  <option value="Dec">Dec</option>
                </select>

                <input
                  type="text"
                  className="inputField"
                  value={reportYear}
                  onChange={(e) => setReportYear(e.target.value)}
                  placeholder="Year (2026)"
                  style={{ width: "150px" }}
                />

                <button
                  type="button"
                  className="addBtn"
                  onClick={() =>
                    alert(
                      `Generating report for ${reportMonth} ${reportYear}...`,
                    )
                  }
                  style={{
                    padding: "10px 24px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  📄 Monthly PDF
                </button>
              </div>
            </div>

            {/* Monthly Report Block */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  🗓️ Monthly Report
                </h3>
              </div>
              <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                No data available
              </p>
            </div>

            {/* Fund-wise Report Block */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  💰 Fund-wise Report
                </h3>
                <button
                  type="button"
                  className="addBtn"
                  onClick={() => alert("Downloading Fund-wise Report PDF...")}
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.8rem",
                    borderRadius: "4px",
                  }}
                >
                  📄 PDF
                </button>
              </div>
              <div className="tableContainer">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>FUND NAME</th>
                      <th>TOTAL AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {funds.map((fund) => (
                      <tr key={fund.id}>
                        <td style={{ fontWeight: "600" }}>{fund.name}</td>
                        <td style={{ fontWeight: "700", color: "var(--navy)" }}>
                          ₹{fund.totalCollection.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Member-wise Report Block */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  👤 Member-wise Report
                </h3>
                <button
                  type="button"
                  className="addBtn"
                  onClick={() => alert("Downloading Member-wise Report PDF...")}
                  style={{
                    padding: "6px 14px",
                    fontSize: "0.8rem",
                    borderRadius: "4px",
                  }}
                >
                  📄 PDF
                </button>
              </div>
              <div className="tableContainer">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>MEMBER NAME</th>
                      <th>TOTAL AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, idx) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: "600" }}>{m.name}</td>
                        <td style={{ fontWeight: "700", color: "var(--navy)" }}>
                          ₹
                          {(idx === 0
                            ? 15000
                            : idx === 1
                              ? 8000
                              : 0
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "meetings" && (
          <>
            <div className="contentHeader">
              <h2
                className="pageTitle"
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🗓️ Meetings
              </h2>
            </div>

            {/* Stat Cards Row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
                  borderRadius: "12px",
                  padding: "20px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.15)",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "10px",
                    borderRadius: "50%",
                    display: "flex",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      opacity: 0.9,
                      fontWeight: "600",
                    }}
                  >
                    Upcoming
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "800" }}>
                    {meetings.length}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #047857 0%, #10b981 100%)",
                  borderRadius: "12px",
                  padding: "20px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.15)",
                }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    padding: "10px",
                    borderRadius: "50%",
                    display: "flex",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      opacity: 0.9,
                      fontWeight: "600",
                    }}
                  >
                    Completed
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "800" }}>0</div>
                </div>
              </div>
            </div>

            {/* Create Meeting Form Card */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  ➕ Create Meeting
                </h3>
              </div>
              <form
                onSubmit={handleCreateMeeting}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="formGroup">
                  <label
                    className="formLabel"
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "var(--navy)",
                    }}
                  >
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    className="inputField"
                    value={newMeeting.title}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, title: e.target.value })
                    }
                    placeholder="Meeting Title"
                    required
                  />
                </div>
                <div className="formGroup">
                  <label
                    className="formLabel"
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "var(--navy)",
                    }}
                  >
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="inputField"
                    value={newMeeting.dateTime}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, dateTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="formGroup">
                  <label
                    className="formLabel"
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "var(--navy)",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    className="inputField"
                    rows="3"
                    value={newMeeting.desc}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, desc: e.target.value })
                    }
                    placeholder="Description"
                    style={{ resize: "none" }}
                  />
                </div>
                <div className="formGroup">
                  <label
                    className="formLabel"
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      color: "var(--navy)",
                    }}
                  >
                    Meeting Link (Zoom / Google Meet)
                  </label>
                  <input
                    type="text"
                    className="inputField"
                    value={newMeeting.link}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, link: e.target.value })
                    }
                    placeholder="Zoom / Google Meet Link"
                  />
                </div>
                <button
                  type="submit"
                  className="addBtn"
                  style={{
                    width: "fit-content",
                    padding: "10px 32px",
                    borderRadius: "20px",
                  }}
                >
                  Create
                </button>
              </form>
            </div>

            {/* List of Meetings (Redesigned Grid Cards) */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "800",
                  color: "#1e293b",
                  marginBottom: "16px",
                }}
              >
                Scheduled Meetings List
              </h3>
              {meetings.length === 0 ? (
                <div
                  className="panelCard"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  No meetings scheduled.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {meetings.map((meet) => {
                    const dateObj = meet.date
                      ? new Date(meet.date)
                      : new Date();
                    const day = isNaN(dateObj.getDate())
                      ? "22"
                      : dateObj.getDate();
                    const month = isNaN(dateObj.getDate())
                      ? "Jul"
                      : dateObj.toLocaleString("en-US", { month: "short" });

                    return (
                      <div
                        key={meet.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #f1f5f9",
                          borderRadius: "12px",
                          padding: "20px",
                          display: "flex",
                          gap: "16px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                          position: "relative",
                        }}
                      >
                        {/* Calendar Badge */}
                        <div
                          style={{
                            background: "rgba(37, 99, 235, 0.05)",
                            border: "1px solid rgba(37, 99, 235, 0.1)",
                            borderRadius: "8px",
                            padding: "8px",
                            width: "55px",
                            height: "65px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              color: "#2563eb",
                              fontSize: "0.75rem",
                              fontWeight: "800",
                              textTransform: "uppercase",
                            }}
                          >
                            {month}
                          </span>
                          <span
                            style={{
                              color: "var(--navy)",
                              fontSize: "1.4rem",
                              fontWeight: "900",
                              lineHeight: "1",
                            }}
                          >
                            {day}
                          </span>
                        </div>

                        {/* Details */}
                        <div
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <h4
                              style={{
                                fontSize: "0.95rem",
                                fontWeight: "800",
                                color: "var(--navy)",
                                marginBottom: "4px",
                              }}
                            >
                              {meet.title}
                            </h4>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#64748b",
                                fontSize: "0.75rem",
                                marginBottom: "8px",
                              }}
                            >
                              <span>🕒 {meet.time}</span>
                              <span>•</span>
                              <span>
                                📍{" "}
                                {meet.link ? "Online" : meet.venue || "Online"}
                              </span>
                            </div>
                            {meet.desc && (
                              <p
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#64748b",
                                  lineHeight: "1.4",
                                  marginBottom: "12px",
                                }}
                              >
                                {meet.desc}
                              </p>
                            )}
                          </div>

                          <div style={{ marginTop: "12px" }}>
                            {meet.link ? (
                              <a
                                href={meet.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: "inline-block",
                                  background:
                                    "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
                                  color: "#ffffff",
                                  padding: "6px 16px",
                                  borderRadius: "20px",
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  textDecoration: "none",
                                  boxShadow: "0 2px 4px rgba(37,99,235,0.2)",
                                }}
                              >
                                Join Meeting 🔗
                              </a>
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  color: "#10b981",
                                  background: "rgba(16, 185, 129, 0.1)",
                                  padding: "4px 10px",
                                  borderRadius: "10px",
                                }}
                              >
                                In-Person Meet
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "complaints" && (
          <>
            <div className="contentHeader">
              <div>
                <h2
                  className="pageTitle"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  📮 My Complaints
                </h2>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "#64748b",
                    marginTop: "4px",
                    fontWeight: "600",
                  }}
                >
                  Logged in as: MEMBER
                </div>
              </div>
            </div>

            {/* Status Grid Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "#ffffff",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(217, 119, 6, 0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.9,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  open
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    marginTop: "4px",
                  }}
                >
                  {complaints.length}
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "#ffffff",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(29, 78, 216, 0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.9,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  forwarded
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    marginTop: "4px",
                  }}
                >
                  0
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "#ffffff",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(109, 40, 217, 0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.9,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  in progress
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    marginTop: "4px",
                  }}
                >
                  0
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "#ffffff",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(4, 120, 87, 0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.9,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  resolved
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    marginTop: "4px",
                  }}
                >
                  0
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "#ffffff",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(71, 85, 105, 0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.9,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  closed
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    marginTop: "4px",
                  }}
                >
                  0
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                  borderRadius: "8px",
                  padding: "16px",
                  color: "#ffffff",
                  textAlign: "center",
                  boxShadow: "0 4px 6px rgba(185, 28, 28, 0.15)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.9,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  sla missed
                </div>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: "900",
                    marginTop: "4px",
                  }}
                >
                  0
                </div>
              </div>
            </div>

            {/* Complaint Overview Chart */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  📊 Complaint Overview
                </h3>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  viewBox="0 0 500 150"
                  style={{ width: "100%", height: "100%" }}
                >
                  <line
                    x1="40"
                    y1="10"
                    x2="480"
                    y2="10"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="40"
                    y1="37.5"
                    x2="480"
                    y2="37.5"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="40"
                    y1="65"
                    x2="480"
                    y2="65"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="40"
                    y1="92.5"
                    x2="480"
                    y2="92.5"
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <line
                    x1="40"
                    y1="10"
                    x2="40"
                    y2="120"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                  <line
                    x1="40"
                    y1="120"
                    x2="480"
                    y2="120"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />

                  {/* Dynamic bar for open complaints */}
                  <rect
                    x="65"
                    y={120 - complaints.length * 25}
                    width="30"
                    height={complaints.length * 25}
                    fill="url(#openGradient)"
                    rx="4"
                  />
                  <defs>
                    <linearGradient
                      id="openGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>

                  <text
                    x="25"
                    y="15"
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                  >
                    4
                  </text>
                  <text
                    x="25"
                    y="42.5"
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                  >
                    3
                  </text>
                  <text
                    x="25"
                    y="70"
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                  >
                    2
                  </text>
                  <text
                    x="25"
                    y="97.5"
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                  >
                    1
                  </text>
                  <text
                    x="25"
                    y="125"
                    fill="#64748b"
                    fontSize="10"
                    textAnchor="end"
                  >
                    0
                  </text>

                  <text
                    x="80"
                    y="135"
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    open
                  </text>
                  <text
                    x="150"
                    y="135"
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    forwarded
                  </text>
                  <text
                    x="220"
                    y="135"
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    in progress
                  </text>
                  <text
                    x="290"
                    y="135"
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    resolved
                  </text>
                  <text
                    x="360"
                    y="135"
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    closed
                  </text>
                  <text
                    x="430"
                    y="135"
                    fill="#64748b"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    sla missed
                  </text>
                </svg>
              </div>
            </div>

            {/* Create Complaint Form Card */}
            <div className="panelCard" style={{ marginBottom: "24px" }}>
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  Create Complaint
                </h3>
              </div>
              <form
                onSubmit={handleCreateComplaint}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div className="formGroup">
                  <input
                    type="text"
                    className="inputField"
                    value={newComplaint.subject}
                    onChange={(e) =>
                      setNewComplaint({
                        ...newComplaint,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Subject"
                    required
                  />
                </div>
                <div className="formGroup">
                  <textarea
                    className="inputField"
                    rows="4"
                    value={newComplaint.desc}
                    onChange={(e) =>
                      setNewComplaint({ ...newComplaint, desc: e.target.value })
                    }
                    placeholder="Description"
                    style={{ resize: "none" }}
                    required
                  />
                </div>
                <div className="formGroup">
                  <textarea
                    className="inputField"
                    rows="3"
                    value={newComplaint.comment}
                    onChange={(e) =>
                      setNewComplaint({
                        ...newComplaint,
                        comment: e.target.value,
                      })
                    }
                    placeholder="Initial Comment (mandatory)"
                    style={{ resize: "none" }}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="addBtn"
                  style={{ width: "fit-content", padding: "10px 32px" }}
                >
                  Submit Complaint
                </button>
              </form>
            </div>

            {/* Active Complaints Log Table */}
            <div className="panelCard">
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                  }}
                >
                  Registered Complaints List
                </h3>
              </div>
              <div className="tableContainer">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Reporter</th>
                      <th>Subject / Title</th>
                      <th>Date Filed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: "700", color: "var(--navy)" }}>
                          {item.name}
                        </td>
                        <td style={{ fontWeight: "600" }}>{item.title}</td>
                        <td>{item.date}</td>
                        <td>
                          <span className="badge badgeWarning">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "suggestions" && (
          <>
            <div className="contentHeader">
              <div>
                <h2
                  className="pageTitle"
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  💡 Suggestion Box
                </h2>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Share ideas, improvements, or concerns with the association
                </div>
              </div>
            </div>

            {/* Status Grid Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  borderRadius: "10px",
                  padding: "20px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 4px 6px rgba(217,119,6,0.15)",
                }}
              >
                <div style={{ fontSize: "2rem" }}>⏳</div>
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      opacity: 0.9,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    PENDING
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "900",
                      marginTop: "4px",
                    }}
                  >
                    {suggestions.length}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                  borderRadius: "10px",
                  padding: "20px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 4px 6px rgba(4,120,87,0.15)",
                }}
              >
                <div style={{ fontSize: "2rem" }}>✅</div>
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      opacity: 0.9,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    APPROVED
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "900",
                      marginTop: "4px",
                    }}
                  >
                    0
                  </div>
                </div>
              </div>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                  borderRadius: "10px",
                  padding: "20px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  boxShadow: "0 4px 6px rgba(185,28,28,0.15)",
                }}
              >
                <div style={{ fontSize: "2rem" }}>❌</div>
                <div>
                  <div
                    style={{
                      fontSize: "0.78rem",
                      opacity: 0.9,
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}
                  >
                    REJECTED
                  </div>
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "900",
                      marginTop: "4px",
                    }}
                  >
                    0
                  </div>
                </div>
              </div>
            </div>

            {/* List of Suggestions */}
            <div className="panelCard">
              <div
                className="panelHeader"
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <h3
                  className="panelTitle"
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    textTransform: "none",
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  📬 All Suggestions
                </h3>
              </div>
              {suggestions.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: "0.88rem" }}>
                  No suggestions yet.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {suggestions.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: "16px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "700",
                            color: "var(--navy)",
                            fontSize: "0.9rem",
                          }}
                        >
                          👤 {item.name}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                          {item.date}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#334155",
                          lineHeight: "1.5",
                        }}
                      >
                        {item.text}
                      </p>
                      <div
                        style={{
                          marginTop: "12px",
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            color: "#f59e0b",
                            background: "rgba(245,158,11,0.1)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          PENDING REVIEW
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "expenses" && (
          <>
            <div className="contentHeader">
              <h2 className="pageTitle">Expense Logs</h2>
              <button
                className="addBtn"
                onClick={() => setShowExpenseModal(true)}
              >
                Record Expense
              </button>
            </div>

            <div className="panelCard">
              <div className="tableContainer">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Status</th>
                      {userRole === "SUPER_ADMIN" && (
                        <th style={{ textAlign: "center" }}>ACTIONS</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {(() => {
                            if (!item.date) return "";
                            const parts = item.date.split("-");
                            if (parts.length === 3 && parts[0].length === 4) {
                              return `${parts[2]}-${parts[1]}-${parts[0]}`;
                            }
                            return item.date;
                          })()}
                        </td>
                        <td style={{ fontWeight: "700", color: "var(--navy)" }}>
                          {item.title}
                        </td>
                        <td style={{ fontWeight: "600" }}>{item.category}</td>
                        <td>{item.desc}</td>
                        <td style={{ fontWeight: "700" }}>
                          ₹{item.amount.toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.status === "APPROVED"
                                ? "badgeSuccess"
                                : "badgeWarning"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        {userRole === "SUPER_ADMIN" && (
                          <td style={{ textAlign: "center" }}>
                            {item.status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => handleApproveExpense(item.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#10b981",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                  marginRight: "8px",
                                }}
                              >
                                Approve
                              </button>
                            )}
                            {item.status === "APPROVED" && (
                              <button
                                type="button"
                                onClick={() => handleCancelExpense(item.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#ef4444",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  fontSize: "0.82rem",
                                }}
                              >
                                Cancel
                              </button>
                            )}
                            {item.status === "CANCELLED" && "-"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "donations" && (
          <>
            <div className="contentHeader">
              <h2 className="pageTitle">Donation Logs</h2>
              <button
                className="addBtn"
                onClick={() => setShowDonationModal(true)}
              >
                Record Donation
              </button>
            </div>

            <div className="panelCard">
              <div className="tableContainer">
                <table className="adminTable">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Fund</th>
                      <th>Amount</th>
                      <th>Description</th>
                      <th>Status</th>
                      {userRole === "SUPER_ADMIN" && (
                        <th style={{ textAlign: "center" }}>ACTIONS</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {donations.length === 0 ? (
                      <tr>
                        <td colSpan={userRole === "SUPER_ADMIN" ? 8 : 7} style={{ textAlign: "center", color: "#64748b" }}>
                          No donations recorded yet.
                        </td>
                      </tr>
                    ) : (
                      donations.map((item) => (
                        <tr key={item.id}>
                          <td>
                            {(() => {
                              if (!item.date) return "";
                              const parts = item.date.split("T")[0].split("-");
                              if (parts.length === 3 && parts[0].length === 4) {
                                return `${parts[2]}-${parts[1]}-${parts[0]}`;
                              }
                              return item.date.split("T")[0];
                            })()}
                          </td>
                          <td style={{ fontWeight: "700", color: "var(--navy)" }}>
                            {item.title}
                          </td>
                          <td style={{ fontWeight: "600" }}>{item.category}</td>
                          <td style={{ fontWeight: "600" }}>{item.fund_name}</td>
                          <td style={{ fontWeight: "700", color: "#10b981" }}>
                            ₹{Number(item.amount).toLocaleString()}
                          </td>
                          <td>{item.desc || item.payment_note || "-"}</td>
                          <td>
                            <span
                              className={`badge ${
                                item.status === "APPROVED"
                                  ? "badgeSuccess"
                                  : item.status === "REJECTED" || item.status === "CANCELLED"
                                  ? "badgeDanger"
                                  : "badgeWarning"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          {userRole === "SUPER_ADMIN" && (
                            <td style={{ textAlign: "center" }}>
                              {item.status === "PENDING" ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveDonation(item)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#10b981",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      fontSize: "0.82rem",
                                      marginRight: "8px",
                                    }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRejectDonation(item)}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      color: "#ef4444",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                      fontSize: "0.82rem",
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              ) : (
                                "-"
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "logs" && (
          <>
            <div className="contentHeader">
              <h2 className="pageTitle">Audit Logs</h2>
            </div>

            <div className="panelCard">
              <div className="timeline" style={{ padding: "10px 0" }}>
                {auditLogs.map((log) => (
                  <div key={log.id} className="timelineItem">
                    <div className="timelineDot" />
                    <div className="timelineContent">
                      <p
                        className="timelineText"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {log.text}
                      </p>
                      <span className="timelineTime">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* --- RECORD MEMBER MODAL --- */}
      {showMemberModal && (
        <div className="modalBackdrop">
          <form className="modalContent" onSubmit={handleAddMember}>
            <div className="modalHeader">
              <h3 className="modalTitle">{editingMember ? "Edit Member Details" : "Register New Member"}</h3>
              <button
                type="button"
                className="closeBtn"
                onClick={() => setShowMemberModal(false)}
              >
                ×
              </button>
            </div>

            <div className="formGroup">
              <label className="formLabel">Full Name</label>
              <input
                type="text"
                className="inputField"
                value={newMember.name}
                onChange={(e) =>
                  setNewMember({ ...newMember, name: e.target.value })
                }
                placeholder="Enter member's full name"
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Email Address</label>
              <input
                type="email"
                className="inputField"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Association Role</label>
              <select
                className="inputField"
                value={newMember.role}
                onChange={(e) =>
                  setNewMember({ ...newMember, role: e.target.value })
                }
                style={{ appearance: "none", background: "#ffffff" }}
              >
                <option value="MEMBER">MEMBER</option>
                <option value="EC_MEMBER">EC_MEMBER</option>
                <option value="TREASURER">TREASURER</option>
                <option value="PRESIDENT">PRESIDENT</option>
                <option value="VICE_PRESIDENT">VICE_PRESIDENT</option>
                <option value="GENERAL_SECRETARY">GENERAL_SECRETARY</option>
                <option value="JOINT_SECRETARY">JOINT_SECRETARY</option>
              </select>
            </div>

            <div className="formGroup">
              <label className="formLabel">Phone Number</label>
              <input
                type="tel"
                className="inputField"
                value={newMember.phone}
                onChange={(e) =>
                  setNewMember({ ...newMember, phone: e.target.value })
                }
                placeholder="Enter 10-digit phone number"
                required
              />
            </div>

            {editingMember && (
              <div className="formGroup">
                <label className="formLabel">Account Status</label>
                <select
                  className="inputField"
                  value={newMember.status}
                  onChange={(e) =>
                    setNewMember({ ...newMember, status: e.target.value })
                  }
                  style={{ appearance: "none", background: "#ffffff" }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            )}

            <div className="modalFooter">
              <button
                type="button"
                className="btnCancel"
                onClick={() => setShowMemberModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btnSubmit">
                {editingMember ? "Save Changes" : "Create Member"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- RECORD EXPENSE MODAL --- */}
      {showExpenseModal && (
        <div className="modalBackdrop">
          <form className="modalContent" onSubmit={handleAddExpense}>
            <div className="modalHeader">
              <h3 className="modalTitle">Record Organization Expense</h3>
              <button
                type="button"
                className="closeBtn"
                onClick={() => setShowExpenseModal(false)}
              >
                ×
              </button>
            </div>

            <div className="formGroup">
              <label className="formLabel">Expense Title *</label>
              <input
                type="text"
                className="inputField"
                value={newExpense.title}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, title: e.target.value })
                }
                placeholder="e.g. Purchase of saplings"
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Category</label>
              <input
                type="text"
                className="inputField"
                value={newExpense.category}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, category: e.target.value })
                }
                placeholder="e.g. Tree Plantation Camp"
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Select Fund *</label>
              <select
                className="inputField"
                value={newExpense.fund_id}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, fund_id: e.target.value })
                }
                style={{ appearance: "none", background: "#ffffff" }}
                required
              >
                <option value="">-- Choose Fund --</option>
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Balance: ₹{f.amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label className="formLabel">Amount (₹) *</label>
              <input
                type="number"
                className="inputField"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
                placeholder="e.g. 5000"
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Expense Date *</label>
              <input
                type="date"
                className="inputField"
                value={newExpense.expense_date}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, expense_date: e.target.value })
                }
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Description</label>
              <textarea
                className="inputField"
                rows="3"
                value={newExpense.desc}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, desc: e.target.value })
                }
                placeholder="Describe details of the purchase"
                style={{ resize: "none" }}
              />
            </div>

            <div className="modalFooter">
              <button
                type="button"
                className="btnCancel"
                onClick={() => setShowExpenseModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btnSubmit">
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}
      {/* --- RECORD DONATION MODAL --- */}
      {showDonationModal && (
        <div className="modalBackdrop">
          <form className="modalContent" onSubmit={handleAddDonation}>
            <div className="modalHeader">
              <h3 className="modalTitle">Record Donation / Income</h3>
              <button
                type="button"
                className="closeBtn"
                onClick={() => setShowDonationModal(false)}
              >
                ×
              </button>
            </div>

            <div className="formGroup">
              <label className="formLabel">Donation Title *</label>
              <input
                type="text"
                className="inputField"
                value={newDonation.title}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, title: e.target.value })
                }
                placeholder="e.g. Temple Festival Fund Contribution"
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Category</label>
              <input
                type="text"
                className="inputField"
                value={newDonation.category}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, category: e.target.value })
                }
                placeholder="e.g. Special Event"
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Select Fund *</label>
              <select
                className="inputField"
                value={newDonation.fund_id}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, fund_id: e.target.value })
                }
                style={{ appearance: "none", background: "#ffffff" }}
                required
              >
                <option value="">-- Choose Fund --</option>
                {funds.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (Balance: ₹{f.amount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label className="formLabel">Amount (₹) *</label>
              <input
                type="number"
                className="inputField"
                value={newDonation.amount}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, amount: e.target.value })
                }
                placeholder="e.g. 5000"
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Donation Date *</label>
              <input
                type="date"
                className="inputField"
                value={newDonation.date}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, date: e.target.value })
                }
                required
              />
            </div>

            <div className="formGroup">
              <label className="formLabel">Description</label>
              <textarea
                className="inputField"
                rows="3"
                value={newDonation.description}
                onChange={(e) =>
                  setNewDonation({ ...newDonation, description: e.target.value })
                }
                placeholder="Describe details of the donation"
                style={{ resize: "none" }}
              />
            </div>

            <div className="modalFooter">
              <button
                type="button"
                className="btnCancel"
                onClick={() => setShowDonationModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btnSubmit">
                Save Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
