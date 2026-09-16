# BWAI Cohort 1 Registration + Admin Dashboard

This version keeps Cohort 1 intentionally manual: visitors register on the website, you contact them directly, they pay you in DM, and you update their payment status from the private admin dashboard. **There is no automatic email sending and no payment gateway integration.**

## Registration flow

1. Visitor clicks **Register for Cohort 1**.
2. They submit their name, email, WhatsApp number, experience level, goal and source.
3. The registration is stored in Firestore.
4. You contact them manually on WhatsApp/DM and handle payment manually.
5. You log in to `/admin/` and update the registration status.
6. The dashboard tracks registrations, paid students, pending payments, revenue and email opt-ins.

## Admin dashboard

Open `/admin/` after deployment. The admin login uses Firebase Authentication (Email/Password). The dashboard only opens for a Firebase Auth user whose UID has an `admins/{uid}` Firestore document with `role: "admin"`.

Dashboard features:
- Total registrations
- Paid / confirmed students
- Payment pending
- Not contacted
- Confirmed revenue
- Email opt-ins
- Search and status filtering
- Registration detail drawer
- Manual payment amount/reference recording
- CSV export of all registrations
- CSV export of only opted-in emails

## Firebase setup

The Firebase web configuration is already placed in `js/firebase-config.js` using the config supplied for this project.

In Firebase Console:

1. Open the Firebase project used by the supplied config (`quizappweb-6fb8c`).
2. Enable **Firestore Database**.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Publish the included `firestore.rules` in Firestore → Rules.

### Create the first admin

1. In Firebase Authentication → Users, create an email/password user for the admin.
2. Copy that user's **UID**.
3. In Firestore, create a collection named `admins`.
4. Create a document whose document ID is exactly that Firebase Auth UID.
5. Add this field:

```json
{
  "role": "admin"
}
```

The website does not allow visitors to create admin records.

## Important

The Firebase browser config can be included in the website. Firebase Rules are what protect the data. Do **not** add Firebase Admin SDK service-account credentials to the frontend.

## Deploy

This is a static Netlify site. No build command is required. Deploy the project folder to Netlify.

Useful URLs after deployment:
- Main site: `/`
- Admin login/dashboard: `/admin/`

## Cohort 1 manual workflow

Recommended statuses:
- **New** — registration just came in
- **Contacted** — you have reached the person
- **Payment pending** — they have been contacted and payment is expected
- **Paid** — payment confirmed by you
- **Rejected** — registration/payment was not accepted

There is deliberately no automated email or payment system in this version. You can add those later after Cohort 1.

## Contact

Email: taiwoalex35@gmail.com
