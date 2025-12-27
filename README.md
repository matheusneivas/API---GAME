# Game Tracker API

API REST para sistema de tracking de jogos (inspirado no Filmow, mas para games).

## Stack Tecnológica

- Node.js + Express
- TypeScript
- PostgreSQL
- JWT para autenticação
- API externa: IGDB (Internet Game Database) - Twitch

## Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=game_tracker
DB_USER=postgres
DB_PASSWORD=sua_senha

JWT_SECRET=sua_chave_secreta_jwt_aqui
JWT_EXPIRES_IN=7d

IGDB_CLIENT_ID=seu_client_id_aqui
IGDB_CLIENT_SECRET=seu_client_secret_aqui
```

**Para obter credenciais da IGDB API:**
1. Acesse https://dev.twitch.tv/console/apps
2. Faça login com sua conta Twitch (ou crie uma)
3. Clique em "Register Your Application"
4. Preencha:
   - Name: Game Tracker API
   - OAuth Redirect URLs: http://localhost (pode ser qualquer URL)
   - Category: Application Integration
5. Após criar, você verá o **Client ID**
6. Clique em "New Secret" para gerar o **Client Secret**
7. Copie ambos para o arquivo `.env`

### 3. Banco de Dados

O banco PostgreSQL já deve estar criado com as seguintes tabelas:
- users
- lists
- list_items
- reviews
- comments

### 4. Rodar o servidor

**Modo desenvolvimento (com hot reload):**
```bash
npm run dev
```

**Build para produção:**
```bash
npm run build
npm start
```

## Rotas da API

### Autenticação

- **POST** `/api/auth/register` - Criar conta
  - Body: `{ email, username, password }`

- **POST** `/api/auth/login` - Fazer login
  - Body: `{ email, password }`

- **GET** `/api/auth/me` - Pegar dados do usuário autenticado
  - Header: `Authorization: Bearer {token}`

### Usuários

- **GET** `/api/users/:id` - Ver perfil público

- **PUT** `/api/users/me` - Atualizar próprio perfil (autenticado)
  - Header: `Authorization: Bearer {token}`
  - Body: `{ username?, avatar?, bio? }`

### Listas

- **GET** `/api/lists` - Listar listas públicas

- **GET** `/api/lists/my` - Minhas listas (autenticado)
  - Header: `Authorization: Bearer {token}`

- **GET** `/api/lists/:id` - Ver detalhes de uma lista

- **POST** `/api/lists` - Criar lista (autenticado)
  - Header: `Authorization: Bearer {token}`
  - Body: `{ name, description?, is_public? }`

- **PUT** `/api/lists/:id` - Editar lista (autenticado)
  - Header: `Authorization: Bearer {token}`
  - Body: `{ name?, description?, is_public? }`

- **DELETE** `/api/lists/:id` - Deletar lista (autenticado)
  - Header: `Authorization: Bearer {token}`

- **POST** `/api/lists/:id/games` - Adicionar jogo na lista (autenticado)
  - Header: `Authorization: Bearer {token}`
  - Body: `{ game_id }`

- **DELETE** `/api/lists/:id/games/:gameId` - Remover jogo da lista (autenticado)
  - Header: `Authorization: Bearer {token}`

### Avaliações

- **GET** `/api/reviews/game/:gameId` - Ver avaliações de um jogo

- **GET** `/api/reviews/user/:userId` - Ver avaliações de um usuário

- **POST** `/api/reviews` - Criar/atualizar avaliação (autenticado)
  - Header: `Authorization: Bearer {token}`
  - Body: `{ game_id, rating, review? }`

- **DELETE** `/api/reviews/:id` - Deletar avaliação (autenticado)
  - Header: `Authorization: Bearer {token}`

### Comentários

- **GET** `/api/comments/game/:gameId` - Ver comentários de um jogo

- **POST** `/api/comments` - Criar comentário (autenticado)
  - Header: `Authorization: Bearer {token}`
  - Body: `{ game_id, content }`

- **DELETE** `/api/comments/:id` - Deletar comentário (autenticado)
  - Header: `Authorization: Bearer {token}`

### Jogos (Proxy IGDB API)

- **GET** `/api/games/search?q=termo` - Buscar jogos
  - Query params: `q` (obrigatório), `limit` (padrão: 20)

- **GET** `/api/games/:id` - Detalhes de um jogo

- **GET** `/api/games/trending` - Jogos em alta (rating > 80)
  - Query params: `limit` (padrão: 20)

- **GET** `/api/games/recent` - Lançamentos recentes (últimos 3 meses)
  - Query params: `limit` (padrão: 20)

## Formato de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... }
}
```

### Erro
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

## Estrutura do Projeto

```
game-tracker-api/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── middlewares/
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── lists.routes.ts
│   │   ├── reviews.routes.ts
│   │   ├── comments.routes.ts
│   │   └── games.routes.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── usersController.ts
│   │   ├── listsController.ts
│   │   ├── reviewsController.ts
│   │   ├── commentsController.ts
│   │   └── gamesController.ts
│   ├── services/
│   │   └── rawgService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── validators.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── nodemon.json
```

## Testando com Insomnia/Postman

1. Crie uma requisição POST para `/api/auth/register` com:
```json
{
  "email": "teste@email.com",
  "username": "usuario_teste",
  "password": "senha123"
}
```

2. Copie o token retornado

3. Para rotas autenticadas, adicione o header:
```
Authorization: Bearer {seu_token_aqui}
```

## Segurança

- Senhas são criptografadas com bcrypt (10 salt rounds)
- JWT com expiração de 7 dias
- Validação de inputs com express-validator
- Helmet.js para headers de segurança
- CORS configurado
- Queries parametrizadas (prevenção contra SQL injection)
