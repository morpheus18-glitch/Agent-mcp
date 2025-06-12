import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import Link from "next/link"

export default function SetupPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Setup</h1>

      <Tabs defaultValue="environment" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="environment">Environment</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="ai">AI Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="environment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment Setup</CardTitle>
              <CardDescription>Configure your environment variables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Create a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file in the root directory of
                your project with the following variables:
              </p>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md font-mono text-sm">
                <pre>
                  {`# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars-long

# Database Configuration (Neon PostgreSQL)
DATABASE_URL=postgres://user:password@hostname:port/database

# LLM API Keys
GROQ_API_KEY=your-groq-api-key
NEXT_PUBLIC_GROQ_API_KEY=your-public-groq-api-key

# Vector Store (Upstash) - Optional
UPSTASH_VECTOR_REST_URL=your-upstash-vector-url
UPSTASH_VECTOR_REST_TOKEN=your-upstash-vector-token`}
                </pre>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                  You can use the <code className="bg-muted px-1 py-0.5 rounded">pnpm run setup</code> command to run the
                  setup script, which will guide you through the process of creating the .env.local file.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="nextauth-url">NEXTAUTH_URL</Label>
                <Input id="nextauth-url" placeholder="http://localhost:3000" />
                <p className="text-xs text-muted-foreground">
                  The base URL of your site. In development, this is usually http://localhost:3000
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextauth-secret">NEXTAUTH_SECRET</Label>
                <Input id="nextauth-secret" placeholder="your-secret-key-min-32-chars-long" />
                <p className="text-xs text-muted-foreground">
                  A random string used to hash tokens and sign cookies. It should be at least 32 characters long.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="database-url">DATABASE_URL</Label>
                <Input id="database-url" placeholder="postgres://user:password@hostname:port/database" />
                <p className="text-xs text-muted-foreground">
                  Your PostgreSQL connection string. You can get this from your database provider (e.g., Neon).
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="groq-api-key">GROQ_API_KEY</Label>
                <Input id="groq-api-key" placeholder="your-groq-api-key" type="password" />
                <p className="text-xs text-muted-foreground">
                  Your Groq API key. You can get this from the Groq dashboard.
                </p>
              </div>

              <Button asChild>
                <Link href="/troubleshoot">Check Configuration</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Setup</CardTitle>
              <CardDescription>Configure your database connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The LLM Sandbox uses PostgreSQL for data storage. We recommend using{" "}
                <a href="https://neon.tech" className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">
                  Neon
                </a>{" "}
                for a serverless PostgreSQL database.
              </p>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Neon Setup</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Create a Neon account and project</li>
                    <li>Create a new database</li>
                    <li>Get your connection string from the Neon dashboard</li>
                    <li>Add the connection string to your .env.local file</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Database Schema Setup</Label>
                <p className="text-sm">Run the following command to set up the database schema:</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm">pnpm run setup-db</div>
              </div>

              <div className="space-y-2">
                <Label>Test Database Connection</Label>
                <p className="text-sm">Run the following command to test your database connection:</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm">pnpm run test-db</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Setup</CardTitle>
              <CardDescription>Configure authentication for your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The LLM Sandbox uses NextAuth.js for authentication. You need to set up the following environment
                variables:
              </p>

              <div className="space-y-2">
                <Label>NEXTAUTH_URL</Label>
                <p className="text-sm">
                  The base URL of your site. In development, this is usually http://localhost:3000
                </p>
              </div>

              <div className="space-y-2">
                <Label>NEXTAUTH_SECRET</Label>
                <p className="text-sm">
                  A random string used to hash tokens and sign cookies. It should be at least 32 characters long.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm">
                  openssl rand -base64 32
                </div>
                <p className="text-xs text-muted-foreground">
                  You can use the command above to generate a secure random string.
                </p>
              </div>

              <Alert variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Make sure to keep your NEXTAUTH_SECRET secure and never commit it to version control.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Integration</CardTitle>
              <CardDescription>Configure AI services for your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                To enable AI features, you need to set up the GROQ API key. This key should be kept secure and not
                exposed to the client.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>
                  Get an API key from{" "}
                  <a
                    href="https://console.groq.com/"
                    className="text-blue-500 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GROQ
                  </a>
                </li>
                <li>
                  Add the API key to your .env.local file as{" "}
                  <code className="bg-muted px-1 py-0.5 rounded">GROQ_API_KEY</code>
                </li>
                <li>
                  Also add it as <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_GROQ_API_KEY</code> for
                  client-side use
                </li>
              </ul>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Vector Store (Optional)</AlertTitle>
                <AlertDescription>
                  <p>For vector search capabilities, you can set up an Upstash Vector store:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li>Create an Upstash account and project</li>
                    <li>Create a new vector index</li>
                    <li>Get your REST URL and token from the Upstash dashboard</li>
                    <li>Add them to your .env.local file</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
