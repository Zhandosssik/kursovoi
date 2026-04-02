const { pool } = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Жобаны жүктеу (Загрузка проекта студентом)
const uploadProject = async (req, res) => {
    const client = await pool.connect();
    try {
        // assignment_id қосылды (Фронтендтен келеді)
        const { title, description, assignment_id } = req.body;
        const studentId = req.user.id;

        if (!req.file) {
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

        const fileUrl = `/uploads/${req.file.filename}`;
        const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'docx';

        await client.query(
            'INSERT INTO files (project_id, file_url, file_type) VALUES ($1, $2, $3)',
            [projectId, fileUrl, fileType]
        );

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
                   f.file_url, f.file_type,
                   g.repo_url, g.repo_name, g.language, g.stars_count,
                   a.title as assignment_title
            FROM projects p
            JOIN users u ON p.student_id = u.id
            LEFT JOIN files f ON p.id = f.project_id
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

// ЖАСАНДЫ ИНТЕЛЛЕКТ АРҚЫЛЫ АВТО-БАҒАЛАУ
const generateAIReview = async (req, res) => {
    try {
        const { id } = req.params;

        const projectQuery = await pool.query(`
            SELECT p.title, p.description, g.repo_url, g.language
            FROM projects p
            LEFT JOIN github_links g ON p.id = g.project_id
            WHERE p.id = $1
        `, [id]);

        if (projectQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Жоба табылмады' });
        }
        const project = projectQuery.rows[0];

        const prompt = `
        Сен университет оқытушысының көмекшісісің. Мына курстық жұмысты бағалауға көмектес:
        Тақырыбы: "${project.title}"
        Сипаттамасы: "${project.description}"
        ${project.repo_url ? `GitHub сілтемесі: ${project.repo_url} (Тілі: ${project.language})` : 'GitHub сілтемесі жоқ.'}

        Маған тек қана JSON форматында жауап бер. Басқа ешқандай сөз қоспа:
        {
            "feedback": "Студентке арналған қазақ тіліндегі конструктивті пікір (2-3 сөйлем. Несі жақсы, нені толықтыру керек).",
            "suggested_grade": "Осы сипаттамаға қарап ұсынылатын баға (0-ден 100-ге дейін сан, тырнақшасыз)"
        }
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(cleanText);

        res.status(200).json(aiData);
    } catch (error) {
        console.error('AI қатесі:', error);
        res.status(500).json({ message: 'Жасанды интеллектпен байланыс қатесі' });
    }
};

module.exports = { uploadProject, getProjects, generateAIReview };