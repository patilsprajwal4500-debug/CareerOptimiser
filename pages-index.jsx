// pages/index.jsx - Main application page

import React, { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';
import styles from '../styles/index.module.css';

export default function Home() {
  const [activeTab, setActiveTab] = useState('optimizer');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);

  // Resume Optimizer State
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [optimizerResult, setOptimizerResult] = useState(null);
  const [optimizerError, setOptimizerError] = useState('');

  // Job Analysis State
  const [analysisJobDesc, setAnalysisJobDesc] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Application Tracker State
  const [appForm, setAppForm] = useState({
    company: '',
    jobTitle: '',
    resumeVersion: '',
    atsScore: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Applied',
  });

  // Load sample data
  const loadSampleResume = () => {
    setResume(`John Smith | john.smith@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
MBA graduate with 2+ years management consulting experience. Strong analytical and strategic problem-solving skills.

PROFESSIONAL EXPERIENCE
Management Consulting Analyst | Strategy Group Consulting, New York | 2023 - Present
• Conducted market analysis for 5+ Fortune 500 clients
• Developed business cases reducing costs by 15%
• Led cross-functional teams on strategic projects
• Created executive presentations and data models

EDUCATION
Master of Business Administration - Strategy & Consulting | 2023
Bachelor of Science in Business Analytics | 2021

SKILLS
Business Strategy, Market Analysis, Financial Modeling, Excel, Python, Tableau, PowerBI, Project Management`);
  };

  const loadSampleJob = () => {
    setJobDesc(`Management Consulting Analyst - Strategy
McKinsey & Company | New York, NY

About the Role
Join our Strategy Practice to work with C-suite executives on complex business challenges.

Key Responsibilities
• Conduct market and competitive analysis
• Build financial models and business cases
• Develop presentations for C-level executives
• Lead client interviews and synthesize findings
• Support project delivery with rigorous analysis

Required Qualifications
• Master's degree in Business, Economics, or Analytics
• 2+ years consulting or strategy experience
• Strong Excel and data visualization skills
• Excellent communication abilities
• Python or SQL experience preferred`);
  };

  // Optimize Resume
  const handleOptimizeResume = async () => {
    if (!resume || !jobDesc) {
      setOptimizerError('Please provide both resume and job description');
      return;
    }

    setLoading(true);
    setOptimizerError('');
    setOptimizerResult(null);

    try {
      const response = await axios.post('/api/optimize-resume', {
        resume,
        jobDescription: jobDesc,
      });
      setOptimizerResult(response.data);
    } catch (error) {
      setOptimizerError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Analyze Job
  const handleAnalyzeJob = async () => {
    if (!analysisJobDesc) {
      setAnalysisError('Please provide a job description');
      return;
    }

    setLoading(true);
    setAnalysisError('');
    setAnalysisResult(null);

    try {
      const response = await axios.post('/api/analyze-job', {
        jobDescription: analysisJobDesc,
      });
      setAnalysisResult(response.data);
    } catch (error) {
      setAnalysisError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Application
  const handleAddApplication = () => {
    if (!appForm.company || !appForm.jobTitle) {
      alert('Please fill in company and job title');
      return;
    }
    setApplications([...applications, { ...appForm, id: Date.now() }]);
    setAppForm({
      company: '',
      jobTitle: '',
      resumeVersion: '',
      atsScore: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Applied',
    });
    alert('✅ Application added!');
  };

  // Export Applications
  const handleExportApplications = () => {
    if (applications.length === 0) {
      alert('No applications to export');
      return;
    }
    let csv = 'Company,Job Title,Resume Version,ATS Score,Date,Status\n';
    applications.forEach(app => {
      csv += `"${app.company}","${app.jobTitle}","${app.resumeVersion}","${app.atsScore}","${app.date}","${app.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Copy to Clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Copied to clipboard!');
    });
  };

  // Calculate Stats
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'Applied').length,
    interviewed: applications.filter(a => a.status === 'Interview').length,
    offers: applications.filter(a => a.status === 'Offer').length,
    rejected: applications.filter(a => a.status === 'Rejected').length,
    avgAts: applications.filter(a => a.atsScore).length > 0
      ? (applications.filter(a => a.atsScore).reduce((sum, a) => sum + parseInt(a.atsScore), 0) / applications.filter(a => a.atsScore).length).toFixed(0)
      : 'N/A',
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  };

  return (
    <>
      <Head>
        <title>CareerOptimizer - AI Job Application Assistant</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Free AI-powered job application optimizer with ATS scoring and cover letter generation" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>🚀 CareerOptimizer</h1>
          <p>AI-Powered Job Application Optimizer</p>
          <span className={styles.badge}>✨ 100% Free • No Sign-ups • Full-Featured</span>
        </header>

        <div className={styles.navTabs}>
          <button
            className={`${styles.navButton} ${activeTab === 'optimizer' ? styles.active : ''}`}
            onClick={() => setActiveTab('optimizer')}
          >
            📄 Resume Optimizer
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'analyzer' ? styles.active : ''}`}
            onClick={() => setActiveTab('analyzer')}
          >
            📊 Job Analysis
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'tracker' ? styles.active : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            📈 Application Tracker
          </button>
          <button
            className={`${styles.navButton} ${activeTab === 'guide' ? styles.active : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            📚 Extension Guide
          </button>
        </div>

        {/* OPTIMIZER TAB */}
        {activeTab === 'optimizer' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>✍️ Resume Optimizer & ATS Scorer</h2>

            <div className={styles.grid2}>
              <div>
                <label className={styles.label}>Your Resume</label>
                <textarea
                  className={styles.textarea}
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  placeholder="Paste your resume here..."
                />
                <button className={`${styles.button} ${styles.secondary}`} onClick={loadSampleResume}>
                  💡 Load Sample
                </button>
              </div>

              <div>
                <label className={styles.label}>Job Description</label>
                <textarea
                  className={styles.textarea}
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the job description..."
                />
                <button className={`${styles.button} ${styles.secondary}`} onClick={loadSampleJob}>
                  💡 Load Sample
                </button>
              </div>
            </div>

            <div className={styles.buttonGroup}>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={handleOptimizeResume}
                disabled={loading}
              >
                {loading ? '⏳ Optimizing...' : '✨ Optimize Resume & Generate Cover Letter'}
              </button>
            </div>

            {optimizerError && <div className={styles.alert}>{optimizerError}</div>}

            {optimizerResult && (
              <div className={styles.results}>
                <div className={`${styles.scoreBadge} ${styles[getScoreBadgeClass(optimizerResult.atsScore)]}`}>
                  {optimizerResult.atsScore}%
                </div>

                <div className={styles.keywordSection}>
                  <h3>✅ Matched Keywords ({optimizerResult.matchedKeywords?.length || 0})</h3>
                  <div className={styles.keywordsList}>
                    {optimizerResult.matchedKeywords?.map((k, i) => (
                      <span key={i} className={`${styles.keyword} ${styles.matched}`}>{k}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.keywordSection}>
                  <h3>⚠️ Missing Keywords ({optimizerResult.missingKeywords?.length || 0})</h3>
                  <div className={styles.keywordsList}>
                    {optimizerResult.missingKeywords?.map((k, i) => (
                      <span key={i} className={`${styles.keyword} ${styles.missing}`}>{k}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.resultSection}>
                  <div className={styles.resultBox}>
                    <h3>📄 Optimized Resume</h3>
                    <textarea readOnly value={optimizerResult.optimizedResume} className={styles.resultTextarea} />
                    <button
                      className={`${styles.button} ${styles.success}`}
                      onClick={() => copyToClipboard(optimizerResult.optimizedResume)}
                    >
                      📋 Copy Resume
                    </button>
                  </div>

                  <div className={styles.resultBox}>
                    <h3>💌 Cover Letter</h3>
                    <textarea readOnly value={optimizerResult.coverLetter} className={styles.resultTextarea} />
                    <button
                      className={`${styles.button} ${styles.success}`}
                      onClick={() => copyToClipboard(optimizerResult.coverLetter)}
                    >
                      📋 Copy Letter
                    </button>
                  </div>
                </div>

                <div className={styles.resultBox}>
                  <h3>💡 Recommendations</h3>
                  <ul>
                    {optimizerResult.recommendations?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYZER TAB */}
        {activeTab === 'analyzer' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🔍 Deep Job Analysis</h2>

            <label className={styles.label}>Job Description</label>
            <textarea
              className={styles.textarea}
              value={analysisJobDesc}
              onChange={(e) => setAnalysisJobDesc(e.target.value)}
              placeholder="Paste job description to analyze..."
            />

            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleAnalyzeJob}
              disabled={loading}
            >
              {loading ? '⏳ Analyzing...' : '🔬 Analyze This Job'}
            </button>

            {analysisError && <div className={styles.alert}>{analysisError}</div>}

            {analysisResult && (
              <div className={styles.results}>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{analysisResult.level || 'N/A'}</div>
                    <div className={styles.statLabel}>Level</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{analysisResult.keySkills?.length || 0}</div>
                    <div className={styles.statLabel}>Key Skills</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statNumber}>{analysisResult.softSkills?.length || 0}</div>
                    <div className={styles.statLabel}>Soft Skills</div>
                  </div>
                </div>

                <div className={styles.resultBox}>
                  <h3>🎯 Technical Skills</h3>
                  <div className={styles.keywordsList}>
                    {analysisResult.keySkills?.map((k, i) => (
                      <span key={i} className={`${styles.keyword} ${styles.matched}`}>{k}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.resultBox}>
                  <h3>💪 Soft Skills Needed</h3>
                  <div className={styles.keywordsList}>
                    {analysisResult.softSkills?.map((k, i) => (
                      <span key={i} className={`${styles.keyword} ${styles.matched}`}>{k}</span>
                    ))}
                  </div>
                </div>

                <div className={styles.resultBox}>
                  <h3>✨ What Stands Out</h3>
                  <ul>
                    {analysisResult.advantages?.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.resultBox}>
                  <h3>⚠️ Red Flags</h3>
                  <ul>
                    {analysisResult.redFlags?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TRACKER TAB */}
        {activeTab === 'tracker' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📊 Application Tracker</h2>

            <div className={styles.grid2}>
              <input
                type="text"
                className={styles.input}
                placeholder="Company Name"
                value={appForm.company}
                onChange={(e) => setAppForm({ ...appForm, company: e.target.value })}
              />
              <input
                type="text"
                className={styles.input}
                placeholder="Job Title"
                value={appForm.jobTitle}
                onChange={(e) => setAppForm({ ...appForm, jobTitle: e.target.value })}
              />
            </div>

            <div className={styles.grid2}>
              <input
                type="text"
                className={styles.input}
                placeholder="Resume Version (e.g., V1-Strategy)"
                value={appForm.resumeVersion}
                onChange={(e) => setAppForm({ ...appForm, resumeVersion: e.target.value })}
              />
              <input
                type="number"
                className={styles.input}
                placeholder="ATS Score (0-100)"
                min="0"
                max="100"
                value={appForm.atsScore}
                onChange={(e) => setAppForm({ ...appForm, atsScore: e.target.value })}
              />
            </div>

            <div className={styles.grid2}>
              <input
                type="date"
                className={styles.input}
                value={appForm.date}
                onChange={(e) => setAppForm({ ...appForm, date: e.target.value })}
              />
              <select
                className={styles.input}
                value={appForm.status}
                onChange={(e) => setAppForm({ ...appForm, status: e.target.value })}
              >
                <option>Applied</option>
                <option>Pending</option>
                <option>Interview</option>
                <option>Offer</option>
                <option>Rejected</option>
              </select>
            </div>

            <div className={styles.buttonGroup}>
              <button className={`${styles.button} ${styles.primary}`} onClick={handleAddApplication}>
                ➕ Add Application
              </button>
              <button className={`${styles.button} ${styles.success}`} onClick={handleExportApplications}>
                📥 Export to CSV
              </button>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.total}</div>
                <div className={styles.statLabel}>Total Apps</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.interviewed}</div>
                <div className={styles.statLabel}>Interviews</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>{stats.avgAts}</div>
                <div className={styles.statLabel}>Avg ATS Score</div>
              </div>
            </div>

            {applications.length > 0 && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Job</th>
                    <th>ATS</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.id}>
                      <td>{app.company}</td>
                      <td>{app.jobTitle}</td>
                      <td>{app.atsScore || '-'}</td>
                      <td>{app.date}</td>
                      <td><span className={styles.badge}>{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🔗 Auto-Apply Extensions Guide</h2>

            <div className={styles.guideSection}>
              <h3>🎯 Recommended Setup</h3>
              <ol>
                <li><strong>Step 1:</strong> Use the Resume Optimizer above to create tailored resume</li>
                <li><strong>Step 2:</strong> Install <a href="https://loopcv.io" target="_blank" rel="noopener noreferrer">LoopCV</a> (free plan available)</li>
                <li><strong>Step 3:</strong> Copy your optimized resume from above</li>
                <li><strong>Step 4:</strong> Upload to LoopCV and set auto-apply filters</li>
                <li><strong>Step 5:</strong> Apply to 15-25 jobs/day sustainably</li>
                <li><strong>Step 6:</strong> Track results in Application Tracker</li>
              </ol>
            </div>

            <div className={styles.guideSection}>
              <h3>✨ Free Auto-Apply Tools</h3>
              <div className={styles.toolsList}>
                <div className={styles.toolCard}>
                  <h4>LoopCV (Recommended)</h4>
                  <p><strong>Cost:</strong> Free plan available</p>
                  <p><strong>Best for:</strong> 30+ job boards + career pages</p>
                  <p><strong>Features:</strong> Auto-apply 5-10/day safely</p>
                </div>

                <div className={styles.toolCard}>
                  <h4>Simplify</h4>
                  <p><strong>Cost:</strong> Free</p>
                  <p><strong>Best for:</strong> Form autofill extension</p>
                  <p><strong>Features:</strong> Autofill job applications</p>
                </div>

                <div className={styles.toolCard}>
                  <h4>Huntr</h4>
                  <p><strong>Cost:</strong> Free + paid</p>
                  <p><strong>Best for:</strong> Application tracking dashboard</p>
                  <p><strong>Features:</strong> Track unlimited applications</p>
                </div>

                <div className={styles.toolCard}>
                  <h4>Teal</h4>
                  <p><strong>Cost:</strong> Free + paid</p>
                  <p><strong>Best for:</strong> ATS keyword optimization</p>
                  <p><strong>Features:</strong> Resume checker & optimizer</p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <h3>⚡ Pro Tips for Entry-Level Success</h3>
              <ul>
                <li>✅ Apply 15-25 jobs/day (quality over quantity)</li>
                <li>✅ Always tailor resume with this tool</li>
                <li>✅ Track ATS scores vs. callback rates</li>
                <li>✅ Apply within first hour of posting</li>
                <li>❌ Avoid 50+ applications/day (spam flags)</li>
                <li>❌ Never use generic resume for all jobs</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
