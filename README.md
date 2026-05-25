# Pipeline Cafe

Estrutura inicial do projeto com foco no backend.

## Pastas

- `backend`: API Node.js + Express + TypeScript + Prisma + Jest/Supertest
- `frontend`: React + TanStack Start/Router + TanStack React Query + Axios, organizado em camadas (DDD: http / domain / data / application / presentation)

## Backend

```bash
cd backend
npm install
npm run dev
```

Comandos úteis:

```bash
npm run build
npm test
npm run test:coverage
npm run prisma:generate
npm run prisma:migrate
```

### PostgreSQL (Docker)

Subir somente o banco:

```bash
docker compose up -d postgres
```

Parar o banco:

```bash
docker compose stop postgres
```

Primeiro uso do Prisma com banco ativo:

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## Frontend

```bash
cd frontend
bun install   # ou npm install
bun run dev   # ou npm run dev
```

Comandos úteis:

```bash
bun run build
bun run preview
bun run typecheck
bun run lint
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

### Estrutura de camadas (frontend)

- `src/http`: abstração do cliente HTTP (`HttpClient`) e implementação com Axios
  (`AxiosHttpClient`)
- `src/domain/items`: entidades de negócio (`CafeItem`, `StockMovement`), enums e
  constantes
- `src/data/items`: DTOs de request/response, mappers e repositório HTTP
  (`ItemHttpRepository` implementando `IItemRepository`)
- `src/application/items`: serviços/casos de uso (`ItemService`) — compõe o
  repositório e expõe a API ao mundo de UI
- `src/presentation`: hooks de React Query (queries e mutations) e páginas que
  consomem os hooks

## Observações

- Arquivo de exemplo de ambiente do backend: `backend/.env.example`
- Schema Prisma inicial: `backend/prisma/schema.prisma`
