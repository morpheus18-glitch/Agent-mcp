"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AgentConfig, ConversationSettings } from "@/types/sandbox";
import { AgentAvatar } from "@/components/agent-avatar";
import { Play, Pause, RotateCw, X } from "lucide-react";

interface ControlPanelProps {
  agents: AgentConfig[];
  onRemoveAgent: (agentId: string) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  isRunning: boolean;
  settings?: ConversationSettings | null;
}

export default function ControlPanel({
  agents,
  onRemoveAgent,
  onStart,
  onPause,
  onResume,
  isRunning,
  settings,
}: ControlPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Control Panel</span>
          {settings && (
            <Badge variant="outline" className="font-normal">
              {settings.topic}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {settings && (
          <div className="space-y-2 mb-4">
            <h3 className="text-sm font-medium">Conversation Settings</h3>
            <div className="text-sm space-y-1">
              <p>
                <span className="font-medium">Objective:</span>{" "}
                {settings.objective}
              </p>
              <p>
                <span className="font-medium">Language:</span>{" "}
                {settings.language}
              </p>
              <p>
                <span className="font-medium">Max Turns:</span>{" "}
                {settings.maxTurns}
              </p>
              <p>
                <span className="font-medium">Temperature:</span>{" "}
                {settings.temperature}
              </p>
            </div>

            {settings.constraints.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Constraints:</p>
                <div className="flex flex-wrap gap-1">
                  {settings.constraints.map((constraint, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {constraint}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-2" />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            Active Agents ({agents.length})
          </h3>
          {agents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agents added yet</p>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <AgentAvatar agent={agent} size="sm" />
                    <div>
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.model}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveAgent(agent.id)}
                    disabled={isRunning}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Conversation Controls</h3>
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                className="flex-1"
                onClick={agents.length > 0 ? onStart : undefined}
                disabled={agents.length < 3}
              >
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button className="flex-1" onClick={onPause}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            )}
            <Button
              className="flex-1"
              variant="outline"
              onClick={onResume}
              disabled={!isRunning}
            >
              <RotateCw className="mr-2 h-4 w-4" />
              Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
