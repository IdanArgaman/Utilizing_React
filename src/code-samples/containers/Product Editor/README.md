# React Products CRUD — Interview Demo

A small TypeScript + React CRUD application designed to demonstrate clean architecture and TanStack React Query.

## Storage switch

The UI and hooks do not care where products are stored.

Copy `.env.example` to `.env` and choose:

```env
VITE_PRODUCT_STORE=localStorage
```

or:

```env
VITE_PRODUCT_STORE=api
VITE_API_URL=http://localhost:3000/api
```

The repository factory selects the implementation at startup:

- `localStorageProductRepository`
- `apiProductRepository`

Both implement the same `ProductRepository` interface.

## Run

```bash
yarn
yarn dev
```

Then open the URL printed by Vite.

## Expected API

When API mode is enabled, the frontend expects:

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

The API should return JSON products with this shape:

```ts
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  createdAt: string;
}
```

## Architecture

```text
Components
    ↓
Custom hooks
    ↓
TanStack Query
    ↓
Product service
    ↓
ProductRepository interface
    ↓
┌─────────────────┬─────────────────┐
│ localStorage    │ REST API        │
│ repository      │ repository      │
└─────────────────┴─────────────────┘
```

This is intentionally small enough for an interview while providing useful discussion points:

- dependency inversion / repository pattern
- server state vs UI state
- React Query caching and invalidation
- reusable custom hooks
- form validation
- error and loading states
- optimistic UI for delete
- switching persistence without changing UI code
