import { Loader2 } from "lucide-react";

export function FullPageSpinner() {
  return (
    <div className="grid min-h-svh place-items-center">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading…
      </div>
    </div>
  );
}
