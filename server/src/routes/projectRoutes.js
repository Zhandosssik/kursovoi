const express = require('express');
const router = express.Router();

const { uploadProject, getProjects } = require('../controllers/projectController');
const { addGithubLink } = require('../controllers/githubController');
const { reviewProject } = require('../controllers/reviewController');

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', authMiddleware, getProjects);
router.post('/', authMiddleware, upload.array('documents', 10), uploadProject);
router.post('/:projectId/github', authMiddleware, addGithubLink);
router.put('/:projectId/review', authMiddleware, reviewProject);

module.exports = router;