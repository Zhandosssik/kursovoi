const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // Токенді тақырыптан алу (Получаем токен из заголовка Authorization)
    const authHeader = req.header('Authorization');

    // Егер токен жоқ болса немесе 'Bearer' сөзімен басталмаса
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Авторизациядан өтпедіңіз, токен жоқ' });
    }

    // "Bearer <token>" ішінен тек токенді бөліп алу
    const token = authHeader.split(' ')[1];

    try {
        // Токеннің дұрыстығын тексеру (Проверка валидности)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Қолданушы мәліметтерін (id, role) сұраныс объектісіне сақтау
        req.user = decoded.user; 
        
        // Келесі функцияға немесе контроллерге өту
        next(); 
    } catch (error) {
        res.status(401).json({ message: 'Токен жарамсыз немесе мерзімі біткен' });
    }
};

module.exports = authMiddleware;