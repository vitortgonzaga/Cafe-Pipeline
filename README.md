# Pipeline Cafe

Estrutura inicial do projeto com foco no backend.

## Pastas

- `backend`: API Node.js + Express + TypeScript + Prisma + Jest/Supertest
- `frontend`: configuração inicial React + Vite + TypeScript + Axios (sem features)

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

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Comandos úteis:

```bash
npm run build
npm run preview
```

## Observações

- Arquivo de exemplo de ambiente do backend: `backend/.env.example`
- Schema Prisma inicial: `backend/prisma/schema.prisma`
