# Project Overview

This repository contains a Next.js application, a Django backend, and a minimal Unity client.

## Unity Client

The Unity project lives in the `Unity/` directory with the following files:

- `Unity/Assets/Scripts/WebSocketClient.cs` – C# script that connects to the backend websocket using the `WEBSOCKET_URL` environment variable (defaults to `ws://localhost:8000/ws/conversations/`).
- `Unity/Packages/manifest.json` – Unity package manifest listing required packages.
- `Unity/ProjectSettings/ProjectVersion.txt` – Unity editor version information.
- `Unity/README.md` – detailed instructions for opening and building the Unity project.

The `Assets` folder is where additional scenes and scripts should be placed. The provided `WebSocketClient.cs` component can be attached to a GameObject to establish real‑time communication with the backend.

## Overall Setup

1. Install Node.js 18+, then run `pnpm install` to install dependencies.
2. Copy `docker/postgres.env.example` to `docker/postgres.env` and run `docker-compose up -d db` to start a local Postgres instance.
3. Create a `.env.local` file (run `pnpm run setup` to generate one) and configure database and API keys.
4. Start the development server with `pnpm run dev`.
5. The Django backend resides in `llm_sandbox/` with the usual manage.py commands. Environment variables are loaded via `dotenv`.
6. The Unity project can be opened with Unity Hub by selecting the `Unity/` directory.

For full instructions, see `README.md` at the repository root and `Unity/README.md` for the Unity client.
