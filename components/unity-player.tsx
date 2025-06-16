"use client"

import { Unity, useUnityContext } from "react-unity-webgl"
import { useEffect } from "react"

export default function UnityPlayer() {
  const { unityProvider, sendMessage, isLoaded } = useUnityContext({
    loaderUrl: "/unity/Build/unity.loader.js",
    dataUrl: "/unity/Build/unity.data",
    frameworkUrl: "/unity/Build/unity.framework.js",
    codeUrl: "/unity/Build/unity.wasm",
  })

  useEffect(() => {
    if (isLoaded) {
      // Initialize avatar settings once Unity is ready
      sendMessage("CharacterManager", "SetInitialAppearance")
    }
  }, [isLoaded, sendMessage])

  return (
    <div className="w-full h-full min-h-[400px]">
      <Unity unityProvider={unityProvider} style={{ width: "100%", height: "100%" }} />
    </div>
  )
}
