# BWP

A blank React + Node starter project.

## Structure

```
bwp/
├── client/   # React + Vite frontend (port 5173)
├── server/   # Node + Express backend (port 3001)
└── package.json
```

## Setup

Install all dependencies (root, server, and client):

```bash
npm run install:all
```

## Development

Run the frontend and backend together:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:3001

The Vite dev server proxies `/api` requests to the backend.

## Build

```bash
npm run build
```
