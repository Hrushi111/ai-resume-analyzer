// ============================================
// ANALYZER PAGE CONTROLLER
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (!user) return;

    // Update sidebar
    document.getElementById('sidebarUserName').textContent = user.name;
    document.getElementById('sidebarUserRole').textContent = user.role === 'admin' ? 'Administrator' : 'User';
    document.getElementById('userAvatarSidebar').textContent = user.name[0].toUpperCase();

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', e => {
        e.preventDefault();
        Store.remove('ra_current_user');
        window.location.href = '../index.html';
    });

    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebarToggle')?.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('sidebarClose')?.addEventListener('click', () => sidebar.classList.remove('open'));

    // ---- UPLOAD TABS ----
    document.querySelectorAll('.upload-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (tab.dataset.tab === 'upload') {
                document.getElementById('uploadPane').classList.remove('hidden');
                document.getElementById('pastePane').classList.add('hidden');
            } else {
                document.getElementById('uploadPane').classList.add('hidden');
                document.getElementById('pastePane').classList.remove('hidden');
            }
        });
    });

    // ---- FILE UPLOAD ----
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('resumeFile');
    const filePreview = document.getElementById('filePreview');
    let uploadedFileText = '';

    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });

    function handleFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) { showToast('File too large. Max 5MB.', 'error'); return; }
        const allowed = ['pdf', 'doc', 'docx', 'txt'];
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) { showToast('Unsupported file type. Use PDF, DOC, DOCX, or TXT.', 'error'); return; }

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        filePreview.classList.add('show');
        showToast('Resume file loaded! ✓', 'success');

        // Read text file
        const reader = new FileReader();
        reader.onload = e => { uploadedFileText = e.target.result; };
        reader.readAsText(file);
    }

    document.getElementById('removeFile')?.addEventListener('click', () => {
        fileInput.value = '';
        filePreview.classList.remove('show');
        uploadedFileText = '';
    });

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // ---- SAMPLE JD CHIPS ----
    document.querySelectorAll('.sample-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const role = chip.dataset.role;
            const sample = NLPEngine.SAMPLE_JDS[role];
            if (sample) {
                document.getElementById('jobDescription').value = sample.jd;
                document.getElementById('jobTitle').value = sample.title;
                showToast(`Loaded "${sample.title}" job description`, 'info');
            }
        });
    });

    // ---- ANALYZE BUTTON ----
    document.getElementById('analyzeBtn').addEventListener('click', async () => {
        // Get resume text
        const activeTab = document.querySelector('.upload-tab.active')?.dataset?.tab;
        let resumeText = '';

        if (activeTab === 'paste') {
            resumeText = document.getElementById('resumeText').value.trim();
            if (!resumeText) { showToast('Please paste your resume text first.', 'error'); return; }
        } else {
            resumeText = uploadedFileText;
            if (!resumeText) {
                // Demo mode with synthetic resume
                resumeText = getDemoResumeText();
                showToast('Using demo resume for analysis. Upload your own for personalized results.', 'info');
            }
        }

        const jobText = document.getElementById('jobDescription').value.trim();
        if (!jobText) { showToast('Please paste or load a job description first.', 'error'); return; }

        await runAnalysis(resumeText, jobText);
    });

    // ---- NEW ANALYSIS ----
    document.getElementById('newAnalysisBtn')?.addEventListener('click', () => {
        document.getElementById('resultsSection').classList.add('hidden');
        document.getElementById('inputSection').style.display = 'grid';
        document.getElementById('analyzeBtnRow').style.display = 'flex';
        document.getElementById('jobDescription').value = '';
        document.getElementById('jobTitle').value = '';
        filePreview.classList.remove('show');
        uploadedFileText = '';
        fileInput.value = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---- DOWNLOAD REPORT ----
    document.getElementById('downloadReportBtn')?.addEventListener('click', () => {
        generateReport();
    });

    // ---- Main Analysis Runner ----
    async function runAnalysis(resumeText, jobText) {
        const loading = document.getElementById('analyzeLoading');
        const inputSection = document.getElementById('inputSection');
        const analyzeBtnRow = document.getElementById('analyzeBtnRow');

        // Hide inputs, show loading
        inputSection.style.display = 'none';
        analyzeBtnRow.style.display = 'none';
        loading.classList.remove('hidden');

        // Animate loading steps
        const steps = [
            { el: 'ls1', fill: 'lf1', delay: 0 },
            { el: 'ls2', fill: 'lf2', delay: 1200 },
            { el: 'ls3', fill: 'lf3', delay: 2400 },
            { el: 'ls4', fill: 'lf4', delay: 3600 },
        ];

        for (const step of steps) {
            await delay(step.delay > 0 ? 1200 : 300);
            document.getElementById(step.el).classList.add('active');
            await delay(100);
            document.getElementById(step.fill).style.width = '100%';
        }

        await delay(1400);

        // Run analysis
        const result = NLPEngine.analyze(resumeText, jobText);

        // Hide loading, show results
        loading.classList.add('hidden');
        document.getElementById('resultsSection').classList.remove('hidden');

        // Render results
        renderResults(result, jobText);

        // Save to history
        const jobTitle = document.getElementById('jobTitle').value.trim() || extractJobTitle(jobText);
        saveAnalysis(user.id, result, jobTitle);

        showToast('Analysis complete! 🎉', 'success');
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    // ---- Render Results ----
    let savedResult = null;
    function renderResults(result, jobText) {
        savedResult = result;
        const jobTitle = document.getElementById('jobTitle').value.trim() || extractJobTitle(jobText);
        document.getElementById('resultsJobTitle').textContent = jobTitle;

        // Animate score ring
        const arc = document.getElementById('mainScoreArc');
        const circumference = 427;
        const offset = circumference - (result.overallScore / 100) * circumference;
        setTimeout(() => { arc.style.strokeDashoffset = offset; }, 200);

        // Score value counter
        let val = 0;
        const valEl = document.getElementById('mainScoreVal');
        const counter = setInterval(() => {
            val = Math.min(val + 2, result.overallScore);
            valEl.textContent = val;
            if (val >= result.overallScore) clearInterval(counter);
        }, 25);

        // Sub scores
        setTimeout(() => {
            animateFill('skillScoreFill', result.skillsScore);
            animateFill('keywordScoreFill', result.keywordScore);
            animateFill('expScoreFill', result.expScore);
            animateFill('eduScoreFill', result.eduScore);
            document.getElementById('skillScoreVal').textContent = result.skillsScore + '%';
            document.getElementById('keywordScoreVal').textContent = result.keywordScore + '%';
            document.getElementById('expScoreVal').textContent = result.expScore + '%';
            document.getElementById('eduScoreVal').textContent = result.eduScore + '%';
        }, 400);

        // Grade
        const grade = NLPEngine.getGrade(result.overallScore);
        const gradeBadge = document.getElementById('gradeBadge');
        gradeBadge.textContent = grade.grade;
        gradeBadge.className = `grade-badge ${grade.class}`;
        document.getElementById('gradeDisplay').querySelector('p').textContent = grade.desc;

        // Skills
        renderChips('matchedSkillsList', result.matchedSkills, 'chip-matched');
        renderChips('missingSkillsList', result.missingSkills, 'chip-missing');
        renderChips('keywordMatchList', result.keywordMatched.slice(0, 15), 'chip-keyword');
        renderChips('keywordMissList', result.keywordMissing, 'chip-missing');
        document.getElementById('matchedCount').textContent = result.matchedSkills.length;
        document.getElementById('missingCount').textContent = result.missingSkills.length;
        document.getElementById('keywordMatchCount').textContent = result.keywordMatched.length;
        document.getElementById('keywordMissCount').textContent = result.keywordMissing.length;

        // Suggestions
        const sug = document.getElementById('suggestionsList');
        sug.innerHTML = result.suggestions.map(s => `
      <div class="suggestion-item">
        <span class="suggestion-icon">${s.icon}</span>
        <div class="suggestion-text"><strong>${s.title}:</strong> ${s.text}</div>
      </div>
    `).join('');

        // Courses
        const courses = document.getElementById('coursesList');
        if (result.courses.length > 0) {
            courses.innerHTML = result.courses.map(c => `
        <div class="course-card">
          <div class="course-platform">${c.platform}</div>
          <div class="course-name">${c.name}</div>
          <span class="course-skill">Missing: ${c.skill}</span>
        </div>
      `).join('');
        } else {
            courses.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">Great! No major course recommendations needed for this role.</p>';
        }
    }

    function animateFill(id, value) {
        const el = document.getElementById(id);
        if (el) el.style.width = value + '%';
    }

    function renderChips(containerId, items, cls) {
        const el = document.getElementById(containerId);
        if (!el) return;
        if (items.length === 0) {
            el.innerHTML = `<span style="color:var(--text-muted);font-size:0.8rem">None found</span>`;
            return;
        }
        el.innerHTML = items.map(s => `<span class="chip ${cls}">${s}</span>`).join('');
    }

    // ---- Save Analysis to Storage ----
    function saveAnalysis(userId, result, jobTitle) {
        const analyses = Store.get('ra_analyses', []);
        analyses.push({
            id: generateId(),
            userId,
            date: new Date().toISOString(),
            jobTitle,
            overallScore: result.overallScore,
            skillsScore: result.skillsScore,
            keywordScore: result.keywordScore,
            matchedSkills: result.matchedSkills,
            missingSkills: result.missingSkills,
            suggestions: result.suggestions,
        });
        Store.set('ra_analyses', analyses);
    }

    // ---- Extract Job Title from Description ----
    function extractJobTitle(jd) {
        const lines = jd.split('\n').filter(l => l.trim());
        return truncate(lines[0] || 'Job Analysis', 40);
    }

    // ---- Download Report ----
    function generateReport() {
        if (!savedResult) return;
        const jobTitle = document.getElementById('jobTitle').value || 'Job Role';
        const date = new Date().toLocaleDateString();

        const reportContent = `
ResumeAI - Analysis Report
===========================
Generated: ${date}
Job Role: ${jobTitle}
User: ${user.name}

OVERALL ATS SCORE: ${savedResult.overallScore}%
${NLPEngine.getGrade(savedResult.overallScore).grade}

SCORE BREAKDOWN
---------------
Skills Match:      ${savedResult.skillsScore}%
Keyword Relevance: ${savedResult.keywordScore}%
Experience Match:  ${savedResult.expScore}%
Education Match:   ${savedResult.eduScore}%

MATCHED SKILLS (${savedResult.matchedSkills.length})
---------------
${savedResult.matchedSkills.join(', ') || 'None detected'}

MISSING SKILLS (${savedResult.missingSkills.length})
--------------
${savedResult.missingSkills.join(', ') || 'None - Great job!'}

MATCHING KEYWORDS
-----------------
${savedResult.keywordMatched.join(', ')}

MISSING KEYWORDS
----------------
${savedResult.keywordMissing.join(', ')}

IMPROVEMENT SUGGESTIONS
------------------------
${savedResult.suggestions.map((s, i) => `${i + 1}. ${s.title}\n   ${s.text.replace(/<[^>]+>/g, '')}`).join('\n\n')}

RECOMMENDED COURSES
-------------------
${savedResult.courses.map(c => `• ${c.name} on ${c.platform} (for ${c.skill})`).join('\n')}

===========================
Generated by ResumeAI
AI-Powered Resume Analysis Platform
    `.trim();

        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ResumeAI_Report_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Report downloaded! ✓', 'success');
    }

    // ---- Demo Resume Text ----
    function getDemoResumeText() {
        return `John Doe
john.doe@email.com | LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Software Engineer with 4 years of experience in full-stack development. Passionate about building scalable web applications using modern technologies. Experienced in Python, JavaScript, React, and cloud technologies.

SKILLS
Programming: Python, JavaScript, TypeScript, Java, SQL
Frontend: React, HTML, CSS, Bootstrap
Backend: Node.js, Express, REST API, Flask
Database: MySQL, PostgreSQL, MongoDB
Tools: Git, GitHub, Jira, Postman, Docker
Cloud: AWS (EC2, S3), Linux

WORK EXPERIENCE

Software Engineer | TechCorp Pvt Ltd | 2022 - Present
• Developed and maintained React frontend applications serving 50,000+ users
• Built RESTful APIs using Python Flask and Node.js Express
• Improved database query performance by 35% through SQL optimization
• Implemented CI/CD pipelines using GitHub Actions
• Collaborated in Agile/Scrum teams of 8 engineers

Junior Developer | StartupXYZ | 2020 - 2022
• Built responsive web interfaces using HTML, CSS, JavaScript, and React
• Integrated third-party APIs and payment gateways
• Wrote unit tests using Jest and Pytest
• Participated in code reviews and daily standups

EDUCATION
Bachelor of Engineering in Computer Science
Pune University, 2020 | CGPA: 8.5/10

PROJECTS
• E-commerce Platform: Built with React, Node.js, PostgreSQL — handled 10K+ transactions
• ML Sentiment Analyzer: Python, NLTK, Scikit-learn — 88% accuracy
• Real-time Chat App: Socket.io, Node.js, MongoDB

CERTIFICATIONS
• AWS Certified Cloud Practitioner (2023)
• Python Developer Certification – Coursera (2022)`;
    }
});
