# LeadIQ — AI-Powered Sales Intelligence Platform

Built with MERN Stack + Llama 3.3 70B (Groq) | React Vite + Tailwind CSS v4

---

## 📌 What Is This?

LeadIQ is an internal sales intelligence platform that helps outbound sales teams **automatically discover, score, and prioritize high-intent B2B companies** — replacing slow, manual research with AI.

Instead of SDRs spending hours on LinkedIn or Crunchbase looking for signals, LeadIQ does it in seconds using AI.

---

## 🎥 Demo Walkthrough

> Loom video link: _(attach your recorded video here)_

---

## 🚀 Live Setup — Run in 3 Steps

### Prerequisites
- Node.js 18+
- MongoDB running locally **or** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A **free** Groq API key from [console.groq.com/keys](https://console.groq.com/keys)

---

### Step 1 — Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (new terminal)
cd frontend
npm install
```

---

### Step 2 — Configure Environment

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/leadgen
GROQ_API_KEY=gsk_your_key_here
```

> 💡 Groq is 100% free. Sign up at console.groq.com, create an API key, paste it here. No billing needed.

---

### Step 3 — Start Both Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# ✅ Running at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# ✅ Running at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧠 How It Works — The Core Flow

```
User clicks "Run AI Scanner"
        ↓
Backend calls Groq (Llama 3.3 70B)
        ↓
AI generates realistic company profiles with intent signals
(funding rounds, hiring SDRs, expansion plans, growth discussions)
        ↓
Each company is sent back to AI for intent scoring (0–100)
        ↓
Score + label (Hot/Warm/Cold) + AI summary saved to MongoDB
        ↓
Dashboard displays ranked, enriched, filterable leads
```

---

## ✨ Features Built (V1)

### 🔍 AI Lead Discovery
- Configure count (3–20 leads), industry, and signal type
- AI discovers companies matching outbound buying signals
- Signals include: Recent Funding, Hiring SDRs, Expansion, Growth

### 📊 Intent Scoring Engine
- Every lead gets a 0–100 intent score
- Hot (75+) / Warm (50–74) / Cold (<50) classification
- AI explains **why** the score was assigned
- Re-score any lead on demand

### 🏢 Company Enrichment
- Company name, website, industry, stage, size, location
- Funding amount & round
- Key contacts with name, title, email, LinkedIn
- Tags for quick filtering

### 💬 AI Chat per Lead
- Dedicated AI assistant for each company
- Ask: "Draft a cold email", "Why do they need SDRs?", "What are talking points?"
- Powered by Llama 3.3 70B with full company context

### 📋 Text → Lead Extraction
- Paste any text: LinkedIn post, news article, job listing
- AI extracts company data and scores it automatically

### 📈 Analytics Dashboard
- Total leads, hot prospects, average intent score
- Industry breakdown bar chart
- Intent mix pie chart (Hot/Warm/Cold)
- Signal source breakdown
- Top prospects quick view

### 🗂️ Leads Management
- Filter by intent label, status, industry
- Sort by score, date, company name
- Full-text search across company name, industry, description
- Update lead status: New → Contacted → Qualified → Converted
- Bulk CSV export

---

## 🏗️ Architecture

```
leadgen/
├── backend/
│   ├── server.js                  # Express app entry, MongoDB connection
│   ├── models/
│   │   └── Lead.js                # Mongoose schema (leads, signals, contacts)
│   ├── routes/
│   │   ├── leads.js               # CRUD, rescore, AI chat, CSV export
│   │   ├── scan.js                # Discovery engine, text extraction, bulk ops
│   │   └── stats.js               # Aggregation queries for dashboard
│   └── services/
│       └── groqService.js         # All AI logic (scoring, enrichment, generation, chat)
│
└── frontend/
    └── src/
        ├── App.jsx                # Router setup
        ├── pages/
        │   ├── DashboardPage.jsx  # Stats, charts, top leads
        │   ├── LeadsPage.jsx      # Filterable, sortable leads table
        │   ├── LeadDetailPage.jsx # Full profile + AI chat
        │   ├── ScanPage.jsx       # AI scanner interface
        │   └── SettingsPage.jsx   # Config + bulk operations
        ├── components/
        │   ├── dashboard/Layout.jsx   # Sidebar, topbar, nav
        │   └── ui/index.jsx           # Design system: Card, Badge, Button, ScoreRing, etc.
        └── utils/
            ├── api.js             # Axios instance + all API calls
            └── helpers.js         # Color logic, formatters, icon maps
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev, modern tooling |
| Styling | Tailwind CSS v4 | New `@theme` API, no config file needed |
| Charts | Recharts | Composable, React-native charts |
| Routing | React Router v6 | Standard SPA routing |
| Backend | Node.js + Express | Lightweight, fast REST API |
| Database | MongoDB + Mongoose | Flexible schema for nested signals/contacts |
| AI Model | Llama 3.3 70B via Groq | Free, fast (500 tok/s), high quality |
| HTTP Client | Axios | Interceptors for error handling |

---

## 🤖 AI Usage in the Product

AI is used at **4 key points** in the workflow:

| Where | What AI Does |
|---|---|
| Lead Discovery | Generates realistic companies with buying signals |
| Intent Scoring | Scores 0–100 with reasoning per company |
| Text Extraction | Extracts structured company data from raw text |
| Per-Lead Chat | Answers sales questions, drafts outreach content |

All AI calls go through `backend/services/groqService.js` — a single service file that handles prompt engineering, JSON parsing, and error fallbacks.

---

## ⚖️ Tradeoffs & Decisions

### Why Groq + Llama 3.3 70B instead of OpenAI?
- **Completely free** — no credit card, no billing
- **Faster** — Groq's LPU hardware gives ~10x inference speed vs standard GPUs
- **Good enough** — Llama 3.3 70B scores close to GPT-4o on structured extraction tasks
- Easily swappable to OpenAI/Anthropic by changing the client in `groqService.js`

### Why simulate signals vs real APIs (LinkedIn/Crunchbase)?
- Crunchbase API: $499/month minimum
- LinkedIn API: requires OAuth app approval (weeks)
- AI simulation demonstrates the **full pipeline** with realistic data
- Real APIs are **drop-in replacements** in V2 — the scoring/enrichment layer doesn't change

### Why MongoDB over PostgreSQL?
- Lead data is naturally document-shaped (signals are arrays, contacts are nested)
- Schema evolves fast in a POC — Mongoose makes that painless
- Aggregation pipeline handles dashboard queries well

### Why not use a vector DB for scoring?
- Rule + LLM hybrid is more explainable for sales teams
- V2 can add embedding-based ICP matching once we have real closed-won data to train on

---

## 🔮 V2 Roadmap

### More Signal Sources
- **Crunchbase API** — real funding data
- **LinkedIn scraper** — SDR job postings
- **Product Hunt** — new launches
- **Twitter/X** — growth discussions
- **Google Alerts** — keyword monitoring

### Better Intelligence
- ICP (Ideal Customer Profile) builder — define your perfect customer, auto-filter
- Feedback loop — mark closed-won deals, retrain scoring weights
- Lookalike discovery — "find companies similar to our best customers"

### Automation & Outreach
- Email sequence generator — AI drafts multi-touch campaigns per lead
- Slack alerts — "New hot lead detected: Acme Corp raised $8M Series A"
- Webhook triggers — push hot leads to HubSpot/Salesforce automatically
- Scheduled scanning — run discovery daily, deduplicate automatically

### Team Features
- Lead assignment and ownership
- Activity feed and notes
- Role-based access (SDR vs manager view)
- Shared ICP templates

---

## 📡 API Reference

```
# Leads
GET    /api/leads                    List leads (filter, sort, paginate)
GET    /api/leads/:id                Single lead detail
POST   /api/leads                    Create lead (auto AI-scored)
PATCH  /api/leads/:id                Update lead (status, notes)
DELETE /api/leads/:id                Delete lead
POST   /api/leads/:id/rescore        Re-run AI scoring
POST   /api/leads/:id/chat           AI chat { message, history[] }
GET    /api/leads/export/csv         Download all leads as CSV

# Scanner
POST   /api/scan/discover            { count, industry, signalType }
POST   /api/scan/from-text           { text, source }
POST   /api/scan/enrich/:id          Re-enrich single lead
POST   /api/scan/bulk-score          Re-score all leads

# Stats
GET    /api/stats/overview           Dashboard data

# Health
GET    /api/health                   Server status check
```

---

## 🧪 Testing the App

1. Go to **AI Scanner** → click **Run AI Scanner** → wait ~15 seconds
2. Leads appear with scores — click any to open detail view
3. In detail view, go to **AI Chat** tab → type "Draft a cold email for this company"
4. Go to **Dashboard** to see analytics populate
5. In **Leads** page, filter by "Hot", sort by score, try the search bar
6. Try **From Text** mode: paste any company news and click Extract

---

## 📁 File Structure Quick Reference

```
backend/.env                  ← Your API keys (never commit)
backend/services/groqService.js ← All AI prompt logic lives here
backend/models/Lead.js         ← Data schema
frontend/src/utils/api.js      ← All API calls from frontend
frontend/src/utils/helpers.js  ← Colors, formatters, icons
frontend/src/index.css         ← Tailwind v4 theme variables
```

---

## 👤 Built By

This project was built by Vivek to demonstrate:
- Moving from idea → system design → working product in under 4 days
- Using AI at every layer of the product (discovery, scoring, enrichment, chat)
- Product thinking around a real sales ops problem
- Clean, maintainable MERN architecture

---

