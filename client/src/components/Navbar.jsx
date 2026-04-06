import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const displayName = user?.firstName || user?.first_name || '';
    const roleLabel =
        user?.role === 'teacher' ? 'Оқытушы' : user?.role === 'admin' ? 'Әкімші' : 'Студент';

    return (
        <nav className="app-navbar">
            <Link to="/" className="app-navbar__logo">
                <svg width="28" height="28" viewBox="0 0 48 48" fill="none" className="app-navbar__logo-icon">
                    <defs>
                        <linearGradient id="navLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#2997ff"/>
                            <stop offset="100%" stopColor="#5e5ce6"/>
                        </linearGradient>
                    </defs>
                    <path d="M24 4L44 14V26C44 35.4 35.2 43.6 24 46C12.8 43.6 4 35.4 4 26V14L24 4Z" fill="url(#navLogoGrad)" opacity="0.25"/>
                    <path d="M24 4L44 14V26C44 35.4 35.2 43.6 24 46C12.8 43.6 4 35.4 4 26V14L24 4Z" stroke="url(#navLogoGrad)" strokeWidth="2" fill="none"/>
                    <path d="M14 22L24 28L34 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M24 14L34 20V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 20V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="app-navbar__logo-text">UniPortal</span>
            </Link>

            <div className="app-navbar__nav">
                {user ? (
                    <>
                        <span className="app-navbar__muted">
                            {displayName} · {roleLabel}
                        </span>

                        {user.role === 'admin' ? (
                            <Link to="/admin" className="app-navbar__link app-navbar__link--accent">
                                Әкімшілік
                            </Link>
                        ) : (
                            <Link to="/dashboard" className="app-navbar__link">
                                Тақта
                            </Link>
                        )}

                        <button type="button" className="app-navbar__btn" onClick={handleLogout}>
                            Шығу
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="app-navbar__link">
                            Кіру
                        </Link>
                        <Link to="/register" className="app-navbar__cta">
                            Тіркелу
                        </Link>
                    </>
                )}

                {/* Theme toggle button */}
                <button
                    type="button"
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={theme === 'dark' ? 'Жарық тема' : 'Қараңғы тема'}
                >
                    {theme === 'dark' ? (
                        /* Sun icon */
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"/>
                            <line x1="12" y1="1" x2="12" y2="3"/>
                            <line x1="12" y1="21" x2="12" y2="23"/>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                            <line x1="1" y1="12" x2="3" y2="12"/>
                            <line x1="21" y1="12" x2="23" y2="12"/>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                        </svg>
                    ) : (
                        /* Moon icon */
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                        </svg>
                    )}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
