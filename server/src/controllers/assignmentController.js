const { pool } = require('../config/db');

// 1. Мұғалімнің жаңа тапсырма қосуы (Файл жүктеуді қоса)
const createAssignment = async (req, res) => {
    const client = await pool.connect();
    try {
        const { title, description, deadline, group_id, student_ids, type } = req.body;
        const teacher_id = req.user.id; 

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Тапсырманы тек оқытушы қоса алады!' });
        }

        await client.query('BEGIN');

        let parsedStudentIds = null;
        if (student_ids) {
            // FormData арқылы келгенде массив string болып келуі мүмкін
            try {
                const parsed = JSON.parse(student_ids);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    parsedStudentIds = parsed;
                }
            } catch {
                if (typeof student_ids === 'string' && student_ids.length > 0) {
                    parsedStudentIds = student_ids.split(','); // мысалы "1,2,3"
                }
            }
        }

        const newAssignment = await client.query(
            'INSERT INTO assignments (teacher_id, title, description, deadline, group_id, student_ids, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [teacher_id, title, description, deadline, group_id, parsedStudentIds, type || 'other']
        );
        
        const assignmentId = newAssignment.rows[0].id;

        // Егер файлдар тіркелсе, оларды сақтаймыз
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const fileUrl = `/uploads/${file.filename}`;
                const fileExt = file.originalname.split('.').pop().toLowerCase();
                
                await client.query(
                    'INSERT INTO files (assignment_id, file_url, file_type) VALUES ($1, $2, $3)',
                    [assignmentId, fileUrl, fileExt]
                );
            }
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Тапсырма сәтті қосылды!', assignment: newAssignment.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Тапсырма қосу қатесі:", error.message);
        res.status(500).json({ message: 'Серверде қате шықты' });
    } finally {
        client.release();
    }
};

// 2. Тапсырмаларды шығару
const getAssignments = async (req, res) => {
    try {
        const { role, id } = req.user;
        let assignments;

        if (role === 'teacher') {
            assignments = await pool.query(`
                SELECT a.*, 
                       (
                           SELECT json_agg(json_build_object('file_url', f.file_url, 'file_type', f.file_type, 'name', f.file_url))
                           FROM files f WHERE f.assignment_id = a.id
                       ) as files_list
                FROM assignments a 
                WHERE teacher_id = $1 ORDER BY deadline ASC
            `, [id]);
        } else if (role === 'student') {
            const userQuery = await pool.query('SELECT group_id FROM users WHERE id = $1', [id]);
            if (userQuery.rows.length === 0) {
                return res.status(404).json({ message: 'Студент табылған жоқ (мүмкін өшірілген)' });
            }
            const groupId = userQuery.rows[0].group_id;
            
            assignments = await pool.query(`
                SELECT a.*, u.first_name, u.last_name as teacher_name,
                       (
                           SELECT json_agg(json_build_object('file_url', f.file_url, 'file_type', f.file_type, 'name', f.file_url))
                           FROM files f WHERE f.assignment_id = a.id
                       ) as files_list
                FROM assignments a 
                JOIN users u ON a.teacher_id = u.id 
                WHERE a.group_id = $1 AND (a.student_ids IS NULL OR $2 = ANY(a.student_ids))
                ORDER BY a.deadline ASC
            `, [groupId, id]);
        } else {
            assignments = { rows: [] };
        }

        res.json(assignments.rows);
    } catch (error) {
        console.error("Тапсырмаларды алу қатесі:", error.message);
        res.status(500).json({ message: 'Сервер қатесі' });
    }
};

// 3. Тапсырманың статистикасы мен оқушыларды бақылау (ЖАҢА)
const getAssignmentStats = async (req, res) => {
    try {
        const { id: assignment_id } = req.params;
        
        // Тапсырма туралы ақпаратты алу
        const assignmQuery = await pool.query('SELECT * FROM assignments WHERE id = $1 AND teacher_id = $2', [assignment_id, req.user.id]);
        if (assignmQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Тапсырма табылмады' });
        }
        const assignment = assignmQuery.rows[0];

        // Күтілетін студенттерді алу
        let expectedStudentsQuery;
        if (assignment.student_ids && assignment.student_ids.length > 0) {
            expectedStudentsQuery = await pool.query(`
                SELECT u.id, u.first_name, u.last_name 
                FROM users u 
                WHERE u.id = ANY($1)
            `, [assignment.student_ids]);
        } else {
            expectedStudentsQuery = await pool.query(`
                SELECT u.id, u.first_name, u.last_name 
                FROM users u 
                JOIN roles r ON u.role_id = r.id
                WHERE u.group_id = $1 AND r.name = 'student'
            `, [assignment.group_id]);
        }
        const expectedStudents = expectedStudentsQuery.rows;

        // Жүктелген жұмыстарды алу (сол тапсырмаға тиесілі)
        const projectsQuery = await pool.query(`
            SELECT p.id as project_id, p.student_id, p.status, p.created_at,
                   (SELECT grade FROM comments WHERE project_id = p.id LIMIT 1) as grade
            FROM projects p 
            WHERE p.assignment_id = $1
        `, [assignment_id]);
        const unindexedProjects = projectsQuery.rows;
        
        // Оқушылар тізіміне жобаларды енгізіп, күйін (статусын) есептеу
        const now = new Date();
        const deadlineDate = new Date(assignment.deadline);

        const stats = expectedStudents.map(student => {
            const project = unindexedProjects.find(p => p.student_id === student.id);
            
            let status = 'missing'; // missing, submitted, late, graded
            if (project) {
                const submittedDate = new Date(project.created_at);
                if (project.grade) {
                    status = 'graded';
                } else if (submittedDate > deadlineDate) {
                    status = 'late';
                } else {
                    status = 'submitted';
                }
            } else if (now > deadlineDate) {
                status = 'missing'; // кешіктірілген
            } else {
                status = 'pending'; // әлі кешіктірілген жоқ, бірақ тапсырмаған
            }

            return {
                ...student,
                project_id: project ? project.project_id : null,
                status: status,
                submitted_at: project ? project.created_at : null,
                grade: project ? project.grade : null,
                project_status: project ? project.status : null
            };
        });

        res.json(stats);
    } catch (error) {
        console.error("Статистика алу қатесі:", error.message);
        res.status(500).json({ message: 'Статистика алу қатесі' });
    }
};

const getGroups = async (req, res) => {
    try {
        const teacherId = req.user.id; 
        const groups = await pool.query(
            'SELECT id, name FROM groups WHERE teacher_id = $1 ORDER BY name ASC', 
            [teacherId]
        );
        res.json(groups.rows);
    } catch (error) {
        res.status(500).json({ message: 'Топтарды алу қатесі' });
    }
};

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

module.exports = { createAssignment, getAssignments, getAssignmentStats, getGroups, getStudentsByGroup };