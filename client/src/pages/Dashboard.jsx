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
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState('');

    // Мұғалімнің тапсырма беру стейттері
    const [groupsList, setGroupsList] = useState([]);
    const [studentsList, setStudentsList] = useState([]);
    const [newAssignment, setNewAssignment] = useState({
        title: '', description: '', deadline: '', group_id: '', student_ids: [], type: ''
    });
    const [assignmentFiles, setAssignmentFiles] = useState([]);
    const [activeTeacherTab, setActiveTeacherTab] = useState('projects'); // 'projects', 'my_assignments', 'create_assignment'
    const [assignmentStats, setAssignmentStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Бағалау және GitHub стейттері
    const [gradeData, setGradeData] = useState({ text: '', grade: '', status: 'accepted' });
    const [activeProject, setActiveProject] = useState(null); 
    const [githubUrl, setGithubUrl] = useState('');
    const [activeGitProject, setActiveGitProject] = useState(null);

    // Сортировка стейттері
    const [projectSort, setProjectSort] = useState('date_desc'); 
    const [assignmentSort, setAssignmentSort] = useState('date_asc'); 

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

    const sortedOpenAssignments = useMemo(() => {
        const arr = [...openAssignments];
        switch (assignmentSort) {
            case 'date_asc': return arr.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            case 'date_desc': return arr.sort((a, b) => new Date(b.deadline) - new Date(a.deadline));
            case 'name_asc': return arr.sort((a, b) => a.title.localeCompare(b.title, 'kk'));
            case 'name_desc': return arr.sort((a, b) => b.title.localeCompare(a.title, 'kk'));
            default: return arr;
        }
    }, [openAssignments, assignmentSort]);

    const sortedProjects = useMemo(() => {
        const arr = [...projects];
        switch (projectSort) {
            case 'date_desc': return arr.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
            case 'date_asc': return arr.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
            case 'name_asc': return arr.sort((a, b) => a.title.localeCompare(b.title, 'kk'));
            case 'name_desc': return arr.sort((a, b) => b.title.localeCompare(a.title, 'kk'));
            case 'status_pending': return arr.sort((a, b) => {
                const order = { pending: 0, accepted: 1, rejected: 2 };
                return (order[a.status] ?? 3) - (order[b.status] ?? 3);
            });
            case 'status_accepted': return arr.sort((a, b) => {
                const order = { accepted: 0, pending: 1, rejected: 2 };
                return (order[a.status] ?? 3) - (order[b.status] ?? 3);
            });
            case 'author_asc': return arr.sort((a, b) => `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`, 'kk'));
            default: return arr;
        }
    }, [projects, projectSort]);

    // МҰҒАЛІМ: Тапсырма сақтау
    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('title', newAssignment.title);
            formData.append('description', newAssignment.description);
            formData.append('deadline', newAssignment.deadline);
            formData.append('group_id', newAssignment.group_id);
            formData.append('type', newAssignment.type);
            
            if (newAssignment.student_ids.length > 0) {
                formData.append('student_ids', JSON.stringify(newAssignment.student_ids));
            }

            for (let i = 0; i < assignmentFiles.length; i++) {
                formData.append('documents', assignmentFiles[i]);
            }

            await api.post('/assignments', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Тапсырма сәтті құрылды!');
            setNewAssignment({ title: '', description: '', deadline: '', group_id: '', student_ids: [], type: '' });
            setAssignmentFiles([]);
            fetchData(); 
            setActiveTeacherTab('my_assignments');
        } catch (error) {
            alert('Тапсырма құру қатесі: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const handleGroupChange = async (e) => {
        const groupId = e.target.value;
        setNewAssignment({ ...newAssignment, group_id: groupId, student_ids: [] }); 
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

    // МҰҒАЛІМ: Статистиканы ашу
    const loadAssignmentStats = async (id) => {
        setLoadingStats(true);
        if (assignmentStats?.id === id) {
            setAssignmentStats(null); // toggle close
            setLoadingStats(false);
            return;
        }

        try {
            const res = await api.get(`/assignments/${id}/stats`);
            setAssignmentStats({ id, data: res.data });
        } catch (error) {
            alert('Статистика алынбады');
        } finally {
            setLoadingStats(false);
        }
    };

    // СТУДЕНТ: Жұмыс жүктеу
    const handleUpload = async (e) => {
        e.preventDefault();
        if (files.length === 0) return alert('Файлды таңдаңыз!');
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        for (let i = 0; i < files.length; i++) {
            formData.append('documents', files[i]); 
        }
        if (selectedAssignment) formData.append('assignment_id', selectedAssignment);

        setUploading(true);
        try {
            await api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Жоба сәтті жүктелді!');
            setTitle(''); setDescription(''); setFiles([]); setSelectedAssignment(''); fetchData(); 
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
            // Егер тексеру үшін статистика парақшасынан келсек, оны жаңартып жібереміз
            if (assignmentStats) loadAssignmentStats(assignmentStats.id);
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
        return date.toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' });
    };

    const jumpToGrading = (projectId) => {
        setActiveTeacherTab('projects');
        setActiveProject(projectId);
        setTimeout(() => {
            const el = document.getElementById(`project-${projectId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Жүйеге кіріңіз...</div>;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;

    return (
        <div className="dashboard-page">
            <div className="bg-orbs" aria-hidden="true"></div>
            <div className="bg-orb-center" aria-hidden="true"></div>
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

                {/* TEACHER TABS NAVIGATION */}
                {user.role === 'teacher' && (
                    <div className="teacher-tabs-container fade-in-up" style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                            className={`modern-input ${activeTeacherTab === 'projects' ? 'active-tab' : ''}`}
                            style={{ width: 'auto', background: activeTeacherTab === 'projects' ? 'var(--primary-color)' : 'var(--bg-elevated)', color: activeTeacherTab === 'projects' ? '#fff' : 'var(--text-main)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => setActiveTeacherTab('projects')}
                        >
                            📋 Бағалау (Дереу)
                        </button>
                        <button 
                            className={`modern-input ${activeTeacherTab === 'my_assignments' ? 'active-tab' : ''}`}
                            style={{ width: 'auto', background: activeTeacherTab === 'my_assignments' ? 'var(--primary-color)' : 'var(--bg-elevated)', color: activeTeacherTab === 'my_assignments' ? '#fff' : 'var(--text-main)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => { setActiveTeacherTab('my_assignments'); setAssignmentStats(null); }}
                        >
                            📊 Тапсырмаларым / Статистика
                        </button>
                        <button 
                            className={`modern-input ${activeTeacherTab === 'create_assignment' ? 'active-tab' : ''}`}
                            style={{ width: 'auto', background: activeTeacherTab === 'create_assignment' ? 'var(--primary-color)' : 'var(--bg-elevated)', color: activeTeacherTab === 'create_assignment' ? '#fff' : 'var(--text-main)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => setActiveTeacherTab('create_assignment')}
                        >
                            ➕ Жаңа Тапсырма
                        </button>
                    </div>
                )}

                {/* TEACHER: CREATE ASSIGNMENT */}
                {user.role === 'teacher' && activeTeacherTab === 'create_assignment' && (
                    <div className="dashboard-card upload-card fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header">
                            <h2>Жаңа тапсырма беру</h2>
                        </div>
                        <form onSubmit={handleCreateAssignment} className="upload-form">
                            <input className="modern-input" type="text" placeholder="Тапсырма тақырыбы" value={newAssignment.title} onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})} required />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                <select className="modern-input" value={newAssignment.type} onChange={(e) => setNewAssignment({...newAssignment, type: e.target.value})} required>
                                    <option value="" disabled>Тапсырма түрін таңдаңыз...</option>
                                    <option value="coursework">Курстық жұмыс</option>
                                    <option value="diploma">Дипломдық жұмыс</option>
                                    <option value="homework">Үй жұмысы</option>
                                    <option value="lab">Зертханалық жұмыс</option>
                                    <option value="practice">Практикалық жұмыс</option>
                                    <option value="other">Басқа</option>
                                </select>

                                <select className="modern-input" value={newAssignment.group_id} onChange={handleGroupChange} required>
                                    <option value="" disabled>Топты таңдаңыз...</option>
                                    {groupsList.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>

                                {newAssignment.group_id && (
                                    <div className="dashboard-inset">
                                        <label style={{ fontWeight: '600', marginBottom: '12px', display: 'block', fontSize: '14px', color: 'var(--text-main)' }}>
                                            Кімдерге қатысты?
                                        </label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                                            <input type="checkbox" id="all_students" style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                checked={newAssignment.student_ids.length === 0} 
                                                onChange={() => setNewAssignment({...newAssignment, student_ids: []})}
                                            />
                                            <label htmlFor="all_students" style={{ cursor: 'pointer', fontWeight: '500' }}>Бүкіл топқа</label>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '180px', overflowY: 'auto', paddingRight: '10px' }}>
                                            {studentsList.map(student => (
                                                <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <input type="checkbox" id={`student_${student.id}`} style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                                        checked={newAssignment.student_ids.includes(student.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setNewAssignment({...newAssignment, student_ids: [...newAssignment.student_ids, student.id]});
                                                            else setNewAssignment({...newAssignment, student_ids: newAssignment.student_ids.filter(id => id !== student.id)});
                                                        }}
                                                    />
                                                    <label htmlFor={`student_${student.id}`} style={{ cursor: 'pointer', fontSize: '14px' }}>{student.first_name} {student.last_name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <textarea className="modern-input" placeholder="Тапсырма сипаттамасы" rows="3" value={newAssignment.description} onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})} required />
                            
                            {/* Мұғалім үшін файл жүктеу қосылды */}
                            <label className="file-upload-label" style={{ marginTop: '0px' }}>
                                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-main)' }}>
                                    Қосымша файл немесе презентация тіркеу (міндетті емес)
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                    {assignmentFiles.length > 0 ? `${assignmentFiles.length} файл таңдалды` : "Файлдар (.pdf, .docx, суреттер т.б.)"}
                                </div>
                                <input type="file" multiple style={{ display: 'none' }} 
                                    onChange={(e) => {
                                        setAssignmentFiles([...assignmentFiles, ...Array.from(e.target.files)]);
                                        e.target.value = null;
                                    }} 
                                />
                            </label>
                            
                            {assignmentFiles.length > 0 && (
                                <ul style={{ listStyleType: 'none', padding: 0, margin: '8px 0', fontSize: '13px' }}>
                                    {assignmentFiles.map((f, i) => (
                                        <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: '6px', marginBottom: '4px' }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {f.name}</span>
                                            <button type="button" onClick={() => setAssignmentFiles(assignmentFiles.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>❌</button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Дедлайн (Мерзімі):</label>
                                <input className="modern-input" type="datetime-local" value={newAssignment.deadline} onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})} required />
                            </div>
                            
                            <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '16px' }} disabled={uploading}>
                                {uploading ? "Жүктелуде..." : "Тапсырманы жіберу"}
                            </button>
                        </form>
                    </div>
                )}

                {/* TEACHER: MY ASSIGNMENTS (СТАТИСТИКА) */}
                {user.role === 'teacher' && activeTeacherTab === 'my_assignments' && (
                    <div className="dashboard-card fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <h2>Менің берген тапсырмаларым</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {assignments.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)' }}>Сіз әлі ешқандай тапсырма бермедіңіз.</p>
                            ) : (
                                assignments.map(a => (
                                    <div key={a.id} className="dashboard-inset" style={{ cursor: 'pointer', borderLeft: '4px solid var(--primary-color)', background: assignmentStats?.id === a.id ? 'var(--bg-card)' : 'transparent' }} onClick={() => loadAssignmentStats(a.id)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {a.title}
                                                {a.type && (
                                                    <span style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--primary-color)', color: '#fff', borderRadius: '4px', opacity: 0.9 }}>
                                                        {a.type === 'coursework' ? 'Курстық жұмыс' : a.type === 'diploma' ? 'Дипломдық жұмыс' : a.type === 'homework' ? 'Үй жұмысы' : a.type === 'lab' ? 'Зертханалық жұмыс' : a.type === 'practice' ? 'Практикалық жұмыс' : 'Басқа'}
                                                    </span>
                                                )}
                                            </h3>
                                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Тапсу жағдайы ▼</span>
                                        </div>
                                        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-muted)' }}>{a.description}</p>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#ff9f0a' }}>Мерзімі: {formatDeadline(a.deadline)}</div>
                                        
                                        {/* Тапсырмаға тіркелген файлдарды көрсету */}
                                        {a.files_list && a.files_list.filter(f => f && f.file_url).length > 0 && (
                                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {a.files_list.filter(f => f && f.file_url).map((file, idx) => (
                                                    <a key={idx} href={`http://${window.location.hostname}:5000${file.file_url}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '12px', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                                        📄 Жүктеп алу
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                        {/* СТАТИСТИКА КЕСТЕСІ (ЕСЛИ АШЫҚ БОЛСА) */}
                                        {assignmentStats?.id === a.id && (
                                            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', cursor: 'default' }} onClick={e => e.stopPropagation()}>
                                                <h4 style={{ margin: '0 0 16px 0' }}>Студенттердің тапсыру статистикасы</h4>
                                                {loadingStats ? <p>Жүктелуде...</p> : (
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                                            <thead>
                                                                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                                                    <th style={{ padding: '8px' }}>Аты-жөні</th>
                                                                    <th style={{ padding: '8px' }}>Статус</th>
                                                                    <th style={{ padding: '8px', textAlign: 'right' }}>Әрекет</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {assignmentStats.data.length === 0 ? (
                                                                    <tr><td colSpan="3" style={{ padding: '16px', textAlign: 'center' }}>Студенттер табылмады</td></tr>
                                                                ) : (
                                                                    assignmentStats.data.map(std => (
                                                                        <tr key={std.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                            <td style={{ padding: '12px 8px' }}>{std.first_name} {std.last_name}</td>
                                                                            <td style={{ padding: '12px 8px', fontWeight: '500' }}>
                                                                                {std.status === 'missing' && <span style={{ color:'#ff453a' }}>❌ Тапсырмады (Уақыт өтті)</span>}
                                                                                {std.status === 'pending' && <span style={{ color:'#ff9f0a' }}>⏳ Барысында</span>}
                                                                                {std.status === 'submitted' && <span style={{ color:'#30d158' }}>✅ Тапсырды ({formatDeadline(std.submitted_at)})</span>}
                                                                                {std.status === 'late' && <span style={{ color:'#ff9f0a' }}>⚠️ Кешігіп тапсырды ({formatDeadline(std.submitted_at)})</span>}
                                                                                {std.status === 'graded' && <span style={{ color:'#30d158' }}>🏆 Бағаланды: {std.grade}</span>}
                                                                            </td>
                                                                            <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                                                                {std.project_id && std.status !== 'graded' && (
                                                                                    <button className="btn-outline-small" onClick={() => jumpToGrading(std.project_id)} style={{ padding: '4px 12px', fontSize: '12px' }}>
                                                                                        Бағалау
                                                                                    </button>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* СТУДЕНТ ЖӨНІНДЕГІ ҮЙРЕНШІКТІ КОД*/}
                {user.role === 'student' && openAssignments.length > 0 && (
                    <div className="dashboard-card fade-in-up" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h2 style={{ fontSize: '20px', margin: 0 }}>Орындалуы тиіс тапсырмалар</h2>
                                <span className="projects-count">{openAssignments.length}</span>
                            </div>
                            <div className="sort-control">
                                <select className="sort-select" value={assignmentSort} onChange={(e) => setAssignmentSort(e.target.value)}>
                                    <option value="date_asc">Мерзімі ↑ (жуық)</option>
                                    <option value="date_desc">Мерзімі ↓ (алыс)</option>
                                    <option value="name_asc">Тақырып А→Я</option>
                                    <option value="name_desc">Тақырып Я→А</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {sortedOpenAssignments.map(task => (
                                <div key={task.id} className="dashboard-inset">
                                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {task.title}
                                        {task.type && (
                                            <span style={{ fontSize: '12px', padding: '2px 8px', background: 'var(--primary-color)', color: '#fff', borderRadius: '4px' }}>
                                                {task.type === 'coursework' ? 'Курстық жұмыс' : task.type === 'diploma' ? 'Дипломдық жұмыс' : task.type === 'homework' ? 'Үй жұмысы' : task.type === 'lab' ? 'Зертханалық жұмыс' : task.type === 'practice' ? 'Практикалық жұмыс' : 'Басқа'}
                                            </span>
                                        )}
                                    </h3>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-muted)' }}>{task.description}</p>
                                    
                                    {/* Студентке мұғалімнің файлдарын көрсету */}
                                    {task.files_list && task.files_list.filter(f => f && f.file_url).length > 0 && (
                                        <div style={{ margin: '12px 0', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {task.files_list.filter(f => f && f.file_url).map((file, idx) => (
                                                <a key={idx} href={`http://${window.location.hostname}:5000${file.file_url}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', padding: '6px 12px', background: 'var(--bg-elevated)', borderRadius: '6px', color: 'var(--text-main)', textDecoration: 'none', border: '1px solid var(--border-subtle)' }}>
                                                    Тіркелген файл: 📄 ({file.file_type})
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', fontWeight: '600' }}>
                                        <span style={{ color: '#ff9f0a' }}>Мерзімі: {formatDeadline(task.deadline)}</span>
                                        <span style={{ color: 'var(--primary-color)' }}>Оқытушы: {task.teacher_name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {user.role === 'student' && assignments.length > 0 && openAssignments.length === 0 && (
                    <div className="dashboard-card dashboard-success-banner fade-in-up">
                        <p>Барлық мұғалім тапсырмаларына жұмыс жіберілді. Жаңа тапсырма келсе, ол осы жерде көрінеді.</p>
                    </div>
                )}

                {user.role === 'student' && (
                    <div className="dashboard-card upload-card fade-in-up">
                        <div className="card-header">
                            <h2>Жұмысты жүктеу (Жауап беру)</h2>
                        </div>
                        <form onSubmit={handleUpload} className="upload-form">
                            <select className="modern-input" value={selectedAssignment} onChange={(e) => setSelectedAssignment(e.target.value)}>
                                <option value="">Өздігінен еркін жұмыс жүктеу (Тапсырмасыз)</option>
                                {openAssignments.map(task => (
                                    <option key={task.id} value={task.id}>{task.title} — {task.teacher_name}</option>
                                ))}
                            </select>
                            <input className="modern-input" type="text" placeholder="Жұмыстың тақырыбы" value={title} onChange={(e) => setTitle(e.target.value)} required />
                            <textarea className="modern-input" placeholder="Қысқаша сипаттама немесе мұғалімге хабарлама" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
                            
                            <label className="file-upload-label">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                {files.length > 0 ? `${files.length} файл таңдалды` : "Файлдар (жаңа файл қосуға болады: .pdf, .docx, .zip, суреттер)"}
                                <input type="file" multiple style={{ display: 'none' }} onChange={(e) => { setFiles([...files, ...Array.from(e.target.files)]); e.target.value = null; }} />
                            </label>
                            
                            {files.length > 0 && (
                                <ul style={{ listStyleType: 'none', padding: 0, margin: '12px 0', fontSize: '13px' }}>
                                    {files.map((file, index) => (
                                        <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'var(--bg-elevated)', borderRadius: '6px', marginBottom: '8px' }}>
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📄 {file.name}</span>
                                            <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== index))} style={{ padding: '4px', background: 'none', border:'none', cursor:'pointer' }}>❌</button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '16px' }} disabled={uploading}>
                                {uploading ? 'Жүктелуде…' : 'Жұмысты жіберу'}
                            </button>
                        </form>
                    </div>
                )}

                {/* БАРЛЫҚ ЖОБАЛАР (Мұғалім-Дереу Бағалау немесе Студент) */}
                {(user.role === 'student' || (user.role === 'teacher' && activeTeacherTab === 'projects')) && (
                    <>
                        <div className="projects-header fade-in-up">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <h2>Жүктелген жұмыстар тізімі</h2>
                                <span className="projects-count">{projects.length}</span>
                            </div>
                            <div className="sort-control">
                                <select className="sort-select" value={projectSort} onChange={(e) => setProjectSort(e.target.value)}>
                                    <option value="date_desc">Күні ↓ (жаңа)</option>
                                    <option value="date_asc">Күні ↑ (ескі)</option>
                                    <option value="name_asc">Тақырып А→Я</option>
                                    <option value="name_desc">Тақырып Я→А</option>
                                    <option value="status_pending">Күй: Тексерілуде</option>
                                    <option value="status_accepted">Күй: Қабылданды</option>
                                    {user.role === 'teacher' && <option value="author_asc">Студент аты А→Я</option>}
                                </select>
                            </div>
                        </div>

                        {projects.length === 0 ? (
                            <div className="empty-state fade-in-up">
                                <h3>Әзірге ешқандай жұмыс жоқ</h3>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {sortedProjects.map((proj, index) => (
                                    <div key={proj.id} id={`project-${proj.id}`} className={`dashboard-card project-card fade-in-up ${activeProject === proj.id ? 'highlight' : ''}`} style={{ margin: 0, border: activeProject === proj.id ? '2px solid var(--primary-color)' : 'none', transition: 'all 0.3s' }}>
                                        <div className="project-header">
                                            <h3 className="project-title">{proj.title}</h3>
                                            <span className={`status-badge status-${proj.status}`}>
                                                {proj.status === 'accepted' ? 'Қабылданды' : proj.status === 'rejected' ? 'Қайтарылды' : 'Тексерілуде'}
                                            </span>
                                        </div>
                                        
                                        <div className="project-meta">
                                            <div className="project-author">{proj.first_name} {proj.last_name}</div>
                                            {proj.assignment_title && (
                                                <div style={{ fontSize: '13px', color: 'var(--primary-color)', fontWeight: '600' }}>
                                                    Тапсырма: {proj.assignment_title} 
                                                    ({proj.assignment_type === 'coursework' ? 'Курстық ж' : proj.assignment_type === 'homework' ? 'Үй ж' : 'Басқа'})
                                                </div>
                                            )}
                                        </div>

                                        <p className="project-desc">{proj.description}</p>
                                        
                                        {proj.files_list && proj.files_list.filter(f => f && f.file_url).length > 0 && (
                                            <div className="project-file" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {proj.files_list.filter(f => f && f.file_url).map((file, index) => (
                                                    <a key={index} href={`http://${window.location.hostname}:5000${file.file_url}`} target="_blank" rel="noreferrer">
                                                        📄 Құжатты ашу ({file.file_type})
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {(proj.status === 'accepted' || proj.status === 'rejected') && proj.grade !== null && (
                                            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', border: `1px solid ${proj.status === 'accepted' ? 'rgba(48, 209, 88, 0.3)' : 'rgba(255, 69, 58, 0.3)'}` }}>
                                                <h4 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {proj.status === 'accepted' ? 'Қабылданды' : 'Қайтарылды'} 
                                                    <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: proj.status === 'accepted' ? '#30d158' : '#ff453a' }}>Баға: {proj.grade}</span>
                                                </h4>
                                                {proj.comment_text && <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}><strong>Пікір:</strong> {proj.comment_text}</p>}
                                            </div>
                                        )}

                                        {proj.repo_url ? (
                                            <div className="github-box">
                                                <div className="github-box-header">
                                                    <a href={proj.repo_url} target="_blank" rel="noreferrer">{proj.repo_name || 'Репозиторийді ашу'}</a>
                                                </div>
                                                <div className="github-meta">
                                                    <span>{proj.language || 'Белгісіз'}</span>
                                                    <span>Жұлдыз: {proj.stars_count || 0}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            user.role === 'student' && proj.status === 'pending' && (
                                                <div style={{ marginTop: '15px' }}>
                                                    {activeGitProject === proj.id ? (
                                                        <div className="inline-form">
                                                            <input className="modern-input" type="url" placeholder="https://github.com/..." value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required />
                                                            <button className="btn-primary" onClick={() => handleAddGithub(proj.id)}>Сақтау</button>
                                                            <button className="btn-outline-small" onClick={() => setActiveGitProject(null)}>Болдырмау</button>
                                                        </div>
                                                    ) : (
                                                        <button className="btn-outline-small" onClick={() => setActiveGitProject(proj.id)}>+ GitHub сілтемесін қосу</button>
                                                    )}
                                                </div>
                                            )
                                        )}

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
                                                        <button className="btn-outline-small" onClick={() => setActiveProject(proj.id)}>Тексеру және бағалау</button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;