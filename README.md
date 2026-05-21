# Pipeline Cafe

Sistema de controle de estoque para uma cafeteria temática DevOps.

## Funcionalidades

- Cadastro, listagem, busca, atualização e remoção de itens de estoque
- Entrada e saída de estoque com validações de negócio
- Histórico de movimentações por item
- Relatório de itens com baixo estoque
- Relatório de itens zerados
- Endpoint de saúde da aplicação (`/health`)

## Instalação

### Pré-requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose

### Clonar e instalar dependências

```bash
git clone <url-do-repositorio>
cd CafePipeline
npm install
cd backend && npm ci
cd ../frontend && npm ci
```

## Execução

### 1) Subir o PostgreSQL

```bash
docker compose up -d postgres
```

### 2) Configurar backend

```bash
cd backend
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### 3) Subir frontend (em outro terminal)

```bash
cd frontend
npm run dev
```

## Uso

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health check: `GET http://localhost:3001/health`
- Base da API: `http://localhost:3001/api`

Configuração do frontend:
- Variável `VITE_API_URL` (padrão: `http://localhost:3001/api`)

## Docker Compose

Serviços atualmente definidos:

- `backend` (build local via `backend/Dockerfile`)
- `postgres` (imagem `postgres:16-alpine`)

Comandos úteis:

```bash
docker compose up -d
docker compose ps
docker compose logs -f backend
docker compose down
```

### Testes (Vitest)

Os testes ficam em `frontend/src` com sufixo `.spec.ts(x)` (unitários) ou
`.test.ts(x)` (integração). Use `npm` no lugar de `bun` se preferir.

```bash
cd frontend

# Executa a suíte uma vez e encerra
bun run test

# Modo watch (reexecuta ao salvar arquivos)
bun run test:watch

# Cobertura de código (relatório em frontend/coverage)
bun run test:coverage
```

Comandos adicionais via CLI do Vitest:

```bash
# Um arquivo ou pasta específica
bunx vitest run src/http/axios-http-client.spec.ts

# Filtrar por nome do teste (describe/it)
bunx vitest run -t "AxiosHttpClient"

# Interface visual no navegador (@vitest/ui)
bunx vitest --ui
```

Após `bun run test`, o reporter HTML gera um relatório em `frontend/html/`
(abra `frontend/html/index.html` no navegador).

A URL da API consumida pelo frontend pode ser configurada via variável de ambiente
`VITE_API_URL` (padrão: `http://localhost:3001/api`).

Executar testes do backend:

```bash
cd backend
npm test
```

Gerar cobertura:

```bash
cd backend
npm run test:coverage
```

Relatórios gerados:

- `backend/coverage/lcov-report/index.html`
- `backend/coverage/lcov.info`
- `backend/coverage/coverage-final.json`
