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

    if (!user) return <div style={{ padding: '40px', textAlign: 'center' }}>Жүйеге кіріңіз...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ fontWeight: '800', fontSize: '2.5rem', marginBottom: '30px', color: '#1d1d1f' }}>
                Бақылау тақтасы 🚀
            </h1>

            {/* СТУДЕНТТІҢ ЖОБА ЖҮКТЕУ ФОРМАСЫ */}
            {user.role === 'student' && (
                <div className="glass-container">
                    <h2 style={{ marginTop: 0 }}>Жаңа жоба жүктеу</h2>
                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input className="glass-input" type="text" placeholder="Жоба тақырыбы" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        <textarea className="glass-input" placeholder="Қысқаша сипаттама" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
                        <input className="glass-input" type="file" accept=".pdf,.docx,.doc" onChange={(e) => setFile(e.target.files[0])} required />
                        <button type="submit" className="glass-btn glass-btn-primary" disabled={uploading}>
                            {uploading ? 'Жүктелуде...' : '✨ Жобаны жіберу'}
                        </button>
                    </form>
                </div>
            )}

            <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>Жүктелген жұмыстар</h2>
            {projects.length === 0 ? <p>Әзірге ешқандай жұмыс жоқ.</p> : null}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {projects.map((proj) => (
                    <div key={proj.id} className="glass-container">
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>
                            {proj.title} 
                            <span style={{ fontSize: '14px', marginLeft: '10px', padding: '4px 10px', borderRadius: '20px', backgroundColor: proj.status === 'accepted' ? '#d4edda' : proj.status === 'rejected' ? '#f8d7da' : '#fff3cd', color: proj.status === 'accepted' ? '#155724' : proj.status === 'rejected' ? '#721c24' : '#856404' }}>
                                {proj.status}
                            </span>
                        </h3>
                        <p style={{ color: '#555', marginBottom: '15px' }}><strong>Авторы:</strong> {proj.first_name} {proj.last_name}</p>
                        <p style={{ lineHeight: '1.6' }}>{proj.description}</p>
                        
                        {proj.file_url && (
                            <div style={{ margin: '15px 0' }}>
                                📄 <a href={`http://localhost:5000${proj.file_url}`} target="_blank" rel="noreferrer" style={{ color: '#0071e3', textDecoration: 'none', fontWeight: '600' }}>
                                    Құжатты ашу ({proj.file_type})
                                </a>
                            </div>
                        )}

                        {proj.repo_url ? (
                            <div className="glass-github">
                                <p style={{ margin: '0 0 5px 0' }}><strong>GitHub:</strong> <a href={proj.repo_url} target="_blank" rel="noreferrer" style={{ color: '#1d1d1f', textDecoration: 'none', fontWeight: 'bold' }}>{proj.repo_name || 'Сілтеме'}</a></p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                                    <strong>Тіл:</strong> {proj.language || 'Белгісіз'} | <strong>Жұлдыздар:</strong> ⭐ {proj.stars_count}
                                </p>
                            </div>
                        ) : (
                            user.role === 'student' && proj.status === 'pending' && (
                                <div style={{ marginTop: '15px' }}>
                                    {activeGitProject === proj.id ? (
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input className="glass-input" type="url" placeholder="https://github.com/..." value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} required />
                                            <button className="glass-btn" onClick={() => handleAddGithub(proj.id)}>Сақтау</button>
                                            <button className="glass-btn" onClick={() => setActiveGitProject(null)}>Болдырмау</button>
                                        </div>
                                    ) : (
                                        <button className="glass-btn" onClick={() => setActiveGitProject(proj.id)}>
                                            + GitHub сілтемесін қосу
                                        </button>
                                    )}
                                </div>
                            )
                        )}

                        {user.role === 'teacher' && proj.status === 'pending' && (
                            <div style={{ marginTop: '20px' }}>
                                {activeProject === proj.id ? (
                                    <div className="glass-github" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <textarea className="glass-input" placeholder="Пікіріңіз..." value={gradeData.text} onChange={(e) => setGradeData({...gradeData, text: e.target.value})} />
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <input className="glass-input" type="number" placeholder="Баға (0-100)" value={gradeData.grade} onChange={(e) => setGradeData({...gradeData, grade: e.target.value})} style={{ width: '150px' }} />
                                            <select className="glass-input" value={gradeData.status} onChange={(e) => setGradeData({...gradeData, status: e.target.value})} style={{ width: '150px' }}>
                                                <option value="accepted">Қабылдау</option>
                                                <option value="rejected">Қайтару</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className="glass-btn glass-btn-primary" onClick={() => handleReview(proj.id)}>Сақтау</button>
                                            <button className="glass-btn" onClick={() => setActiveProject(null)}>Болдырмау</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button className="glass-btn" onClick={() => setActiveProject(proj.id)} style={{ marginRight: '10px' }}>
                                        ✍️ Тексеру және Бағалау
                                    </button>
                                )}
                            </div>
                        )}

                        {user.role === 'teacher' && (
                            <button 
                                className="glass-btn glass-btn-primary"
                                onClick={() => handleAIReview(proj.id)}
                                style={{ marginTop: '15px', display: 'block' }}
                            >
                                🤖 AI көмекшісімен тексеру
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;