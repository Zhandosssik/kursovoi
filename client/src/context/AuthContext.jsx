import React, { createContext, useState, useEffect } from 'react';

// Контекст құру (Создаем контекст)
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Қолданушы мәліметін сақтайтын күй (Стейт для хранения юзера)
    const [user, setUser] = useState(null);

    // Сайт жаңартылғанда токенді тексеру (Проверка данных при обновлении страницы F5)
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData)); // Егер токен болса, қолданушыны қалпына келтіру
        }
    }, []);

    // Жүйеге кіру функциясы (Функция логина)
    const login = (userData, token) => {
        localStorage.setItem('token', token); // Токенді сақтау
        localStorage.setItem('user', JSON.stringify(userData)); // Қолданушы деректерін сақтау
        setUser(userData); // Стейтті жаңарту
    };

    // Жүйеден шығу функциясы (Функция логаута)
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};