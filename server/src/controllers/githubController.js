const axios = require('axios');
const { pool } = require('../config/db');

// GitHub сілтемесін қосу және мәліметтерді алу
const addGithubLink = async (req, res) => {
    try {
        const { projectId } = req.params; // Жобаның ID-і URL-ден келеді
        const { repoUrl } = req.body;     // Сілтеме денеден (body) келеді

        // 1. Сілтемеден логин мен репозиторий атын бөліп алу 
        // Мысалы: https://github.com/facebook/react -> owner: facebook, repo: react
        const urlParts = repoUrl.split('/');
        const owner = urlParts[urlParts.length - 2];
        const repo = urlParts[urlParts.length - 1];

        // 2. GitHub API-ге сұраныс жіберу
        const githubResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        const { name, language, stargazers_count } = githubResponse.data;

        // 3. Алынған мәліметтерді дерекқорға сақтау
        await pool.query(
            'INSERT INTO github_links (project_id, repo_url, repo_name, language, stars_count) VALUES ($1, $2, $3, $4, $5)',
            [projectId, repoUrl, name, language, stargazers_count]
        );

        res.status(201).json({ 
            message: 'GitHub сілтемесі сәтті сақталды!', 
            repoName: name, 
            language: language,
            stars: stargazers_count 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'GitHub-пен байланыс кезінде қате шықты немесе репозиторий табылмады' });
    }
};

module.exports = { addGithubLink };