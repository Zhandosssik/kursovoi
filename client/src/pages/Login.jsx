import React, { useState, useContext } from 'react';
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

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data.user, response.data.token);
            const role = response.data.user?.role;
            navigate(role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message ||
                (err.response?.status === 400 || err.response?.status === 401
                    ? 'Пошта немесе құпия сөз дұрыс емес.'
                    : null) ||
                (err.code === 'ERR_NETWORK' ? 'Серверге қосылу мүмкін емес.' : null) ||
                'Кіру сәтсіз аяқталды. Әрекетті қайталаңыз.';
            setError(msg);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card-modern fade-in-up">
                <div className="auth-header">
                    <div className="auth-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                    <h2>Жүйеге кіру</h2>
                    <p>Жалғастыру үшін мәліметтеріңізді енгізіңіз.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error ? (
                        <div className="auth-error-banner" role="alert">
                            {error}
                        </div>
                    ) : null}
                    <div className="form-group-modern">
                        <label>Электрондық пошта</label>
                        <div className="input-wrapper">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <polyline points="22,6 12,13 2,6" />
                            </svg>
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
                            <a href="#" className="forgot-password" onClick={(e) => e.preventDefault()}>
                                Ұмыттыңыз ба?
                            </a>
                        </div>
                        <div className="input-wrapper input-wrapper--password">
                            <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
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

                    <button type="submit" className="btn-primary btn-full">
                        Кіру
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Аккаунтыңыз жоқ па?</span>
                    <Link to="/register" className="auth-link-modern">
                        Тіркелу
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
