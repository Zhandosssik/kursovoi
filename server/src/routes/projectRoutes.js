const express = require('express');
const router = express.Router();

const { uploadProject, getProjects, generateAIReview } = require('../controllers/projectController');
const { addGithubLink } = require('../controllers/githubController');
const { reviewProject } = require('../controllers/reviewController');

const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', authMiddleware, getProjects);
router.post('/', authMiddleware, upload.single('document'), uploadProject);
router.post('/:projectId/github', authMiddleware, addGithubLink);
router.put('/:projectId/review', authMiddleware, reviewProject);

// ЖАҢА: AI арқылы жобаны бағалау
router.get('/:id/ai-review', authMiddleware, generateAIReview);

module.exports = router;