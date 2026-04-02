const express = require('express');
const router = express.Router();
// getPublicGroups-ті импортқа қостық
const { register, login, getPublicGroups } = require('../controllers/authController'); 

router.post('/register', register);
router.post('/login', login);
router.get('/groups', getPublicGroups); // ЖАҢА РОУТ (Топтарды алу үшін)

module.exports = router;