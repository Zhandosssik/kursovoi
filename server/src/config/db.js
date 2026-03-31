const { Pool } = require('pg');
require('dotenv').config();

// Дерекқорға қосылу пулы (Пул подключений к БД)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Қосылымды тексеру (Проверка подключения)
pool.connect((err, client, release) => {
    if (err) {
        console.error('Дерекқорға қосылу қатесі (Ошибка БД):', err.stack);
    } else {
        console.log('Дерекқорға сәтті қосылды (Успешное подключение к БД)');
    }
    if (client) release();
});

module.exports = { pool };