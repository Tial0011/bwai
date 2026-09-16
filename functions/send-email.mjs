import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { Resend } from "resend";

const cors = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json"
};

function adminApp() {
  if (getApps().length) return getApps()[0];
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });
}

function response(statusCode, body) {
  return { statusCode, headers: cors, body: JSON.stringify(body) };
}

function htmlEscape(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function emailHtml(type, name) {
  const safeName = htmlEscape(name || "there");
  if (type === "payment_confirmed") {
    return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.6;color:#14213d"><h2>You're confirmed for BWAI Cohort 1 🎉</h2><p>Hi ${safeName},</p><p>Your BWAI Cohort 1 registration has been confirmed. We'll share the next program details and instructions with you directly.</p><p>We're excited to build with you.</p><p>— BWAI Team</p></div>`;
  }
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;line-height:1.6;color:#14213d"><h2>BWAI Cohort 1 registration received</h2><p>Hi ${safeName},</p><p>We've received your registration for BWAI Cohort 1.</p><p>We'll contact you directly via WhatsApp with the next steps, including payment information. No payment was taken through the website.</p><p>— BWAI Team</p></div>`;
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return response(405, { error: "Method not allowed" });
  if (!process.env.RESEND_API_KEY) return response(503, { error: "Email service is not configured." });

  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return response(400, { error: "Invalid JSON." }); }

  const { type, name, email, registrationId } = payload;
  if (!email || !name || !registrationId || !["registration_received", "payment_confirmed"].includes(type)) {
    return response(400, { error: "Missing or invalid email payload." });
  }

  if (type === "payment_confirmed") {
    const authorization = event.headers?.authorization || event.headers?.Authorization || "";
    if (!authorization.startsWith("Bearer ")) return response(401, { error: "Authentication required." });
    try {
      const token = authorization.slice(7);
      const app = adminApp();
      const decoded = await getAuth(app).verifyIdToken(token);
      const adminSnap = await getFirestore(app).doc(`admins/${decoded.uid}`).get();
      if (!adminSnap.exists || adminSnap.data().role !== "admin") return response(403, { error: "Admin access required." });
    } catch (error) {
      console.error(error);
      return response(401, { error: "Invalid admin session." });
    }
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "BWAI <onboarding@resend.dev>",
      to: [email],
      subject: type === "payment_confirmed" ? "Your BWAI Cohort 1 registration is confirmed 🎉" : "BWAI Cohort 1 — registration received",
      html: emailHtml(type, name)
    });
    if (result.error) throw new Error(result.error.message || "Email provider error");
    return response(200, { ok: true, id: result.data?.id || null });
  } catch (error) {
    console.error(error);
    return response(502, { error: "Email could not be sent." });
  }
}
