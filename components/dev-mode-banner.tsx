import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DevModeBanner() {
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <AlertTriangle className="h-4 w-4 text-blue-500" />
      <AlertDescription className="text-blue-700">
        <strong>Development Mode:</strong> Using simplified authentication. Use
        email: user@example.com, password: password
      </AlertDescription>
    </Alert>
  );
}
