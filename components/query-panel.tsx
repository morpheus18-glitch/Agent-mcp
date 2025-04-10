"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { queryConversation } from "@/lib/conversation-controller"

interface QueryPanelProps {
  conversationId: string | null
}

const QUERY_TYPES = [
  { id: "epistemic", name: "Epistemic Behavior" },
  { id: "metacognition", name: "Meta-Cognition" },
  { id: "recursion", name: "Recursive Cohesion" },
  { id: "leadership", name: "Emergent Leadership" },
  { id: "patterns", name: "Behavioral Patterns" },
  { id: "custom", name: "Custom Query" },
]

export default function QueryPanel({ conversationId }: QueryPanelProps) {
  const { toast } = useToast()
  const [queryType, setQueryType] = useState("")
  const [customQuery, setCustomQuery] = useState("")
  const [results, setResults] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRunQuery = async () => {
    if (!conversationId) {
      toast({
        title: "No Active Conversation",
        description: "Start a conversation before running queries.",
        variant: "destructive",
      })
      return
    }

    if (!queryType) {
      toast({
        title: "Select Query Type",
        description: "Please select a query type to analyze the conversation.",
        variant: "destructive",
      })
      return
    }

    if (queryType === "custom" && !customQuery) {
      toast({
        title: "Empty Custom Query",
        description: "Please enter your custom query.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const queryText = queryType === "custom" ? customQuery : queryType
      const queryResults = await queryConversation(conversationId, queryText)
      setResults(queryResults)
    } catch (error) {
      toast({
        title: "Query Error",
        description: error instanceof Error ? error.message : "Failed to run query",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Select value={queryType} onValueChange={setQueryType}>
            <SelectTrigger>
              <SelectValue placeholder="Select query type" />
            </SelectTrigger>
            <SelectContent>
              {QUERY_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {queryType === "custom" && (
            <Textarea
              placeholder="Enter your custom query..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              rows={3}
            />
          )}

          <Button
            onClick={handleRunQuery}
            disabled={!conversationId || !queryType || isLoading || (queryType === "custom" && !customQuery)}
            className="w-full"
          >
            {isLoading ? "Running Query..." : "Run Query"}
          </Button>
        </div>

        {results && (
          <div className="p-3 bg-muted rounded-md">
            <h4 className="text-sm font-medium mb-2">Query Results</h4>
            <div className="text-sm whitespace-pre-wrap">{results}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
