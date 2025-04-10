"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const [errorType, setErrorType] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>("An unknown authentication error occurred")

  useEffect(() => {
    const error = searchParams?.get("error")
    setErrorType(error)

    // Set appropriate error message based on the error type
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage(
            "There is a problem with the server configuration. Please check NEXTAUTH_URL and NEXTAUTH_SECRET.",
          )
          break
        case "AccessDenied":
          setErrorMessage("You do not have permission to sign in.")
          break
        case "Verification":
          setErrorMessage("The token has expired or has already been used.")
          break
        case "CredentialsSignin":
          setErrorMessage("The email or password you entered is incorrect.")
          break
        case "SessionRequired":
          setErrorMessage("You must be signed in to access this page.")
          break
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
        case "OAuthAccountNotLinked":
        case "EmailSignin":
        case "AuthorizedCallback":
          setErrorMessage(`Authentication error: ${error}. Please try again.`)
          break
        default:
          setErrorMessage(`An error occurred: ${error}. Please try again.`)
      }
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
          <CardDescription>There was a problem with your authentication request</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{errorType || "Error"}</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>

          <div className="mt-4 text-sm text-gray-500">
            <p>If you continue to experience this issue, please try:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Clearing your browser cookies</li>
              <li>Using a different browser</li>
              <li>Contacting support if the problem persists</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
