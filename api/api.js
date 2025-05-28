const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuração do Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Traduções de Jogos',
            version: '1.0.0',
            description: 'API para buscar traduções de jogos da Central de Traduções',
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Servidor de Desenvolvimento',
            },
        ],
    },
    apis: ['./api.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Busca traduções de jogos
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Termo de busca (nome do jogo)
 *     responses:
 *       200:
 *         description: Lista de traduções encontradas
 *       400:
 *         description: Parâmetro de busca não fornecido
 *       500:
 *         description: Erro interno do servidor
 */
app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ error: 'Parâmetro de busca (q) é obrigatório' });
        }

        const response = await axios.get(`https://www.centraldetraducoes.net.br/search?q=${encodeURIComponent(q)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('.post').each((i, element) => {
            const title = $(element).find('.post-title').text().trim();
            const link = $(element).find('.post-title a').attr('href');
            const date = $(element).find('.post-date').text().trim();
            
            if (title && link) {
                results.push({
                    title,
                    link,
                    date
                });
            }
        });

        res.json(results);
    } catch (error) {
        console.error('Erro ao buscar traduções:', error);
        res.status(500).json({ error: 'Erro ao buscar traduções' });
    }
});

/**
 * @swagger
 * /api/translation/{path}:
 *   get:
 *     summary: Obtém detalhes de uma tradução específica
 *     parameters:
 *       - in: path
 *         name: path
 *         schema:
 *           type: string
 *         required: true
 *         description: Caminho da tradução
 *     responses:
 *       200:
 *         description: Detalhes da tradução
 *       404:
 *         description: Tradução não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
app.get('/api/translation/*', async (req, res) => {
    try {
        const fullPath = req.params[0];
        
        if (!fullPath || fullPath.includes('..')) {
            return res.status(400).json({ error: 'Caminho inválido' });
        }

        const url = `https://www.centraldetraducoes.net.br/${fullPath}`;
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            validateStatus: function (status) {
                return status < 500;
            }
        });

        if (response.status === 404) {
            return res.status(404).json({ error: 'Tradução não encontrada' });
        }

        const $ = cheerio.load(response.data);
        
        const title = $('.post-title').first().text().trim();
        const content = $('.post-content').first().html();
        const cleanContent = content ? cheerio.load(content).text().trim() : '';
        
        let downloadLink = '';
        const downloadElement = $('.downloadLink .linkDownload').first();
        if (downloadElement.length) {
            downloadLink = downloadElement.attr('href');
        }

        if (!downloadLink) {
            $('.post-content a').each((i, element) => {
                const href = $(element).attr('href');
                const text = $(element).text().toLowerCase();
                
                if (href && (text.includes('download') || href.toLowerCase().includes('download'))) {
                    downloadLink = href;
                    return false;
                }
            });
        }

        const translation = {
            title,
            content: cleanContent,
            downloadLink: downloadLink || 'Link de download não encontrado',
            url
        };

        res.json(translation);
    } catch (error) {
        console.error('Erro ao buscar detalhes da tradução:', error);
        res.status(500).json({ error: 'Erro ao buscar detalhes da tradução' });
    }
});

// Rota raiz com informações básicas
app.get('/', (req, res) => {
    res.json({
        name: 'API de Traduções de Jogos',
        version: '1.0.0',
        description: 'API para buscar traduções de jogos da Central de Traduções',
        endpoints: {
            search: '/api/search?q=nome_do_jogo',
            translation: '/api/translation/caminho_da_traducao',
            documentation: '/api-docs'
        }
    });
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║        API de Traduções - Servidor Ativo       ║
║                                                ║
╠════════════════════════════════════════════════╣
║                                                ║
║  • Local: http://localhost:${PORT}                 ║
║  • Documentação: http://localhost:${PORT}/api-docs ║
║                                                ║
║  Endpoints principais:                         ║
║  • GET /api/search?q=nome_do_jogo             ║
║  • GET /api/translation/caminho_da_traducao    ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);
}); 