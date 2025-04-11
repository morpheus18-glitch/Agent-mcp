import client from "prom-client"

// Create a Registry to register the metrics
const register = new client.Registry()

// Add a default label to all metrics
register.setDefaultLabels({
  app: "llm-sandbox",
})

// Enable the collection of default metrics
client.collectDefaultMetrics({ register })

// Define custom metrics
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
})

const llmRequestDurationSeconds = new client.Histogram({
  name: "llm_request_duration_seconds",
  help: "Duration of LLM API requests in seconds",
  labelNames: ["model", "provider"],
  buckets: [0.5, 1, 2, 5, 10, 20, 30, 60],
})

const llmTokensUsedCounter = new client.Counter({
  name: "llm_tokens_used_total",
  help: "Total number of tokens used in LLM requests",
  labelNames: ["model", "provider", "type"],
})

const conversationsCreatedCounter = new client.Counter({
  name: "conversations_created_total",
  help: "Total number of conversations created",
})

const messagesGeneratedCounter = new client.Counter({
  name: "messages_generated_total",
  help: "Total number of messages generated",
  labelNames: ["agent_id", "model"],
})

const activeUsersGauge = new client.Gauge({
  name: "active_users",
  help: "Number of active users",
})

// Register the metrics
register.registerMetric(httpRequestDurationMicroseconds)
register.registerMetric(llmRequestDurationSeconds)
register.registerMetric(llmTokensUsedCounter)
register.registerMetric(conversationsCreatedCounter)
register.registerMetric(messagesGeneratedCounter)
register.registerMetric(activeUsersGauge)

// Export the metrics
export {
  register,
  httpRequestDurationMicroseconds,
  llmRequestDurationSeconds,
  llmTokensUsedCounter,
  conversationsCreatedCounter,
  messagesGeneratedCounter,
  activeUsersGauge,
}
