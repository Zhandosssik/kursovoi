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
        <div className="auth-split-page">
            {/* LEFT PANEL — Branding */}
            <div className="auth-split-left">
                <div className="auth-split-left__orbs" aria-hidden="true"></div>

                {/* Logo */}
                <div className="auth-brand">
                    <div className="auth-brand__logo">
                        <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                            <defs>
                                <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#2997ff"/>
                                    <stop offset="100%" stopColor="#5e5ce6"/>
                                </linearGradient>
                            </defs>
                            <path d="M24 4L44 14V26C44 35.4 35.2 43.6 24 46C12.8 43.6 4 35.4 4 26V14L24 4Z" fill="url(#logoGrad)" opacity="0.2"/>
                            <path d="M24 4L44 14V26C44 35.4 35.2 43.6 24 46C12.8 43.6 4 35.4 4 26V14L24 4Z" stroke="url(#logoGrad)" strokeWidth="2" fill="none"/>
                            <path d="M14 22L24 28L34 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M24 14L34 20V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 20V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="auth-brand__name">UniPortal</span>
                </div>

                {/* Hero text */}
                <div className="auth-split-hero">
                    <h1 className="auth-split-hero__title">
                        Білімің —<br/>
                        <span>болашағың</span>
                    </h1>
                    <p className="auth-split-hero__sub">
                        Курстық жобаларды басқарудың ең ыңғайлы платформасы
                    </p>
                </div>

                {/* Feature list */}
                <div className="auth-split-features">
                    <div className="auth-split-feature">
                        <div className="auth-split-feature__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Жылдам жүктеу</strong>
                            <span>Файлдарды секундта жіберіңіз</span>
                        </div>
                    </div>
                    <div className="auth-split-feature">
                        <div className="auth-split-feature__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                                <path d="M9 18c-4.51 2-5-2-7-2"/>
                            </svg>
                        </div>
                        <div>
                            <strong>GitHub интеграция</strong>
                            <span>Кодты тікелей тексеріңіз</span>
                        </div>
                    </div>
                    <div className="auth-split-feature">
                        <div className="auth-split-feature__icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 11 12 14 22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Оқытушы бағасы</strong>
                            <span>Жұмыс мәртебесін қадағалаңыз</span>
                        </div>
                    </div>
                </div>

                {/* Decorative floating cards */}
                <div className="auth-split-deco" aria-hidden="true">
                    <div className="auth-split-deco__card auth-split-deco__card--1">
                        <span className="auth-split-deco__badge auth-split-deco__badge--green">✓ Қабылданды</span>
                        <div className="auth-split-deco__line"></div>
                        <div className="auth-split-deco__line auth-split-deco__line--short"></div>
                    </div>
                    <div className="auth-split-deco__card auth-split-deco__card--2">
                        <span className="auth-split-deco__badge auth-split-deco__badge--blue">↑ 95/100</span>
                        <div className="auth-split-deco__line"></div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL — Form */}
            <div className="auth-split-right">
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
        </div>
    );
}

export default Login;
