const express = require('express');
const cors = require('cors');
const projectRoutes = require('./routes/projectRoutes');
const groupRoutes = require('./routes/groupRoutes');
require('dotenv').config();
const { pool } = require('./config/db');

// Маршруттарды шақыру
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); 

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Сервер іске қосылды және жұмыс істеп тұр!' });
});

// API бағыттарын қосу (Подключение маршрутов)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/groups', groupRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Сервер http://localhost:${PORT} мекенжайында іске қосылды`);
});