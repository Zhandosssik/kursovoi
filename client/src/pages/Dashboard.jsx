import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
    const { user } = useContext(AuthContext); 
    const [projects, setProjects] = useState([]); 

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [gradeData, setGradeData] = useState({ text: '', grade: '', status: 'accepted' });
    const [activeProject, setActiveProject] = useState(null); 

    const [githubUrl, setGithubUrl] = useState('');
    const [activeGitProject, setActiveGitProject] = useState(null);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Жобаларды жүктеу қатесі:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert('Файлды таңдаңыз!');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('document', file); 
        setUploading(true);
        try {
            await api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Жоба сәтті жүктелді!');
            setTitle(''); setDescription(''); setFile(null); fetchProjects(); 
        } catch (error) {
            alert('Қате шықты: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleReview = async (projectId) => {
        try {
            await api.put(`/projects/${projectId}/review`, gradeData);
            alert('Баға қойылды!');
            setActiveProject(null); setGradeData({ text: '', grade: '', status: 'accepted' }); fetchProjects(); 
        } catch (error) {
            alert('Бағалау кезінде қате шықты');
        }
    };

    const handleAddGithub = async (projectId) => {
        if (!githubUrl) return alert('Сілтемені енгізіңіз!');
        try {
            await api.post(`/projects/${projectId}/github`, { repoUrl: githubUrl });
            alert('GitHub қосылды!');
            setGithubUrl(''); setActiveGitProject(null); fetchProjects(); 
        } catch (error) {
            alert('Қате: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleAIReview = async (projectId) => {
        try {
            alert('🤖 AI жұмысты оқып жатыр... Күте тұрыңыз (бұл 5-10 секунд алуы мүмкін).');
            const response = await api.get(`/projects/${projectId}/ai-review`);
            const aiData = response.data;
            alert(`🤖 AI ЖАУАБЫ:\n\n📝 Пікір: ${aiData.feedback}\n\n💯 Ұсынылатын баға: ${aiData.suggested_grade}`);
        } catch (error) {
            console.error(error); alert('AI бағалау кезінде қате шықты!');
        }
    };

    if (!user) return <div className="loading-screen">Жүйеге кіріңіз...</div>;

    return (
        <div className="dashboard-page">
            <div className="dashboard-container fade-in-up">
                
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Бақылау тақтасы</h1>
                        <p className="dashboard-subtitle">Жобаларыңызды басқарыңыз және бағалаңыз</p>
                    </div>
                    <div className="user-badge">
                        <span className="user-role-icon">{user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}</span>
                        <div className="user-info">
                            <strong>{user.first_name} {user.last_name}</strong>
                            <span>{user.role === 'teacher' ? 'Оқытушы' : 'Студент'}</span>
                        </div>
                    </div>
                </div>

                {/* СТУДЕНТТІҢ ЖОБА ЖҮКТЕУ ФОРМАСЫ */}
                {user.role === 'student' && (
                    <div className="dashboard-card upload-card">
                        <div className="card-header">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <h2>Жаңа жоба жүктеу</h2>
                        </div>
                        <form onSubmit={handleUpload} className="upload-form">
                            <div className="form-group-modern">
                                <label>Жоба тақырыбы</label>
                                <input className="modern-input" type="text" placeholder="Тақырыпты енгізіңіз" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            </div>
                            <div className="form-group-modern">
                                <label>Қысқаша сипаттама</label>
                                <textarea className="modern-input" placeholder="Жоба туралы қысқаша мәлімет" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            </div>
                            <div className="form-group-modern file-upload-wrapper">
                                <label className="file-upload-label">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                    <span>{file ? file.name : 'Файлды таңдаңыз (.pdf, .docx)'}</span>
                                    <input type="file" accept=".pdf,.docx,.doc" onChange={(e) => setFile(e.target.files[0])} required style={{display: 'none'}} />
                                </label>
                            </div>
                            <button type="submit" className="btn-primary" disabled={uploading} style={{ width: 'fit-content', padding: '12px 24px' }}>
                                {uploading ? 'Жүктелуде...' : 'Жобаны жіберу'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="projects-header">
                    <h2>{user.role === 'teacher' ? 'Тексеруді қажет ететін жұмыстар' : 'Жүктелген жұмыстар'}</h2>
                    <span className="projects-count">{projects.length} жоба</span>
                </div>

                {projects.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>Әзірге жобалар жоқ</h3>
                        <p>Жаңа жобалар жүктелгенде осы жерде пайда болады.</p>
                    </div>
                ) : (
                    <div className="projects-list">
                        {projects.map((proj) => (
                            <div key={proj.id} className="dashboard-card project-card">
                                <div className="project-header">
                                    <h3 className="project-title">{proj.title}</h3>
                                    <span className={`status-badge status-${proj.status}`}>
                                        {proj.status === 'accepted' ? 'Қабылданды' : proj.status === 'rejected' ? 'Қайтарылды' : 'Күтуде'}
                                    </span>
                                </div>
                                <div className="project-meta">
                                    <span className="project-author">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                        {proj.first_name} {proj.last_name}
                                    </span>
                                </div>
                                <p className="project-desc">{proj.description}</p>
                                
                                {proj.file_url && (
                                    <div className="project-file">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                        <a href={`http://localhost:5000${proj.file_url}`} target="_blank" rel="noreferrer">
                                            Құжатты ашу ({proj.file_type})
                                        </a>
                                    </div>
                                )}

                                {proj.repo_url ? (
                                    <div className="github-box">
                                        <div className="github-box-header">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                            <a href={proj.repo_url} target="_blank" rel="noreferrer">{proj.repo_name || 'Репозиторийді көру'}</a>
                                        </div>
                                        <div className="github-meta">
                                            <span className="github-lang"><span className="lang-dot"></span> {proj.language || 'Code'}</span>
                                            <span>⭐ {proj.stars_count}</span>
                                        </div>
                                    </div>
                                ) : (
                                    user.role === 'student' && proj.status === 'pending' && (
                                        <div className="action-area">
                                            {activeGitProject === proj.id ? (
                                                <div className="inline-form">
                                                    <input className="modern-input" type="url" placeholder="https://github.com/..." value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required />
                                                    <button className="btn-primary" onClick={() => handleAddGithub(proj.id)}>Сақтау</button>
                                                    <button className="btn-secondary" onClick={() => setActiveGitProject(null)}>Болдырмау</button>
                                                </div>
                                            ) : (
                                                <button className="btn-outline-small" onClick={() => setActiveGitProject(proj.id)}>
                                                    + GitHub сілтемесін қосу
                                                </button>
                                            )}
                                        </div>
                                    )
                                )}

                                {/* TEACHER ACTIONS */}
                                {user.role === 'teacher' && (
                                    <div className="teacher-actions">
                                        <hr className="divider" />
                                        
                                        {proj.status === 'pending' && (
                                            <div className="review-section">
                                                {activeProject === proj.id ? (
                                                    <div className="review-form fade-in-up" style={{animationDuration: '0.3s'}}>
                                                        <textarea className="modern-input" placeholder="Оқушыға пікіріңіз..." rows="2" value={gradeData.text} onChange={(e) => setGradeData({...gradeData, text: e.target.value})} />
                                                        <div className="review-controls">
                                                            <input className="modern-input short-input" type="number" placeholder="Баға (0-100)" value={gradeData.grade} onChange={(e) => setGradeData({...gradeData, grade: e.target.value})} />
                                                            <select className="modern-input modern-select short-input" value={gradeData.status} onChange={(e) => setGradeData({...gradeData, status: e.target.value})}>
                                                                <option value="accepted">Қабылдау ✅</option>
                                                                <option value="rejected">Қайтару ❌</option>
                                                            </select>
                                                            <button className="btn-primary" onClick={() => handleReview(proj.id)}>Сақтау</button>
                                                            <button className="btn-secondary" onClick={() => setActiveProject(null)}>Жабу</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button className="btn-outline-small" onClick={() => setActiveProject(proj.id)}>
                                                        ✍️ Тексеру және Бағалау
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <button className="btn-ai" onClick={() => handleAIReview(proj.id)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                                            AI көмекшісімен талдау
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;