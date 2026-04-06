import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function AdminPanel() {
    const { user } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loadError, setLoadError] = useState('');

    const fetchData = async () => {
        setLoadError('');
        try {
            const [groupsRes, teachersRes, statsRes] = await Promise.all([
                api.get('/groups'),
                api.get('/groups/teachers'),
                api.get('/admin/stats'),
            ]);
            setGroups(groupsRes.data);
            setTeachers(teachersRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Деректерді жүктеу қатесі', error);
            setLoadError(error.response?.data?.message || 'Деректерді жүктеу мүмкін болмады.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAssignTeacher = async (groupId, teacherId) => {
        try {
            await api.put(`/groups/${groupId}/assign`, { teacherId: teacherId || null });
            await fetchData();
        } catch (error) {
            alert('Қате: ' + (error.response?.data?.message || error.message));
        }
    };

    if (!user) {
        return <div style={{ padding: '40px', textAlign: 'center' }}>Жүктелуде...</div>;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <div className="dashboard-header fade-in-up">
                    <div>
                        <h1 className="dashboard-title">Әкімшілік панелі</h1>
                        <p className="dashboard-subtitle">
                            Топтар мен оқытушыларды басқару, жүйе статистикасы
                        </p>
                    </div>
                    <div className="user-badge">
                        <div className="user-role-icon" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        </div>
                        <div className="user-info">
                            <strong>{user.firstName} {user.lastName}</strong>
                            <span>Әкімші</span>
                        </div>
                    </div>
                </div>

                {loadError ? (
                    <div className="dashboard-card fade-in-up" style={{ borderLeft: '3px solid #ff453a' }}>
                        <p style={{ margin: 0, color: '#ff9f8f' }}>{loadError}</p>
                    </div>
                ) : null}

                {stats && (
                    <div
                        className="fade-in-up"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '16px',
                            marginBottom: '24px',
                        }}
                    >
                        {[
                            { label: 'Студенттер', value: stats.users?.student ?? 0 },
                            { label: 'Оқытушылар', value: stats.users?.teacher ?? 0 },
                            { label: 'Әкімшілер', value: stats.users?.admin ?? 0 },
                            { label: 'Топтар', value: stats.groups ?? 0 },
                            { label: 'Жобалар', value: stats.projects ?? 0 },
                        ].map((card) => (
                            <div key={card.label} className="dashboard-card admin-stat-card">
                                <div className="admin-stat-value">{card.value}</div>
                                <div className="admin-stat-label">{card.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="dashboard-card fade-in-up" style={{ animationDelay: '0.05s' }}>
                    <div className="card-header" style={{ marginBottom: '16px', alignItems: 'flex-start' }}>
                        <div className="card-header-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Әкімшінің мүмкіндіктері</h2>
                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
                                Оқытушыны топқа бекітесіз — сол топтың студенттері тек осы оқытушының тапсырмаларын көреді.
                            </p>
                        </div>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-main)', lineHeight: 1.7 }}>
                        <li>Топтар тізімін көру</li>
                        <li>Әр топқа кураторлық ететін оқытушыны таңдау немесе босату</li>
                        <li>Жүйедегі қолданушылар мен жобалардың санын бақылау</li>
                    </ul>
                </div>

                <div className="projects-header fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <h2>Топтар мен оқытушылар</h2>
                    <span className="projects-count">{groups.length}</span>
                </div>

                {groups.length === 0 && !loadError ? (
                    <div className="empty-state fade-in-up">
                        <div className="empty-icon" aria-hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <line x1="3" y1="9" x2="21" y2="9" />
                                <line x1="9" y1="21" x2="9" y2="9" />
                            </svg>
                        </div>
                        <h3>Топтар әлі жоқ</h3>
                        <p>Дерекқорда топтар қосылғаннан кейін олар осы жерде көрінеді.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {groups.map((group, index) => (
                            <div
                                key={group.id}
                                className="dashboard-card project-card fade-in-up"
                                style={{ animationDelay: `${0.05 * index}s`, margin: 0 }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '16px',
                                    }}
                                >
                                    <div>
                                        <h3 className="project-title" style={{ marginBottom: '4px' }}>
                                            {group.name}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                                            ID: {group.id}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                                            Оқытушы:
                                        </span>
                                        <select
                                            className="modern-input"
                                            value={group.teacher_id || ''}
                                            onChange={(e) => handleAssignTeacher(group.id, e.target.value)}
                                            style={{ minWidth: '220px' }}
                                        >
                                            <option value="">— Таңдалмаған —</option>
                                            {teachers.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.first_name} {t.last_name} ({t.email})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
