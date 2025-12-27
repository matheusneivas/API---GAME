# Guia Rápido - Game Tracker API

## Passo a Passo para Começar

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Configurar Banco de Dados

**Opção A: Se o banco já existe**
- Pule para o passo 3

**Opção B: Criar banco do zero**

```bash
# Conecte ao PostgreSQL
psql -U postgres

# Crie o banco
CREATE DATABASE game_tracker;

# Conecte ao banco
\c game_tracker

# Execute o schema (ou copie e cole o conteúdo de database_schema.sql)
\i database_schema.sql
```

### 3️⃣ Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env
```

Edite o arquivo `.env` e configure:

```env
PORT=3000
NODE_ENV=development

# Configure suas credenciais do PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=game_tracker
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# Gere uma chave secreta aleatória (pode usar qualquer string longa)
JWT_SECRET=minha_chave_secreta_super_segura_123456

# Token expira em 7 dias
JWT_EXPIRES_IN=7d

# Obtenha em https://dev.twitch.tv/console/apps (grátis)
IGDB_CLIENT_ID=seu_client_id_aqui
IGDB_CLIENT_SECRET=seu_client_secret_aqui
```

**Como obter credenciais IGDB:**
1. Acesse https://dev.twitch.tv/console/apps
2. Faça login (ou crie conta Twitch)
3. Clique em "Register Your Application"
4. Nome: Game Tracker API
5. OAuth Redirect: http://localhost
6. Category: Application Integration
7. Copie o Client ID e gere um Client Secret
```

### 4️⃣ Rodar o Servidor

```bash
npm run dev
```

Você verá:
```
✅ Conectado ao PostgreSQL
🚀 Servidor rodando na porta 3000
📍 http://localhost:3000
```

### 5️⃣ Testar a API

**Teste 1: Verificar se está rodando**
```bash
curl http://localhost:3000
```

**Teste 2: Criar usuário**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "username": "usuario_teste",
    "password": "senha123"
  }'
```

**Teste 3: Fazer login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "password": "senha123"
  }'
```

Copie o `token` retornado!

**Teste 4: Buscar jogos (usando RAWG API)**
```bash
curl http://localhost:3000/api/games/search?q=zelda
```

**Teste 5: Criar uma lista (autenticado)**
```bash
curl -X POST http://localhost:3000/api/lists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Jogos Favoritos",
    "description": "Minha lista de favoritos",
    "is_public": true
  }'
```

## Importar no Insomnia/Postman

1. Abra o Insomnia ou Postman
2. Importe o arquivo `insomnia_collection.json`
3. Configure a variável `token` após fazer login
4. Teste todas as rotas facilmente!

## Estrutura das Rotas

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| POST | `/api/auth/register` | ❌ | Criar conta |
| POST | `/api/auth/login` | ❌ | Fazer login |
| GET | `/api/auth/me` | ✅ | Ver meu perfil |
| GET | `/api/users/:id` | ❌ | Ver perfil público |
| PUT | `/api/users/me` | ✅ | Atualizar perfil |
| GET | `/api/lists` | ❌ | Listas públicas |
| GET | `/api/lists/my` | ✅ | Minhas listas |
| POST | `/api/lists` | ✅ | Criar lista |
| POST | `/api/lists/:id/games` | ✅ | Adicionar jogo |
| GET | `/api/reviews/game/:gameId` | ❌ | Ver avaliações |
| POST | `/api/reviews` | ✅ | Criar avaliação |
| GET | `/api/comments/game/:gameId` | ❌ | Ver comentários |
| POST | `/api/comments` | ✅ | Criar comentário |
| GET | `/api/games/search?q=termo` | ❌ | Buscar jogos |
| GET | `/api/games/:id` | ❌ | Detalhes do jogo |
| GET | `/api/games/trending` | ❌ | Jogos em alta |
| GET | `/api/games/recent` | ❌ | Lançamentos |

✅ = Requer autenticação (header `Authorization: Bearer TOKEN`)

## Problemas Comuns

### Erro de conexão com o banco
- Verifique se o PostgreSQL está rodando
- Confira as credenciais no `.env`
- Teste a conexão: `psql -U postgres -d game_tracker`

### Erro "JWT_SECRET is not defined"
- Certifique-se de ter criado o arquivo `.env`
- Adicione a variável `JWT_SECRET=qualquer_string_longa`

### Erro na RAWG API
- Verifique se adicionou a `RAWG_API_KEY` no `.env`
- Obtenha em: https://rawg.io/apidocs
- A chave é gratuita!

## Build para Produção

```bash
# Compilar TypeScript
npm run build

# Rodar versão compilada
npm start
```

## Próximos Passos

- [ ] Testar todas as rotas
- [ ] Ajustar validações conforme necessário
- [ ] Adicionar mais features (likes, follows, etc)
- [ ] Implementar cache para RAWG API
- [ ] Adicionar testes automatizados
- [ ] Fazer deploy (Heroku, Railway, Render, etc)

## Recursos Úteis

- **RAWG API Docs:** https://api.rawg.io/docs/
- **Express.js:** https://expressjs.com/
- **PostgreSQL:** https://www.postgresql.org/docs/
- **JWT:** https://jwt.io/

Bom desenvolvimento! 🚀
