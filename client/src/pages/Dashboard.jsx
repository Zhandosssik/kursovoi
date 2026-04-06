import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
    const { user } = useContext(AuthContext); 
    const [projects, setProjects] = useState([]); 
    const [assignments, setAssignments] = useState([]); 

    // Студенттің жұмыс жүктеу стейттері
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(''); // Жаңа: қай тапсырма екенін таңдау

    // Мұғалімнің тапсырма беру стейттері
    const [groupsList, setGroupsList] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const [newAssignment, setNewAssignment] = useState({
        title: '', description: '', deadline: '', group_id: '', student_ids: []
    });

    // Бағалау және GitHub стейттері
    const [gradeData, setGradeData] = useState({ text: '', grade: '', status: 'accepted' });
    const [activeProject, setActiveProject] = useState(null); 
    const [githubUrl, setGithubUrl] = useState('');
    const [activeGitProject, setActiveGitProject] = useState(null);

    const fetchData = async () => {
        try {
            const projRes = await api.get('/projects');
            setProjects(projRes.data);

            const assignRes = await api.get('/assignments');
            setAssignments(assignRes.data);

            if (user?.role === 'teacher') {
                const groupsRes = await api.get('/assignments/groups');
                setGroupsList(groupsRes.data);
            }
        } catch (error) {
            console.error('Қате:', error);
        }
    };

    useEffect(() => {
        if (!user || user.role === 'admin') return;
        fetchData();
    }, [user]);

    const openAssignments = useMemo(() => {
        if (user?.role !== 'student') return [];
        return assignments.filter(
            (a) =>
                !projects.some(
                    (p) =>
                        p.assignment_id != null &&
                        Number(p.assignment_id) === Number(a.id)
                )
        );
    }, [user?.role, assignments, projects]);

    useEffect(() => {
        if (!selectedAssignment) return;
        const stillOpen = openAssignments.some(
            (a) => String(a.id) === String(selectedAssignment)
        );
        if (!stillOpen) setSelectedAssignment('');
    }, [openAssignments, selectedAssignment]);

    // 1. Мұғалім - Тапсырма жасау
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            await api.post('/assignments', newAssignment);
            alert('Тапсырма сәтті құрылды!');
            setNewAssignment({ title: '', description: '', deadline: '', group_id: '', student_id: 'all' });
            fetchData(); 
        } catch (error) {
            alert('Тапсырма құру қатесі: ' + (error.response?.data?.message || error.message));
        }
    };

    // 2. Мұғалім - Топты таңдағанда оқушыларды әкелу
    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        setNewAssignment({ ...newAssignment, group_id: groupId, student_id: 'all' }); 
        
        if (groupId) {
            try {
                const studentsRes = await api.get(`/assignments/groups/${groupId}/students`);
                setStudentsList(studentsRes.data);
            } catch (error) {
                console.error('Студенттерді жүктеу қатесі', error);
            }
        } else {
            setStudentsList([]);
        }
    };

    // 3. Студент - Жұмысты жүктеу (Тапсырманы таңдаумен)
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return alert('Файлды таңдаңыз!');
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('document', file); 
        if (selectedAssignment) formData.append('assignment_id', selectedAssignment);

        setUploading(true);
        try {
            await api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Жоба сәтті жүктелді!');
            setTitle(''); setDescription(''); setFile(null); setSelectedAssignment(''); fetchData(); 
        } catch (error) {
            alert('Қате: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleReview = async (projectId) => {
        try {
            await api.put(`/projects/${projectId}/review`, gradeData);
            alert('Баға қойылды!');
            setActiveProject(null); setGradeData({ text: '', grade: '', status: 'accepted' }); fetchData(); 
        } catch (error) {
            alert('Бағалау кезінде қате шықты');
        }
    };

    const handleAddGithub = async (projectId) => {
        if (!githubUrl) return alert('Сілтемені енгізіңіз!');
        try {
            await api.post(`/projects/${projectId}/github`, { repoUrl: githubUrl });
            alert('GitHub қосылды!');
            setGithubUrl(''); setActiveGitProject(null); fetchData(); 
        } catch (error) {
            alert('Қате: ' + (error.response?.data?.message || error.message));
        }
    };

    const formatDeadline = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', { 
            day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' 
        });
    };

    if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Жүйеге кіріңіз...</div>;

    if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                
                {/* HEADER */}
                <div className="dashboard-header fade-in-up">
                    <div>
                        <h1 className="dashboard-title">Бақылау тақтасы</h1>
                        <p className="dashboard-subtitle">Қош келдіңіз, жұмысыңызды басқарыңыз</p>
                    </div>
                    <div className="user-badge">
                        <div className="user-role-icon" aria-hidden>
                            {user.role === 'teacher' ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                </svg>
                            )}
                        </div>
                        <div className="user-info">
                            <strong>{user.firstName} {user.lastName}</strong>
                            <span>{user.role === 'teacher' ? 'Оқытушы' : 'Студент'}</span>
                        </div>
                    </div>
                </div>

                {/* БЛОК ДЛЯ ПРЕПОДАВАТЕЛЯ: ТАПСЫРМА ҚОСУ */}
                {/* БЛОК ДЛЯ ПРЕПОДАВАТЕЛЯ: ТАПСЫРМА ҚОСУ */}
                {user.role === 'teacher' && (
                    <div className="dashboard-card upload-card fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header">
                            <div className="card-header-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="12" y1="18" x2="12" y2="12" />
                                    <line x1="9" y1="15" x2="15" y2="15" />
                                </svg>
                            </div>
                            <h2>Жаңа тапсырма беру</h2>
                        </div>
                        <form onSubmit={handleCreateAssignment} className="upload-form">
                            <input className="modern-input" type="text" placeholder="Тапсырма тақырыбы" value={newAssignment.title} onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})} required />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                {/* 1. ТОПТЫ ТАҢДАУ */}
                                <select className="modern-input" value={newAssignment.group_id} onChange={handleGroupChange} required>
                                    <option value="" disabled>Топты таңдаңыз...</option>
                                    {groupsList.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>

                                {/* 2. СТУДЕНТТЕРДІ ГАЛОЧКАМЕН ТАҢДАУ (CHECKBOXES) */}
                                {newAssignment.group_id && (
                                    <div className="dashboard-inset">
                                        <label style={{ fontWeight: '600', marginBottom: '12px', display: 'block', fontSize: '14px', color: 'var(--text-main)' }}>
                                            Кімдерге тапсырма береміз?
                                        </label>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <input 
                                                type="checkbox" 
                                                id="all_students"
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                checked={newAssignment.student_ids.length === 0} 
                                                onChange={() => setNewAssignment({...newAssignment, student_ids: []})}
                                            />
                                            <label htmlFor="all_students" style={{ cursor: 'pointer', fontWeight: '500' }}>Бүкіл топқа</label>
                                        </div>

                                        {/* Оқушылар тізімі (екі баған етіп шығарамыз) */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '180px', overflowY: 'auto', paddingRight: '10px' }}>
                                            {studentsList.map(student => (
                                                <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        id={`student_${student.id}`}
                                                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                        checked={newAssignment.student_ids.includes(student.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                // Қосу
                                                                setNewAssignment({
                                                                    ...newAssignment, 
                                                                    student_ids: [...newAssignment.student_ids, student.id]
                                                                });
                                                            } else {
                                                                // Алып тастау
                                                                setNewAssignment({
                                                                    ...newAssignment, 
                                                                    student_ids: newAssignment.student_ids.filter(id => id !== student.id)
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor={`student_${student.id}`} style={{ cursor: 'pointer', fontSize: '14px' }}>
                                                        {student.first_name} {student.last_name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <textarea className="modern-input" placeholder="Тапсырма сипаттамасы" rows="3" value={newAssignment.description} onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})} required />
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Дедлайн (Мерзімі):</label>
                                <input className="modern-input" type="datetime-local" value={newAssignment.deadline} onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})} required />
                            </div>
                            
                            <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '16px' }}>
                                Тапсырманы жіберу
                            </button>
                        </form>
                    </div>
                )}

                {/* БЛОК ДЛЯ СТУДЕНТА: ОРЫНДАЛУЫ ТИІС ТАПСЫРМАЛАР (жүктелгендері тізімнен алынады) */}
                {user.role === 'student' && openAssignments.length > 0 && (
                    <div className="dashboard-card fade-in-up" style={{ animationDelay: '0.1s', borderLeft: '4px solid var(--primary-color)' }}>
                        <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', margin: 0 }}>Орындалуы тиіс тапсырмалар</h2>
                            <span className="projects-count">{openAssignments.length}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {openAssignments.map(task => (
                                <div key={task.id} className="dashboard-inset">
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-main)' }}>{task.title}</h3>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-muted)' }}>{task.description}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', fontWeight: '600' }}>
                                        <span style={{ color: '#ff9f0a' }}>
                                            Мерзімі: {formatDeadline(task.deadline)}
                                        </span>
                                        <span style={{ color: 'var(--primary-color)' }}>Оқытушы: {task.teacher_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {user.role === 'student' && assignments.length > 0 && openAssignments.length === 0 && (
                    <div className="dashboard-card dashboard-success-banner fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <p>
                            Барлық мұғалім тапсырмаларына жұмыс жіберілді. Жаңа тапсырма келсе, ол осы жерде көрінеді.
                        </p>
                    </div>
                )}

                {/* БЛОК ДЛЯ СТУДЕНТА: ЖҰМЫСТЫ ЖҮКТЕУ */}
                {user.role === 'student' && (
                    <div className="dashboard-card upload-card fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <div className="card-header">
                            <div className="card-header-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </div>
                            <h2>Жұмысты жүктеу (Жауап беру)</h2>
                        </div>
                        <form onSubmit={handleUpload} className="upload-form">
                            
                            {/* Қай тапсырмаға жауап екенін таңдау */}
                            <select 
                                className="modern-input" 
                                value={selectedAssignment} 
                                onChange={(e) => setSelectedAssignment(e.target.value)}
                            >
                                <option value="">Өздігінен еркін жұмыс жүктеу (Тапсырмасыз)</option>
                                {openAssignments.map(task => (
                                    <option key={task.id} value={task.id}>
                                        {task.title} — {task.teacher_name}
                                    </option>
                                ))}
                            </select>

                            <input className="modern-input" type="text" placeholder="Жұмыстың тақырыбы" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            <textarea className="modern-input" placeholder="Қысқаша сипаттама немесе мұғалімге хабарлама" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            
                            <label className="file-upload-label">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                {file ? file.name : "Файлды таңдаңыз (.pdf, .docx, .zip)"}
                                <input type="file" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} required />
                            </label>
                            
                            <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '16px' }} disabled={uploading}>
                                {uploading ? 'Жүктелуде…' : 'Жұмысты жіберу'}
                            </button>
                        </form>
                    </div>
                )}

                {/* СПИСОК РАБОТ */}
                <div className="projects-header fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <h2>Жүктелген жұмыстар тізімі</h2>
                    <span className="projects-count">{projects.length}</span>
                </div>

                {projects.length === 0 ? (
                    <div className="empty-state fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <div className="empty-icon" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h3>Әзірге ешқандай жұмыс жоқ</h3>
                        <p>Бірінші болып жобаңызды жүктеңіз!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {projects.map((proj, index) => (
                            <div key={proj.id} className="dashboard-card project-card fade-in-up" style={{ animationDelay: `${0.1 * index}s`, margin: 0 }}>
                                <div className="project-header">
                                    <h3 className="project-title">{proj.title}</h3>
                                    <span className={`status-badge status-${proj.status}`}>
                                        {proj.status === 'accepted' ? 'Қабылданды' : proj.status === 'rejected' ? 'Қайтарылды' : 'Тексерілуде'}
                                    </span>
                                </div>
                                
                                <div className="project-meta">
                                    <div className="project-author">
                                        {proj.first_name} {proj.last_name}
                                    </div>
                                </div>

                                <p className="project-desc">{proj.description}</p>
                                
                                {proj.file_url && (
                                    <div className="project-file">
                                        <a href={`http://localhost:5000${proj.file_url}`} target="_blank" rel="noreferrer">
                                            Құжатты ашу
                                        </a>
                                    </div>
                                )}

                                {/* GitHub Блок */}
                                {proj.repo_url ? (
                                    <div className="github-box">
                                        <div className="github-box-header">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                                                <path d="M9 18c-4.51 2-5-2-7-2"/>
                                            </svg>
                                            <a href={proj.repo_url} target="_blank" rel="noreferrer">{proj.repo_name || 'Репозиторийді ашу'}</a>
                                        </div>
                                        <div className="github-meta">
                                            <span><span className="lang-dot"></span>{proj.language || 'Белгісіз'}</span>
                                            <span>Жұлдыз: {proj.stars_count || 0}</span>
                                        </div>
                                    </div>
                                ) : (
                                    user.role === 'student' && proj.status === 'pending' && (
                                        <div style={{ marginTop: '15px' }}>
                                            {activeGitProject === proj.id ? (
                                                <div className="inline-form">
                                                    <input className="modern-input" type="url" placeholder="https://github.com/..." value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required />
                                                    <button className="btn-primary" style={{ padding: '0 20px', borderRadius: '8px' }} onClick={() => handleAddGithub(proj.id)}>Сақтау</button>
                                                    <button className="btn-outline-small" onClick={() => setActiveGitProject(null)}>Болдырмау</button>
                                                </div>
                                            ) : (
                                                <button className="btn-outline-small" onClick={() => setActiveGitProject(proj.id)}>
                                                    + GitHub сілтемесін қосу
                                                </button>
                                            )}
                                        </div>
                                    )
                                )}

                                {/* Блок проверки для преподавателя */}
                                {user.role === 'teacher' && proj.status === 'pending' && (
                                    <>
                                        <hr className="divider" />
                                        <div style={{ marginTop: '20px' }}>
                                            {activeProject === proj.id ? (
                                                <div className="review-form">
                                                    <label style={{ fontSize: '14px', fontWeight: '600' }}>Жұмысты бағалау:</label>
                                                    <textarea className="modern-input" placeholder="Пікіріңізді жазыңыз..." value={gradeData.text} onChange={(e) => setGradeData({...gradeData, text: e.target.value})} />
                                                    <div className="review-controls">
                                                        <input className="modern-input short-input" type="number" placeholder="Баға (0-100)" value={gradeData.grade} onChange={(e) => setGradeData({...gradeData, grade: e.target.value})} />
                                                        <select className="modern-input short-input" value={gradeData.status} onChange={(e) => setGradeData({...gradeData, status: e.target.value})}>
                                                            <option value="accepted">Қабылдау</option>
                                                            <option value="rejected">Қайтару</option>
                                                        </select>
                                                        <button className="btn-primary" style={{ padding: '0 24px', borderRadius: '8px' }} onClick={() => handleReview(proj.id)}>Сақтау</button>
                                                        <button className="btn-outline-small" onClick={() => setActiveProject(null)}>Болдырмау</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button className="btn-outline-small" onClick={() => setActiveProject(proj.id)}>
                                                    Тексеру және бағалау
                                                </button>
                                            )}
                                        </div>
                                    </>
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