"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  bio?: string
    preferences?: {
      theme?: string
      notifications?: boolean
      [key: string]: unknown
    }
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const { toast } = useToast()

  // Safely update a profile field
    const updateProfileField = (field: keyof UserProfile, value: unknown) => {
    if (!profile) return
    setProfile({
      ...profile,
      [field]: value,
    })
  }

  // Safely update a preference
    const updatePreference = (key: string, value: unknown) => {
    if (!profile) return
    setProfile({
      ...profile,
      preferences: {
        ...(profile.preferences || {}),
        [key]: value,
      },
    })
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }

    if (status === "authenticated" && session?.user) {
      // In a real app, fetch the profile from the API
      const mockProfile: UserProfile = {
        id: session.user.id || "user-1",
        email: session.user.email || "user@example.com",
        fullName: session.user.name || "Demo User",
        avatarUrl: session.user.image || "",
        bio: "AI enthusiast and researcher exploring multi-agent conversations.",
        preferences: {
          theme: "system",
          notifications: true,
        },
      }

      setProfile(mockProfile)
      setIsLoading(false)
    }
  }, [status, session])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      // In a real app, send the profile update to the API
      // await fetch("/api/profile", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(profile),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update the session
      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            name: profile.fullName,
          },
        })
      }

      setSuccess("Profile updated successfully")
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      } catch {
        setError("Failed to update profile")
        toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      // In a real app, send the password update to the API
      // await fetch("/api/profile/password", {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     currentPassword: currentPassword,
      //     newPassword: newPassword,
      //   }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess("Password updated successfully")
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
      } catch {
        setError("Failed to update password")
        toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load profile information. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <aside className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatarUrl || "/placeholder.svg?height=96&width=96"} alt={profile.fullName} />
                <AvatarFallback className="text-2xl">
                  {profile.fullName?.charAt(0) || profile.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-medium">{profile.fullName}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </CardContent>
          </Card>
        </aside>
        <div className="flex-1 space-y-4">
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>General Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileUpdate}>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    {success && (
                      <Alert className="bg-green-50 border-green-500">
                        <Check className="h-4 w-4 text-green-500" />
                        <AlertDescription className="text-green-700">{success}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) => updateProfileField("fullName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={profile.email} disabled />
                      <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio || ""}
                        onChange={(e) => updateProfileField("bio", e.target.value)}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password to keep your account secure</CardDescription>
                </CardHeader>
                <form onSubmit={handlePasswordUpdate}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters and include uppercase, lowercase, number, and special
                        character.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? "Updating..." : "Update Password"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            <TabsContent value="preferences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={profile.preferences?.theme || "system"}
                      onChange={(e) => updatePreference("theme", e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="button" onClick={handleProfileUpdate} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
