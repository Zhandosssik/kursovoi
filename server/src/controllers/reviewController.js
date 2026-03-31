const { pool } = require('../config/db');

// Жобаны тексеру және бағалау (Проверка и оценка проекта)
const reviewProject = async (req, res) => {
    const client = await pool.connect();
    try {
        const { projectId } = req.params;
        const { status, text, grade } = req.body;
        const teacherId = req.user.id; 

        // Қауіпсіздік: Тек оқытушылар тексере алады (Проверка роли)
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Бұл әрекетке тек оқытушыларға рұқсат етілген' });
        }

        await client.query('BEGIN'); // Транзакция бастау

        // 1. Жобаның мәртебесін жаңарту (status: 'accepted' немесе 'rejected')
        await client.query(
            'UPDATE projects SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [status, projectId]
        );

        // 2. Пікір мен бағаны қосу
        await client.query(
            'INSERT INTO comments (project_id, teacher_id, text, grade) VALUES ($1, $2, $3, $4)',
            [projectId, teacherId, text, grade]
        );

        await client.query('COMMIT'); // Сақтау
        res.status(200).json({ message: 'Жұмыс сәтті тексерілді және бағаланды!' });

    } catch (error) {
        await client.query('ROLLBACK'); // Қате болса кері қайтару
        console.error(error);
        res.status(500).json({ message: 'Серверде қате шықты' });
    } finally {
        client.release();
    }
};

module.exports = { reviewProject };