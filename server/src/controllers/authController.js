const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
require('dotenv').config();

// Қолданушыны тіркеу (Регистрация)
// Қолданушыны тіркеу (Регистрация)
const register = async (req, res) => {
    try {
        // 1. Фронтендтен келетін деректерге groupId қостық
        const { firstName, lastName, email, password, roleName, groupId } = req.body;

        // Рөлдің ID-ін дерекқордан іздеу
        const roleQuery = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
        if (roleQuery.rows.length === 0) {
            return res.status(400).json({ message: 'Мұндай рөл табылмады' });
        }
        const roleId = roleQuery.rows[0].id;

        // Электрондық поштаның қайталанбауын тексеру
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Бұл электрондық пошта тіркелген' });
        }

        // Құпия сөзді хэштеу
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. ЖАҢА ЛОГИКА: Егер студент болса және топ таңдалса, соны аламыз, әйтпесе null
        const groupValue = (roleName === 'student' && groupId) ? groupId : null;

        // 3. ЖАҢА СҰРАНЫС: group_id бағанын қосып сақтаймыз
        const newUser = await pool.query(
            'INSERT INTO users (role_id, first_name, last_name, email, password_hash, group_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, email',
            [roleId, firstName, lastName, email, passwordHash, groupValue]
        );

        res.status(201).json({ 
            message: 'Сәтті тіркелдіңіз!', 
            user: newUser.rows[0] 
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Серверде қате шықты' });
    }
};

// Жүйеге кіру (Логин)
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Қолданушыны іздеу және оның рөлін қоса алу (JOIN)
        const userQuery = await pool.query(`
            SELECT u.*, r.name as role_name 
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.email = $1
        `, [email]);

        if (userQuery.rows.length === 0) {
            return res.status(400).json({ message: 'Пошта немесе құпия сөз қате' });
        }

        const user = userQuery.rows[0];

        // 2. Құпия сөзді тексеру
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Пошта немесе құпия сөз қате' });
        }

        // 3. JWT токен құру
        const payload = {
            user: {
                id: user.id,
                role: user.role_name
            }
        };

        // Токен 24 сағатқа жарамды
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({
            message: 'Жүйеге сәтті кірдіңіз',
            token,
            user: { id: user.id, firstName: user.first_name, lastName: user.last_name, role: user.role_name }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Серверде қате шықты' });
    }
};

module.exports = { register, login };