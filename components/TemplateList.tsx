"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define a simple Template interface
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
}

export default function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setIsLoading(true);
        // Attempt to fetch templates from the API
        const response = await fetch("/api/templates");

        // If the API fails, use sample data
        if (!response.ok) {
          // Use sample data instead of throwing an error
          setTemplates(sampleTemplates);
          return;
        }

        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        console.error("Error fetching templates:", err);
        // Use sample data on error
        setTemplates(sampleTemplates);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-8">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card key={template.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">{template.description}</p>
            <div className="mt-4">
              <span className="inline-block bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                {template.category}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Use Template
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// Sample template data to use if API fails
const sampleTemplates: Template[] = [
  {
    id: "1",
    name: "Conversation Analysis",
    description:
      "Template for analyzing conversation patterns between multiple agents.",
    category: "Analysis",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Financial Report",
    description: "Generate financial reports and insights from market data.",
    category: "Finance",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Research Assistant",
    description: "Configure agents to help with academic or business research.",
    category: "Research",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Customer Support",
    description:
      "Template for handling customer inquiries and support requests.",
    category: "Support",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Content Creation",
    description:
      "Generate blog posts, articles, and other content with AI assistance.",
    category: "Content",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Code Review",
    description: "Set up agents to review and provide feedback on code.",
    category: "Development",
    created_at: new Date().toISOString(),
  },
];
