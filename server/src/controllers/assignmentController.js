const { pool } = require('../config/db');

// 1. Мұғалімнің жаңа тапсырма қосуы
const createAssignment = async (req, res) => {
    try {
        // student_ids массив ретінде келеді
        const { title, description, deadline, group_id, student_ids } = req.body;
        const teacher_id = req.user.id; 

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Тапсырманы тек оқытушы қоса алады!' });
        }

        // Егер массив бос болса (яғни бәріне), дерекқорға NULL сақтаймыз
        const targetStudentIds = (student_ids && student_ids.length > 0) ? student_ids : null;

        const newAssignment = await pool.query(
            'INSERT INTO assignments (teacher_id, title, description, deadline, group_id, student_ids) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [teacher_id, title, description, deadline, group_id, targetStudentIds]
        );

        res.status(201).json({ message: 'Тапсырма сәтті қосылды!', assignment: newAssignment.rows[0] });
    } catch (error) {
        console.error("Тапсырма қосу қатесі:", error.message);
        res.status(500).json({ message: 'Серверде қате шықты' });
    }
};

// 2. Тапсырмаларды шығару
const getAssignments = async (req, res) => {
    try {
        const { role, id } = req.user;
        let assignments;

        if (role === 'teacher') {
            assignments = await pool.query('SELECT * FROM assignments WHERE teacher_id = $1 ORDER BY deadline ASC', [id]);
        } else if (role === 'student') {
            const userQuery = await pool.query('SELECT group_id FROM users WHERE id = $1', [id]);
            const groupId = userQuery.rows[0].group_id;
            
            // Студентке "Бүкіл топқа" (NULL) немесе өз ID-і массивтің ішінде (ANY) болса ғана көрінеді
            assignments = await pool.query(`
                SELECT a.*, u.first_name, u.last_name as teacher_name 
                FROM assignments a 
                JOIN users u ON a.teacher_id = u.id 
                WHERE a.group_id = $1 AND (a.student_ids IS NULL OR $2 = ANY(a.student_ids))
                ORDER BY a.deadline ASC
            `, [groupId, id]);
        }

        res.json(assignments.rows);
    } catch (error) {
        console.error("Тапсырмаларды алу қатесі:", error.message);
        res.status(500).json({ message: 'Сервер қатесі' });
    }
};

// ... қалған функциялар (getGroups, getStudentsByGroup) орнында тұра береді
// 3. ЖАҢА: Топтардың тізімін алу
// 3. Топтардың тізімін алу (Тек өзіне бекітілген топтарды ғана көреді)
const getGroups = async (req, res) => {
    try {
        // req.user.id ішінде қазіргі жүйеге кіріп тұрған мұғалімнің ID-і бар
        const teacherId = req.user.id; 

        // Тек осы мұғалімге тиесілі топтарды ғана іздейміз
        const groups = await pool.query(
            'SELECT id, name FROM groups WHERE teacher_id = $1 ORDER BY name ASC', 
            [teacherId]
        );
        
        res.json(groups.rows);
    } catch (error) {
        console.error("Топтарды алу қатесі:", error.message);
        res.status(500).json({ message: 'Топтарды алу қатесі' });
    }
};

// 4. ЖАҢА: Таңдалған топтағы студенттерді алу
const getStudentsByGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const students = await pool.query(`
            SELECT u.id, u.first_name, u.last_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.group_id = $1 AND r.name = 'student'
            ORDER BY u.first_name ASC
        `, [groupId]);
        res.json(students.rows);
    } catch (error) {
        res.status(500).json({ message: 'Студенттерді алу қатесі' });
    }
};

module.exports = { createAssignment, getAssignments, getGroups, getStudentsByGroup };