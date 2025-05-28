# API Central de Traduções

Uma API Node.js para buscar e acessar traduções de jogos do site Central de Traduções.

## 🚀 Funcionalidades

- Busca de traduções por nome do jogo
- Visualização detalhada de cada tradução
- Links diretos para download
- Interface web moderna e responsiva
- Tema escuro para melhor visualização

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node.js)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd [NOME_DO_DIRETÓRIO]
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📡 Endpoints da API

### 1. Busca de Traduções
```
GET /api/search?q=[termo_busca]
```

**Parâmetros:**
- `q`: Termo de busca (nome do jogo)

**Resposta:**
```json
[
  {
    "title": "Nome da Tradução",
    "link": "URL da tradução",
    "date": "Data da publicação"
  }
]
```

### 2. Detalhes da Tradução
```
GET /api/translation/[caminho]
```

**Parâmetros:**
- `caminho`: Caminho completo da tradução (ex: 2005/10/traducao-do-jogo.html)

**Resposta:**
```json
{
  "title": "Nome da Tradução",
  "url": "URL completa",
  "downloadLink": "Link para download",
  "content": "Conteúdo da página"
}
```

## 🎨 Interface Web

A API inclui uma interface web moderna com as seguintes características:

- Design responsivo
- Tema escuro
- Busca em tempo real
- Visualização detalhada das traduções
- Links diretos para download
- Suporte a imagens e conteúdo formatado

## 🔒 Segurança

- Headers personalizados para evitar bloqueios
- Validação de URLs e parâmetros
- Tratamento de erros robusto
- Sanitização de conteúdo HTML

## 🛠️ Tecnologias Utilizadas

- Node.js
- Express.js
- Axios
- Cheerio
- Bootstrap 5
- Font Awesome

## 📝 Estrutura do Projeto

```
.
├── index.js              # Arquivo principal da API
├── package.json          # Dependências e scripts
├── public/              # Arquivos estáticos
│   └── index.html       # Interface web
└── README.md            # Este arquivo
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## ⚠️ Limitações

- A API depende da estrutura do site Central de Traduções
- Alterações no site podem afetar o funcionamento
- Algumas traduções podem não ter link de download disponível

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📧 Contato

Seu Nome - [@seutwitter](https://twitter.com/seutwitter) - email@exemplo.com

Link do Projeto: [https://github.com/seu-usuario/seu-repositorio](https://github.com/seu-usuario/seu-repositorio) 