const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, getGroups, getStudentsByGroup } = require('../controllers/assignmentController');
const authMiddleware = require('../middlewares/authMiddleware');

// Бұрынғылар
router.post('/', authMiddleware, createAssignment);
router.get('/', authMiddleware, getAssignments);

// Жаңа қосылғандар (Топтар мен студенттер тізімі үшін)
router.get('/groups', authMiddleware, getGroups);
router.get('/groups/:groupId/students', authMiddleware, getStudentsByGroup);

module.exports = router;