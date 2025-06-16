# Unity Client

This folder contains a minimal Unity project that communicates with the Django backend.

## Opening the Project

1. Install **Unity Hub** and add a recent Unity version (2022 or later).
2. In Unity Hub, choose **Open** and select the `UnityClient` directory. Unity will automatically generate any missing project files.
3. Alternatively, from the command line you can create the project:

   ```bash
   unity -createProject UnityClient
   ```

## Networking Scripts

The `Assets/Scripts` folder includes two scripts:

- `DjangoApiClient.cs` &mdash; handles REST requests using `UnityWebRequest`.
- `DjangoWebSocketClient.cs` &mdash; connects to Django WebSocket endpoints using `ClientWebSocket`.

Attach these scripts to GameObjects in your scene to interact with the backend.

## Building

1. Open **File → Build Settings...** in Unity.
2. Select your target platform and click **Build**.
3. The client will communicate with the Django API configured in the scripts.

