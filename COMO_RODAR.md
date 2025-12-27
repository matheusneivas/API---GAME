# 🚀 Como Rodar o Projeto - Passo a Passo

## ⚠️ Pré-requisitos

O projeto precisa do **Node.js** instalado. Vamos verificar e instalar.

### 1️⃣ Verificar se Node.js está instalado

Abra o **PowerShell** ou **CMD** e execute:

```bash
node --version
npm --version
```

**Se aparecer as versões (ex: v20.x.x):** ✅ Node.js já está instalado, pule para o passo 3.

**Se der erro "comando não encontrado":** ❌ Precisa instalar o Node.js (vá para o passo 2).

---

## 2️⃣ Instalar Node.js (se necessário)

### Opção A: Download Oficial (Recomendado)

1. Acesse: https://nodejs.org/
2. Baixe a versão **LTS** (Long Term Support)
3. Execute o instalador
4. Aceite as opções padrão
5. Reinicie o terminal após a instalação
6. Verifique novamente: `node --version`

### Opção B: Usando Chocolatey (se já tiver)

```bash
choco install nodejs-lts
```

---

## 3️⃣ Configurar Credenciais IGDB

Antes de rodar, você precisa das credenciais da IGDB API:

### Passo 1: Criar aplicação na Twitch

1. Acesse: https://dev.twitch.tv/console/apps
2. Faça login com Twitch (ou crie conta gratuita)
3. Clique em **"Register Your Application"**
4. Preencha:
   - **Name:** Game Tracker API
   - **OAuth Redirect URLs:** http://localhost:3000
   - **Category:** Application Integration
5. Clique em **"Create"**

### Passo 2: Copiar credenciais

1. Na lista de aplicações, clique no nome da sua app
2. Copie o **Client ID**
3. Clique em **"New Secret"** e copie o **Client Secret**

### Passo 3: Adicionar no .env

Abra o arquivo `.env` nesta pasta e adicione:

```env
IGDB_CLIENT_ID=seu_client_id_aqui
IGDB_CLIENT_SECRET=seu_client_secret_aqui
```

**⚠️ IMPORTANTE:** Substitua pelos valores reais que você copiou!

---

## 4️⃣ Verificar Banco de Dados PostgreSQL

O projeto precisa de um banco PostgreSQL rodando.

### Verificar se PostgreSQL está rodando:

**Windows (Services):**
1. Pressione `Win + R`
2. Digite `services.msc`
3. Procure por "PostgreSQL" na lista
4. Se estiver "Parado", clique com botão direito → "Iniciar"

**Ou via PowerShell:**
```powershell
Get-Service -Name postgresql*
```

### Configurar o banco:

O arquivo `.env` já está configurado com:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=game
DB_USER=postgres
DB_PASSWORD=rubronegro8
```

**Se você precisa criar o banco:**

1. Abra o **pgAdmin** ou terminal do PostgreSQL
2. Execute:
```sql
CREATE DATABASE game;
```

3. Execute o schema (opcional, se ainda não criou as tabelas):
```bash
psql -U postgres -d game -f database_schema.sql
```

---

## 5️⃣ Instalar Dependências do Projeto

Abra o terminal **nesta pasta** (API - Site Game) e execute:

```bash
npm install
```

Isso vai instalar:
- express
- pg (PostgreSQL client)
- bcrypt
- jsonwebtoken
- axios
- typescript
- E todas as outras dependências...

**Aguarde concluir** (pode demorar 1-2 minutos).

---

## 6️⃣ Rodar o Servidor

Após instalar tudo, rode:

```bash
npm run dev
```

### ✅ Se tudo estiver OK, você verá:

```
✅ Conectado ao PostgreSQL
🔄 Obtendo novo token IGDB...
✅ Token IGDB obtido com sucesso (expira em 5184000s)
🚀 Servidor rodando na porta 3000
📍 http://localhost:3000
```

---

## 7️⃣ Testar a API

### Método 1: Navegador

Abra: http://localhost:3000

Deve retornar:
```json
{
  "success": true,
  "message": "Game Tracker API",
  "version": "1.0.0"
}
```

### Método 2: curl (terminal)

**Buscar jogos:**
```bash
curl "http://localhost:3000/api/games/search?q=zelda&limit=5"
```

**Jogos em alta:**
```bash
curl "http://localhost:3000/api/games/trending?limit=10"
```

**Lançamentos recentes:**
```bash
curl "http://localhost:3000/api/games/recent?limit=10"
```

**Detalhes de um jogo (exemplo: The Witcher 3 = ID 1942):**
```bash
curl "http://localhost:3000/api/games/1942"
```

### Método 3: Insomnia/Postman

1. Abra o Insomnia ou Postman
2. Importe o arquivo `insomnia_collection.json`
3. Teste todas as rotas facilmente

---

## 🔧 Resolver Problemas Comuns

### ❌ Erro: "Cannot find module 'express'"

**Solução:** Rode `npm install` novamente

### ❌ Erro: "connect ECONNREFUSED ::1:5432"

**Problema:** PostgreSQL não está rodando

**Solução:**
1. Inicie o serviço PostgreSQL
2. Verifique as credenciais no `.env`
3. Teste conexão: `psql -U postgres -d game`

### ❌ Erro: "JWT_SECRET is not defined"

**Problema:** Variável de ambiente não carregada

**Solução:** Certifique-se que o arquivo `.env` existe nesta pasta

### ❌ Erro: "Falha ao autenticar com IGDB API"

**Problema:** Credenciais IGDB inválidas

**Solução:**
1. Verifique se você colocou o Client ID e Secret corretos no `.env`
2. Confirme em https://dev.twitch.tv/console/apps
3. Gere um novo Client Secret se necessário

### ❌ Erro: "Port 3000 is already in use"

**Problema:** Porta já está sendo usada

**Solução 1:** Mude a porta no `.env`:
```env
PORT=3001
```

**Solução 2:** Mate o processo na porta 3000:
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

---

## 📝 Checklist Completo

Antes de rodar, confirme:

- [ ] Node.js instalado (`node --version`)
- [ ] PostgreSQL rodando
- [ ] Banco `game` criado
- [ ] Arquivo `.env` configurado com credenciais IGDB
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor rodando (`npm run dev`)

---

## 🎯 Próximos Passos

Depois que o servidor estiver rodando:

1. **Teste as rotas de jogos** (buscar, trending, recent)
2. **Crie um usuário** via POST `/api/auth/register`
3. **Faça login** e pegue o token
4. **Crie listas, reviews e comments** (rotas autenticadas)

---

## 📚 Documentação Completa

- [README.md](README.md) - Documentação completa da API
- [QUICKSTART.md](QUICKSTART.md) - Guia rápido
- [MIGRATION_IGDB.md](MIGRATION_IGDB.md) - Detalhes da migração RAWG → IGDB

---

**Precisa de ajuda?** Consulte a documentação ou verifique os logs do servidor para mais detalhes sobre erros.

Bom desenvolvimento! 🚀
