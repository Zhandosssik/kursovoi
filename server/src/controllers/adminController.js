const { pool } = require('../config/db');

const getStats = async (req, res) => {
    try {
        const [roleCounts, groupsCount, projectsCount] = await Promise.all([
            pool.query(`
                SELECT r.name AS role, COUNT(*)::int AS c
                FROM users u
                JOIN roles r ON u.role_id = r.id
                GROUP BY r.name
            `),
            pool.query('SELECT COUNT(*)::int AS c FROM groups'),
            pool.query('SELECT COUNT(*)::int AS c FROM projects'),
        ]);

        const users = { student: 0, teacher: 0, admin: 0 };
        roleCounts.rows.forEach((row) => {
            if (users[row.role] !== undefined) users[row.role] = row.c;
        });

        res.json({
            users,
            groups: groupsCount.rows[0].c,
            projects: projectsCount.rows[0].c,
        });
    } catch (error) {
        console.error('admin stats:', error);
        res.status(500).json({ message: 'Статистика алу қатесі' });
    }
};

module.exports = { getStats };
