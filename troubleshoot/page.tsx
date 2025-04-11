import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import EnvChecker from "@/components/env-checker"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TroubleshootPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Troubleshooting</h1>

      <div className="grid gap-6">
        <EnvChecker />

        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
            <CardDescription>Solutions to common problems you might encounter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">Database Connection Issues</h3>
              <p className="text-muted-foreground">If you're having trouble connecting to the database, make sure:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Your DATABASE_URL environment variable is correctly set</li>
                <li>The database server is running and accessible</li>
                <li>Your firewall allows connections to the database port</li>
                <li>SSL is enabled if your database requires it</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg">Authentication Problems</h3>
              <p className="text-muted-foreground">For authentication issues, check:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>NEXTAUTH_SECRET is set to a secure random string (at least 32 characters)</li>
                <li>NEXTAUTH_URL is set to your application's URL</li>
                <li>Your database has the required auth tables</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg">API Integration Not Working</h3>
              <p className="text-muted-foreground">If API features aren't working:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Verify your GROQ_API_KEY is correctly set</li>
                <li>Check server logs for any API rate limiting or errors</li>
                <li>Ensure your network allows outbound connections to the API service</li>
              </ul>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Need more help?</AlertTitle>
              <AlertDescription>
                If you're still experiencing issues, check the{" "}
                <a href="https://github.com/yourusername/llm-sandbox" className="text-blue-500 hover:underline">
                  GitHub repository
                </a>{" "}
                for more troubleshooting tips or open an issue.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Test</CardTitle>
            <CardDescription>Test your database connection</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Run the database test script to verify your connection and check if all required tables exist:
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm mb-4">npm run test-db</div>
            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Make sure your DATABASE_URL environment variable is correctly set before running the test.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reset Application</CardTitle>
            <CardDescription>Start fresh if you're experiencing persistent issues</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">If you're experiencing persistent issues, you can try resetting the application:</p>
            <ol className="list-decimal list-inside space-y-2 mb-4">
              <li>Stop the development server</li>
              <li>Delete the .next folder</li>
              <li>Run npm install to ensure all dependencies are correctly installed</li>
              <li>Start the development server again</li>
            </ol>
            <Button asChild variant="outline">
              <Link href="/setup">Go to Setup Page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
