# Unity Client

This directory contains a minimal Unity project that connects to the Django websocket endpoint used by the LLM Sandbox backend.

## Structure

- `Assets/Scripts/WebSocketClient.cs` – MonoBehaviour component establishing the websocket connection.
- `Packages/manifest.json` – Unity package manifest.
- `ProjectSettings/ProjectVersion.txt` – Unity editor version file.

## Configuration

The websocket endpoint base URL is read from the environment variable `WEBSOCKET_URL`.
If this variable is not defined, the script defaults to `ws://localhost:8000/ws/conversations/`.

At runtime the component appends the `ConversationId` value to this base URL to produce the final socket path:

```
<WEBSOCKET_URL><ConversationId>/
```

Set the environment variable before launching the Unity editor or when running the built application:

```bash
export WEBSOCKET_URL=ws://example.com/ws/conversations/
```

You can modify `ConversationId` via the inspector on the `WebSocketClient` component.

## Building

1. Open **Unity Hub**.
2. Click **Add** and select the `Unity/` directory.
3. Open the project using Unity 2021.3 LTS or a newer version.
4. Create a scene containing an empty GameObject and attach the `WebSocketClient` script.
5. Build the project using **File > Build Settings** for your target platform.

The built application will attempt to connect to the websocket endpoint on startup.
