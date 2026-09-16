import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig } from "../js/firebase-config.js";

const $ = (id) => document.getElementById(id);
const configured = !Object.values(firebaseConfig).some((value) => String(value).includes("YOUR_"));

const loginView = $("login-view");
const dashboardView = $("dashboard-view");
const loginForm = $("login-form");
const loginStatus = $("login-status");
const registrationsBody = $("registrations-body");
const searchInput = $("search-input");
const statusFilter = $("status-filter");
const drawer = $("drawer");
const drawerContent = $("drawer-content");

let db;
let auth;
let currentUser = null;
let registrations = [];

function formatDate(value) {
  if (!value) return "—";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function naira(value) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function statusLabel(status) {
  return ({
    new: "New",
    contacted: "Contacted",
    "payment-pending": "Payment pending",
    paid: "Paid",
    rejected: "Rejected",
    "not-contacted": "Not contacted"
  })[status] || status || "—";
}

function statusClass(status) {
  if (status === "paid") return "badge-paid";
  if (status === "payment-pending" || status === "contacted") return "badge-pending";
  if (status === "rejected") return "badge-rejected";
  return "";
}

function normalizedStatus(reg) {
  if (reg.paymentStatus === "paid") return "paid";
  if (reg.paymentStatus === "rejected") return "rejected";
  if (reg.paymentStatus === "payment-pending") return "payment-pending";
  if (reg.registrationStatus === "contacted") return "contacted";
  return "new";
}

function updateKPIs() {
  const total = registrations.length;
  const paid = registrations.filter((r) => r.paymentStatus === "paid").length;
  const pending = registrations.filter((r) => ["payment-pending", "contacted"].includes(normalizedStatus(r))).length;
  const newly = registrations.filter((r) => normalizedStatus(r) === "new").length;
  const revenue = registrations.reduce((sum, r) => sum + (r.paymentStatus === "paid" ? Number(r.amount || 0) : 0), 0);
  const optins = registrations.filter((r) => r.marketingConsent === true).length;

  $("kpi-total").textContent = total;
  $("kpi-paid").textContent = paid;
  $("kpi-pending").textContent = pending;
  $("kpi-new").textContent = newly;
  $("kpi-revenue").textContent = naira(revenue);
  $("kpi-optins").textContent = optins;
}

function filteredRegistrations() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = statusFilter.value;
  return registrations.filter((r) => {
    const status = normalizedStatus(r);
    const matchesStatus = filter === "all" || status === filter;
    const haystack = [r.name, r.email, r.phone, r.goal, r.source].join(" ").toLowerCase();
    return matchesStatus && (!query || haystack.includes(query));
  });
}

function renderTable() {
  const rows = filteredRegistrations();
  if (!rows.length) {
    registrationsBody.innerHTML = '<tr><td colspan="6" class="empty">No registrations match your filters.</td></tr>';
    return;
  }

  registrationsBody.innerHTML = rows.map((r) => {
    const status = normalizedStatus(r);
    return `<tr>
      <td><div class="person-name">${escapeHtml(r.name)}</div><div class="muted">${escapeHtml(r.email)}<br>${escapeHtml(r.phone)}</div></td>
      <td>${escapeHtml(r.experienceLevel || "—")}</td>
      <td>${escapeHtml(r.source || "Unknown")}</td>
      <td><span class="badge ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></td>
      <td>${formatDate(r.createdAt)}</td>
      <td><button class="action-btn" data-open="${escapeHtml(r.id)}">View</button></td>
    </tr>`;
  }).join("");
}

function openDrawer(id) {
  const r = registrations.find((item) => item.id === id);
  if (!r) return;
  const status = normalizedStatus(r);
  drawerContent.innerHTML = `
    <p class="eyebrow">Registration</p>
    <h2>${escapeHtml(r.name)}</h2>
    <div class="detail-grid">
      <div class="detail-item"><small>Email</small><p>${escapeHtml(r.email)}</p></div>
      <div class="detail-item"><small>WhatsApp</small><p>${escapeHtml(r.phone)}</p></div>
      <div class="detail-item"><small>Experience</small><p>${escapeHtml(r.experienceLevel || "—")}</p></div>
      <div class="detail-item"><small>Goal / project</small><p>${escapeHtml(r.goal || "—")}</p></div>
      <div class="detail-item"><small>Source</small><p>${escapeHtml(r.source || "Unknown")}</p></div>
      <div class="detail-item"><small>Email updates</small><p>${r.marketingConsent ? "Opted in" : "Not opted in"}</p></div>
      <div class="detail-item"><small>Registered</small><p>${formatDate(r.createdAt)}</p></div>
      <div class="detail-item"><small>Current status</small><p><span class="badge ${statusClass(status)}">${escapeHtml(statusLabel(status))}</span></p></div>
      <div class="detail-item"><small>Payment</small><p>${r.paymentStatus === "paid" ? `${naira(r.amount)} · ${escapeHtml(r.paymentReference || "No reference")}` : escapeHtml(statusLabel(r.paymentStatus || "not-contacted"))}</p></div>
    </div>
    <div class="detail-actions">
      <button class="action-btn" data-status="contacted" data-id="${escapeHtml(r.id)}">Mark contacted</button>
      <button class="action-btn" data-status="payment-pending" data-id="${escapeHtml(r.id)}">Payment pending</button>
      <button class="action-btn success" data-status="paid" data-id="${escapeHtml(r.id)}">Confirm paid</button>
      <button class="action-btn danger" data-status="rejected" data-id="${escapeHtml(r.id)}">Reject</button>
    </div>`;
  drawer.hidden = false;
}

async function updateRegistration(id, nextStatus) {
  const r = registrations.find((item) => item.id === id);
  if (!r) return;
  const updates = { updatedAt: serverTimestamp() };
  if (nextStatus === "paid") {
    const amount = window.prompt("Amount paid (NGN):", String(r.amount || ""));
    if (amount === null) return;
    const reference = window.prompt("Payment/reference note (optional):", r.paymentReference || "");
    updates.paymentStatus = "paid";
    updates.registrationStatus = "confirmed";
    updates.amount = Number(amount) || 0;
    updates.paymentReference = reference || "";
    updates.paidAt = serverTimestamp();
  } else if (nextStatus === "rejected") {
    updates.paymentStatus = "rejected";
    updates.registrationStatus = "rejected";
  } else if (nextStatus === "payment-pending") {
    updates.paymentStatus = "payment-pending";
    updates.registrationStatus = "contacted";
  } else {
    updates.paymentStatus = r.paymentStatus || "not-contacted";
    updates.registrationStatus = "contacted";
  }

  await updateDoc(doc(db, "registrations", id), updates);
  Object.assign(r, updates);
  updateKPIs();
  renderTable();
  openDrawer(id);
}

async function loadRegistrations() {
  registrationsBody.innerHTML = '<tr><td colspan="6" class="empty">Loading registrations…</td></tr>';
  const snapshot = await getDocs(collection(db, "registrations"));
  registrations = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  registrations.sort((a, b) => {
    const ad = a.createdAt?.toDate?.() || new Date(0);
    const bd = b.createdAt?.toDate?.() || new Date(0);
    return bd - ad;
  });
  updateKPIs();
  renderTable();
}

function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function exportOptins() {
  const optedIn = registrations.filter((r) => r.marketingConsent === true);
  const lines = ["Name,Email,WhatsApp,Registered"].concat(optedIn.map((r) => [r.name, r.email, r.phone, formatDate(r.createdAt)].map(csvCell).join(",")));
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `bwai-email-list-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
}

function exportCSV() {
  const headers = ["Name", "Email", "WhatsApp", "Experience", "Goal", "Source", "Marketing consent", "Registration status", "Payment status", "Amount", "Payment reference", "Registered"];
  const lines = [headers.map(csvCell).join(",")];
  registrations.forEach((r) => lines.push([
    r.name, r.email, r.phone, r.experienceLevel, r.goal, r.source, r.marketingConsent ? "Yes" : "No",
    r.registrationStatus, r.paymentStatus, r.amount || "", r.paymentReference || "", formatDate(r.createdAt)
  ].map(csvCell).join(",")));
  const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `bwai-cohort-1-registrations-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
}

async function bootstrap() {
  if (!configured) {
    loginStatus.textContent = "Add your Firebase web-app config in js/firebase-config.js first.";
    $("login-btn").disabled = true;
    return;
  }

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (!user) {
      loginView.hidden = false; dashboardView.hidden = true; return;
    }
    try {
      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      if (!adminDoc.exists() || adminDoc.data().role !== "admin") {
        await signOut(auth);
        throw new Error("This account is not approved as a BWAI admin.");
      }
      $("admin-email").textContent = user.email || "";
      loginView.hidden = true; dashboardView.hidden = false;
      await loadRegistrations();
    } catch (error) {
      loginView.hidden = false; dashboardView.hidden = true;
      loginStatus.textContent = error.message || "Admin access could not be verified.";
    }
  });
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginStatus.textContent = "";
  $("login-btn").disabled = true;
  try {
    await signInWithEmailAndPassword(auth, $("login-email").value.trim(), $("login-password").value);
  } catch (error) {
    loginStatus.textContent = "Login failed. Check your email/password and make sure the account is approved as an admin.";
  } finally { $("login-btn").disabled = false; }
});

$("logout-btn").addEventListener("click", () => signOut(auth));
searchInput.addEventListener("input", renderTable);
statusFilter.addEventListener("change", renderTable);
$("export-btn").addEventListener("click", exportCSV);
$("export-optins-btn").addEventListener("click", exportOptins);
$("drawer-close").addEventListener("click", () => { drawer.hidden = true; });
drawer.addEventListener("click", (event) => { if (event.target.hasAttribute("data-close-drawer")) drawer.hidden = true; });
registrationsBody.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-open]");
  if (btn) openDrawer(btn.dataset.open);
});
drawerContent.addEventListener("click", async (event) => {
  const btn = event.target.closest("[data-status]");
  if (!btn) return;
  btn.disabled = true;
  try { await updateRegistration(btn.dataset.id, btn.dataset.status); }
  catch (error) { alert(error.message || "Could not update registration."); btn.disabled = false; }
});

bootstrap();
