# AI-Powered RFP Management System

Automates the entire RFP workflow — create RFPs from natural language, send vendor invitations via email, receive and parse vendor proposals (IMAP + PDF parsing), and generate proposal comparisons with scoring & recommendations.

---

## 1. Project Setup

### 1.1 Prerequisites

- Node.js v18+ (recommended v20)
- npm v8+
- MongoDB (local or cloud)
- IMAP-enabled email (Gmail recommended; App Password required)
- SMTP (Gmail SMTP or any provider)
- LLM API key (e.g., Gemini / Google AI or other)

Add credentials to a `.env` file (example below).

### 1.2 Installation (Backend + Frontend)

Clone repository
```bash
git clone https://github.com/paramesh244/AI-Powered-RFP-Management-System.git
cd AI-Powered-RFP-Management-System

```

Backend
```bash
cd backend
npm install
```

Create `.env` (example)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/rfp-system

# SMTP (sending)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your@gmail.com
EMAIL_SMTP_PASS=YOUR_APP_PASSWORD

# IMAP (receiving)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your@gmail.com
IMAP_PASS=YOUR_APP_PASSWORD

# AI provider
GEMINI_API_KEY=xxxx
```

Run backend
```bash
npm start
# Backend: http://localhost:3000
# IMAP listener starts automatically
```

Frontend
```bash
cd frontend
npm install

```
Create `.env` (example)

```env
VITE_API_BASE_URL=http://localhost:3000
```


Run frontend
```bash
npm run dev
# frontend: http://localhost:5173

```


### 1.3 Configure Gmail (if used)

- Generate an App Password: Google Account → Security → App Passwords.
- Enable IMAP: Gmail Settings → Forwarding and POP/IMAP → Enable IMAP.
- Use the App Password for SMTP and IMAP.

---

### 1.4 Running Locally (summary)

- Backend: `npm start`
- Frontend: `npm run dev`
- MongoDB: running locally or provide cloud URI
- IMAP listener: starts with backend


---

## 2. Tech Stack

Frontend
- React (Vite), TailwindCSS, Axios, React Router

Backend
- Node.js, Express, Mongoose
- IMAP listener (node-imap), Nodemailer (SMTP)

Other
- MongoDB (Mongoose)
- AI provider (Gemini or other LLM)
- pdfjs-dist (PDF extraction), mailparser

---

## 3. API Documentation

- Create RFP (NL → structured)  
  POST /rfp/create  
  Body:
  ```json
  { "naturalLanguageDescription": "We need 10 laptops with 16GB RAM delivered within 20 days..." }
  ```
  Response: structured RFP JSON

- Get all RFPs  
  GET /rfp/

- Get RFP by ID  
  GET /rfp/:id

- Send RFP Emails to Vendors  
  POST /rfp/:id/send  
  Body:
  ```json
  { "vendorIds": ["vendor1", "vendor2"] }
  ```
  Response:
  ```json
  { "success": true, "sentTo": 2 }
  ```

- Receive Vendor Proposals (IMAP)
  - No API call required — background IMAP listener processes incoming messages.

- List all proposals / inbox  
  GET /rfp/inbox  
  Supports query params: `?page=1&limit=20&rfpId=xxx&vendorId=yyy`

- Compare proposals (AI scoring)  
  GET /rfp/:id/comparison  
  Response includes proposals, rankings, recommended vendor, estimated savings.

---

## 4. Design Decisions & Assumptions

- LLM used to parse NL RFPs and unstructured vendor replies into structured JSON.
- PDF.js (`pdfjs-dist`) used for text extraction from PDFs.
- IMAP listener monitors Gmail inbox and auto-processes vendor replies.
- Scoring logic delegated to AI; system expects structured JSON .
- Batched email sending to avoid SMTP throttling.

Assumptions:
- Vendors reply to RFP email thread.
- PDF attachments contain selectable text.
- Vendor IDs in subject help matching.
- Gmail IMAP delivers messages in sequence (best-effort).

---

## 5. AI Tools Usage

Tools mentioned for development:
- ChatGPT 5.1

How they were used:
- PDF parsing error handling.
- IMAP processing pipeline and JSON formatting prompts.
- Frontend UI scaffolding.


Key prompts included:
- "Create a robust IMAP listener that parses emails and PDF attachments."
- "Fix pdfjs Buffer → Uint8Array conversion issue."
- "Generate comparison logic returning strict JSON for AI ranking."

What was learned:
- Handling IMAP & SMTP reliably.
- Enforcing structured JSON output from LLMs.
- Best practices for batching SMTP sends and error handling.

---

