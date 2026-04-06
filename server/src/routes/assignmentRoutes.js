const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, getAssignmentStats, getGroups, getStudentsByGroup } = require('../controllers/assignmentController');
const authMiddleware = require('../middlewares/authMiddleware');

const upload = require('../middlewares/uploadMiddleware');

// Бұрынғылар
router.post('/', authMiddleware, upload.array('documents', 10), createAssignment);
router.get('/', authMiddleware, getAssignments);
router.get('/:id/stats', authMiddleware, getAssignmentStats);

// Жаңа қосылғандар (Топтар мен студенттер тізімі үшін)
router.get('/groups', authMiddleware, getGroups);
router.get('/groups/:groupId/students', authMiddleware, getStudentsByGroup);

module.exports = router;