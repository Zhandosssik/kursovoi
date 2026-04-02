import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import api from '../services/api';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // AuthContext-тен login функциясымен қатар user-ді де аламыз
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Егер қолданушы жүйеге кіріп тұрса, Dashboard-қа лақтырады
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // СЕРВЕРГЕ СҰРАНЫС ЖІБЕРУ
            const response = await api.post('/auth/login', { email, password });
            
            // Серверден келген user мен token-ді контекстке жіберу
            login(response.data.user, response.data.token);
            
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Қате: Логин немесе пароль дұрыс емес немесе сервер жұмыс істемей тұр!');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card-modern fade-in-up">
                <div className="auth-header">
                    <div className="auth-icon">
                        {/* Иконка замка (Security) */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <h2>Жүйеге кіру</h2>
                    <p>Қайта оралғаныңызбен! Жалғастыру үшін мәліметтеріңізді енгізіңіз.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group-modern">
                        <label>Электрондық пошта</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <input 
                                type="email" 
                                placeholder="user@university.edu" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group-modern">
                        <div className="label-row">
                            <label>Құпия сөз</label>
                            <a href="#" className="forgot-password">Ұмыттыңыз ба?</a>
                        </div>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary btn-full">
                        Кіру
                    </button>
                </form>
                
                <div className="auth-footer">
                    <span>Аккаунтыңыз жоқ па?</span>
                    <Link to="/register" className="auth-link-modern">Тіркелу</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;