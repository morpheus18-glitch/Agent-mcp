import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EnvChecker from "@/components/env-checker"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">LLM Sandbox Dashboard</h1>

      <div className="grid gap-6">
        <EnvChecker />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription>Welcome to the LLM Sandbox</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This dashboard provides tools to manage your LLM Sandbox environment. Check your environment configuration
              above to ensure everything is set up correctly.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline">
                <Link href="/sandbox">Launch Sandbox</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/templates">Browse Templates</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/settings">Settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2">
                <li>Check your environment variables</li>
                <li>Configure your database connection</li>
                <li>Create your first agent</li>
                <li>Start a conversation</li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <a href="https://github.com/yourusername/llm-sandbox" className="text-blue-500 hover:underline">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="https://docs.example.com/llm-sandbox" className="text-blue-500 hover:underline">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://discord.gg/example" className="text-blue-500 hover:underline">
                    Community Discord
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="text-green-500">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span>Authentication:</span>
                  <span className="text-green-500">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>LLM API:</span>
                  <span className="text-green-500">Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
