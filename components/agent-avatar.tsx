"use client";

import {
  BotIcon as Robot,
  MicroscopeIcon as Scientist,
  ActivityIcon as Assistant,
  BadgeIcon as Detective,
  PiIcon as Philosopher,
  WandIcon as Wizard,
  SpaceIcon as AlienIcon,
  FoldersIcon as Explorer,
} from "lucide-react";
import type { AgentConfig } from "@/types/sandbox";
import { cn } from "@/lib/utils";

interface AgentAvatarProps {
  agent: AgentConfig;
  size?: "sm" | "md" | "lg";
}

export function AgentAvatar({ agent, size = "md" }: AgentAvatarProps) {
  const getAvatarIcon = () => {
    switch (agent.avatar) {
      case "robot":
        return <Robot className="h-full w-full" />;
      case "scientist":
        return <Scientist className="h-full w-full" />;
      case "assistant":
        return <Assistant className="h-full w-full" />;
      case "detective":
        return <Detective className="h-full w-full" />;
      case "philosopher":
        return <Philosopher className="h-full w-full" />;
      case "wizard":
        return <Wizard className="h-full w-full" />;
      case "alien":
        return <AlienIcon className="h-full w-full" />;
      case "explorer":
        return <Explorer className="h-full w-full" />;
      default:
        return <Robot className="h-full w-full" />;
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white",
        sizeClasses[size],
      )}
      style={{ backgroundColor: agent.color }}
    >
      {getAvatarIcon()}
    </div>
  );
}
