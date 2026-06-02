# Pipeline Cafe

Sistema de controle de estoque para um café temático de desenvolvimento, com foco em práticas de DevOps: API, interface web, testes automatizados, Docker, Docker Compose e pipeline CI/CD com Jenkins.

## Funcionalidades

- Cadastro, edição, listagem e remoção de itens do estoque
- Controle de quantidade mínima e status automático do item
- Registro de entradas e saídas de estoque com responsável e motivo
- Histórico de movimentações por item
- Relatórios de itens com estoque baixo e itens sem estoque
- Frontend integrado à API com React Query
- Backend com validação, regras de negócio e persistência em PostgreSQL
- Pipeline com testes, build, empacotamento e notificação por e-mail
- Orquestração local com `Docker Compose`

## Arquitetura

```text
Cafe-Pipeline/
├── backend/   # API REST com Node.js, Express, TypeScript, Prisma e Jest
├── frontend/  # Aplicação web com React, TanStack Router/Query, Vite e Vitest
├── infra/     # Docker Compose, Jenkins e scripts auxiliares
└── Jenkinsfile
```

## Stack

- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Zod, Jest, Supertest
- **Frontend:** React, TanStack Router, TanStack Query, Axios, Vite, Vitest
- **DevOps:** Docker, Docker Compose, Jenkins, Docker Hub

## Como executar

### Pré-requisitos

- Docker Desktop em execução
- Node.js 20+ para o backend
- Node.js 22+ para o frontend/Jenkins local
- `npm` instalado

### 1. Subir a stack com Docker Compose

```bash
cd infra
docker compose up -d
```

Serviços disponíveis:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Jenkins: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

### 2. Subir somente o banco de dados

```bash
cd infra
docker compose up -d postgres
```

### 3. Parar os serviços

```bash
cd infra
docker compose down
```

## Execução local sem Docker

### Backend

1. Copie o arquivo de ambiente:

```bash
cd backend
cp .env.example .env
```

2. Instale as dependências:

```bash
npm install
```

3. Gere o client do Prisma e aplique as migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Inicie a API:

```bash
npm run dev
```

API disponível em `http://localhost:3001`.

### Frontend

1. Instale as dependências:

```bash
cd frontend
npm install
```

2. Opcionalmente, configure a URL da API:

```bash
VITE_API_URL=http://localhost:3001/api
```

3. Inicie a aplicação:

```bash
npm run dev
```

Frontend disponível em `http://localhost:3000`.

## Variáveis de ambiente

### Backend

Arquivo de exemplo: `backend/.env.example`

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pipeline_cafe?schema=public"
```

### Jenkins / notificações

O serviço do Jenkins no `docker compose` usa o arquivo `infra/.env`.

1. Copie o exemplo:

```bash
cd infra
cp .env.example .env
```

2. Preencha as variáveis:

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `NOTIFICATION_EMAIL` | Sim | Destinatário da notificação do pipeline |
| `SMTP_HOST` | Sim | Servidor SMTP |
| `SMTP_USER` | Sim | Usuário SMTP |
| `SMTP_PASS` | Sim | Senha SMTP ou app password |
| `SMTP_PORT` | Não | Porta SMTP. Padrão recomendado: `587` ou `465` |
| `SMTP_FROM` | Não | Remetente do e-mail. Se vazio, usa `SMTP_USER` |
| `SMTP_SSL` | Não | Força `smtps://` fora da porta `465` (`true`/`false`) |
| `SMTP_DEBUG` | Não | Ativa logs verbosos do `curl` (`true`/`false`) |

Exemplo:

```env
NOTIFICATION_EMAIL=your-email@example.com
SMTP_FROM=cafepipelineci@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PASS=replace-with-your-app-password
SMTP_PORT=465
SMTP_USER=cafepipelineci@gmail.com
```

## Scripts úteis

### Raiz do projeto

```bash
npm run dev:backend
npm run dev:frontend
npm run build
npm run test
npm run test:coverage
npm run typecheck
```

### Backend

```bash
cd backend
npm run dev
npm run build
npm run start
npm run typecheck
npm run typecheck:test
npm run test
npm run test:coverage
npm run prisma:generate
npm run prisma:migrate
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run preview
npm run typecheck
npm run lint
npm run test
npm run test:watch
npm run test:coverage
```

## Testes

### Backend

- Testes unitários e de integração com Jest + Supertest
- Relatório de cobertura gerado em `backend/coverage/`

```bash
cd backend
npm run test
npm run test:coverage
```

### Frontend

- Testes com Vitest
- Relatório de cobertura gerado em `frontend/coverage/`
- Relatório HTML adicional em `frontend/html/`

```bash
cd frontend
npm run test
npm run test:coverage
```

## Docker e Docker Hub

### Docker Compose

O `docker-compose.yml` em `infra/` sobe quatro serviços:

- `frontend`
- `backend`
- `postgres`
- `jenkins`

### Imagens publicadas

Imagens publicadas no Docker Hub:

- Frontend: `joaogabrielcosta/cafe-pipeline-frontend`
- Link do frontend: `https://hub.docker.com/r/joaogabrielcosta/cafe-pipeline-frontend`
- Jenkins: `torress2003/cafe-pipeline-jenkins`
- Link do Jenkins: `https://hub.docker.com/r/torress2003/cafe-pipeline-jenkins`

Pull manual:

```bash
docker pull joaogabrielcosta/cafe-pipeline-frontend:latest
docker pull torress2003/cafe-pipeline-jenkins:latest
```

## Pipeline com Jenkins

O pipeline está definido em `Jenkinsfile` e contempla:

- checkout do repositório
- instalação de dependências
- typecheck de backend e frontend
- execução de testes com cobertura
- build de backend e frontend
- empacotamento de artefatos
- envio de notificação por e-mail

### Subir o Jenkins localmente

```bash
cd infra
cp .env.example .env
docker compose up -d jenkins
```

Depois, acesse `http://localhost:8080` e configure um job do tipo **Pipeline** apontando para este repositório e para o arquivo `Jenkinsfile`.

### Artefatos esperados

Ao final da execução do pipeline, o Jenkins arquiva:

- `artifacts/frontend-package.tar.gz`
- `artifacts/backend-package.tar.gz`
- `frontend/coverage/**`
- `frontend/html/**`
- `backend/coverage/**`
- `backend/test-results/**`

## Estrutura do frontend

O frontend segue uma organização em camadas:

- `src/http`: cliente HTTP e implementação com Axios
- `src/domain/items`: entidades, enums e constantes
- `src/data/items`: DTOs, mappers e repositório HTTP
- `src/application/items`: serviços e casos de uso
- `src/presentation`: hooks, estado de tela e páginas

## Observações

- Arquivo de exemplo do backend: `backend/.env.example`
- Arquivo de exemplo do Jenkins/infra: `infra/.env.example`
- Schema Prisma: `backend/prisma/schema.prisma`
- Pipeline CI/CD: `Jenkinsfile`

## Uso de IA


### Modelos utilizados

- GPT 5.3
- Codex
- GPT 5.5

### Como a IA foi utilizada

- Pair programming durante o desenvolvimento
- Apoio em revisões constantes de implementação, estrutura e documentação
- Suporte para validação de decisões técnicas ao longo do projeto

### Prompts utilizados

#### Prompt 1

- **Objetivo:** Gerar uma base inicial para a estrutura do backend, seguindo boas práticas de organização, separação de responsabilidades e manutenção do código.
- **Prompt + Plan.md:** "Seguindo o Plan.md crie uma estrutura base para um backend em Node.js com Express e TypeScript, seguindo boas práticas de organização em camadas, separação de responsabilidades, validação de dados, tratamento de erros e facilidade de manutenção, junto ao README.MD com explicações de como rodar o projeto."
- **Resultado ajustado:** O resultado foi aceito como base inicial e ajustado para seguir a regra de negócio planejada pelo grupo.

#### Prompt 2

- **Objetivo:**
- **Prompt:**
- **Resultado aceito/ajustado/descartado:**

#### Prompt 3

- **Objetivo:**
- **Prompt:**
- **Resultado aceito/ajustado/descartado:**

### O que não foi feito por IA

-
