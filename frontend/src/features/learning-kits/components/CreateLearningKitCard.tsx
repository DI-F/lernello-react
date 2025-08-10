import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function CreateLearningKitCard({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="border-dashed transition hover:shadow-sm hover:ring-1 hover:ring-border">
        <CardContent className="h-full min-h-[120px] flex flex-col items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-full border flex items-center justify-center">
            <Plus className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">Create Learning Kit</p>
        </CardContent>
      </Card>
    </button>
  );
}
