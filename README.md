# Locker Panel

Painel de ocupação de um locker com compartimentos S, M e L: ver o estado de cada
compartimento, criar encomendas, colocá-las e levantá-las, em tempo real.

**API:** Node.js 24, TypeScript, Express 5, MongoDB, Redis · **Web:** Svelte 5, Vite ·
**Testes:** Vitest, Supertest · **CI:** GitHub Actions

## Correr

Requer Docker.

```bash
docker compose up --build
```

Abrir http://localhost:8080. O locker começa com 12 compartimentos (6 S, 4 M, 2 L).

Para arrancar duas instâncias da API: `docker compose up --build --scale api=2`.
Para limpar os dados: `docker compose down -v`.

### Desenvolvimento

```bash
docker compose up -d mongo
cd api && npm install && npm run dev    # http://localhost:3000
cd web && npm install && npm run dev    # http://localhost:5173
```

### Verificações (as mesmas do CI)

```bash
cd api && npm run lint && npm run typecheck && npm test
cd web && npm run lint && npm run check && npm run build
```

Os testes da API arrancam um MongoDB temporário; não é preciso Docker.

## API

| Método | Caminho | Corpo |
|---|---|---|
| `GET` | `/locker` | |
| `GET` | `/parcels?carrier=&status=` | |
| `POST` | `/parcels` | `{ id, size, carrier }` |
| `POST` | `/parcels/:id/place` | `{ compartmentId? }` |
| `POST` | `/parcels/:id/pick-up` | |
| `POST` | `/carriers/:carrier/parcels` | formato de cada transportadora |
| `GET` | `/events?limit=` | |
| `GET` | `/stream` | Server-Sent Events |

Os erros devolvem `{ "error": "CÓDIGO" }`.

## Regras assumidas

- Uma encomenda cabe num compartimento do mesmo tamanho ou maior.
- Sem compartimento indicado, é escolhido o mais pequeno livre onde a encomenda cabe.
- Um compartimento pode estar livre, ocupado ou fora de serviço.
- Uma encomenda por compartimento; o ID vem de fora e é único.
- Levantar uma encomenda liberta o compartimento.
- Várias transportadoras partilham o locker, cada uma com o seu formato.
