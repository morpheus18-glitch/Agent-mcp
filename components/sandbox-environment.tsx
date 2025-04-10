"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Settings, Plus, Trash2, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMediaQuery } from "@/hooks/use-mobile"
import { defaultAgents, generateMockConversation, generateMockMessage } from "@/lib/mock-data"
import { v4 as uuidv4 } from "uuid"

export default function SandboxEnvironment() {
  const [agents, setAgents] = useState(defaultAgents)
  const [conversation, setConversation] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("conversation")
  const [topic, setTopic] = useState("Current market conditions and investment opportunities")
  const [objective, setObjective] = useState(
    "Analyze recent market trends and identify potential investment opportunities across different asset classes.",
  )
  const [systemPrompt, setSystemPrompt] = useState("")
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleStart = async () => {
    try {
      setIsGenerating(true)
      // Generate a mock conversation with the current agents
      const newConversation = generateMockConversation(agents, topic, objective)
      setConversation(newConversation)
      setActiveTab("conversation")
    } catch (error) {
      console.error("Error starting conversation:", error)
      toast({
        title: "Error starting conversation",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContinue = async () => {
    if (!conversation) return

    try {
      setIsGenerating(true)
      // Add a mock message from the next agent in rotation
      const nextAgentIndex = conversation.messages.length % agents.length
      const nextAgent = agents[nextAgentIndex]

      const newMessage = generateMockMessage(conversation.id, nextAgent.id)

      setConversation({
        ...conversation,
        messages: [...conversation.messages, newMessage],
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error continuing conversation:", error)
      toast({
        title: "Error generating response",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddAgent = () => {
    const newAgent = {
      id: uuidv4(),
      name: `Agent ${agents.length + 1}`,
      model: "mock-model",
      avatar: "/placeholder.svg?height=40&width=40",
      instructions: "You are a helpful assistant.",
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      role: "assistant",
      description: "A helpful assistant",
    }
    setAgents([...agents, newAgent])
  }

  const handleUpdateAgent = (index, updatedAgent) => {
    const newAgents = [...agents]
    newAgents[index] = updatedAgent
    setAgents(newAgents)
  }

  const handleRemoveAgent = (index) => {
    if (agents.length <= 1) {
      toast({
        title: "Cannot remove agent",
        description: "You need at least one agent in the conversation.",
        variant: "destructive",
      })
      return
    }

    const newAgents = agents.filter((_, i) => i !== index)
    setAgents(newAgents)
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">LLM Sandbox</h1>
        <p className="text-muted-foreground">Create multi-agent conversations and analyze their interactions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="conversation" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Conversation</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className={isMobile ? "hidden" : "inline"}>Agents</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {!conversation ? (
              <Button onClick={handleStart} disabled={isGenerating}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={handleContinue} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Continue
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="conversation" className="space-y-4">
          {!conversation ? (
            <Card>
              <CardHeader>
                <CardTitle>New Conversation</CardTitle>
                <CardDescription>Configure your conversation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter conversation topic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objective">Objective</Label>
                  <Textarea
                    id="objective"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="What should the agents accomplish?"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="system-prompt">System Prompt (Optional)</Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Additional instructions for all agents"
                    rows={3}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleStart} disabled={isGenerating}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Conversation
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle>{conversation.topic}</CardTitle>
                  <CardDescription>{conversation.objective}</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] p-4">
                    <div className="space-y-4">
                      {conversation.messages.map((message) => {
                        const agent = agents.find((a) => a.id === message.agentId)
                        if (!agent) return null

                        return (
                          <div key={message.id} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarImage src={agent.avatar} alt={agent.name} />
                                <AvatarFallback style={{ backgroundColor: agent.color }}>
                                  {agent.name.substring(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium" style={{ color: agent.color }}>
                                  {agent.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-auto">
                                {agent.model}
                              </Badge>
                            </div>
                            <div className="pl-10 pr-4">
                              <div className="text-sm">{message.content}</div>
                              {message.metadata?.thinking && (
                                <div className="mt-2 p-2 bg-muted rounded-md text-xs italic">
                                  <div className="font-semibold mb-1">Thinking:</div>
                                  {message.metadata.thinking}
                                </div>
                              )}
                            </div>
                            <Separator className="my-2" />
                          </div>
                        )
                      })}
                      {isGenerating && (
                        <div className="flex justify-center p-4">
                          <div className="animate-pulse flex space-x-2">
                            <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                            <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                            <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button onClick={handleContinue} disabled={isGenerating} className="w-full">
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Continue Conversation
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle>Agent Visualization</CardTitle>
                  <CardDescription>Visual representation of agents</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-center p-4">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {agents.map((agent) => (
                          <div key={agent.id} className="p-4 rounded-lg bg-card">
                            <div
                              className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white"
                              style={{ backgroundColor: agent.color }}
                            >
                              {agent.name.substring(0, 2)}
                            </div>
                            <div className="mt-2 text-center">
                              <div className="font-medium" style={{ color: agent.color }}>
                                {agent.name}
                              </div>
                              <p className="text-xs text-muted-foreground">{agent.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-muted-foreground">Simple agent visualization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Configure Agents</h2>
            <Button onClick={handleAddAgent} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, index) => (
              <Card key={agent.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback style={{ backgroundColor: agent.color }}>
                          {agent.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        value={agent.name}
                        onChange={(e) => handleUpdateAgent(index, { ...agent, name: e.target.value })}
                        className="h-8 w-32 md:w-auto"
                      />
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAgent(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`model-${index}`}>Model</Label>
                    <select
                      id={`model-${index}`}
                      value={agent.model}
                      onChange={(e) => handleUpdateAgent(index, { ...agent, model: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="mock-model">Mock Model</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`instructions-${index}`}>Instructions</Label>
                    <Textarea
                      id={`instructions-${index}`}
                      value={agent.instructions}
                      onChange={(e) => handleUpdateAgent(index, { ...agent, instructions: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`color-${index}`}>Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id={`color-${index}`}
                        value={agent.color}
                        onChange={(e) => handleUpdateAgent(index, { ...agent, color: e.target.value })}
                        className="h-8 w-8 rounded-md border"
                      />
                      <Input
                        value={agent.color}
                        onChange={(e) => handleUpdateAgent(index, { ...agent, color: e.target.value })}
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`role-${index}`}>Role</Label>
                    <Input
                      id={`role-${index}`}
                      value={agent.role}
                      onChange={(e) => handleUpdateAgent(index, { ...agent, role: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
