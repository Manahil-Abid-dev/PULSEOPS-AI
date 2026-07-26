
<div align="center">

# ⚡ PulseOps AI

### Enterprise-Grade AI Operations & Business Analytics Dashboard

*Real-time metrics. AI-grounded insights. On-demand multi-channel triggers — directly at your fingertips.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Resend](https://img.shields.io/badge/Email-Resend-black?logo=resend)](https://resend.com/)
[![Slack](https://img.shields.io/badge/Alerts-Slack_Webhooks-4A154B?logo=slack)](https://api.slack.com/messaging/webhooks)
[![Groq](https://img.shields.io/badge/AI-Groq_API-f55036?logo=groq)](https://groq.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://pulseops-ai.vercel.app)

**[🚀 Live Demo](https://pulseops-3idrq45ig-manahil-abid1.vercel.app)** · **[📂 GitHub Repository](https://github.com/Manahil-Abid-dev/PULSEOPS-AI)** · **[Report a Bug](https://github.com/Manahil-Abid-dev/PULSEOPS-AI/issues)**

</div>

---

## 🌐 Live Links

- **Production Deployment (Vercel):** [https://pulseops-3idrq45ig-manahil-abid1.vercel.app](https://pulseops-3idrq45ig-manahil-abid1.vercel.app)
- **GitHub Repository:** [https://github.com/Manahil-Abid-dev/PULSEOPS-AI](https://github.com/Manahil-Abid-dev/PULSEOPS-AI)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Key Features](#-key-features)
- [Interactive Automation Control Center](#-interactive-automation-control-center)
- [Getting Started — For Business Owners](#-getting-started--for-business-owners--end-users)
- [System Architecture](#-system-architecture)
- [API Reference — Automation Routes](#-api-reference--automation-routes)
- [Environment Setup](#-environment-setup)
- [Quickstart — For Developers](#-quickstart--for-developers)
- [Deployment (Vercel)](#-deployment-vercel)
- [Built With — Tools & AI Assistance](#-built-with--tools--ai-assistance)
- [Security](#-security)
- [Roadmap](#-roadmap--upcoming-work)
- [Author & Acknowledgments](#-author--acknowledgments)
- [License](#-license)

---

## 📌 Overview

**PulseOps AI** is a full-stack operations dashboard for small businesses, combining live Firestore-backed metrics, an ultra-fast **Groq API-powered AI Copilot** grounded in real business data, and an **on-demand multi-channel automation engine** that pushes real-time alerts, executive digests, and re-engagement emails to Slack and email inboxes.

> 🎓 **Status:** v1.0, training/portfolio build. Single-tenant architecture (one deployment = one business). See [Roadmap](#-roadmap--upcoming-work) for the multi-tenant SaaS plan.

---

## 🖼️ Screenshots

| Dashboard | AI Copilot |
|---|---|
| ![Dashboard](./public/screenshots/dashboard.png) | ![Copilot](./public/screenshots/copilot.png) |

---

## ✨ Key Features

| Category | What it does |
|---|---|
| 📊 **Live Dashboard** | Revenue, orders, customers, inventory — real-time, computed server-side from Firestore |
| ⚡ **Automation Control Panel** | On-demand UI controls to trigger system-wide automations instantly with live visual status |
| 🤖 **AI Copilot** | Ultra-fast, low-latency chat interface grounded in summarized business metrics via **Groq API** |
| 🧠 **AI Executive Summary** | Health score, risks, opportunities, action items — generated on-demand or daily |
| 📣 **Slack Automation** | Instant webhook alerts for low stock & overdue invoices |
| 📧 **Email Automation** | Resend-powered executive briefings & dormant-customer win-back campaigns |
| 🔐 **Secured Automation API** | Header-based API key auth (`x-automation-key`), fully isolated from user auth |

---

## ⚡ Interactive Automation Control Center

To eliminate background delays during live demos and user testing, **PulseOps AI** features an **On-Demand Automation Control Panel** built directly into the main Dashboard:

| Automation Workflow | Endpoint Triggered | Primary Action & Instant Feedback Location |
| :--- | :--- | :--- |
| 🚀 **Executive Briefing** | `/api/automation/briefing` | Generates AI health summary via Groq API → Dispatches Resend Email & Updates Feed |
| ⚠️ **Stock & Inventory Scan** | `/api/automation/alerts` | Scans low stock & overdue invoices → Updates Inventory Tab & Dispatches Slack Webhook |
| 📬 **Customer Retention** | `/api/automation/dormant-customers` | Identifies inactive profiles → Triggers Resend win-back email outreach |
| 🔄 **System Data Sync** | `/api/automation/sync` | Syncs operational metrics → Instantly refreshes Real-Time Analytics UI |

> 💡 **Instant Testing:** Testers can click any button in the UI to trigger the full backend pipeline (Firestore read, Groq AI inference, and email/Slack dispatch) in real-time with zero wait times!

---

## 🧭 Getting Started — For Business Owners / End Users

1. **Sign up / Log in** — Open the live URL ([https://pulseops-3idrq45ig-manahil-abid1.vercel.app](https://pulseops-3idrq45ig-manahil-abid1.vercel.app)), create an account or sign in.
2. **Dashboard** — View real-time revenue, order volume, customer counts, and inventory status computed directly from your database.
3. **Run Automations On-Demand** — Use the **Automation Control Center** on the dashboard to immediately test daily briefings, inventory scans, and customer retention workflows with live visual status indicators.
4. **AI Copilot** — Use the left sidebar to ask natural-language questions like *"How is revenue trending this month?"* or *"Which customers haven't ordered recently?"*.
5. **Core Records** — Manage Products, Customers, Orders, and Invoices. Changes reflect immediately across the dashboard and AI responses.

---

## 🏗️ System Architecture

```mermaid
flowchart LR
    A[⚡ On-Demand UI / Trigger] -->|POST/GET + x-automation-key| B[Next.js API Routes]
    U[👤 Signed-in User] -->|Bearer Firebase ID Token| B
    B --> C[(Firestore via Admin SDK)]
    B --> D{Automation Engine}
    D -->|Critical alerts| E[💬 Slack Webhook]
    D -->|Digests / win-back| F[📧 Resend Email API]
    E --> G[Slack Channel]
    F --> H[Owner / Customer Inbox]
    B -->|Ultra-fast AI reasoning| I[⚡ Groq API]
    I --> B

```
### Automation Dispatch Sequence
```mermaid
sequenceDiagram
    participant U as UI Control Button
    participant A as /api/automation/*
    participant F as Firestore
    participant SL as Slack
    participant R as Resend

    U->>A: POST request + x-automation-key / Auth
    A->>A: Validate authentication & headers
    A->>F: Read products / invoices / customers / orders
    F-->>A: Current business data
    alt Alerts route — low stock or overdue invoices found
        A->>SL: POST webhook message
    end
    alt Briefing route — daily summary generated
        A->>R: Send email to OWNER_EMAIL
    end
    alt Customer retention route — inactive customers found
        A->>R: Send win-back email per customer
    end
    A-->>U: 200 JSON response + UI Success Notification

```
## 🔌 API Reference — Automation Routes
All backend automation endpoints support on-demand execution and require authentication via active user session or dedicated header key:
```http
x-automation-key: <AUTOMATION_API_KEY>

```
| Route | Method | Purpose | Dispatches | Response / Output |
|---|---|---|---|---|
| /api/automation/snapshot | GET/POST | Instant raw business metrics (fast database read) | — | { metrics, capturedAt } |
| /api/automation/briefing | GET/POST | AI-generated executive summary & health score via Groq API | 📧 Resend Email | { headline, healthScore, healthLabel, actionItems[] } |
| /api/automation/alerts | GET/POST | Low-stock & overdue-invoice detection | 💬 Slack Webhook | { lowStock[], overdueInvoices[] } |
| /api/automation/dormant-customers | GET/POST | Identifies inactive customers & triggers win-back outreach | 📧 Resend Email | { dormantCustomers[] } |
| /api/automation/sync | GET/POST | Operational payload sync & dashboard state refresh | — | { success: true, syncedAt } |
| /api/copilot | POST | Grounded chat response using business metrics context | — | { text: "Response..." } |
## ⚙️ Environment Setup
Create .env.local in the project root:
```bash
# Firebase (Client - Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_client_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pulseops-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pulseops-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pulseops-ai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-only)
FIREBASE_PROJECT_ID=pulseops-ai
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@pulseops-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Configuration (Groq API)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Automation Engine
AUTOMATION_API_KEY=your_generated_secret_key
SLACK_WEBHOOK_URL=[https://hooks.slack.com/services/](https://hooks.slack.com/services/)...
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
OWNER_EMAIL=admin@yourbusiness.com

```
> 🔒 .env.local is git-ignored. **Never commit production credentials.**
> 
## 🚀 Quickstart — For Developers
```bash
# Clone the repository
git clone [https://github.com/Manahil-Abid-dev/PULSEOPS-AI.git](https://github.com/Manahil-Abid-dev/PULSEOPS-AI.git)
cd PULSEOPS-AI

# Install dependencies
npm install

# Copy environment variables & configure
cp .env.example .env.local

# Run local development server
npm run dev

```
### Test Automation Endpoints Locally
```bash
curl -X POST http://localhost:3000/api/automation/briefing -H "x-automation-key: YOUR_KEY"
curl -X POST http://localhost:3000/api/automation/alerts -H "x-automation-key: YOUR_KEY"

```
## ☁️ Deployment (Vercel)
 1. Push latest code to GitHub (git push origin main).
 2. Import project into Vercel.
 3. Add all variables from .env.local under **Project Settings → Environment Variables**.
 4. Add your Vercel deployment URL (https://pulseops-3idrq45ig-manahil-abid1.vercel.app) under **Firebase Console → Authentication → Authorized Domains**.
 5. Deploy Firestore Security Rules:
   ```bash
   firebase deploy --only firestore:rules
   
   ```
## 🧰 Built With — Tools & AI Assistance
| Tool | Usage Context |
|---|---|
| **Next.js 16** | App Router, Server Actions, & Route Handlers |
| **TypeScript & Tailwind CSS** | Type-safe business models & sleek dark UI design |
| **Groq API** | Ultra-fast Llama-3/Mixtral inference for AI Copilot & Executive Briefings |
| **Firebase** | Auth & Firestore real-time database |
| **Resend** | Transactional email delivery for executive briefings & win-backs |
| **Slack Webhooks** | Real-time operations & alert dispatching |
| **Claude & ChatGPT** | Architectural hardening, UI refinement, & code optimization |
## 🔐 Security
 * **Authentication:** Firebase ID Token verification (Authorization: Bearer <token>) on user routes.
 * **API Isolation:** Automation routes protected via dedicated x-automation-key header logic.
 * **Privacy First (PII Protection):** Groq prompts only receive **summarized, aggregated metrics**—raw customer PII or transaction data is never passed to external AI models.
 * **Robust Error Handling:** Route handlers wrapped in safe try...catch blocks with sanitized error returns.
## 🗺️ Roadmap / Upcoming Work
 * [ ] **Multi-tenancy:** companyId scoping across Firestore & Security Rules for multi-business SaaS support.
 * [ ] **Custom Automation Builder:** Allow users to set custom low-stock thresholds & email templates.
 * [ ] **Streaming AI Responses:** Integrate streaming for real-time text generation in the Copilot UI via Groq streams.
 * [ ] **Persistent Copilot History:** Move chat history from sessionStorage into Firestore.
## 👥 Author & Acknowledgments
**Manahil Abid**
*BS Information Technology Student & Front-End Developer*
 * **GitHub:** @Manahil-Abid-dev
## 📜 License
Distributed under the **MIT License**. See LICENSE for details.
<p align="center">
<sub>Built with Next.js, Tailwind CSS, Resend, Groq API, and Slack Webhooks for <b>PulseOps AI</b>.</sub>
</p>
```
