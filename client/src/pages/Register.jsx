import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'student', groupId: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            alert('Тіркелу сәтті аяқталды!');
            navigate('/login');
        } catch (error) {
            alert('Қате: ' + (error.response?.data?.message || 'Сервер қатесі'));
        }
    };

    return (
        <div className="auth-container">
            {/* Тіркелу формасы сәл кеңірек болуы үшін maxWidth 500px жасадық */}
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <h2 className="auth-title">Тіркелу</h2>
                <p className="auth-subtitle">Жаңа академиялық аккаунт құру</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Аты</label>
                            <input type="text" className="form-input" placeholder="Атыңыз" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Тегі</label>
                            <input type="text" className="form-input" placeholder="Тегіңіз" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Электрондық пошта</label>
                        <input type="email" className="form-input" placeholder="Университет поштасы" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Құпия сөз</label>
                        <input type="password" className="form-input" placeholder="Кем дегенде 6 таңба" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Рөлді таңдаңыз</label>
                        <select className="form-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                            <option value="student">Студент</option>
                            <option value="teacher">Оқытушы</option>
                        </select>
                    </div>

                    {formData.role === 'student' && (
                        <div className="form-group">
                            <label className="form-label">Топ ID (мысалы: 1)</label>
                            <input type="number" className="form-input" placeholder="Топ нөмірі" value={formData.groupId} onChange={(e) => setFormData({...formData, groupId: e.target.value})} />
                        </div>
                    )}

                    <button type="submit" className="btn-primary">Тіркелу</button>
                </form>

                <Link to="/login" className="auth-link">Аккаунтыңыз бар ма? Жүйеге кіру</Link>
            </div>
        </div>
    );
}

export default Register;