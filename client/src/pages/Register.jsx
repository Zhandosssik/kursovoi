import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'student', groupId: ''
    });
    const navigate = useNavigate();

    // ... (импорттар сол қалпында қалады)

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // МҰҚИЯТ ҚАРА: Бэкенд snake_case (төменгі сызық) күтеді
        const dataToSend = {
            first_name: formData.firstName,  // firstName -> first_name
            last_name: formData.lastName,    // lastName -> last_name
            email: formData.email,
            password: formData.password,
            role: formData.role,
            group_id: formData.role === 'student' ? (formData.groupId ? parseInt(formData.groupId) : null) : null
        };

        console.log("Серверге кетіп жатқан нақты деректер:", dataToSend);

        try {
            const response = await api.post('/auth/register', dataToSend);
            alert('Тіркелу сәтті аяқталды!');
            navigate('/login');
        } catch (error) {
            // Қате болса, сервер нақты не декенін көреміз
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
                            <input type="email" placeholder="zangar@gmail.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label>Құпия сөз</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <input type="password" placeholder="••••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <label>Пайдаланушы рөлі</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                            <select 
                                value={formData.role} 
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="modern-select"
                                required
                            >
                                <option value="student">Студент</option>
                                <option value="teacher">Оқытушы</option>
                            </select>
                        </div>
                    </div>

                    {formData.role === 'student' && (
                        <div className="form-group-modern fade-in-up">
                            <label>Топ нөмірі (ID)</label>
                            <div className="input-wrapper">
                                <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                                <input type="number" placeholder="Мысалы: 1" value={formData.groupId} onChange={(e) => setFormData({...formData, groupId: e.target.value})} required={formData.role === 'student'} />
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