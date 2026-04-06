import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
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
                UniPortal
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
            </div>
        </nav>
    );
}

export default Navbar;
