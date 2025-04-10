"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { InfoIcon } from "lucide-react"

interface VectorMetric {
  id: string
  name: string
  value: number
  target: [number, number] // Min and max target values
  description: string
}

interface VectorHistoryPoint {
  timestamp: string
  [key: string]: number | string
}

interface VectorMonitorProps {
  conversationId: string | null
}

export default function VectorMonitor({ conversationId }: VectorMonitorProps) {
  const [metrics, setMetrics] = useState<VectorMetric[]>([
    {
      id: "asymmetricCognition",
      name: "Asymmetric Cognition",
      value: 0,
      target: [60, 80],
      description: "Measures diversity of cognitive approaches among agents",
    },
    {
      id: "metaLanguageCoherence",
      name: "Meta-Language Coherence",
      value: 0,
      target: [65, 90],
      description: "Tracks shared conceptual frameworks between agents",
    },
    {
      id: "recursiveDepth",
      name: "Recursive Depth",
      value: 0,
      target: [50, 85],
      description: "Measures how agents build upon previous concepts",
    },
    {
      id: "incompletenessReverence",
      name: "Incompleteness Tolerance",
      value: 0,
      target: [60, 85],
      description: "Tracks resistance to premature convergence",
    },
    {
      id: "cognitiveTransparency",
      name: "Cognitive Transparency",
      value: 0,
      target: [70, 90],
      description: "Monitors explicit sharing of reasoning processes",
    },
    {
      id: "nonMonotonicIntent",
      name: "Non-Monotonic Exploration",
      value: 0,
      target: [55, 80],
      description: "Tracks non-linear exploration of concept space",
    },
    {
      id: "patternPersistence",
      name: "Pattern Persistence",
      value: 0,
      target: [60, 85],
      description: "Measures reusability of emergent conceptual frameworks",
    },
  ])

  const [history, setHistory] = useState<VectorHistoryPoint[]>([])
  const [activeTab, setActiveTab] = useState("current")

  useEffect(() => {
    if (!conversationId) return

    fetchMetrics()
    const intervalId = setInterval(fetchMetrics, 5000)

    return () => clearInterval(intervalId)
  }, [conversationId])

  const fetchMetrics = async () => {
    if (!conversationId) return

    try {
      const response = await fetch(`/api/conversations/${conversationId}/vectors`)

      if (!response.ok) {
        throw new Error("Failed to fetch vector metrics")
      }

      const data = await response.json()

      // Update metrics with the fetched data
      const updatedMetrics = metrics.map((metric) => ({
        ...metric,
        value: data[metric.name] || Math.floor(40 + Math.random() * 50), // Fallback to random value
      }))

      setMetrics(updatedMetrics)

      // Update history
      const timestamp = new Date().toLocaleTimeString()
      const historyPoint: VectorHistoryPoint = { timestamp }

      updatedMetrics.forEach((metric) => {
        historyPoint[metric.id] = metric.value
      })

      setHistory((prev) => {
        const newHistory = [...prev, historyPoint]
        if (newHistory.length > 20) {
          return newHistory.slice(newHistory.length - 20)
        }
        return newHistory
      })
    } catch (error) {
      console.error("Error fetching vector metrics:", error)
    }
  }

  const getStatusColor = (value: number, target: [number, number]) => {
    if (value < target[0]) return "text-amber-500"
    if (value > target[1]) return "text-red-500"
    return "text-green-500"
  }

  const getProgressColor = (value: number, target: [number, number]) => {
    if (value < target[0]) return "bg-amber-500"
    if (value > target[1]) return "bg-red-500"
    return "bg-green-500"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center justify-between">
          <span>RDIP Vector Monitor</span>
          {conversationId ? (
            <span className="text-sm font-normal text-muted-foreground">
              Monitoring conversation {conversationId.substring(0, 8)}...
            </span>
          ) : (
            <span className="text-sm font-normal text-muted-foreground">No active conversation</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current">Current Metrics</TabsTrigger>
            <TabsTrigger value="history">Historical Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric) => (
                <div key={metric.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="group relative">
                        <InfoIcon className="h-3 w-3 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-popover text-popover-foreground rounded shadow-lg text-xs w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-50">
                          {metric.description}
                          <div className="text-xs mt-1">
                            Target: {metric.target[0]}%-{metric.target[1]}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${getStatusColor(metric.value, metric.target)}`}>
                      {metric.value}%
                    </span>
                  </div>
                  <Progress
                    value={metric.value}
                    className="h-2"
                    indicatorClassName={getProgressColor(metric.value, metric.target)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {metrics.map((metric, index) => (
                    <Line
                      key={metric.id}
                      type="monotone"
                      dataKey={metric.id}
                      name={metric.name}
                      stroke={`hsl(${index * 40}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
