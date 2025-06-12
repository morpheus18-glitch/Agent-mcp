import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="container mx-auto flex flex-col items-center py-16 text-center">
      <Image src="/placeholder-logo.png" alt="LLM Sandbox" width={120} height={120} className="mb-6" />
      <h1 className="text-4xl font-bold mb-4">Welcome to the LLM Sandbox</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Explore multi-agent LLM conversations, manage templates, and visualize your data. Get started by launching the dashboard or jump straight into the sandbox.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sandbox">Launch Sandbox</Link>
        </Button>
      </div>
    </div>
  )
}
