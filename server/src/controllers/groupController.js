const { pool } = require('../config/db');

// Барлық топтарды алу (Мұны бұрын жазғанбыз)
const getGroups = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM groups ORDER BY name ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Топтарды алу кезінде қате шықты' });
    }
};

// ЖАҢА: Барлық оқытушыларды алу (Админ панель үшін)
const getTeachers = async (req, res) => {
    try {
        // Сенде roles кестесі бар екенін білемін, сондықтан JOIN қолданамыз
        const result = await pool.query(`
            SELECT u.id, u.first_name, u.last_name, u.email 
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE r.name = 'teacher'
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Оқытушыларды алу қатесі' });
    }
};

// ЖАҢА: Оқытушыны топқа бекіту (Админ панель үшін)
const assignTeacher = async (req, res) => {
    try {
        const { groupId } = req.params; // URL-ден топтың ID аламыз
        const { teacherId } = req.body; // Денеден мұғалімнің ID аламыз

        await pool.query(
            'UPDATE groups SET teacher_id = $1 WHERE id = $2', 
            [teacherId || null, groupId] // Егер teacherId бос болса, null қояды (алып тастайды)
        );

        res.status(200).json({ message: 'Оқытушы сәтті бекітілді!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Бекіту кезінде қате шықты' });
    }
};

module.exports = { getGroups, getTeachers, assignTeacher };