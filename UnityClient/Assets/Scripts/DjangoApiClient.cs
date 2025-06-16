using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

public class DjangoApiClient : MonoBehaviour
{
    [SerializeField]
    private string baseUrl = "http://localhost:8000/api";

    public IEnumerator Get(string endpoint, Action<string> onComplete)
    {
        using var request = UnityWebRequest.Get($"{baseUrl}/{endpoint}");
        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"GET failed: {request.error}");
        }
        else
        {
            onComplete?.Invoke(request.downloadHandler.text);
        }
    }

    public IEnumerator Post(string endpoint, string jsonBody, Action<string> onComplete)
    {
        var bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
        using var request = new UnityWebRequest($"{baseUrl}/{endpoint}", "POST");
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");

        yield return request.SendWebRequest();

        if (request.result != UnityWebRequest.Result.Success)
        {
            Debug.LogError($"POST failed: {request.error}");
        }
        else
        {
            onComplete?.Invoke(request.downloadHandler.text);
        }
    }
}
