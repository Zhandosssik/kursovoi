import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Home() {
    const { user } = useContext(AuthContext);

    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
    }

    return (
        <div className="home-page">
            <div className="bg-orbs" aria-hidden="true"></div>

            {/* ── HERO ── */}
            <section className="hero">
                <div className="container hero-container">
                    <div className="hero-content">
                        <div className="badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                            <span>Университеттік портал</span>
                        </div>
                        <h1 className="hero-title">
                            Болашақ энергиясы —&nbsp;<br/>
                            <span>Курстық жобалар</span>&nbsp;порталы
                        </h1>
                        <p className="hero-description">
                            Студенттердің зерттеу жұмыстарын басқаруға арналған бірыңғай экожүйе.
                            GitHub-пен интеграция және оқытушылардың тексеруі мен бағалауы.
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
                            <div className="stat-item"><strong>100%</strong> <span>Қауіпсіз жүктеу</span></div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        {/* Main card */}
                        <div className="hero-card-preview">
                            <div className="preview-header">
                                <span className="dot red"></span>
                                <span className="dot yellow"></span>
                                <span className="dot green"></span>
                                <span className="preview-title-text">Диплом жобасы 2025</span>
                            </div>
                            <div className="preview-body">
                                <div className="skeleton-line long"></div>
                                <div className="skeleton-line medium"></div>
                                <div className="status-badge-preview">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    Баға: 95/100
                                </div>
                            </div>
                        </div>

                        {/* Floating notification */}
                        <div className="hero-notif hero-notif--1">
                            <div className="hero-notif__icon hero-notif__icon--green">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <div>
                                <div className="hero-notif__title">Жоба қабылданды!</div>
                                <div className="hero-notif__sub">Оқытушы Асанов А.</div>
                            </div>
                        </div>

                        {/* Floating progress card */}
                        <div className="hero-notif hero-notif--2">
                            <div className="hero-notif__icon hero-notif__icon--blue">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <div>
                                <div className="hero-notif__title">Жүктелуде…</div>
                                <div className="hero-notif__bar">
                                    <div className="hero-notif__bar-fill"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Scroll indicator */}
                <div className="hero-scroll-hint" aria-hidden="true">
                    <div className="hero-scroll-mouse">
                        <div className="hero-scroll-wheel"></div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Процесс</div>
                        <h2 className="section-title">Қалай жұмыс істейді?</h2>
                        <p className="section-sub">3 қарапайым қадам — жобаңыз дайын</p>
                    </div>
                    <div className="steps-row">
                        <div className="step-card">
                            <div className="step-num">01</div>
                            <div className="step-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            </div>
                            <h3>Тіркелу</h3>
                            <p>Аккаунт жасап, студент немесе оқытушы ретінде кіріңіз</p>
                        </div>
                        <div className="step-connector" aria-hidden="true">
                            <svg width="40" height="12" viewBox="0 0 40 12"><path d="M0 6 Q20 0 40 6" stroke="url(#arrowGrad)" strokeWidth="2" fill="none" strokeDasharray="4 3"/><defs><linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#2997ff"/><stop offset="100%" stopColor="#5e5ce6"/></linearGradient></defs></svg>
                        </div>
                        <div className="step-card">
                            <div className="step-num">02</div>
                            <div className="step-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <h3>Жоба жүктеу</h3>
                            <p>Файл немесе GitHub сілтемесін тапсырмаға тіркеңіз</p>
                        </div>
                        <div className="step-connector" aria-hidden="true">
                            <svg width="40" height="12" viewBox="0 0 40 12"><path d="M0 6 Q20 0 40 6" stroke="url(#arrowGrad)" strokeWidth="2" fill="none" strokeDasharray="4 3"/></svg>
                        </div>
                        <div className="step-card">
                            <div className="step-num">03</div>
                            <div className="step-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            </div>
                            <h3>Баға алу</h3>
                            <p>Оқытушы тексеріп, баға мен пікір береді — онлайн!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="features">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Мүмкіндіктер</div>
                        <h2 className="section-title">Неге бізді таңдайды?</h2>
                        <p className="section-sub">Заманауи платформа — студенттер мен оқытушыларға</p>
                    </div>
                    <div className="features-grid features-grid--4">
                        <div className="feature-card feature-card--glow">
                            <div className="icon-wrapper">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <h3>Жылдам жүктеу</h3>
                            <p>Курстық жұмыстар мен дипломдарды санаулы секундта жіберіңіз.</p>
                        </div>
                        <div className="feature-card feature-card--glow">
                            <div className="icon-wrapper">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                            </div>
                            <h3>GitHub байланысы</h3>
                            <p>Кодты тікелей репозиторийден тексеру мүмкіндігі.</p>
                        </div>
                        <div className="feature-card feature-card--glow">
                            <div className="icon-wrapper">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                            </div>
                            <h3>Оқытушы тексеруі</h3>
                            <p>Пікір мен баға оқытушы арқылы беріледі, мәртебені қадағалаңыз.</p>
                        </div>
                        <div className="feature-card feature-card--glow">
                            <div className="icon-wrapper">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                            <h3>Қауіпсіздік</h3>
                            <p>Деректер шифрланып сақталады. Тек рұқсат берілген адам ғана кіре алады.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section className="testimonials">
                <div className="container">
                    <div className="section-header">
                        <div className="section-label">Пікірлер</div>
                        <h2 className="section-title">Пайдаланушылар не дейді?</h2>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-text">«UniPortal арқасында тапсырмаларды вақтылы тапсыру оңай болды. Бәрін бір жерден басқарамын!»</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar testimonial-avatar--A">А</div>
                                <div>
                                    <strong>Айгерім Бекова</strong>
                                    <span>Студент, 3-курс</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card testimonial-card--featured">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-text">«Жобаларды тексеру процесі мүлдем жеңілдеді. GitHub интеграциясы өте ыңғайлы — кодты тікелей платформада көремін.»</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar testimonial-avatar--M">М</div>
                                <div>
                                    <strong>Мұхтар Асанов</strong>
                                    <span>Оқытушы, Информатика</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-text">«Дизайны жақсы, жылдамдығы керемет. Бұрын email арқылы тапсыратынбыз, енді бәрі автоматты.»</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar testimonial-avatar--D">Д</div>
                                <div>
                                    <strong>Дарина Сейткали</strong>
                                    <span>Студент, 4-курс</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <div className="cta-orb" aria-hidden="true"></div>
                        <div className="cta-content">
                            <h2 className="cta-title">Бүгін бастаңыз</h2>
                            <p className="cta-sub">Тіркелу тегін және 1 минут алады. Академиялық ортаңызды жаңа деңгейге шығарыңыз.</p>
                            <div className="cta-actions">
                                <Link to="/register" className="btn btn-primary btn-lg">
                                    Тегін тіркелу
                                </Link>
                                <Link to="/login" className="btn btn-outline btn-lg">
                                    Кіру
                                </Link>
                            </div>
                        </div>
                        <div className="cta-badge-row" aria-hidden="true">
                            <div className="cta-badge">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                Тіркеу — тегін
                            </div>
                            <div className="cta-badge">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                Техникалық қолдау
                            </div>
                            <div className="cta-badge">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                Деректер қорғалған
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="home-footer">
                <div className="container home-footer__inner">
                    <div className="home-footer__brand">
                        <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                            <defs>
                                <linearGradient id="footLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                                    <stop offset="0%" stopColor="#2997ff"/><stop offset="100%" stopColor="#5e5ce6"/>
                                </linearGradient>
                            </defs>
                            <path d="M24 4L44 14V26C44 35.4 35.2 43.6 24 46C12.8 43.6 4 35.4 4 26V14L24 4Z" stroke="url(#footLogoGrad)" strokeWidth="2" fill="none"/>
                            <path d="M14 22L24 28L34 22M24 14L34 20V28M14 20V28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>UniPortal</span>
                    </div>
                    <p className="home-footer__copy">© 2025 UniPortal. Барлық құқықтар қорғалған.</p>
                    <div className="home-footer__links">
                        <Link to="/login">Кіру</Link>
                        <Link to="/register">Тіркелу</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;