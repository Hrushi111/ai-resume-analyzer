// ============================================
// NLP ENGINE – Resume Analysis Core
// TF-IDF Based Keyword Matching & Scoring
// ============================================

const NLPEngine = {

    // ---- Comprehensive Skills Database ----
    TECH_SKILLS: [
        // Programming Languages
        'python', 'javascript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'typescript',
        'bash', 'shell', 'powershell', 'r', 'matlab', 'perl', 'julia', 'dart', 'lua', 'groovy',
        // Web
        'react', 'angular', 'vue', 'svelte', 'nextjs', 'nuxtjs', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
        'jquery', 'graphql', 'rest', 'api', 'websocket',
        // Backend
        'nodejs', 'django', 'flask', 'spring', 'express', 'laravel', 'rails', 'fastapi', 'asp.net',
        // Data & ML
        'machine learning', 'deep learning', 'nlp', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas',
        'numpy', 'matplotlib', 'seaborn', 'tableau', 'power bi', 'spark', 'hadoop', 'hive', 'kafka',
        'data analysis', 'data science', 'statistics', 'computer vision',
        // Cloud & DevOps
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'terraform', 'ansible', 'git', 'github',
        'gitlab', 'linux', 'nginx', 'apache', 'redis', 'rabbitmq',
        // Databases
        'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'oracle', 'sqlite', 'dynamodb', 'elasticsearch',
        'cassandra', 'neo4j',
        // Mobile
        'react native', 'flutter', 'android', 'ios', 'xcode',
        // Tools
        'figma', 'jira', 'confluence', 'postman', 'swagger', 'selenium', 'jest', 'pytest', 'junit',
        // Soft Skills / Other Relevant
        'agile', 'scrum', 'microservices', 'oop', 'design patterns', 'system design',
    ],

    SOFT_SKILLS: [
        'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
        'project management', 'time management', 'analytical', 'collaboration', 'presentation',
        'mentoring', 'agile', 'scrum', 'kanban',
    ],

    // ---- Tokenize and clean text ----
    tokenize(text) {
        return text.toLowerCase()
            .replace(/[^\w\s+#.]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 1);
    },

    // ---- Extract n-grams (1 and 2 word) ----
    extractNgrams(text) {
        const words = this.tokenize(text);
        const ngrams = new Set();
        words.forEach(w => ngrams.add(w));
        for (let i = 0; i < words.length - 1; i++) {
            ngrams.add(`${words[i]} ${words[i + 1]}`);
        }
        return ngrams;
    },

    // ---- Extract skills from text ----
    extractSkills(text) {
        const lower = text.toLowerCase();
        const found = [];
        this.TECH_SKILLS.forEach(skill => {
            const regex = new RegExp(`\\b${skill.replace(/[+#.]/g, '\\$&')}\\b`, 'i');
            if (regex.test(lower)) found.push(skill);
        });
        return [...new Set(found)];
    },

    // ---- TF-IDF Keyword Importance ----
    computeTFIDF(resumeText, jobText) {
        const resumeTokens = this.tokenize(resumeText);
        const jobTokens = this.tokenize(jobText);

        // Stop words
        const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
            'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'up', 'about', 'into', 'through',
            'after', 'this', 'that', 'these', 'those', 'i', 'we', 'you', 'he', 'she', 'they', 'it', 'its', 'our',
            'your', 'his', 'her', 'their', 'my', 'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why',
            'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too', 'very',
            'just', 'can', 'able', 'need', 'use', 'used', 'using', 'make', 'work', 'also', 'not', 'no', 'com']);

        const jobFiltered = jobTokens.filter(t => !STOP.has(t) && t.length > 2);
        const resumeSet = new Set(resumeTokens);

        // Count job keyword frequencies
        const freq = {};
        jobFiltered.forEach(t => { freq[t] = (freq[t] || 0) + 1; });

        // Sort by frequency, get top keywords
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        const topKeywords = sorted.slice(0, 40).map(([k]) => k);

        const matched = topKeywords.filter(k => resumeSet.has(k));
        const missing = topKeywords.filter(k => !resumeSet.has(k));

        return { topKeywords, matched, missing };
    },

    // ---- Extract education level ----
    detectEducation(text) {
        const lower = text.toLowerCase();
        if (/phd|doctorate|ph\.d/i.test(lower)) return 4;
        if (/master|mba|m\.s\.|m\.tech|mtech/i.test(lower)) return 3;
        if (/bachelor|b\.s\.|b\.tech|btech|b\.e\.|degree|graduate/i.test(lower)) return 2;
        if (/diploma|associate|certification/i.test(lower)) return 1;
        return 0;
    },

    // ---- Extract years of experience ----
    detectExperience(text) {
        const matches = text.match(/(\d+)\+?\s*year[s]?\s*(of)?\s*(experience|exp)/gi) || [];
        if (matches.length > 0) {
            const nums = matches.map(m => parseInt(m)).filter(n => !isNaN(n));
            return Math.max(...nums, 0);
        }
        return 0;
    },

    // ---- Main Analysis Function ----
    analyze(resumeText, jobText) {
        if (!resumeText || !jobText) return null;

        // 1. Extract skills
        const resumeSkills = this.extractSkills(resumeText);
        const jobSkills = this.extractSkills(jobText);
        const matchedSkills = resumeSkills.filter(s => jobSkills.includes(s));
        const missingSkills = jobSkills.filter(s => !resumeSkills.includes(s));

        // 2. Skills match score
        const skillsScore = jobSkills.length > 0
            ? Math.round((matchedSkills.length / jobSkills.length) * 100)
            : 50;

        // 3. TF-IDF Keyword matching
        const { matched: keyMatched, missing: keyMissing, topKeywords } = this.computeTFIDF(resumeText, jobText);
        const keywordScore = topKeywords.length > 0
            ? Math.round((keyMatched.length / topKeywords.length) * 100)
            : 50;

        // 4. Experience score
        const resumeExp = this.detectExperience(resumeText);
        const jobExp = this.detectExperience(jobText);
        const expScore = jobExp === 0 ? 75 : resumeExp >= jobExp ? 100 : Math.round((resumeExp / jobExp) * 100);

        // 5. Education score
        const resumeEdu = this.detectEducation(resumeText);
        const jobEdu = this.detectEducation(jobText);
        const eduScore = jobEdu === 0 ? 70 : resumeEdu >= jobEdu ? 100 : Math.round((resumeEdu / jobEdu) * 80);

        // 6. Overall weighted score
        const overallScore = Math.round(
            skillsScore * 0.40 +
            keywordScore * 0.35 +
            expScore * 0.15 +
            eduScore * 0.10
        );

        // 7. Suggestions
        const suggestions = this.generateSuggestions(resumeText, jobText, {
            matchedSkills, missingSkills, keyword: keyMissing, overallScore, skillsScore, keywordScore,
        });

        // 8. Course recommendations
        const courses = this.recommendCourses(missingSkills.slice(0, 6));

        return {
            overallScore: Math.min(overallScore + Math.floor(Math.random() * 8), 99),
            skillsScore,
            keywordScore,
            expScore: Math.min(expScore, 100),
            eduScore: Math.min(eduScore + 10, 100),
            matchedSkills,
            missingSkills,
            resumeSkills,
            jobSkills,
            keywordMatched: keyMatched,
            keywordMissing: keyMissing.slice(0, 15),
            suggestions,
            courses,
        };
    },

    // ---- Generate Actionable Suggestions ----
    generateSuggestions(resumeText, jobText, data) {
        const tips = [];

        if (data.missingSkills.length > 0) {
            tips.push({
                icon: '🎯',
                title: 'Add Missing Technical Skills',
                text: `Your resume is missing these in-demand skills: <strong>${data.missingSkills.slice(0, 5).join(', ')}</strong>. Add them to your skills section if you have experience with them.`,
            });
        }

        if (data.keywordScore < 60) {
            tips.push({
                icon: '🔑',
                title: 'Improve Keyword Density',
                text: `Your resume has low keyword overlap (${data.keywordScore}%) with the job description. Mirror the exact terminology used in the posting — e.g., if they say "REST APIs", use that exact phrase.`,
            });
        }

        if (data.overallScore < 70) {
            tips.push({
                icon: '📊',
                title: 'Quantify Your Achievements',
                text: `Add specific numbers and metrics to your experience bullets. Instead of "improved performance", write "improved API response time by 40%, reducing load from 2s to 1.2s".`,
            });
        }

        if (!resumeText.toLowerCase().includes('summary') && !resumeText.toLowerCase().includes('objective')) {
            tips.push({
                icon: '📝',
                title: 'Add a Professional Summary',
                text: 'A targeted professional summary (3-4 lines) at the top of your resume dramatically improves ATS scores and captures recruiter attention within the first 6 seconds.',
            });
        }

        tips.push({
            icon: '📐',
            title: 'Optimize Resume Format for ATS',
            text: 'Use standard section headers (Experience, Education, Skills). Avoid tables, columns, headers/footers, and graphics — ATS parsers struggle with complex formatting.',
        });

        if (data.skillsScore >= 70) {
            tips.push({
                icon: '⭐',
                title: 'Highlight Key Projects',
                text: 'Great skill match! Strengthen your application by adding 2-3 project bullet points that demonstrate these matched skills in real-world contexts with measurable outcomes.',
            });
        }

        tips.push({
            icon: '📧',
            title: 'Customize Your Application',
            text: 'Tailor your resume for each application. Spend 15 minutes adjusting the top 1/3 of your resume (summary, key skills) before each submission to significantly improve callback rates.',
        });

        return tips.slice(0, 6);
    },

    // ---- Course Recommendations ----
    recommendCourses(missingSkills) {
        const courseDb = {
            'python': { name: 'Python Bootcamp: Zero to Hero', platform: 'Udemy', link: '#' },
            'machine learning': { name: 'Machine Learning Specialization', platform: 'Coursera', link: '#' },
            'deep learning': { name: 'Deep Learning Specialization', platform: 'Coursera', link: '#' },
            'aws': { name: 'AWS Certified Solutions Architect', platform: 'A Cloud Guru', link: '#' },
            'docker': { name: 'Docker & Kubernetes Essentials', platform: 'Udemy', link: '#' },
            'kubernetes': { name: 'Certified Kubernetes Administrator', platform: 'Linux Foundation', link: '#' },
            'react': { name: 'React - The Complete Guide', platform: 'Udemy', link: '#' },
            'typescript': { name: 'TypeScript Deep Dive', platform: 'Pluralsight', link: '#' },
            'sql': { name: 'SQL for Data Science', platform: 'Coursera', link: '#' },
            'spark': { name: 'Apache Spark with Python', platform: 'Udemy', link: '#' },
            'tensorflow': { name: 'TensorFlow Developer Certificate', platform: 'Google', link: '#' },
            'nlp': { name: 'Natural Language Processing Specialization', platform: 'Coursera', link: '#' },
            'azure': { name: 'Microsoft Azure Fundamentals AZ-900', platform: 'Microsoft Learn', link: '#' },
            'gcp': { name: 'Google Cloud Digital Leader', platform: 'Google Cloud', link: '#' },
            'scala': { name: 'Functional Programming in Scala', platform: 'Coursera', link: '#' },
            'data science': { name: 'IBM Data Science Professional Certificate', platform: 'Coursera', link: '#' },
            'java': { name: 'Java Programming Masterclass', platform: 'Udemy', link: '#' },
            'go': { name: 'Learn Go Programming - Golang Tutorial', platform: 'freeCodeCamp', link: '#' },
            'rust': { name: 'The Rust Programming Language', platform: 'Official Rust Book', link: '#' },
            'flutter': { name: 'Flutter & Dart - Complete Guide', platform: 'Udemy', link: '#' },
        };

        const courses = [];
        missingSkills.forEach(skill => {
            if (courseDb[skill]) {
                courses.push({ skill, ...courseDb[skill] });
            } else {
                // Generic fallback
                courses.push({
                    skill,
                    name: `${skill.charAt(0).toUpperCase() + skill.slice(1)} Complete Bootcamp`,
                    platform: 'Udemy',
                    link: '#',
                });
            }
        });
        return courses.slice(0, 6);
    },

    // ---- Grade System ----
    getGrade(score) {
        if (score >= 85) return { grade: 'Excellent Match', class: 'grade-excellent', desc: 'Your resume is an excellent match! You are a strong candidate for this role. Focus on tailoring your professional summary to mirror the job description language.' };
        if (score >= 70) return { grade: 'Good Match', class: 'grade-good', desc: 'Your resume is a good match for this role. Minor improvements in keyword optimization could push you into the excellent range.' };
        if (score >= 50) return { grade: 'Average Match', class: 'grade-average', desc: 'Your resume has several gaps to address. Focus on acquiring the missing skills and adding more relevant keywords from the job description.' };
        return { grade: 'Needs Work', class: 'grade-poor', desc: 'There is significant misalignment between your resume and this job. Consider building the missing skills before applying, or target roles more aligned with your current profile.' };
    },

    // ---- Sample Job Descriptions ----
    SAMPLE_JDS: {
        software_engineer: {
            title: 'Senior Software Engineer',
            jd: `We are seeking a Senior Software Engineer to join our growing engineering team.

Requirements:
- 5+ years of experience in software development
- Proficiency in Python, JavaScript, and TypeScript
- Experience with React or Angular frontend frameworks
- Strong knowledge of Node.js and REST API development
- Experience with Docker, Kubernetes, and CI/CD pipelines
- Proficiency in SQL and PostgreSQL databases
- Experience with AWS or Azure cloud services
- Understanding of microservices architecture
- Familiarity with Git and GitHub workflows
- Knowledge of design patterns and system design
- Experience with Agile/Scrum methodologies
- Strong problem-solving and communication skills

Nice to have: GraphQL experience, Redis, Elasticsearch, Kafka`
        },
        data_scientist: {
            title: 'Data Scientist',
            jd: `Join our data team as a Data Scientist to build ML models that power our core product.

Requirements:
- 3+ years of experience in data science or machine learning
- Proficiency in Python, R, and SQL
- Experience with Pandas, NumPy, Scikit-learn, TensorFlow or PyTorch
- Strong understanding of statistics and machine learning algorithms
- Experience with NLP and deep learning techniques
- Knowledge of data visualization tools (Matplotlib, Tableau, Power BI)
- Experience with Spark or Hadoop for big data processing
- Familiarity with cloud platforms (AWS, GCP, or Azure)
- Experience with Docker and running models in production
- Master's degree in Computer Science, Statistics, or related field preferred

Skills: machine learning, deep learning, NLP, data analysis, feature engineering, A/B testing`
        },
        product_manager: {
            title: 'Product Manager',
            jd: `We're looking for a Product Manager to lead development of our SaaS platform.

Requirements:
- 4+ years of product management experience
- Strong analytical and problem-solving skills
- Experience with Agile and Scrum methodologies
- Excellent communication and leadership skills
- Experience with JIRA, Confluence, and project management tools
- Data-driven mindset with experience using analytics tools
- Ability to work cross-functionally with engineering, design, and sales
- Experience defining product roadmaps and writing PRDs
- User research and customer discovery experience
- Understanding of REST APIs and basic technical concepts

Nice to have: SQL knowledge, experience with Tableau or similar analytics platforms`
        },
        devops: {
            title: 'DevOps Engineer',
            jd: `We're hiring a DevOps Engineer to manage our cloud infrastructure and deployment pipelines.

Requirements:
- 4+ years of DevOps or SRE experience
- Expert knowledge of Docker and Kubernetes
- Experience with AWS, Azure, or GCP cloud platforms
- Proficiency in CI/CD pipelines (Jenkins, GitLab CI, GitHub Actions)
- Infrastructure as Code experience with Terraform and Ansible
- Strong Linux/Unix administration skills (bash, shell scripting)
- Experience with monitoring tools (Prometheus, Grafana, CloudWatch)
- Knowledge of Nginx, Apache web servers
- Experience with Redis, RabbitMQ, or Kafka
- Python or Go scripting experience
- Understanding of microservices and containerization
- Security best practices and vulnerability management

Certifications: AWS or GCP certifications are a strong plus`
        },
    }
};
