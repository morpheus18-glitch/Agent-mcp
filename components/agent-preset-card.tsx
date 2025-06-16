"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { AgentAvatar } from "@/components/agent-avatar";
import type { AgentConfig } from "@/types/sandbox";

interface AgentPresetCardProps {
  agent: AgentConfig;
  isSelected: boolean;
  onSelect: () => void;
}

export function AgentPresetCard({
  agent,
  isSelected,
  onSelect,
}: AgentPresetCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-primary border-2" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <AgentAvatar agent={agent} size="lg" />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium" style={{ color: agent.color }}>
              {agent.name}
            </h4>
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className="h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {isSelected ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            {agent.description || "No description available"}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
              {agent.model}
            </span>
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
              {agent.role || "General"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
