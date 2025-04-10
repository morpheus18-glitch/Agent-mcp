"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { AgentConfig, Conversation } from "@/types/sandbox"
import { AgentAvatar } from "@/components/agent-avatar"
import { cn } from "@/lib/utils"

interface ConversationViewProps {
  conversation: Conversation | null
  agents: AgentConfig[]
  isRunning: boolean
}

export default function ConversationView({ conversation, agents, isRunning }: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [conversation?.messages])

  const getAgentById = (id: string) => {
    return agents.find((agent) => agent.id === id)
  }

  return (
    <Card className="flex-1 flex flex-col h-[600px]">
      <CardContent className="flex-1 p-0 flex flex-col">
        <div className="p-4 bg-muted/50 border-b">
          <h2 className="text-xl font-semibold">Agent Interaction</h2>
          <p className="text-sm text-muted-foreground">
            {isRunning ? "Agents are actively communicating" : "Conversation is paused"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!conversation || conversation.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                No conversation started yet. Add at least 3 agents and press Start.
              </p>
            </div>
          ) : (
            conversation.messages.map((message, index) => {
              const agent = getAgentById(message.agentId)
              if (!agent) return null

              return (
                <div key={index} className="flex items-start gap-3 animate-in fade-in-50 duration-300">
                  <AgentAvatar agent={agent} />
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: agent.color }}>
                        {agent.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={cn("rounded-lg p-3 text-sm", "bg-muted")}>{message.content}</div>
                    {message.metadata && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.metadata.thinking && (
                          <div className="italic border-l-2 pl-2 mt-1 border-muted-foreground/30">
                            Thinking: {message.metadata.thinking}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
    </Card>
  )
}
