const { pool } = require('../config/db');

// Жобаны жүктеу (Загрузка проекта студентом)
const uploadProject = async (req, res) => {
    const client = await pool.connect();
    try {
        // assignment_id қосылды (Фронтендтен келеді)
        const { title, description, assignment_id } = req.body;
        const studentId = req.user.id;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Файл таңдалмады!' });
        }

        await client.query('BEGIN');

        // Егер студент тапсырмасыз жүктесе (еркін тақырып), онда null болады
        const targetAssignmentId = assignment_id ? assignment_id : null;

        // projects кестесіне assignment_id-ді де сақтаймыз
        const projectResult = await client.query(
            'INSERT INTO projects (student_id, title, description, assignment_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [studentId, title, description, targetAssignmentId]
        );
        const projectId = projectResult.rows[0].id;

        for (const file of req.files) {
            const fileUrl = `/uploads/${file.filename}`;
            const fileExt = file.originalname.split('.').pop().toLowerCase();
            const fileType = fileExt; // 'pdf', 'jpg', 'zip' etc.

            await client.query(
                'INSERT INTO files (project_id, file_url, file_type) VALUES ($1, $2, $3)',
                [projectId, fileUrl, fileType]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Жоба сәтті жүктелді!', projectId });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Жоба жүктеу қатесі:", error);
        res.status(500).json({ message: 'Серверде қате шықты' });
    } finally {
        client.release();
    }
};

// Жобалар тізімін алу (Получение списка проектов)
const getProjects = async (req, res) => {
    try {
        const userId = req.user.id;     
        const userRole = req.user.role; 

        // LEFT JOIN assignments a ON p.assignment_id = a.id қостық, 
        // жобаның қай тапсырмаға тиесілі екенін (a.title) көру үшін
        let query = `
            SELECT p.id, p.title, p.description, p.status, p.created_at, p.assignment_id,
                   u.first_name, u.last_name, u.group_id,
                   (
                       SELECT json_agg(json_build_object('file_url', f.file_url, 'file_type', f.file_type))
                       FROM files f WHERE f.project_id = p.id
                   ) as files_list,
                   g.repo_url, g.repo_name, g.language, g.stars_count,
                   a.title as assignment_title, a.type as assignment_type,
                   (SELECT grade FROM comments WHERE project_id = p.id LIMIT 1) as grade,
                   (SELECT text FROM comments WHERE project_id = p.id LIMIT 1) as comment_text
            FROM projects p
            JOIN users u ON p.student_id = u.id
            LEFT JOIN github_links g ON p.id = g.project_id
            LEFT JOIN assignments a ON p.assignment_id = a.id
        `;

        let values = [];

        if (userRole === 'student') {
            query += ` WHERE p.student_id = $1`;
            values.push(userId);
        } else if (userRole === 'teacher') {
            query += ` WHERE u.group_id IN (SELECT id FROM groups WHERE teacher_id = $1)`;
            values.push(userId);
        }

        query += ` ORDER BY p.created_at DESC`;

        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Жобаларды алу қатесі:", error);
        res.status(500).json({ message: 'Серверде қате шықты' });
    }
};

module.exports = { uploadProject, getProjects };