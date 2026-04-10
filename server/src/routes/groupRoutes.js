const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { getGroups, getTeachers, assignTeacher, createGroup } = require('../controllers/groupController');

router.get('/teachers', authMiddleware, adminMiddleware, getTeachers);
router.get('/', authMiddleware, adminMiddleware, getGroups);
router.post('/', authMiddleware, adminMiddleware, createGroup); // Топ қосу маршруты
router.put('/:groupId/assign', authMiddleware, adminMiddleware, assignTeacher);

module.exports = router;