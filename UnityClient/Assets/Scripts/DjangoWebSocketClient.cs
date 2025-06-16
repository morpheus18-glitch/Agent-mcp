using System;
using System.Net.WebSockets;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

public class DjangoWebSocketClient : MonoBehaviour
{
    [SerializeField]
    private string websocketUrl = "ws://localhost:8000/ws";

    private ClientWebSocket socket;

    private async void Start()
    {
        socket = new ClientWebSocket();
        await socket.ConnectAsync(new Uri(websocketUrl), CancellationToken.None);
        Debug.Log("WebSocket connected");
        _ = ReceiveLoop();
    }

    public async Task Send(string message)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(message);
        await socket.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
    }

    private async Task ReceiveLoop()
    {
        var buffer = new byte[1024];
        while (socket.State == WebSocketState.Open)
        {
            var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                break;
            }
            var message = System.Text.Encoding.UTF8.GetString(buffer, 0, result.Count);
            Debug.Log($"Received: {message}");
        }
    }

    private void OnDestroy()
    {
        if (socket != null && socket.State == WebSocketState.Open)
        {
            socket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None).Wait();
        }
    }
}
