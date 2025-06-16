"use client";

import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-500" />
        <AlertTitle>Checking authentication status...</AlertTitle>
        <AlertDescription>
          Please wait while we verify your session.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "authenticated") {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle>Authenticated</AlertTitle>
        <AlertDescription>
          You are signed in as {session.user?.name} ({session.user?.email})
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4 bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-4 w-4 text-yellow-500" />
      <AlertTitle>Not authenticated</AlertTitle>
      <AlertDescription>You are not currently signed in.</AlertDescription>
    </Alert>
  );
}
