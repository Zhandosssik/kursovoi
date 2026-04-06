const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Тек әкімшілікке рұқсат етілген' });
    }
    next();
};

module.exports = adminMiddleware;
