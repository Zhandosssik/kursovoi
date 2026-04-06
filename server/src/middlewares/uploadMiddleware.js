const multer = require('multer');
const path = require('path');

// Файлдарды сақтау баптаулары (Настройки сохранения файлов)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Осы папкаға сақталады
    },
    filename: (req, file, cb) => {
        // Файл аты қайталанбауы үшін уақыт белгісін қосамыз
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Рұқсат етілген форматтар (Фильтр форматов)
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx', '.doc', '.zip', '.rar', '.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    if (allowed.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Рұқсат етілмеген формат! Тек құжаттар, архивтер немесе суреттерді жүктеңіз.'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;