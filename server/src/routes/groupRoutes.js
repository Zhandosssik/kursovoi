const express = require('express');
const router = express.Router();
const { getGroups, getTeachers, assignTeacher } = require('../controllers/groupController');

// GET /api/groups - Барлық топтар
router.get('/', getGroups);

// GET /api/groups/teachers - Барлық оқытушылар (Бұл жол міндетті түрде /:groupId-дан БҰРЫН тұруы керек)
router.get('/teachers', getTeachers);

// PUT /api/groups/:groupId/assign - Топқа оқытушы бекіту
router.put('/:groupId/assign', assignTeacher);

module.exports = router;