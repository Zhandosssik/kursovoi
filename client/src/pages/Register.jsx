import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../services/api';

function EyeIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );
}

function Register() {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'student', group_id: ''
    });
    const [groups, setGroups] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // AuthContext-тен user-ді аламыз
    const { user } = useContext(AuthContext);

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    // Парақша ашылғанда топтар тізімін базадан жүктеп алу
    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await api.get('/auth/groups');
                setGroups(res.data);
            } catch (error) {
                console.error("Топтарды жүктеу қатесі", error);
            }
        };
        fetchGroups();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const dataToSend = {
            first_name: formData.firstName,  
            last_name: formData.lastName,    
            email: formData.email,
            password: formData.password,
            role: formData.role,
            group_id: formData.role === 'student' ? (formData.group_id ? parseInt(formData.group_id) : null) : null
        };

        try {
            await api.post('/auth/register', dataToSend);
            alert('Тіркелу сәтті аяқталды!');
            navigate('/login');
        } catch (error) {
            console.error("Серверден келген жауап:", error.response?.data);
            const errorMsg = error.response?.data?.message || 'Сервер қатесі';
            alert('Қате: ' + errorMsg);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card-modern fade-in-up" style={{ maxWidth: '540px' }}>
                <div className="auth-header">
                    <div className="auth-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                    </div>
                    <h2>Тіркелу</h2>
                    <p>Академиялық ортаға қосылыңыз. Өз аккаунтыңызды жасаңыз.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group-modern">
                            <label>Аты</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                <input type="text" placeholder="Атыңыз" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                            </div>
                        </div>
                        <div className="form-group-modern">
                            <label>Тегі</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                <input type="text" placeholder="Тегіңіз" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                            </div>
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label>Электрондық пошта</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <input type="email" placeholder="университет поштасы" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label>Құпия сөз</label>
                        <div className="input-wrapper input-wrapper--password">
                            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Құпия сөзді жасыру' : 'Құпия сөзді көрсету'}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label>Пайдаланушы рөлі</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                            <select 
                                value={formData.role} 
                                onChange={(e) => setFormData({...formData, role: e.target.value, group_id: ''})}
                                className="modern-select"
                                required
                            >
                                <option value="student">Студент</option>
                                <option value="teacher">Оқытушы</option>
                            </select>
                        </div>
                    </div>

                    {/* Топты тізімнен таңдау */}
                    {formData.role === 'student' && (
                        <div className="form-group-modern fade-in-up">
                            <label>Оқитын тобыңыз</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                                <select 
                                    className="modern-select"
                                    value={formData.group_id} 
                                    onChange={(e) => setFormData({...formData, group_id: e.target.value})} 
                                    required={formData.role === 'student'}
                                >
                                    <option value="" disabled>Топты таңдаңыз...</option>
                                    {groups.map(group => (
                                        <option key={group.id} value={group.id}>{group.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="btn-primary btn-full" style={{ marginTop: '16px' }}>
                        Аккаунт құру
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Аккаунтыңыз бар ма?</span>
                    <Link to="/login" className="auth-link-modern">Жүйеге кіру</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;