using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using UnityEngine;

public class WebSocketClient : MonoBehaviour
{
    private ClientWebSocket _socket;

    [Tooltip("Conversation identifier appended to the websocket URL")] 
    public string ConversationId = "1";

    async void Start()
    {
        string baseUrl = Environment.GetEnvironmentVariable("WEBSOCKET_URL");
        if (string.IsNullOrEmpty(baseUrl))
        {
            baseUrl = "ws://localhost:8000/ws/conversations/";
        }

        string url = $"{baseUrl}{ConversationId}/";
        _socket = new ClientWebSocket();
        await _socket.ConnectAsync(new Uri(url), CancellationToken.None);
        Debug.Log($"Connected to {url}");

        _ = ReceiveLoop();
    }

    public async Task Send(string message)
    {
        if (_socket == null || _socket.State != WebSocketState.Open) return;
        byte[] data = Encoding.UTF8.GetBytes(message);
        var buffer = new ArraySegment<byte>(data);
        await _socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
    }

    private async Task ReceiveLoop()
    {
        var buffer = new ArraySegment<byte>(new byte[1024]);
        while (_socket.State == WebSocketState.Open)
        {
            WebSocketReceiveResult result = await _socket.ReceiveAsync(buffer, CancellationToken.None);
            if (result.MessageType == WebSocketMessageType.Close)
            {
                await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, string.Empty, CancellationToken.None);
                break;
            }
            else
            {
                string message = Encoding.UTF8.GetString(buffer.Array, 0, result.Count);
                Debug.Log($"Message received: {message}");
            }
        }
    }

    async void OnDestroy()
    {
        if (_socket != null && _socket.State == WebSocketState.Open)
        {
            await _socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Component destroyed", CancellationToken.None);
        }
    }
}
