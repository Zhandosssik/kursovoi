const { pool } = require('./db');

async function migrate() {
    try {
        console.log('Миграция басталуда...');
        // 1. files кестесіне assignment_id қосу
        await pool.query('ALTER TABLE files ADD COLUMN IF NOT EXISTS assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE');
        // 2. project_id міндетті (NOT NULL) талабын алып тастау, өйткені бұл файл тапсырманікі болуы да мүмкін
        await pool.query('ALTER TABLE files ALTER COLUMN project_id DROP NOT NULL');
        console.log('✅ Миграция сәтті аяқталды! files кестесіне assignment_id қосылды.');
    } catch (error) {
        console.error('❌ Миграция кезіндегі қате:', error.message);
    } finally {
        pool.end();
    }
}

migrate();
