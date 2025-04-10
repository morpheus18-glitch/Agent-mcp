"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

export default function EnvChecker() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>All environment variables have been removed for simplicity</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Simplified Mode Active</AlertTitle>
          <AlertDescription className="text-green-600">
            <p>The application is running in simplified mode with no external dependencies</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
