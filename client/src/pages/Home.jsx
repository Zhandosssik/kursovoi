import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Home() {
    const { user } = useContext(AuthContext);

    // Егер адам жүйеге кіріп тұрса (user бар болса), 
    // оны басты бетте ұстамай, бірден Бақылау тақтасына (Dashboard) лақтырамыз
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="badge">
                            {/* Иконка AI/Sparkles */}
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                            <span>AI-Powered Platform</span>
                        </div>
                        <h1 className="hero-title">
                            Болашақ энергиясы — <br/>
                            <span>Интеллектуалды жобалар</span> порталы
                        </h1>
                        <p className="hero-description">
                            Студенттердің зерттеу жұмыстарын басқаруға арналған бірыңғай экожүйе. 
                            GitHub-пен интеграция және жасанды интеллект арқылы автоматты сараптама.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Жұмысты бастау
                            </Link>
                            <Link to="/login" className="btn btn-secondary btn-lg">
                                Жүйеге кіру
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item"><strong>1000+</strong> <span>Жобалар</span></div>
                            <div className="stat-item"><strong>50+</strong> <span>Оқытушылар</span></div>
                            <div className="stat-item"><strong>24/7</strong> <span>AI Сараптама</span></div>
                        </div>
                    </div>
                    
                    <div className="hero-visual">
                        <div className="hero-card-preview">
                            <div className="preview-header">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                            </div>
                            <div className="preview-body">
                                <div className="skeleton-line long"></div>
                                <div className="skeleton-line medium"></div>
                                <div className="ai-badge-preview">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    AI Score: 95/100
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title">Неге бізді таңдайды?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="icon-wrapper">
                                {/* Иконка "Жылдамдық / Upload" */}
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <h3>Жылдам жүктеу</h3>
                            <p>Курстық жұмыстар мен дипломдарды санаулы секундта жіберіңіз.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-wrapper">
                                {/* Иконка "GitHub" */}
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                            </div>
                            <h3>GitHub байланысы</h3>
                            <p>Кодты тікелей репозиторийден тексеру мүмкіндігі.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-wrapper">
                                {/* Иконка "AI / Brain" */}
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ai-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                            </div>
                            <h3>AI Рецензия</h3>
                            <p>Жасанды интеллект қателерді тауып, жақсарту бойынша кеңес береді.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;