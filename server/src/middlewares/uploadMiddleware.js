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

// Тек PDF және DOCX рұқсат (Фильтр форматов)
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.docx' || ext === '.doc') {
        cb(null, true);
    } else {
        cb(new Error('Тек PDF немесе DOCX файлдарын жүктеуге болады!'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;