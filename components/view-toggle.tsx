"use client";

import { Button } from "@/components/ui/button";
import { Monitor, CuboidIcon as Cube } from "lucide-react";

interface ViewToggleProps {
  view: "2d" | "3d";
  onToggle: (view: "2d" | "3d") => void;
}

export default function ViewToggle({ view, onToggle }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium mr-2">View Mode:</span>
      <Button
        variant={view === "2d" ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle("2d")}
        className="flex items-center gap-2"
      >
        <Monitor className="h-4 w-4" />
        <span>2D Chat</span>
      </Button>
      <Button
        variant={view === "3d" ? "default" : "outline"}
        size="sm"
        onClick={() => onToggle("3d")}
        className="flex items-center gap-2"
      >
        <Cube className="h-4 w-4" />
        <span>3D World</span>
      </Button>
    </div>
  );
}
