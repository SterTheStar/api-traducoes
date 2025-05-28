#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');
const open = require('open');
const boxen = require('boxen');

// Configuração das cores e estilos
const styles = {
    title: chalk.bold.white,
    subtitle: chalk.gray,
    highlight: chalk.bold.white,
    error: chalk.bold.red,
    success: chalk.bold.green,
    info: chalk.cyan,
    date: chalk.yellow,
    link: chalk.blue.underline,
    loading: chalk.white,
    border: chalk.white
};

// Função para buscar traduções
async function searchTranslations(query) {
    const spinner = ora({
        text: styles.loading('Buscando traduções...'),
        color: 'white'
    }).start();

    try {
        const response = await axios.get(`https://www.centraldetraducoes.net.br/search?q=${encodeURIComponent(query)}`, {
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
                results.push({ title, link, date });
            }
        });

        spinner.stop();

        if (results.length === 0) {
            console.log(boxen(styles.error('Nenhuma tradução encontrada'), {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'red'
            }));
            return;
        }

        return results;
    } catch (error) {
        spinner.stop();
        console.error(styles.error('Erro ao buscar traduções:'), error.message);
        return null;
    }
}

// Função para obter detalhes de uma tradução
async function getTranslationDetails(url) {
    const spinner = ora({
        text: styles.loading('Carregando detalhes da tradução...'),
        color: 'white'
    }).start();

    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname.substring(1);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        
        // Pega apenas o título do post atual
        const title = $('.post-title').first().text().trim();
        
        // Pega apenas o conteúdo do post atual
        const content = $('.post-content').first().html();
        const cleanContent = content ? cheerio.load(content).text().trim() : '';
        
        let downloadLink = '';
        // Primeiro tenta encontrar o link de download específico
        const downloadElement = $('.downloadLink .linkDownload').first();
        if (downloadElement.length) {
            downloadLink = downloadElement.attr('href');
        }

        // Se não encontrou, procura por links que contenham "download" no texto ou href
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

        spinner.stop();

        return {
            title,
            content: cleanContent,
            downloadLink: downloadLink || 'Link de download não encontrado',
            url
        };
    } catch (error) {
        spinner.stop();
        console.error(styles.error('Erro ao buscar detalhes da tradução:'), error.message);
        return null;
    }
}

// Função para exibir os resultados em uma tabela
function displayResults(results) {
    const table = new Table({
        head: [
            styles.highlight('Nº'),
            styles.highlight('Título'),
            styles.highlight('Data')
        ],
        style: {
            head: [],
            border: []
        },
        chars: {
            'top': '─',
            'top-mid': '┬',
            'top-left': '┌',
            'top-right': '┐',
            'bottom': '─',
            'bottom-mid': '┴',
            'bottom-left': '└',
            'bottom-right': '┘',
            'left': '│',
            'left-mid': '├',
            'mid': '─',
            'mid-mid': '┼',
            'right': '│',
            'right-mid': '┤',
            'middle': '│'
        }
    });

    results.forEach((result, index) => {
        table.push([
            styles.info(index + 1),
            styles.title(result.title),
            styles.date(result.date)
        ]);
    });

    console.log(table.toString());
}

// Função para exibir os detalhes de uma tradução
function displayTranslationDetails(details) {
    // Limita o conteúdo a um número máximo de caracteres e adiciona reticências se necessário
    const maxContentLength = 500;
    const content = details.content.length > maxContentLength 
        ? details.content.substring(0, maxContentLength) + '...'
        : details.content;

    console.log('\n' + boxen(
        `${styles.highlight('Título:')} ${details.title}\n\n` +
        `${styles.highlight('URL:')} ${styles.link(details.url)}\n\n` +
        `${styles.highlight('Link de Download:')} ${styles.link(details.downloadLink)}\n\n` +
        `${styles.highlight('Descrição:')}\n${styles.subtitle(content)}`,
        {
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'white',
            width: 100,
            wordWrap: true
        }
    ));
}

// Função principal
async function main() {
    console.log(boxen(styles.title('Central de Traduções - CLI'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'white'
    }));

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'O que você deseja fazer?',
                choices: [
                    { name: 'Buscar traduções', value: 'search' },
                    { name: 'Sair', value: 'exit' }
                ]
            }
        ]);

        if (action === 'exit') {
            console.log(styles.info('\nAté logo!\n'));
            break;
        }

        const { query } = await inquirer.prompt([
            {
                type: 'input',
                name: 'query',
                message: 'Digite o nome do jogo:',
                validate: input => input.length > 0 || 'Por favor, digite um termo de busca'
            }
        ]);

        const results = await searchTranslations(query);
        
        if (results && results.length > 0) {
            displayResults(results);

            const { viewDetails } = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'viewDetails',
                    message: 'Deseja ver detalhes de alguma tradução?',
                    default: true
                }
            ]);

            if (viewDetails) {
                const { translationIndex } = await inquirer.prompt([
                    {
                        type: 'number',
                        name: 'translationIndex',
                        message: 'Digite o número da tradução:',
                        validate: input => {
                            const num = parseInt(input);
                            return (num > 0 && num <= results.length) || 'Número inválido';
                        }
                    }
                ]);

                const details = await getTranslationDetails(results[translationIndex - 1].link);
                
                if (details) {
                    displayTranslationDetails(details);

                    const { openDownload } = await inquirer.prompt([
                        {
                            type: 'confirm',
                            name: 'openDownload',
                            message: 'Deseja abrir o link de download no navegador?',
                            default: false
                        }
                    ]);

                    if (openDownload && details.downloadLink !== 'Link de download não encontrado') {
                        await open(details.downloadLink);
                    }
                }
            }
        }

        const { continue: shouldContinue } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'continue',
                message: 'Deseja fazer outra busca?',
                default: true
            }
        ]);

        if (!shouldContinue) {
            console.log(styles.info('\nAté logo!\n'));
            break;
        }

        console.log('\n');
    }
}

// Iniciar o programa
main().catch(error => {
    console.error(styles.error('Erro inesperado:'), error);
    process.exit(1);
}); 