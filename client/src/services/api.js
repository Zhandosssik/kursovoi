import axios from 'axios';

// Негізгі API баптаулары (Базовая настройка)
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Бэкенд сервердің мекенжайы
});

// Әрбір сұраныс алдында токенді қосу (Интерцептор для добавления токена)
api.interceptors.request.use(
    (config) => {
        // Локалды сақтағыштан токенді алу (Браузердің LocalStorage)
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;