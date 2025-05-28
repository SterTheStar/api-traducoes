# API de Traduções de Jogos

Esse projeto oferece uma API e uma ferramenta de linha de comando (CLI) para procurar e visualizar traduções de jogos publicadas no site Central de Traduções (centraldetraducoes.net.br).

## O que tem no projeto?

Ele é dividido em três partes principais:

1. **CLI (`cli.js`)**  
   Uma ferramenta interativa que você pode usar direto no terminal para buscar e ver traduções de jogos.

2. **API (`api/api.js`)**  
   Uma API com endpoints que permitem buscar traduções e ver os detalhes de cada uma. Ela vem com documentação no Swagger pra facilitar o uso.

3. **Teste da API (`api/apitester.js`)**  
   Um script separado de linha de comando feito pra testar os endpoints da API localmente.

1.  **Clonar o repositório:**

    ```bash
    git clone https://github.com/SterTheStar/api-traducoes.git
    ```

2.  **Instalar dependências:**

    ```bash
    npm install
    ```

3.  **Executar a API:**

    Navega para o diretório `api` e executa o servidor:

    ```bash
    npm run api
    ```

    A API estará disponível em `http://localhost:3000` por defeito. A documentação Swagger pode ser acedida em `http://localhost:3000/api-docs`.

4.  **Executar a CLI:**

    Abre uma nova janela do terminal, navega para o diretório raiz do projeto e executa o script `cli.js`:

    ```bash
    npm start
    ```

    A CLI irá iniciar um prompt interativo.

5.  **Executar o API Tester:**

    Se a API estiver a correr, podes usar o script de teste. Abre outra janela do terminal, navega para o diretório `api` e executa:

    ```bash
    npm run test-api
    ```

    Este script irá permitir testar os endpoints da API interativamente.

## Funcionalidades da CLI (cli.js)

*   Busca interativa de traduções por nome de jogo.
*   Exibição dos resultados da busca numa tabela formatada.
*   Opção para ver detalhes de uma tradução selecionada, incluindo título, URL, link de download e descrição.

## Funcionalidades da API (api/api.js)

*   Endpoint GET `/api/search?q=`: Busca traduções com base no parâmetro de query `q`.
*   Endpoint GET `/api/translation/*`: Obtém detalhes de uma tradução específica usando o caminho da URL do site.
*   Documentação interativa via Swagger UI em `/api-docs`.


## Package.json:

*   `npm start`: Para iniciar a CLI.
*   `npm run api`: Para iniciar a API.
*   `npm run test-api`: Para executar o testador da API. 
