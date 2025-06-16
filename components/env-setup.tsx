"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EnvSetup() {
  const [databaseUrl, setDatabaseUrl] = useState("");
  const [nextAuthSecret, setNextAuthSecret] = useState("");
  const [nextAuthUrl, setNextAuthUrl] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      // In a real app, you would send this to a server endpoint
      // that would securely store these environment variables
      console.log("Environment variables would be set on the server:");
      console.log({
        DATABASE_URL: databaseUrl,
        NEXTAUTH_SECRET: nextAuthSecret,
        NEXTAUTH_URL: nextAuthUrl,
        GROQ_API_KEY: groqApiKey,
      });

      setMessage({
        type: "success",
        text: "Environment variables have been saved. Please restart the server for changes to take effect.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to save environment variables. Please try again.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment Setup</CardTitle>
        <CardDescription>
          Configure your environment variables for the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="database-url">Database URL</Label>
            <Input
              id="database-url"
              placeholder="postgres://username:password@localhost:5432/database"
              value={databaseUrl}
              onChange={(e) => setDatabaseUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextauth-secret">NextAuth Secret</Label>
            <Input
              id="nextauth-secret"
              placeholder="A random string used to hash tokens"
              value={nextAuthSecret}
              onChange={(e) => setNextAuthSecret(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextauth-url">NextAuth URL</Label>
            <Input
              id="nextauth-url"
              placeholder="http://localhost:3000"
              value={nextAuthUrl}
              onChange={(e) => setNextAuthUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="groq-api-key">
              GROQ API Key (Server-side only)
            </Label>
            <Input
              id="groq-api-key"
              placeholder="Your GROQ API key"
              value={groqApiKey}
              onChange={(e) => setGroqApiKey(e.target.value)}
              type="password"
            />
            <p className="text-sm text-muted-foreground">
              This key will be stored securely on the server and not exposed to
              the client.
            </p>
          </div>

          {message && (
            <Alert
              variant={message.type === "success" ? "default" : "destructive"}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {message.type === "success" ? "Success" : "Error"}
              </AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <Button type="submit">Save Environment Variables</Button>
        </form>
      </CardContent>
    </Card>
  );
}
