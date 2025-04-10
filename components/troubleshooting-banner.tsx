import { AlertTriangle } from "lucide-react"

export default function TroubleshootingBanner() {
  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium">Authentication is temporarily disabled</p>
          <p className="text-sm">
            We've temporarily disabled authentication to allow you to explore the sandbox without login.
          </p>
        </div>
      </div>
    </div>
  )
}
