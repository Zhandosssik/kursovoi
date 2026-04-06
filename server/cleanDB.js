const fs = require('fs');
const path = require('path');
const { pool } = require('./src/config/db');

async function cleanEverything() {
    try {
        console.log('🔄 Базаны тазалау басталып жатыр...');

        // 1. Кестелерді тазалау (Cascade арқылы байланысқан деректерді жою ықтималдығымен)
        await pool.query('DELETE FROM files');
        console.log('✅ Файлдар кестесі тазаланды');

        await pool.query('DELETE FROM comments');
        console.log('✅ Пікірлер тазаланды');

        await pool.query('DELETE FROM github_links');
        console.log('✅ GitHub сілтемелері тазаланды');

        await pool.query('DELETE FROM projects');
        console.log('✅ Жобалар тазаланды');

        await pool.query('DELETE FROM assignments');
        console.log('✅ Тапсырмалар тазаланды');

        await pool.query('DELETE FROM groups');
        console.log('✅ Топтар тазаланды');

        // Роль id-лерін алу және 'admin'-нен басқа барлық қолданушыларды өшіру
        // Егер сізде role_id орнына тікелей role='admin' болса, мынау:
        // await pool.query("DELETE FROM users WHERE role != 'admin'");
        
        // Ал егер roles кестесі болса:
        await pool.query(`
            DELETE FROM users 
            WHERE role_id IN (SELECT id FROM roles WHERE name != 'admin')
        `);
        console.log('✅ Админнан басқа барлық қолданушылар өшірілді');

        // 2. Uploads папкасын тазарту
        const uploadsDir = path.join(__dirname, 'uploads');
        if (fs.existsSync(uploadsDir)) {
            const filesInDir = fs.readdirSync(uploadsDir);
            for (const file of filesInDir) {
                // .gitkeep сияқты файлдар қалдырылып, басқалары жойылады
                if (file !== '.gitkeep') {
                    fs.unlinkSync(path.join(uploadsDir, file));
                }
            }
            console.log('✅ Жүктелген файлдар (uploads папкасы) тазаланды');
        }

        console.log('\n🎉 Жүйе толықтай тазаланды! Енді таза парақтан бастауға болады.');

    } catch (error) {
        console.error('❌ Қате шықты:', error.message);
        console.log('Егер role_id бағанына байланысты қате шықса, скрипт ішіндегі "DELETE FROM users" сұранысын өзіңіздің ДҚ құрылымыңызға қарай өзгертіңіз.');
    } finally {
        pool.end();
    }
}

cleanEverything();
