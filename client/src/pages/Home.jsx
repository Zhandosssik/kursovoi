import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div style={{ backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
            
            {/* Басты сәлемдесу блогы (Hero Split-Screen) */}
            <div className="hero-wrapper">
                {/* Дизайн үшін фондық фигура */}
                <div className="hero-blob"></div>
                
                <div className="hero-content">
                    {/* Сол жақ: Мәтін мен Батырмалар */}
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Университеттің <br/> <span>Жобалар Порталы</span>
                        </h1>
                        <p className="hero-subtitle">
                            Студенттік жұмыстарды жүктеуге, тексеруге және Жасанды Интеллект (AI) көмегімен автоматты түрде бағалауға арналған заманауи академиялық платформа.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register" className="btn-primary" style={{ padding: '14px 28px', textDecoration: 'none', display: 'inline-block', margin: 0, fontSize: '16px' }}>
                                Бастау үшін тіркеліңіз
                            </Link>
                            <Link to="/login" className="btn-outline" style={{ padding: '14px 28px' }}>
                                Жүйеге кіру
                            </Link>
                        </div>
                    </div>

                    {/* Оң жақ: Кәсіби Иллюстрация / Фото */}
                    <div className="hero-image-container">
                        {/* Unsplash сайтынан алынған жоғары сапалы студенттердің суреті */}
                        <img 
                            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80" 
                            alt="Студенттер жұмыс істеп жатыр" 
                            className="hero-img"
                        />
                    </div>
                </div>
            </div>

            {/* Мүмкіндіктерді сипаттайтын блоктар (Cards) */}
            <div className="features-section">
                <div className="feature-card">
                    <div className="feature-icon">🎓</div>
                    <h3 className="feature-title">Студенттерге</h3>
                    <p className="feature-desc">Курстық және дипломдық жұмыстарыңызды жүктеп, GitHub сілтемелерін қосып, оқытушыдан тікелей баға алыңыз.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">👨‍🏫</div>
                    <h3 className="feature-title">Оқытушыларға</h3>
                    <p className="feature-desc">Студенттердің жұмысын бір жерден қадағалап, ыңғайлы интерфейс арқылы тексеріп, кері байланыс қалдырыңыз.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🤖</div>
                    <h3 className="feature-title">AI Көмекшісі</h3>
                    <p className="feature-desc">Жасанды интеллект студенттердің кодын және жұмысын автоматты түрде талдап, дәл баға мен конструктивті пікір ұсынады.</p>
                </div>
            </div>

        </div>
    );
}

export default Home;