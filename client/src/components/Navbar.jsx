import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Шыққан соң Басты бетке жібереміз
    };

    return (
        <nav style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '15px 40px', 
            backgroundColor: '#FFFFFF', 
            borderBottom: '1px solid #E5E7EB',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <div>
                <Link to="/" style={{ color: '#0056D2', textDecoration: 'none', fontSize: '22px', fontWeight: 'bold' }}>
                    🎓 UniPortal
                </Link>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span style={{ color: '#4B5563', fontWeight: '500', fontSize: '15px' }}>
                            Сәлем, {user.first_name}! ({user.role === 'teacher' ? 'Оқытушы' : user.role === 'admin' ? 'Админ' : 'Студент'})
                        </span>
                        
                        <Link to="/dashboard" style={{ color: '#374151', textDecoration: 'none', fontWeight: '500' }}>
                            Бақылау тақтасы
                        </Link>

                        {user.role === 'admin' && (
                            <Link to="/admin" style={{ color: '#0056D2', textDecoration: 'none', fontWeight: '600' }}>
                                Админ Панель
                            </Link>
                        )}
                        
                        <button 
                            onClick={handleLogout} 
                            style={{ 
                                padding: '8px 16px', 
                                backgroundColor: '#F3F4F6', 
                                color: '#374151', 
                                border: '1px solid #D1D5DB', 
                                borderRadius: '6px', 
                                cursor: 'pointer',
                                fontWeight: '500',
                                transition: '0.2s'
                            }}
                        >
                            Шығу
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ color: '#374151', textDecoration: 'none', fontWeight: '500' }}>Кіру</Link>
                        <Link to="/register" style={{ 
                            padding: '8px 16px', 
                            backgroundColor: '#0056D2', 
                            color: 'white', 
                            textDecoration: 'none', 
                            borderRadius: '6px',
                            fontWeight: '500'
                        }}>
                            Тіркелу
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;