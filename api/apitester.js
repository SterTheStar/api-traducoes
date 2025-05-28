#!/usr/bin/env node

const axios = require('axios');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const boxen = require('boxen');

const API_URL = 'http://localhost:3000';

const styles = {
    title: chalk.bold.cyan,
    error: chalk.bold.red,
    success: chalk.bold.green,
    info: chalk.white,
    highlight: chalk.yellow,
    url: chalk.blue.underline
};

async function testSearch(query) {
    const spinner = ora({
        text: styles.info('Testando busca de traduções...'),
        color: 'cyan'
    }).start();

    try {
        const response = await axios.get(`${API_URL}/api/search`, {
            params: { q: query }
        });

        spinner.stop();

        if (response.data.length === 0) {
            console.log(boxen(styles.info('Nenhuma tradução encontrada'), {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'yellow'
            }));
            return null;
        }

        console.log(boxen(
            styles.success(`Encontradas ${response.data.length} traduções:\n\n`) +
            response.data.map((item, index) => 
                styles.highlight(`${index + 1}. `) +
                styles.info(item.title) +
                (item.date ? `\n   ${styles.info('Data:')} ${styles.highlight(item.date)}` : '') +
                `\n   ${styles.info('Link:')} ${styles.url(item.link)}\n`
            ).join('\n'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green'
            }
        ));

        return response.data;
    } catch (error) {
        spinner.stop();
        console.error(boxen(
            styles.error('Erro ao testar busca:') + '\n' +
            styles.info(error.response?.data?.error || error.message),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'red'
            }
        ));
        return null;
    }
}

async function testTranslationDetails(path) {
    const spinner = ora({
        text: styles.info('Testando detalhes da tradução...'),
        color: 'cyan'
    }).start();

    try {
        const response = await axios.get(`${API_URL}/api/translation/${path}`);
        spinner.stop();

        console.log(boxen(
            styles.success('Detalhes da Tradução:\n\n') +
            styles.highlight('Título: ') + styles.info(response.data.title) + '\n\n' +
            styles.highlight('URL: ') + styles.url(response.data.url) + '\n\n' +
            styles.highlight('Link de Download: ') + styles.url(response.data.downloadLink) + '\n\n' +
            styles.highlight('Conteúdo:\n') + styles.info(response.data.content),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green',
                width: 100,
                wordWrap: true
            }
        ));

        return response.data;
    } catch (error) {
        spinner.stop();
        console.error(boxen(
            styles.error('Erro ao testar detalhes:') + '\n' +
            styles.info(error.response?.data?.error || error.message),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'red'
            }
        ));
        return null;
    }
}

async function testApiStatus() {
    const spinner = ora({
        text: styles.info('Verificando status da API...'),
        color: 'cyan'
    }).start();

    try {
        const response = await axios.get(API_URL);
        spinner.stop();

        console.log(boxen(
            styles.success('API está online!\n\n') +
            styles.highlight('Nome: ') + styles.info(response.data.name) + '\n' +
            styles.highlight('Versão: ') + styles.info(response.data.version) + '\n' +
            styles.highlight('Descrição: ') + styles.info(response.data.description) + '\n\n' +
            styles.highlight('Endpoints disponíveis:\n') +
            Object.entries(response.data.endpoints).map(([name, path]) =>
                `• ${styles.info(name)}: ${styles.url(API_URL + path)}`
            ).join('\n'),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'green'
            }
        ));

        return true;
    } catch (error) {
        spinner.stop();
        console.error(boxen(
            styles.error('API está offline ou inacessível!\n\n') +
            styles.info(`Erro: ${error.message}\n`) +
            styles.info(`URL: ${API_URL}`),
            {
                padding: 1,
                margin: 1,
                borderStyle: 'round',
                borderColor: 'red'
            }
        ));
        return false;
    }
}

async function main() {
    console.log(boxen(styles.title('Testador da API de Traduções'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
    }));

    // Verifica status da API primeiro
    const apiOnline = await testApiStatus();
    if (!apiOnline) {
        console.log(styles.error('\nPor favor, verifique se a API está rodando em ' + styles.url(API_URL)));
        process.exit(1);
    }

    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'O que você deseja testar?',
                choices: [
                    { name: 'Buscar traduções', value: 'search' },
                    { name: 'Ver detalhes de uma tradução', value: 'details' },
                    { name: 'Verificar status da API', value: 'status' },
                    { name: 'Sair', value: 'exit' }
                ]
            }
        ]);

        if (action === 'exit') {
            console.log(styles.info('\nAté logo!\n'));
            break;
        }

        if (action === 'status') {
            await testApiStatus();
        }
        else if (action === 'search') {
            const { query } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'query',
                    message: 'Digite o nome do jogo:',
                    validate: input => input.length > 0 || 'Por favor, digite um termo de busca'
                }
            ]);

            const results = await testSearch(query);

            if (results && results.length > 0) {
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

                    const selectedTranslation = results[translationIndex - 1];
                    const path = new URL(selectedTranslation.link).pathname.substring(1);
                    await testTranslationDetails(path);
                }
            }
        }
        else if (action === 'details') {
            const { path } = await inquirer.prompt([
                {
                    type: 'input',
                    name: 'path',
                    message: 'Digite o caminho da tradução (ex: traducao-do-jogo):',
                    validate: input => input.length > 0 || 'Por favor, digite o caminho'
                }
            ]);

            await testTranslationDetails(path);
        }

        const { continue: shouldContinue } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'continue',
                message: 'Deseja fazer outro teste?',
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
    console.error(styles.error('\nErro inesperado:'), error);
    process.exit(1);
}); 