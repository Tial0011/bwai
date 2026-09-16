import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, addDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const form = document.getElementById("cohort-form");
const success = document.getElementById("cohort-success");
const statusEl = document.getElementById("cohort-form-status");
const submitBtn = document.getElementById("cohort-submit");

function isConfigured(config) {
  return config && !Object.values(config).some((value) => String(value).includes("YOUR_"));
}

if (form && isConfigured(firebaseConfig)) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    const data = new FormData(form);
    if (String(data.get("website") || "").trim()) return;

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const phone = String(data.get("phone") || "").trim();
    const experienceLevel = String(data.get("experienceLevel") || "");
    const goal = String(data.get("goal") || "").trim();
    const source = String(data.get("source") || "");
    const marketingConsent = data.get("marketingConsent") === "on";

    if (!name || !email || !phone || !experienceLevel || !goal) {
      statusEl.textContent = "Please complete all required fields.";
      statusEl.classList.add("is-error");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      statusEl.textContent = "Please enter a valid email address.";
      statusEl.classList.add("is-error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Registering…";

    try {
      const params = new URLSearchParams(window.location.search);
      const registration = {
        cohort: "cohort-1",
        name,
        email,
        phone,
        experienceLevel,
        goal,
        source: source || "Unknown",
        marketingConsent,
        paymentStatus: "not-contacted",
        registrationStatus: "new",
        utmSource: params.get("utm_source") || "",
        utmMedium: params.get("utm_medium") || "",
        utmCampaign: params.get("utm_campaign") || "",
        referrer: document.referrer || "direct",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "registrations"), registration);

      form.hidden = true;
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (error) {
      console.error(error);
      statusEl.textContent = "We couldn't complete your registration. Please try again.";
      statusEl.classList.add("is-error");
      submitBtn.disabled = false;
      submitBtn.textContent = "Register for Cohort 1";
    }
  });
} else if (form) {
  submitBtn.disabled = true;
  statusEl.textContent = "Registration is being configured. Please add your Firebase web-app config first.";
  statusEl.classList.add("is-error");
}
