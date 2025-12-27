# Migração de RAWG para IGDB

Este documento explica as mudanças feitas na API ao migrar de RAWG para IGDB.

## 🔄 O que mudou?

### Arquivo de Serviço
- ❌ **Removido:** `src/services/rawgService.ts`
- ✅ **Criado:** `src/services/igdbService.ts`

### Credenciais (.env)

**Antes (RAWG):**
```env
RAWG_API_KEY=sua_chave_aqui
```

**Agora (IGDB):**
```env
IGDB_CLIENT_ID=seu_client_id
IGDB_CLIENT_SECRET=seu_client_secret
```

### Como obter credenciais IGDB

1. Acesse: https://dev.twitch.tv/console/apps
2. Faça login com Twitch (ou crie uma conta gratuita)
3. Clique em **"Register Your Application"**
4. Preencha:
   - **Name:** Game Tracker API (ou qualquer nome)
   - **OAuth Redirect URLs:** http://localhost
   - **Category:** Application Integration
5. Clique em **"Create"**
6. Copie o **Client ID**
7. Clique em **"New Secret"** e copie o **Client Secret**
8. Cole ambos no seu arquivo `.env`

## 📋 Mudanças nas Rotas

### Parâmetros de Query

**Antes (RAWG):**
```
GET /api/games/search?q=zelda&page=1&page_size=20
GET /api/games/trending?page=1&page_size=20
GET /api/games/recent?page=1&page_size=20
```

**Agora (IGDB):**
```
GET /api/games/search?q=zelda&limit=20
GET /api/games/trending?limit=20
GET /api/games/recent?limit=20
```

A IGDB não usa paginação tradicional (page/page_size), mas sim um limite direto de resultados.

### Formato de Resposta dos Jogos

**Estrutura padronizada:**
```typescript
{
  id: number;
  name: string;
  summary?: string;
  cover?: string;           // URL completa da imagem
  rating?: number;          // 0-10 (convertido de 0-100 da IGDB)
  releaseDate?: string;     // ISO 8601
  platforms?: string[];
  developers?: string[];
  genres?: string[];
}
```

## 🔐 Autenticação

### RAWG (Antiga)
- Chave API simples enviada como query parameter
- Sem expiração

### IGDB (Nova)
- OAuth 2.0 Client Credentials Flow
- Access Token com expiração de 60 dias
- Token é automaticamente renovado quando expira
- Cache implementado para não fazer requisições desnecessárias

## 🆕 Novas Funcionalidades

### Cache de Token
O serviço IGDB implementa cache automático:
- Token é armazenado em memória
- Renovação automática quando expira
- Logs informativos sobre o status do token

### Melhor Qualidade de Dados
IGDB geralmente oferece:
- ✅ Dados mais completos e atualizados
- ✅ Informações mais precisas sobre desenvolvedores
- ✅ Melhor categorização de gêneros
- ✅ Imagens em alta qualidade

## 📦 Novas Dependências

Foi adicionado o **axios** ao `package.json`:

```json
{
  "dependencies": {
    "axios": "^1.6.2"
  }
}
```

Instale com:
```bash
npm install
```

## 🧪 Como Testar

### 1. Configurar .env

Edite seu arquivo `.env` e adicione:
```env
IGDB_CLIENT_ID=seu_client_id_real
IGDB_CLIENT_SECRET=seu_client_secret_real
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar o servidor

```bash
npm run dev
```

### 4. Testar busca de jogos

```bash
# Buscar jogos
curl "http://localhost:3000/api/games/search?q=zelda"

# Jogos em alta
curl "http://localhost:3000/api/games/trending?limit=10"

# Lançamentos recentes
curl "http://localhost:3000/api/games/recent?limit=10"

# Detalhes de um jogo específico (exemplo: The Witcher 3 = ID 1942)
curl "http://localhost:3000/api/games/1942"
```

## 🔍 Logs Informativos

O serviço IGDB mostra logs úteis:

```
✅ Conectado ao PostgreSQL
🔄 Obtendo novo token IGDB...
✅ Token IGDB obtido com sucesso (expira em 5184000s)
🚀 Servidor rodando na porta 3000
```

Nas próximas requisições:
```
✅ Usando token IGDB em cache
```

## ⚠️ Possíveis Erros

### "Falha ao autenticar com IGDB API"
- Verifique se `IGDB_CLIENT_ID` e `IGDB_CLIENT_SECRET` estão corretos no `.env`
- Confirme que as credenciais são válidas em https://dev.twitch.tv/console/apps

### "Rate limit atingido"
- A IGDB tem limite de requisições
- Aguarde alguns minutos antes de tentar novamente
- Considere implementar cache local se necessário

### "Jogo não encontrado"
- O ID do jogo pode não existir na IGDB
- Use a busca primeiro para encontrar IDs válidos

## 🎯 Próximos Passos

Após configurar e testar:

1. ✅ Atualize suas credenciais IGDB no `.env`
2. ✅ Rode `npm install` para instalar axios
3. ✅ Teste todas as rotas de jogos
4. ✅ Atualize sua documentação frontend (se aplicável)
5. ✅ Considere implementar cache Redis para respostas da IGDB (opcional)

## 📚 Recursos

- **IGDB API Docs:** https://api-docs.igdb.com/
- **Twitch Developer Console:** https://dev.twitch.tv/console/apps
- **Apicalypse Query Language:** https://api-docs.igdb.com/#apicalypse

---

**Dúvidas?** Consulte a documentação oficial da IGDB ou abra uma issue no repositório.
