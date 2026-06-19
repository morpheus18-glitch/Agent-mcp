# Unity Project Overview

This project includes a lightweight Unity client used to connect to the backend websocket service for real-time communication.

## Location

All Unity related files live under the [`Unity/`](./Unity) directory at the repository root. Important subfolders include:

- **`Unity/Assets/Scripts/`** – contains `WebSocketClient.cs`, the MonoBehaviour that establishes a websocket connection.
- **`Unity/Packages/`** – Unity package manifest (`manifest.json`).
- **`Unity/ProjectSettings/`** – project settings including the editor version (`ProjectVersion.txt`).

## Setup

1. Open **Unity Hub**.
2. Click **Add** and select the `Unity/` folder from this repository.
3. Open the project using **Unity 2021.3 LTS** or newer.
4. Create or open a scene and attach the `WebSocketClient` script to a GameObject.

`WebSocketClient` reads the websocket base URL from the environment variable `WEBSOCKET_URL`. If not defined, it defaults to `ws://localhost:8000/ws/conversations/`.

Example configuration:

```bash
export WEBSOCKET_URL=ws://example.com/ws/conversations/
```

At runtime, the component appends the configured `ConversationId` value to produce the final socket path.

## Building

Use **File > Build Settings** within Unity to build for your target platform. The built application will attempt to connect to the configured websocket endpoint on startup.
