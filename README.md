# 🤖 ResumeAI — AI-Powered Resume Analyzer & Job Matcher

A full-stack-style web application that analyzes resumes using NLP and Machine Learning techniques — **entirely in the browser** with no backend required.

![ResumeAI Preview](https://img.shields.io/badge/ResumeAI-Live%20Demo-6C63FF?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

---

## ✨ Features

- **ATS Score Calculator** — TF-IDF powered matching algorithm scores your resume out of 100
- **Skill Gap Analysis** — Identifies 70+ technical skills missing from your resume vs. the job description
- **Keyword Optimization** — Lists important missing keywords ranked by job relevance
- **AI Improvement Suggestions** — Personalized, actionable tips to improve your resume
- **Course Recommendations** — Curated learning resources (Coursera, Udemy, etc.) for missing skills
- **Analysis History** — Tracks all past analyses with progress visualization
- **Admin Dashboard** — Platform-wide analytics with charts and user management
- **Downloadable Report** — Export your full analysis as a text report
- **Beautiful Glassmorphism UI** — Warm, cozy dark theme with frosted glass effects

---

## 🏗️ Project Structure

```
resume-analyzer/
├── index.html              ← Landing page
├── css/
│   ├── global.css          ← Design system (glass effects, tokens)
│   ├── landing.css         ← Landing page styles
│   ├── auth.css            ← Login / Register styles
│   └── dashboard.css       ← Dashboard, Analyzer, History styles
├── js/
│   ├── utils.js            ← Shared utilities, localStorage, auth
│   ├── auth.js             ← Login / Register logic
│   ├── landing.js          ← Particles, animations
│   ├── nlp-engine.js       ← TF-IDF analysis, skill extraction, scoring
│   ├── analyzer.js         ← Analyzer controller
│   └── dashboard.js        ← Dashboard charts & data
└── pages/
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── analyzer.html
    ├── history.html
    ├── profile.html
    └── admin.html
```

---

## 🚀 How to Use

### Option 1: GitHub Pages (Live)
Visit the deployed site at:  
👉 `https://<your-username>.github.io/resume-analyzer/`

### Option 2: Run Locally
1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/resume-analyzer.git
   ```
2. Open `index.html` in your browser — **no server needed!**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@resumeai.com` | `admin123` |
| User | `user@resumeai.com` | `user123` |

Or register a new account on the Register page.

---

## 🧠 How the NLP Engine Works

The analysis uses a **simulated NLP pipeline**:

1. **Text Preprocessing** — Tokenization, stop-word removal
2. **Skill Extraction** — Pattern matching against 70+ tech skill database
3. **TF-IDF Keyword Scoring** — Frequency-based keyword importance ranking
4. **Weighted Scoring** — 4-factor weighted score:
   - Skills Match: **40%**
   - Keyword Relevance: **35%**
   - Experience Match: **15%**
   - Education Match: **10%**

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Structure | HTML5 |
| Styling | Vanilla CSS (Glassmorphism) |
| Logic | Vanilla JavaScript (ES6+) |
| Charts | Chart.js |
| Fonts | Google Fonts (Sora, Inter) |
| Storage | LocalStorage (client-side) |

---

## 📸 Screenshots

> Landing Page · Dashboard · Resume Analyzer · History · Admin Panel

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Built with 💜 using NLP & Machine Learning simulation
