# Cafe Pipeline — Backend

API REST responsável pelo controle de estoque de itens do café de desenvolvimento.

---

## Índice

- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Rodando localmente](#rodando-localmente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Rotas da API](#rotas-da-api)
- [Testes](#testes)
- [Convenção de testes](#convenção-de-testes)
- [Checklist de PR](#checklist-de-pr)

---

## Tecnologias

| Ferramenta | Uso |
|---|---|
| Node.js 20 | Runtime |
| TypeScript 6 | Linguagem |
| Express 5 | Framework HTTP |
| Prisma 6 | ORM / migrations |
| PostgreSQL 16 | Banco de dados |
| Zod 4 | Validação de schemas |
| Jest + ts-jest | Testes |
| Supertest | Testes de integração HTTP |

---

## Estrutura do projeto

```
backend/
├── src/
│   ├── app.ts                        # Configuração do Express (middlewares, rotas)
│   ├── server.ts                     # Entry point — sobe o servidor HTTP
│   ├── controllers/
│   │   ├── health.controller.ts      # GET /health
│   │   └── item.controller.ts        # Handlers de /api/items e /api/reports
│   ├── errors/
│   │   └── app-error.ts              # Classe de erro de domínio (AppError)
│   ├── helpers/
│   │   └── async-handler.ts          # Wrapper que captura erros async e repassa via next()
│   ├── lib/
│   │   └── prisma.ts                 # Instância singleton do PrismaClient
│   ├── middlewares/
│   │   └── error-handler.ts          # Middleware global de tratamento de erros
│   ├── repositories/
│   │   └── item.repository.ts        # Acesso ao banco via Prisma
│   ├── routes/
│   │   ├── health.routes.ts
│   │   └── item.routes.ts            # Composição de controller → router
│   ├── services/
│   │   ├── item.service.ts           # Regras de negócio
│   │   └── item-status.service.ts    # Cálculo de status do item (AVAILABLE/LOW_STOCK/OUT_OF_STOCK)
│   └── types/
│       └── item.types.ts             # Schemas Zod + tipos TypeScript exportados
├── tests/
│   ├── factories/
│   │   ├── item.factory.ts           # makeItem() e makeItemPayload() com suporte a overrides
│   │   └── movement.factory.ts       # makeMovement(), makeMovementInPayload(), makeMovementOutPayload()
│   ├── health.controller.test.ts
│   ├── item.controller.test.ts
│   ├── item.endpoints.test.ts        # Testes de integração HTTP (Supertest), organizados por rota
│   ├── item-status.service.test.ts
│   ├── item.service.test.ts
│   ├── item.types.test.ts
│   └── tsconfig.json                 # tsconfig estendido para a pasta tests/
├── .env                              # Variáveis de ambiente locais (não commitado)
├── .env.example                      # Exemplo de variáveis de ambiente
├── tsconfig.json                     # TypeScript para src/
├── tsconfig.build.json               # TypeScript para build de produção
└── tsconfig.test.json                # TypeScript estendido para src/ + tests/
```

---

## Rodando localmente

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução
- Node.js 20+
- npm 10+

### 1. Suba o banco de dados

O banco PostgreSQL é gerenciado pelo Docker Compose na raiz do repositório:

```bash
# Na raiz do repositório (pasta Cafe-Pipeline/)
docker compose -f infra/docker-compose.yml up -d postgres
```

> Isso sobe apenas o container `pipeline-cafe-postgres` na porta `5432`.

### 2. Configure as variáveis de ambiente

```bash
# Dentro de backend/
cp .env.example .env
```

O `.env.example` já contém os valores corretos para o ambiente local com Docker:

```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pipeline_cafe?schema=public"
```

### 3. Instale as dependências

```bash
npm ci
```

### 4. Execute as migrations

```bash
npm run prisma:migrate
```

> Isso cria as tabelas `CafeItem` e `StockMovement` no banco.

### 5. Inicie o servidor em modo desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3001`.

---

## Scripts disponíveis

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Servidor com hot-reload |
| `build` | `tsc -p tsconfig.build.json` | Compila para `dist/` |
| `start` | `node dist/server.js` | Inicia o build compilado |
| `typecheck` | `tsc -p tsconfig.json --noEmit` | Verifica tipos de `src/` sem gerar arquivos |
| `typecheck:test` | `tsc -p tsconfig.test.json --noEmit` | Verifica tipos de `src/` + `tests/` |
| `test` | `jest --runInBand` | Roda todos os testes |
| `test:watch` | `jest --watch` | Testes em modo interativo |
| `test:coverage` | `jest --coverage` | Testes com relatório de cobertura |
| `test:ci` | `jest --runInBand --json --outputFile=...` | Testes com saída JSON para CI |
| `prisma:generate` | `prisma generate` | Regenera o cliente Prisma |
| `prisma:migrate` | `prisma migrate dev` | Executa migrations pendentes |

---

## Rotas da API

### Health

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Retorna status da API e do banco |

**Resposta 200:**
```json
{ "status": "ok", "db": "ok" }
```

**Resposta 503** (banco indisponível):
```json
{ "status": "degraded", "db": "error" }
```

---

### Itens (`/api/items`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/items` | Cria um novo item |
| `GET` | `/api/items` | Lista todos os itens |
| `GET` | `/api/items/:id` | Busca item por ID (UUID) |
| `PUT` | `/api/items/:id` | Atualiza um item |
| `DELETE` | `/api/items/:id` | Remove um item |

**Payload de criação/atualização:**
```json
{
  "name": "Cafe de Deploy",
  "category": "DEPLOY",
  "quantity": 10,
  "minQuantity": 2,
  "unit": "UNIT",
  "criticality": "HIGH"
}
```

Valores aceitos:
- `category`: `COFFEE` | `SNACK` | `ENERGY_DRINK` | `TESTING` | `DEPLOY` | `ROLLBACK` | `HOTFIX`
- `unit`: `UNIT` | `KG` | `LITER` | `PACKAGE`
- `criticality`: `LOW` | `MEDIUM` | `HIGH`

---

### Movimentações de estoque

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/items/:id/movements/in` | Entrada de estoque |
| `POST` | `/api/items/:id/movements/out` | Saída de estoque |
| `GET` | `/api/items/:id/movements` | Lista movimentações do item |

**Payload entrada (`in`):**
```json
{
  "quantity": 5,
  "responsible": "vitor",
  "reason": "reposicao semanal"
}
```
> `reason` é opcional para entradas.

**Payload saída (`out`):**
```json
{
  "quantity": 2,
  "responsible": "joao",
  "reason": "consumo em deploy"
}
```
> `reason` é **obrigatório** para saídas.

---

### Relatórios

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/reports/low-stock` | Itens com estoque baixo (`LOW_STOCK`) |
| `GET` | `/api/reports/out-of-stock` | Itens sem estoque (`OUT_OF_STOCK`) |

---

### Formato de erro

Todos os erros seguem o mesmo envelope:

```json
{
  "success": false,
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "Item not found",
    "details": null
  },
  "path": "/api/items/uuid-invalido",
  "timestamp": "2026-06-01T12:00:00.000Z"
}
```

Códigos de erro comuns:

| Código | Status HTTP | Situação |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Payload inválido (Zod) |
| `ITEM_NOT_FOUND` | 404 | Item não existe |
| `INSUFFICIENT_STOCK` | 400 | Saída maior que estoque atual |
| `ROUTE_NOT_FOUND` | 404 | Rota inexistente |
| `INTERNAL_SERVER_ERROR` | 500 | Erro inesperado |

---

## Testes

### Rodar todos os testes

```bash
npm test
```

### Rodar com relatório de cobertura

```bash
npm run test:coverage
```

O relatório é gerado em `backend/coverage/` (HTML acessível em `coverage/lcov-report/index.html`).

### Verificar tipos antes de testar

```bash
npm run typecheck        # verifica src/
npm run typecheck:test   # verifica src/ + tests/
```

> Recomendado rodar o typecheck antes dos testes. Erros de tipo podem mascarar falhas de comportamento.

### Cobertura atual

| Métrica | Valor |
|---|---|
| Total de testes | 103 |
| Suites | 6 |
| Cobertura de linhas (`src/`) | ~94% |

---

## Convenção de testes

### Nomenclatura de arquivos

| Tipo de teste | Convenção | Exemplo |
|---|---|---|
| Schema / tipo | `<modulo>.types.test.ts` | `item.types.test.ts` |
| Service (unit) | `<modulo>.service.test.ts` | `item.service.test.ts` |
| Controller (unit) | `<modulo>.controller.test.ts` | `item.controller.test.ts` |
| Integração HTTP | `<modulo>.endpoints.test.ts` | `item.endpoints.test.ts` |

Todos os arquivos ficam em `backend/tests/`.

### Estrutura interna

```typescript
describe("<NomeDaClasse ou módulo>", () => {
  describe("<método ou rota>", () => {
    it("<cenário esperado>", async () => {
      // arrange
      // act
      // assert
    });
  });
});
```

### Regras

- **Mocks**: use `jest.fn()` e isole dependências externas. O Prisma é mockado via `jest.mock("../src/lib/prisma")` — nunca acesse o banco real nos testes.
- **`beforeEach`**: limpe os mocks com `jest.clearAllMocks()` para evitar contaminação entre testes.
- **Casos obrigatórios por handler/service**: sempre cobrir o caminho feliz e pelo menos um caminho de erro.
- **Nomes**: descreva o comportamento esperado, não a implementação. Prefira `"returns 404 when item does not exist"` ao invés de `"calls findById with null"`.
- **Sem lógica nos testes**: testes não devem ter `if`, `for` ou lógica condicional. Se precisar variar dados, use `it.each`.

### Factories de teste

Payloads e entidades reutilizáveis ficam em `tests/factories/`. Use sempre as factories em vez de repetir objetos nos testes:

```typescript
import { makeItem, makeItemPayload, ITEM_ID } from "./factories/item.factory";
import { makeMovementInPayload, makeMovementOutPayload } from "./factories/movement.factory";

// entidade completa com status padrão AVAILABLE
const item = makeItem();

// sobrescrever campos específicos
const lowStock = makeItem({ quantity: 1, status: "LOW_STOCK" });

// payload de criação/atualização
const payload = makeItemPayload({ criticality: "HIGH" });

// payload de movimentação
const entrada = makeMovementInPayload({ quantity: 5 });
const saida  = makeMovementOutPayload({ reason: "consumo em deploy" });
```

### Exemplo de mock de controller

```typescript
const buildServiceMock = () => ({
  create: jest.fn(),
  list: jest.fn(),
  // ...demais métodos
});

const buildRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};
```

---

## Checklist de PR

Antes de abrir um Pull Request no backend, confirme:

### Código

- [ ] Nenhuma regra de negócio foi alterada sem aprovação prévia
- [ ] Sem `console.log` ou código de debug esquecido
- [ ] Sem imports não utilizados
- [ ] `npm run typecheck` passa sem erros
- [ ] `npm run typecheck:test` passa sem erros

### Testes

- [ ] `npm test` passa localmente com 0 falhas
- [ ] Novos comportamentos têm testes cobrindo caminho feliz e de erro
- [ ] Nenhum teste existente foi removido sem justificativa
- [ ] A cobertura não regrediu (verificar com `npm run test:coverage`)

### Banco de dados

- [ ] Se houver migration nova: testada localmente com `npm run prisma:migrate`
- [ ] O schema do Prisma foi atualizado e o client regenerado com `npm run prisma:generate`

### Geral

- [ ] O título do PR descreve **o quê** mudou
- [ ] A descrição do PR explica **por quê** mudou
- [ ] Nenhum arquivo de `.env` ou segredo foi incluído no commit
