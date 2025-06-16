import { Loader2 } from "lucide-react";

export default function LoadingEnvironment() {
  return (
    <div className="flex flex-col items-center justify-center h-[600px]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h2 className="text-xl font-medium">Loading Sandbox Environment...</h2>
      <p className="text-muted-foreground">
        Preparing the LLM models and environment
      </p>
    </div>
  );
}
