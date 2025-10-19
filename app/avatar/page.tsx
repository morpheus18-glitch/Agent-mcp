import UnityPlayer from "@/components/unity-player"

export default function AvatarPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Avatar Customization</h1>
      <p className="mb-4">Use the Unity-powered customizer below to design your character.</p>
      <UnityPlayer />
    </div>
  )
}
